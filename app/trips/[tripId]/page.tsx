import { getServerComponentClient } from '@/utils/supabase/unified';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { TRIP_ROLES } from '@/utils/constants/status';
import { VerticalStepper } from '@/components/itinerary/VerticalStepper';
import { MobileStepper } from '@/components/itinerary/MobileStepper';
import { Metadata, ResolvingMetadata } from 'next';
import { createServerComponentClient } from '@/utils/supabase/server';
import { getOpenGraphImageForTrip } from '@/lib/hooks/use-og-image';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/database';

import type { Database } from '@/types/database.types';
// Import TABLES but use type assertion
import type { TripRole } from '@/types/trip';
import TripPageClientWrapper from './trip-page-client-wrapper';

// Define a more complete type for TABLES
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  DESTINATIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

// Define trip data interface
interface TripData {
  id: string;
  name: string;
  description?: string;
  destination_id?: string;
  destinations?: {
    city?: string;
    country?: string;
    image_url?: string;
  };
  cover_image_url?: string;
}

// Add metadata generation for trip pages
export async function generateMetadata(
  { params }: { params: Promise<{ tripId: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { tripId } = await params;
    const supabase = await createServerComponentClient();

    // Fetch trip data for metadata
    const { data: trip, error } = await supabase
      .from(TABLES.TRIPS)
      .select(`id, name, description, destination_id, cover_image_url, destinations:${TABLES.DESTINATIONS}(city, country, image_url)`)
      .eq('id', tripId)
      .single();

    if (error || !trip) {
      console.error('Error fetching trip for metadata:', error);
      return {
        title: 'Trip | WithMe Travel',
        description: 'Plan and organize your trip with WithMe Travel'
      };
    }

    const tripData = trip as unknown as TripData;
    
    // Create metadata title and description
    const title = `${tripData.name} | WithMe Travel`;
    const description = tripData.description
      ? tripData.description.substring(0, 160)
      : `Plan your trip to ${tripData.destinations?.city || 'your destination'} with WithMe Travel`;
      
    // Generate OG images
    const ogImages = getOpenGraphImageForTrip({
      tripId,
      bgColor: '#4A90E2'
    });
    
    // Return metadata object
    return {
      title,
      description,
      openGraph: {
        title: tripData.name,
        description,
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: tripData.name,
        description,
        images: ogImages.map(img => img.url),
      }
    };
  } catch (error) {
    console.error('Error generating trip metadata:', error);
    return {
      title: 'Trip | WithMe Travel',
      description: 'Plan and organize your trip with WithMe Travel'
    };
  }
}

export default async function TripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  
  // Get server component client
  const supabase = await createServerComponentClient();
  
  // Get cookies for guest token check
  const cookieStore = await cookies();
  const guestTripToken = cookieStore.get('guest_trip_token')?.value;
  
  // Check authentication status
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  // First check if the trip exists
  const { data: trip, error: tripError } = await supabase
    .from(TABLES.TRIPS)
    .select('id, name, created_by, guest_token')
    .eq('id', tripId)
    .single();
  
  if (tripError) {
    console.error('Trip not found:', tripError);
    redirect(`/trips?error=${encodeURIComponent('Trip not found')}`);
  }
  
  // Determine if this is a guest-created trip the current guest can access
  const isGuestCreator = !user && trip.guest_token && guestTripToken === trip.guest_token;
  
  // Now check if the user has access to this trip
  if (!user && !isGuestCreator) {
    // If not authenticated and not a guest creator, redirect to login
    redirect(`/login?redirectTo=${encodeURIComponent(`/trips/${tripId}`)}`);
  }
  
  // If authenticated, check if user is a member of the trip
  let canEdit = false;
  
  if (user) {
    const { data: membership, error: membershipError } = await supabase
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (membershipError) {
      console.error('Error checking trip membership:', membershipError);
    }
    
    // User can edit if they are a member with admin or editor role
    if (membership && (membership.role === 'admin' || membership.role === 'editor')) {
      canEdit = true;
    } else if (trip.created_by === user.id) {
      // User is the creator but might not be in trip_members yet
      canEdit = true;
    }
  } else if (isGuestCreator) {
    // Guest creators can edit their trips
    canEdit = true;
  }
  
  return (
    <div className="min-h-screen">
      <TripPageClientWrapper
        tripId={tripId}
        canEdit={canEdit}
        isGuestCreator={isGuestCreator}
      />
    </div>
  );
}
