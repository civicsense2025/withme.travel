import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

// GET /api/groups/members - List group members
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

    // Get all members with their profiles
    const { data: members, error } = await supabase
      .from('group_members')
      .select(
        `
        user_id,
        role,
        status,
        joined_at,
        updated_at,
        profiles:${'profiles'}(
          id,
          avatar_url,
          full_name,
          username
        )
      `
      )
      .eq('GROUP_ID', groupId);

    if (error) {
      console.error('Error fetching group members:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error in group members GET route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups/members - Invite a user to a group
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
    const { groupId, userId, role = 'member' } = body;

    // Validate required fields
    if (!groupId || !userId) {
      return NextResponse.json({ error: 'Group ID and User ID are required' }, { status: 400 });
    }

    // Call the invite_to_group function
    const { data, error } = await supabase.rpc('invite_to_group', {
      p_group_id: groupId,
      p_user_id: userId,
      p_role: role,
    });

    if (error) {
      console.error('Error inviting user to group:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch the created invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('group_members')
      .select(
        `
        user_id,
        role,
        status,
        updated_at,
        profiles:${'profiles'} (
          id,
          avatar_url,
          full_name,
          username
        )
      `
      )
      .eq('GROUP_ID', groupId)
      .eq('USER_ID', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching invitation:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Error in group members POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
