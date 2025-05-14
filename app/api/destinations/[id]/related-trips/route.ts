import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/api';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

/**
 * GET related trips for a destination
 *
 * This endpoint returns public trips associated with a destination
 * Trips are filtered based on privacy settings, and limited to a set number
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: destinationId } = await params;
    const supabase = createServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams?.get('limit') || '4', 10);

    // Fetch public trips associated with this destination
    const { data: trips, error } = await supabase
      .from('trips')
      .select(
        `
        id, 
        name, 
        start_date, 
        end_date, 
        destination_id, 
        destination_name, 
        cover_image_url,
        description,
        public_slug,
        privacy_setting,
        created_at,
        trip_members (
          user_id,
          role,
          profiles (
            id,
            name,
            avatar_url
          )
        )
      `
      )
      .eq('destination_id', destinationId)
      .in('privacy_setting', ['public', 'shared_with_link'])
      .not('public_slug', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching related trips:', error);
      return NextResponse.json({ error: 'Failed to fetch related trips' }, { status: 500 });
    }

    // Process trips to include member count
    const processedTrips = trips?.map((trip: any) => {
      // Count unique members
      const uniqueMembers = trip.trip_members
        ? [...new Set(trip.trip_members.map((member: any) => member.user_id))]
        : [];

      return {
        id: trip.id,
        name: trip.name,
        startDate: trip.start_date,
        endDate: trip.end_date,
        destinationId: trip.destination_id,
        destinationName: trip.destination_name,
        coverImageUrl: trip.cover_image_url,
        description: trip.description,
        publicSlug: trip.public_slug,
        membersCount: uniqueMembers.length,
        createdAt: trip.created_at,
      };
    });

    return NextResponse.json({ trips: processedTrips || [] });
  } catch (error) {
    console.error('Error in related-trips endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
