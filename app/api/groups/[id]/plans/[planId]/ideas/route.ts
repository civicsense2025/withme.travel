import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';

/**
 * GET /api/groups/[id]/plans/[planId]/ideas
 * Get all ideas for a specific plan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is a member of the group
    const { data: membership, error: membershipError } = await supabase
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
    
    // Check if plan exists and belongs to this group
    const { data: plan, error: planError } = await supabase
      .from(TABLES.GROUP_IDEA_PLANS)
      .select('*')
      .eq('id', params.planId)
      .eq(FIELDS.GROUP_IDEA_PLANS.GROUP_ID, params.id)
      .single();
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or does not belong to this group' },
        { status: 404 }
      );
    }
    
    // Fetch ideas associated with this plan
    const { data: ideas, error: ideasError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .select(`
        *,
        creator:${FIELDS.GROUP_IDEAS.CREATED_BY}(
          id,
          email,
          user_metadata
        ),
        votes:${TABLES.GROUP_IDEA_VOTES}(
          id,
          user_id,
          vote_type
        )
      `)
      .eq(FIELDS.GROUP_IDEAS.GROUP_ID, params.id)
      .eq('plan_id', params.planId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });
    
    if (ideasError) {
      console.error('Error fetching plan ideas:', ideasError);
      return NextResponse.json(
        { error: 'Failed to fetch plan ideas' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ ideas: ideas || [] });
  } catch (error) {
    console.error('Error in get plan ideas API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 