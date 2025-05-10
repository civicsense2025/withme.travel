import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/database';
import TripPageClientWrapper from './trip-page-client-wrapper';
import { createServerComponentClient } from '@/utils/supabase/server';
import { getOpenGraphImageForTrip } from '@/lib/hooks/use-og-image';

type TripParams = {
  params: Promise<{
    tripId: string;
  }>;
};

// Define metadata for the page
export async function generateMetadata({ params }: TripParams): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const tripId = resolvedParams.tripId;
    console.log(`[Metadata] Generating for trip: ${tripId}`);
    
    const supabase = await createServerComponentClient();
    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .select('id, name, description')
      .eq('id', tripId);

    if (error) {
      console.log(`[Metadata] Error fetching trip: ${error?.message || 'Unknown error'}`);
      return {
        title: 'Trip | WithMe Travel',
        description: 'Plan your trip with WithMe Travel'
      };
    }
    
    if (!data || data.length === 0) {
      console.log(`[Metadata] Trip not found: ${tripId}`);
      return {
        title: 'Trip | WithMe Travel',
        description: 'Plan your trip with WithMe Travel'
      };
    }
    
    // Take the first trip if multiple were returned
    const trip = data[0];

    return {
      title: `${trip.name} | WithMe Travel`,
      description: trip.description || 'Plan your trip with WithMe Travel',
      openGraph: {
        title: trip.name,
        description: trip.description || 'Plan your trip with WithMe Travel',
        images: getOpenGraphImageForTrip({ tripId, bgColor: '#4A90E2' }),
      }
    };
  } catch (error: any) {
    console.error(`[Metadata] Error: ${error?.message || 'Unknown error'}`);
    return {
      title: 'Trip | WithMe Travel',
      description: 'Plan your trip with WithMe Travel'
    };
  }
}

// Main page component
export default async function TripPage({ params }: TripParams) {
  const resolvedParams = await params;
  const tripId = resolvedParams.tripId;
  console.log(`[TripPage] Loading trip: ${tripId}`);
  
  let trip = null;
  let canView = false;
  let canEdit = false;
  let isGuestCreator = false;
  let errorMessage = '';

  try {
    const supabase = await createServerComponentClient();
    
    // Get user if available
    const { data: { user } } = await supabase.auth.getUser();
    
    // First try to get the trip data
    const { data: tripData, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('*')
      .eq('id', tripId);
      
    if (tripError) {
      console.log(`[TripPage] Error fetching trip: ${tripError.message}`);
      errorMessage = `Error fetching trip: ${tripError.message}`;
    } else if (!tripData || tripData.length === 0) {
      console.log(`[TripPage] Trip not found: ${tripId}`);
      errorMessage = `Trip not found: ${tripId}`;
      return notFound(); // Return 404 immediately if trip doesn't exist
    } else {
      // Take the first trip if multiple were returned
      trip = tripData[0];
      console.log(`[TripPage] Found trip: ${trip.name}`);
      
      // Check if user is logged in and is the creator
      if (user && trip.created_by === user.id) {
        console.log(`[TripPage] User ${user.id} is the creator`);
        canView = true;
        canEdit = true;
      } else {
        // Check for guest token using the parse method which is more reliable
        const cookieStore = await cookies();
        const cookiesStr = cookieStore.toString();
        const guestTokenMatch = cookiesStr.match(/guest_user_id=([^;]+)/);
        const guestToken = guestTokenMatch ? guestTokenMatch[1] : null;
        
        console.log(`[TripPage] Checking guest token: ${guestToken}`);
        
        if (guestToken) {
          try {
            // First check if the trip has a guest_token field that matches directly
            // Use type assertion with 'as any' to bypass strict typing since these fields 
            // may exist at runtime but are not in the TypeScript type definition
            const tripAny = trip as any;
            if ((tripAny.guest_token && tripAny.guest_token === guestToken) || 
                (tripAny.guest_token_text && tripAny.guest_token_text === guestToken)) {
              console.log(`[TripPage] Guest token matches directly on trip record`);
              canView = true;
              canEdit = true;
              isGuestCreator = true;
            } else {
              // Then check the guest_tokens table
              const { data: guestRows, error: guestError } = await supabase
                .from('guest_tokens')
                .select('*')
                .eq('trip_id', tripId)
                .eq('token', guestToken);
                
              if (guestError) {
                console.log(`[TripPage] Error checking guest token: ${guestError.message || 'Unknown error'}`);
              } else if (guestRows && guestRows.length > 0) {
                console.log(`[TripPage] Found ${guestRows.length} matching guest tokens`);
                canView = true;
                canEdit = true;
                isGuestCreator = true;
              }
            }
          } catch (tokenError: any) {
            console.error(`[TripPage] Error checking guest token: ${tokenError?.message || 'Unknown error'}`);
          }
        }
      }
    }
  } catch (error: any) {
    console.error(`[TripPage] Error: ${error?.message || 'Unknown error'}`);
    errorMessage = `Error: ${error?.message || 'Unknown error'}`;
  }

  // If user doesn't have access, return 404
  if (!canView) {
    console.log(`[TripPage] Access denied for trip ${tripId}`);
    return notFound();
  }

  console.log(`[TripPage] Rendering trip ${tripId}, canEdit=${canEdit}, isGuestCreator=${isGuestCreator}`);
  
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
