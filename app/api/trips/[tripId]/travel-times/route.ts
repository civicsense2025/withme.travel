import { NextResponse, type NextRequest } from 'next/server';
import { createApiClient } from '@/utils/supabase/server';

import { calculateTravelTimes, TravelInfo } from '@/lib/mapbox';
import { DB_TABLES } from '@/utils/constants/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  if (!tripId) {
    return NextResponse.json({ error: 'Missing tripId parameter' }, { status: 400 });
  }

  try {
    const supabase = await createApiClient();

    // 1. Fetch itinerary items required for calculation
    // Type assertion might need adjustment based on actual DB schema/types
    const { data: items, error: itemsError } = await supabase
      .from(DB_TABLES.ITINERARY_ITEMS)
      .select('id, day_number, latitude, longitude, position, start_time') // Select fields needed by calculateTravelTimes
      .eq('trip_id', tripId)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);
    // Sorting is handled within calculateTravelTimes now if day_number/position/start_time are passed
    // .order('day_number', { ascending: true, nullsFirst: false })
    // .order('position', { ascending: true, nullsFirst: true })
    // .order('start_time', { ascending: true, nullsFirst: true });

    if (itemsError) {
      console.error('Supabase error fetching itinerary items for travel times:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch itinerary items' }, { status: 500 });
    }

    if (!items || items.length < 2) {
      return NextResponse.json({}); // Not enough items
    }

    // 2. Calculate travel times using the utility function
    // Pass the fetched items directly
    const travelTimes = await calculateTravelTimes(items);

    // 3. Return the calculated travel times
    return NextResponse.json(travelTimes);
  } catch (error) {
    console.error('Unexpected error in travel times API:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
  }
}
