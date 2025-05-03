import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { Database } from '@/types/database.types';

// Define constants directly to avoid type issues
const TRIP_MEMBERS_TABLE = 'trip_members';
const TRIP_VOTE_POLLS_TABLE = 'trip_vote_polls';

// Field constants
const TRIP_MEMBERS_FIELDS = {
  TRIP_ID: 'trip_id',
  USER_ID: 'user_id',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;

  // Validate trip ID
  if (!tripId || !/^\d+$/.test(tripId)) {
    return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
  }
  const supabase = createRouteHandlerClient();

  try {
    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a member of the trip
    const { data: tripMember, error: memberError } = await supabase
      .from(TRIP_MEMBERS_TABLE)
      .select('id, role')
      .eq(TRIP_MEMBERS_FIELDS.TRIP_ID, tripId)
      .eq(TRIP_MEMBERS_FIELDS.USER_ID, user.id)
      .single();

    if (memberError || !tripMember) {
      return NextResponse.json({ error: 'You are not a member of this trip' }, { status: 403 });
    }

    // Get active polls for this trip
    const { data: polls, error: pollsError } = await supabase
      .from(TRIP_VOTE_POLLS_TABLE)
      .select(
        `
        id,
        title,
        description,
        created_at,
        expires_at,
        created_by,
        is_active
      `
      )
      .eq('trip_id', tripId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (pollsError) {
      console.error('Error fetching polls:', pollsError);
      return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
    }

    // Return the list of active polls
    return NextResponse.json({ polls: polls || [] });
  } catch (error) {
    console.error('Error in vote API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const supabase = createRouteHandlerClient();

  // For now, return a "not implemented" message
  // This can be expanded later to support creating polls
  return NextResponse.json({ error: 'POST method not fully implemented yet' }, { status: 501 });
}
