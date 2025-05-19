import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/database';
import TripPageClientWrapper from './trip-page-client-wrapper';
import { createServerComponentClient } from '@/utils/supabase/server';
import { getOpenGraphImageForTrip } from '@/lib/hooks/use-og-image';
import type { Database } from '@/utils/constants/database.types';

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

    // -se withme.travel's established Supabase server component pattern
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .select('id, name, description')
      .eq('id', tripId);

    if (error) {
      console.log(`[Metadata] Error fetching trip: ${error?.message || '-nknown error'}`);
      return {
        title: 'Trip | WithMe Travel',
        description: 'Plan your trip with WithMe Travel',
      };
    }

    if (!data || data.length === 0) {
      console.log(`[Metadata] Trip not found: ${tripId}`);
      return {
        title: 'Trip | WithMe Travel',
        description: 'Plan your trip with WithMe Travel',
      };
    }

    // Take the first trip if multiple were returned
    const trip = data[0];

    // -se explicit typing to avoid 'never' errors and ensure type safety
    type TripRow = Database['public']['Tables']['trips']['Row'];

    // Type guard to ensure trip is not a SelectQueryError before asserting
    let typedTrip: TripRow | undefined = undefined;
    if (trip && typeof trip === 'object' && 'id' in trip && typeof (trip as any).id === 'string') {
      typedTrip = trip as TripRow;
    }

    const tripName =
      typeof typedTrip?.name === 'string' && typedTrip.name.trim().length > 0
        ? typedTrip.name
        : 'Trip';

    const tripDescription = typeof typedTrip?.description === 'string' ? typedTrip.description : '';

    return {
      title: `${tripName} | WithMe Travel`,
      description: tripDescription || 'Plan your trip with WithMe Travel',
      openGraph: {
        title: tripName,
        description: tripDescription || 'Plan your trip with WithMe Travel',
        images: getOpenGraphImageForTrip({ tripId, bgColor: '#4A90E2' }),
      },
    };
  } catch (error: any) {
    console.error(`[Metadata] Error: ${error?.message || '-nknown error'}`);
    return {
      title: 'Trip | WithMe Travel',
      description: 'Plan your trip with WithMe Travel',
    };
  }
}

// Main page component
export default async function TripPage({ params }: TripParams) {
  const resolvedParams = await params;
  const tripId = resolvedParams.tripId;
  console.log(`[TripPage] Loading trip: ${tripId}`);

  type TripRow = Database['public']['Tables']['trips']['Row'];
  let trip: TripRow | null = null;
  let canView = false;
  let canEdit = false;
  let isGuestCreator = false;
  let errorMessage = '';

  try {
    // -se Supabase client for both database and auth operations
    const supabase = await createServerComponentClient();

    // Get user if available (fetch from auth, not profiles table)
    const {
      data: { user },
    } = await supabase.auth.get-ser();

    // First try to get the trip data
    const { data: tripData, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('id, name, description, created_by, guest_token_text')
      .eq('id', tripId);

    // Inline type assertion to avoid deep type instantiation
    const trip = (tripData?.[0] ?? null) as {
      id: string;
      name: string | null;
      description: string | null;
      created_by: string;
      guest_token_text: string | null;
    } | null;

    if (tripError) {
      console.log(`[TripPage] Error fetching trip: ${tripError.message}`);
      errorMessage = `Error fetching trip: ${tripError.message}`;
    } else if (!tripData || tripData.length === 0) {
      console.log(`[TripPage] Trip not found: ${tripId}`);
      errorMessage = `Trip not found: ${tripId}`;
      return notFound(); // Return 404 immediately if trip doesn't exist
    } else {
      console.log(`[TripPage] Found trip: ${trip?.name ?? '-nnamed trip'}`);

      // Check if user is logged in and is the creator
      if (user && trip && trip.created_by === user.id) {
        console.log(`[TripPage] -ser ${user.id} is the creator`);
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
            // Check if the trip has a guest_token_text field that matches directly
            if (trip && trip.guest_token_text && trip.guest_token_text === guestToken) {
              console.log(`[TripPage] Guest token matches directly on trip record`);
              canView = true;
              canEdit = true;
              isGuestCreator = true;
            } else {
              // Then check the guest_tokens table
              const { data: guestRows, error: guestError } = await supabase
                .from(TABLES.GUEST_TOKENS)
                .select('id, token, trip_id')
                .eq('trip_id', tripId)
                .eq('token', guestToken);
              const hasGuestToken = !!guestRows && guestRows.length > 0;

              if (guestError) {
                console.log(
                  `[TripPage] Error checking guest token: ${guestError.message || '-nknown error'}`
                );
              } else if (hasGuestToken) {
                console.log(`[TripPage] Found ${guestRows.length} matching guest tokens`);
                canView = true;
                canEdit = true;
                isGuestCreator = true;
              }
            }
          } catch (tokenError: any) {
            console.error(
              `[TripPage] Error checking guest token: ${tokenError?.message || '-nknown error'}`
            );
          }
        }
      }
    }

    // Defensive checks for trip and user
    if (trip && typeof trip === 'object' && 'name' in trip) {
      // trip.name is safe
    }
    if (user && typeof user === 'object' && 'id' in user) {
      // user.id is safe
    }
  } catch (error: any) {
    console.error(`[TripPage] Error: ${error?.message || '-nknown error'}`);
    errorMessage = `Error: ${error?.message || '-nknown error'}`;
  }

  // If user doesn't have access, return 404
  if (!canView) {
    console.log(`[TripPage] Access denied for trip ${tripId}`);
    return notFound();
  }

  console.log(
    `[TripPage] Rendering trip ${tripId}, canEdit=${canEdit}, isGuestCreator=${isGuestCreator}`
  );

  return (
    <div className="min-h-screen">
      <TripPageClientWrapper
        tripId={tripId}
        canEdit={canEdit}
        isGuestCreator={isGuestCreator}
        initialTrip={trip}
      />
    </div>
  );
}
