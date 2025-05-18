import { createRouteHandlerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tripId, guestToken, role } = await request.json();

    // Validate required fields
    if (!tripId || !guestToken) {
      return NextResponse.json(
        { error: 'Missing required fields: tripId and guestToken are required' },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = await createRouteHandlerClient();

    // First check if the trip exists
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found or access denied' }, { status: 404 });
    }

    // Use supabase's raw SQL query to insert into the guest_trip_access table
    // (using SQL to bypass TypeScript typing issues)
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `
        INSERT INTO guest_trip_access (trip_id, guest_token, role, created_at) 
        VALUES ('${tripId}', '${guestToken}', '${role || 'member'}', NOW())
        ON CONFLICT (trip_id, guest_token) DO UPDATE 
        SET role = EXCLUDED.role, updated_at = NOW()
      `,
    });

    if (error) {
      console.error('Error associating guest with trip:', error);
      return NextResponse.json({ error: 'Failed to associate guest with trip' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in associate-guest API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
