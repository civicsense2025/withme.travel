import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { TripPageClient } from './trip-page-client';
import { ErrorBoundary } from '@/components/error-boundary';
import { TripPageSkeleton } from '@/components/skeletons/trip-page-skeleton';
import { TripPageError } from '@/components/trips/trip-page-error';
import { createClient } from "@/utils/supabase/server";
import { z } from 'zod';

// Define a TypeScript interface for props
interface PageProps {
  params: {
    tripId: string;
  }
}

// Define a Zod schema for validating trip data
const TripDataSchema = z.object({
  tripId: z.string().uuid(),
  tripName: z.string().min(1),
  tripDescription: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  tripDurationDays: z.number().nullable(),
  coverImageUrl: z.string().url().nullable(),
  destinationId: z.string().uuid().nullable(),
  initialMembers: z.array(z.object({
    id: z.string(),
    trip_id: z.string(),
    user_id: z.string(),
    role: z.string(),
    joined_at: z.string(),
    profiles: z.object({
      id: z.string(),
      name: z.string().nullable(),
      avatar_url: z.string().nullable(),
      username: z.string().nullable(),
    }).nullable(),
  })),
  initialSections: z.array(z.object({
    id: z.string(),
    trip_id: z.string(),
    day_number: z.number(),
    date: z.string().nullable(),
    title: z.string().nullable(),
    position: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    items: z.array(z.any()), // We'll allow any for items to keep it simpler
  })),
  initialUnscheduledItems: z.array(z.any()),
  initialManualExpenses: z.array(z.any()),
  userRole: z.string().nullable(),
  canEdit: z.boolean(),
  isTripOver: z.boolean(),
  destinationLat: z.number().nullable().optional(),
  destinationLng: z.number().nullable().optional(),
  initialTripBudget: z.number().nullable(),
  initialTags: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  slug: z.string().nullable(),
  privacySetting: z.enum(['private', 'shared_with_link', 'public']).nullable(),
  playlistUrl: z.string().nullable().optional(),
});

// Define Cookie interface
interface Cookie {
  name: string;
  value: string;
}

/**
 * Check if the user is authenticated and can access the trip
 * @param tripId The ID of the trip
 * @returns Authentication status
 */
async function checkAuth(tripId: string): Promise<{ authenticated: boolean; canAccess: boolean; message?: string }> {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { authenticated: false, canAccess: false, message: "Please sign in to view this trip" };
    }
    
    // Check if the user is a member of the trip or if the trip is public
    const { data: member, error: memberError } = await supabase
      .from('trip_members')
      .select('user_id')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (memberError) {
      console.error("Error checking trip membership:", memberError);
      return { authenticated: true, canAccess: false, message: "Error checking trip access" };
    }
    
    // If they're a member, they can access
    if (member) {
      return { authenticated: true, canAccess: true };
    }
    
    // Check if trip is public
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('is_public, privacy_setting')
      .eq('id', tripId)
      .single();
      
    if (tripError) {
      console.error("Error checking trip privacy:", tripError);
      return { authenticated: true, canAccess: false, message: "Error checking trip access" };
    }
    
    // Allow access if the trip is public or shared_with_link
    if (trip && (trip.is_public || trip.privacy_setting === 'public' || trip.privacy_setting === 'shared_with_link')) {
      return { authenticated: true, canAccess: true };
    }
    
    return { authenticated: true, canAccess: false, message: "You don't have access to this trip" };
  } catch (error) {
    console.error("Error in checkAuth:", error);
    return { authenticated: true, canAccess: false, message: "Error checking authentication" };
  }
}

/**
 * Fetch trip data from API
 * @param tripId The ID of the trip to fetch
 * @returns The trip data or throws an error
 */
async function getTripData(tripId: string) {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    // Construct the URL
    const url = `${protocol}://${host}/api/trips/${tripId}`;
    console.log('Fetching from URL:', url);
    
    // Implement timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        // Convert cookie store to string synchronously - it's an iterable
        Cookie: cookieStore.getAll().map((c: Cookie) => `${c.name}=${c.value}`).join('; '),
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorResponse;
      try {
        errorResponse = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        throw new Error(`Failed to fetch trip data: ${response.status} ${errorText}`);
      }
      
      console.error('API response error (JSON):', response.status, errorResponse);
      throw new Error(errorResponse.error || `Failed to fetch trip data: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate the response data
    const result = TripDataSchema.safeParse(data);
    if (!result.success) {
      console.error('Trip data validation failed:', result.error);
      throw new Error(`Invalid trip data: ${result.error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in getTripData:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

/**
 * Main Trip Page component
 */
export default async function TripPage({ params }: PageProps) {
  // Await the params object before destructuring it
  const parameters = await params;
  const tripId = parameters.tripId;
  
  // Check authentication and access
  const authStatus = await checkAuth(tripId);
  
  if (!authStatus.authenticated) {
    // Redirect to login if not authenticated
    redirect('/auth/signin?redirectTo=' + encodeURIComponent(`/trips/${tripId}`));
  }
  
  if (!authStatus.canAccess) {
    // Render a nice access denied page if authenticated but can't access
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-red-500 mb-4">
          {authStatus.message || "You don't have permission to view this trip"}
        </p>
        <a href="/trips" className="text-blue-500 hover:underline">
          View your trips
        </a>
      </div>
    );
  }
  
  return (
    <ErrorBoundary fallback={<TripPageError tripId={tripId} />}>
      <Suspense fallback={<TripPageSkeleton />}>
        <TripContent tripId={tripId} />
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Trip content component that loads the actual trip data
 */
async function TripContent({ tripId }: { tripId: string }) {
  try {
    const tripData = await getTripData(tripId);
    
    return <TripPageClient {...tripData} />;
  } catch (error) {
    // Return a detailed error UI
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Trip</h1>
        <p className="text-red-500 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <div className="p-4 bg-card border rounded-lg overflow-auto max-h-64">
          <pre className="text-sm">
            {JSON.stringify({ tripId, error: error instanceof Error ? error.message : String(error) }, null, 2)}
          </pre>
        </div>
        <div className="mt-6">
          <a href="/trips" className="text-primary hover:underline">
            Return to trips
          </a>
        </div>
      </div>
    );
  }
}
