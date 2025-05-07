import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { getGuestToken } from '@/utils/guest';

/**
 * Get all plans for a group
 * GET /api/groups/[id]/plans
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly handle params as it might be a Promise in Next.js App Router
    const params = await context.params;
    const groupId = params.id;
    
    const supabase = await createRouteHandlerClient();
    // Get the current user if authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    let isGuest = false;
    let guestToken: string | null = null;
    if (!user) {
      guestToken = await getGuestToken();
      if (!guestToken) {
        return NextResponse.json(
          { error: 'Authentication or guest token required' },
          { status: 401 }
        );
      }
      isGuest = true;
    }
    // For guests, allow read-only access (no membership check)
    if (!isGuest) {
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      // Check membership for authenticated users
      const { data: membership } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!membership) {
        return NextResponse.json(
          { error: 'Not a member of this group' },
          { status: 403 }
        );
      }
    }
    // Get query params
    const url = new URL(request.url);
    const includeArchived = url.searchParams.get('include_archived') === 'true';
    // Fetch plans with creators - Select only fields that exist in the profiles table
    let query = supabase
      .from('group_idea_plans')
      .select(`
        *,
        creator:created_by(
          id,
          name,
          avatar_url,
          username
        ),
        ideas:group_ideas(id)
      `)
      .eq('group_id', groupId);
    // Filter out archived plans unless explicitly requested
    if (!includeArchived) {
      query = query.is('is_archived', null).or('is_archived.eq.false');
    }
    // For guests, include plans created by this guest token as well as public plans
    if (isGuest && guestToken) {
      // Show plans where created_by_guest_token is null (normal plans) or matches this guest
      query = query.or(`created_by_guest_token.is.null,created_by_guest_token.eq.${guestToken}`);
    }
    const { data: plans, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching group plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch group plans' },
        { status: 500 }
      );
    }
    // Count ideas for each plan
    const plansWithCounts = plans?.map((plan: any) => ({
      ...plan,
      ideas_count: plan.ideas?.length || 0,
      ideas: undefined // Don't return all ideas, just the count
    })) || [];
    return NextResponse.json({ plans: plansWithCounts });
  } catch (error) {
    console.error('Error processing group plans request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Create a new plan for a group
 * POST /api/groups/[id]/plans
 */
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  // context.params is always an object in Next.js App Router
  const params = await context.params;
  const groupId = params.id;

  const supabase = await createRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();
  let guestToken: string | null = null;
  let createdByGuestToken: string | null = null;

  if (!user) {
    guestToken = await getGuestToken();
    if (!guestToken) {
      return NextResponse.json({ error: 'Missing guest token' }, { status: 401 });
    }
    createdByGuestToken = guestToken;
    // Insert into group_guest_members if not already present
    const { data: existing } = await supabase
      .from('group_guest_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('guest_token', guestToken)
      .maybeSingle();
    if (!existing) {
      await supabase.from('group_guest_members').insert({ group_id: groupId, guest_token: guestToken });
    }
  }

  // Parse plan data from request
  const body = await request.json();
  // Defensive: validate required fields
  if (!body.name) {
    return NextResponse.json({ error: 'Missing plan title' }, { status: 400 });
  }

  // Insert plan
  const { data: plan, error } = await supabase.from('group_idea_plans').insert({
    group_id: groupId,
    name: body.name,
    description: body.description ?? null,
    created_by: user ? user.id : null,
    created_by_guest_token: createdByGuestToken,
    // ...other fields as needed
  }).select('*').single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plan });
} 