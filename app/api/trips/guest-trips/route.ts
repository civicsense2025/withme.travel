import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get('token');

    if (!guestToken) {
      return NextResponse.json({ error: 'Guest token is required' }, { status: 400 });
    }

    // Create a Supabase client
    const supabase = await createRouteHandlerClient();

    // Use a raw SQL query to get guest trips since TypeScript may not have types for guest_trip_access
    const { data: tripsData, error } = await supabase.rpc('get_guest_trips', {
      p_guest_token: guestToken,
    });

    if (error) {
      console.error('Error fetching guest trips:', error);

      // Fallback to raw SQL if the RPC function doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase.rpc('execute_sql', {
        sql_query: `
          SELECT t.* FROM trips t
          JOIN guest_trip_access gta ON t.id = gta.trip_id
          WHERE gta.guest_token = '${guestToken}'
          ORDER BY t.created_at DESC
        `,
      });

      if (fallbackError) {
        console.error('Fallback error fetching guest trips:', fallbackError);
        return NextResponse.json({ error: 'Failed to fetch guest trips' }, { status: 500 });
      }

      return NextResponse.json({ trips: fallbackData || [] });
    }

    return NextResponse.json({ trips: tripsData || [] });
  } catch (error) {
    console.error('Error in guest-trips API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
