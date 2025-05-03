import { NextResponse, type NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { Database } from '@/types/database.types';
import { calculateTravelTimes, TravelInfo } from '@/lib/mapbox';

// Define the interface for itinerary item coordinates
interface ItineraryItemCoords {
  id: string;
  day_number: number | null;
  latitude: number;
  longitude: number;
  position: number;
  start_time?: string | null;
}

// Define field constants for queries
const FIELDS = {
  COMMON: {
    ID: 'id',
  },
  ITINERARY_ITEMS: {
    DAY_NUMBER: 'day_number',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    POSITION: 'position',
    START_TIME: 'start_time',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { tripId: string } }
): Promise<NextResponse> {
  const { tripId } = params;

  if (!tripId) {
    return NextResponse.json({ error: 'Missing tripId parameter' }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient();

    // 1. Fetch itinerary items required for calculation using FIELDS
    const { data: items, error: itemsError } = await supabase
      .from('itinerary_items')
      .select(
        `
        ${FIELDS.COMMON.ID},
        ${FIELDS.ITINERARY_ITEMS.DAY_NUMBER},
        ${FIELDS.ITINERARY_ITEMS.LATITUDE},
        ${FIELDS.ITINERARY_ITEMS.LONGITUDE},
        ${FIELDS.ITINERARY_ITEMS.POSITION},
        ${FIELDS.ITINERARY_ITEMS.START_TIME}
      `
      ) // Select fields needed by calculateTravelTimes
      .eq('trip_id', tripId)
      .not(FIELDS.ITINERARY_ITEMS.LATITUDE, 'is', null)
      .not(FIELDS.ITINERARY_ITEMS.LONGITUDE, 'is', null);

    if (itemsError) {
      console.error('Supabase error fetching itinerary items for travel times:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch itinerary items' }, { status: 500 });
    }

    if (!items || items.length < 2) {
      return NextResponse.json({}); // Not enough items
    }

    // 2. Calculate travel times using the utility function
    // We've already filtered for non-null coordinates in the database query
    // Type assertion is safe here because we've verified the data format
    const travelTimes = await calculateTravelTimes(items as unknown as ItineraryItemCoords[]);

    // 3. Return the calculated travel times
    return NextResponse.json(travelTimes);
  } catch (error) {
    console.error('Unexpected error in travel times API:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected server error occurred',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { tripId: string } }) {
  const { tripId } = params;
  const supabase = createRouteHandlerClient();
  // ... rest of POST handler ...
  return NextResponse.json({ error: 'POST method not implemented' }, { status: 405 });
}
