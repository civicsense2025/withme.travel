import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { FIELDS, TABLES } from '@/utils/constants/tables';

// Helper to create Supabase client
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// GET /api/groups/trips - List trips for a group
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient();

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get URL params
    const url = new URL(request.url);
    const groupId = url.searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Check if user is member of the group
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('GROUP_ID', groupId)
      .eq('USER_ID', session.user.id)
      .eq('STATUS', 'active')
      .single();

    if (membershipError) {
      return NextResponse.json({ error: 'You are not a member of this group' }, { status: 403 });
    }

    // Get trips for this group
    const { data: trips, error } = await supabase
      .from('group_trips')
      .select(
        `
        added_at,
        added_by,
        profiles:${TABLES.PROFILES}!added_by (
          id,
          full_name,
          avatar_url
        ),
        trip:${'trips'}!trip_id (
          id,
          name,
          start_date,
          end_date,
          created_by,
          destination_id,
          destinations:${'destinations'}!destination_id (
            id,
            name,
            country,
            image_url
          )
        )
      `
      )
      .eq('GROUP_ID', groupId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching group trips:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error in group trips GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups/trips - Add a trip to a group
export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient();

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { groupId, tripId } = body;

    // Validate required fields
    if (!groupId || !tripId) {
      return NextResponse.json({ error: 'Group ID and Trip ID are required' }, { status: 400 });
    }

    // Call the add_trip_to_group function
    const { data, error } = await supabase.rpc('add_trip_to_group', {
      p_group_id: groupId,
      p_trip_id: tripId,
    });

    if (error) {
      console.error('Error adding trip to group:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch the added trip
    const { data: trip, error: fetchError } = await supabase
      .from('group_trips')
      .select(
        `
        added_at,
        trip:${'trips'}!trip_id (
          id,
          name,
          start_date,
          end_date,
          created_by,
          destination_id,
          destinations:${'destinations'}!destination_id (
            id,
            name,
            country,
            image_url
          )
        )
      `
      )
      .eq('GROUP_ID', groupId)
      .eq('TRIP_ID', tripId)
      .single();

    if (fetchError) {
      console.error('Error fetching added trip:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    console.error('Error in group trips POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/groups/trips - Remove a trip from a group
export async function DELETE(request: Request) {
  try {
    const supabase = await getSupabaseClient();

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get URL params
    const url = new URL(request.url);
    const groupId = url.searchParams.get('groupId');
    const tripId = url.searchParams.get('tripId');

    if (!groupId || !tripId) {
      return NextResponse.json({ error: 'Group ID and Trip ID are required' }, { status: 400 });
    }

    // Check if user is admin/owner of the group
    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('role')
      .eq('GROUP_ID', groupId)
      .eq('USER_ID', session.user.id)
      .eq('STATUS', 'active')
      .single();

    if (membershipError || !membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json(
        { error: "You don't have permission to remove trips from this group" },
        { status: 403 }
      );
    }

    // Remove the trip from the group
    const { error } = await supabase
      .from('group_trips')
      .delete()
      .eq('GROUP_ID', groupId)
      .eq('TRIP_ID', tripId);

    if (error) {
      console.error('Error removing trip from group:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Trip removed from group successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in group trips DELETE route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
