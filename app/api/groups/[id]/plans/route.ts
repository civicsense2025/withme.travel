import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';
import { cookies } from 'next/headers';

/**
 * Get all plans for a group
 * GET /api/groups/[id]/plans
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user if authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check membership
    const { data: membership } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq(FIELDS.GROUP_MEMBERS.GROUP_ID, params.id)
      .eq(FIELDS.GROUP_MEMBERS.USER_ID, user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }
    
    // Get query params
    const url = new URL(request.url);
    const includeArchived = url.searchParams.get('include_archived') === 'true';
    
    // Fetch plans with creators
    let query = supabase
      .from(TABLES.GROUP_IDEA_PLANS)
      .select(`
        *,
        creator:${FIELDS.GROUP_IDEA_PLANS.CREATED_BY}(
          id,
          email,
          user_metadata
        ),
        ideas:${TABLES.GROUP_IDEAS}(id)
      `)
      .eq(FIELDS.GROUP_IDEA_PLANS.GROUP_ID, params.id);
    
    // Filter out archived plans unless explicitly requested
    if (!includeArchived) {
      query = query.is('is_archived', null).or('is_archived.eq.false');
    }
    
    const { data: plans, error } = await query.order(FIELDS.GROUP_IDEA_PLANS.CREATED_AT, { ascending: false });
    
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
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the current user if authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check membership
    const { data: membership } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq(FIELDS.GROUP_MEMBERS.GROUP_ID, params.id)
      .eq(FIELDS.GROUP_MEMBERS.USER_ID, user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Insert new plan
    const { data: plan, error } = await supabase
      .from(TABLES.GROUP_IDEA_PLANS)
      .insert({
        [FIELDS.GROUP_IDEA_PLANS.GROUP_ID]: params.id,
        [FIELDS.GROUP_IDEA_PLANS.NAME]: body.name,
        [FIELDS.GROUP_IDEA_PLANS.DESCRIPTION]: body.description || null,
        [FIELDS.GROUP_IDEA_PLANS.CREATED_BY]: user.id,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating group plan:', error);
      return NextResponse.json(
        { error: 'Failed to create group plan' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error processing create plan request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 