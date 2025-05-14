import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

export async function GET(request: NextRequest, { params }: { params: { tripId: string } }) {
  const supabase = await createRouteHandlerClient();

  // Get trip ID from route params
  const { tripId } = params;

  if (!tripId) {
    return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
  }

  try {
    // Get the trip
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('*')
      .eq('id', tripId)
      .single();

    if (tripError) {
      console.error('Error fetching trip:', tripError);
      return NextResponse.json({ error: 'Failed to fetch trip details' }, { status: 500 });
    }

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get trip members
    const { data: members, error: membersError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('*')
      .eq('trip_id', tripId);

    if (membersError) {
      console.error('Error fetching trip members:', membersError);
      return NextResponse.json({ error: 'Failed to fetch trip members' }, { status: 500 });
    }

    // Get itinerary items
    const { data: itineraryItems, error: itemsError } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .select('*')
      .eq('trip_id', tripId);

    if (itemsError) {
      console.error('Error fetching itinerary items:', itemsError);
      return NextResponse.json({ error: 'Failed to fetch itinerary items' }, { status: 500 });
    }

    return NextResponse.json({
      trip,
      members: members || [],
      itineraryItems: itineraryItems || [],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
