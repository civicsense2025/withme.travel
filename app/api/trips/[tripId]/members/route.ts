import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import type { Database } from '@/types/database.types';

// Define table names directly as string literals
const TRIP_MEMBERS_TABLE = 'trip_members';

// Define database field constants to avoid linting issues
const FIELDS = {
  TRIP_MEMBERS: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
): Promise<NextResponse> {
  try {
    // Must await params in Next.js 15
    const { tripId } = await params;

    // UUID validation to prevent database errors
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!tripId || !UUID_REGEX.test(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID format' }, { status: 400 });
    }

    // Create Supabase client without await (it's not an async function)
    const supabase = await createRouteHandlerClient();

    // Get the auth session cookie directly
    const cookieHeader = request.headers.get('cookie') || '';
    if (!cookieHeader.includes('sb-') && !cookieHeader.includes('supabase-auth')) {
      console.error('Missing auth cookies in request:', cookieHeader.substring(0, 100)); // Log first 100 chars
      return NextResponse.json({ error: 'Auth session missing in cookies' }, { status: 401 });
    }

    // Use getUser() for a more secure auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error in members route:', authError || 'No user found');
      console.log('Request headers:', Object.fromEntries(request.headers.entries()));
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this user is a member of the trip (for authorization)
    const { data: userMembership, error: membershipError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('role')
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(FIELDS.TRIP_MEMBERS.USER_ID, user.id)
      .maybeSingle();

    if (membershipError) {
      console.error('Error checking membership:', membershipError);
    }

    // If not a member, check if trip is public
    if (!userMembership) {
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('is_public, privacy_setting')
        .eq('id', tripId)
        .single();

      if (tripError) {
        console.error('Error checking trip privacy:', tripError);
        return NextResponse.json({ error: 'Failed to verify trip access' }, { status: 500 });
      }

      // Only allow viewing members if trip is public
      if (!tripData?.is_public && tripData?.privacy_setting !== 'public') {
        return NextResponse.json({ error: 'Not authorized to view this trip' }, { status: 403 });
      }
    }

    // Fetch trip members
    const { data, error } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select(
        `
        *,
        profiles(*)
      `
      )
      .eq(FIELDS.TRIP_MEMBERS.TRIP_ID, tripId);

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return only the data array as per original logic, assuming the consumer expects { data: [...] }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
