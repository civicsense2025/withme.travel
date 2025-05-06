import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';

/**
 * POST /api/groups/[id]/plans/[planId]/add-ideas
 * Add existing ideas to a plan
 */
export async function POST(
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
    
    // Get the request body containing idea IDs to add
    const { ideaIds } = await request.json();
    
    if (!ideaIds || !Array.isArray(ideaIds) || ideaIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid idea IDs data' },
        { status: 400 }
      );
    }
    
    // Validate that these ideas belong to this group
    const { data: ideas, error: ideasError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .select('id')
      .eq(FIELDS.GROUP_IDEAS.GROUP_ID, params.id)
      .in('id', ideaIds);
    
    if (ideasError) {
      console.error('Error validating ideas:', ideasError);
      return NextResponse.json(
        { error: 'Failed to validate ideas' },
        { status: 500 }
      );
    }
    
    // Check if all ideas exist in the group
    if (!ideas || ideas.length !== ideaIds.length) {
      return NextResponse.json(
        { error: 'Some ideas do not belong to this group' },
        { status: 400 }
      );
    }
    
    // Update each idea to add it to the plan
    const updates = ideaIds.map(async (ideaId) => {
      const { error } = await supabase
        .from(TABLES.GROUP_IDEAS)
        .update({ plan_id: params.planId })
        .eq('id', ideaId)
        .eq(FIELDS.GROUP_IDEAS.GROUP_ID, params.id);
      
      if (error) {
        console.error(`Error adding idea ${ideaId} to plan:`, error);
        return { ideaId, success: false, error: error.message };
      }
      
      return { ideaId, success: true };
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updates);
    
    // Check if any updates failed
    const failures = results.filter(result => !result.success);
    
    if (failures.length > 0) {
      return NextResponse.json(
        {
          message: 'Some ideas could not be added to the plan',
          failures
        },
        { status: 207 } // Multi-Status
      );
    }
    
    // Fetch the updated ideas with their details
    const { data: updatedIdeas, error: fetchError } = await supabase
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
      .in('id', ideaIds);
    
    if (fetchError) {
      console.error('Error fetching updated ideas:', fetchError);
      return NextResponse.json(
        { 
          success: true, 
          message: 'Ideas added to plan, but could not fetch updated data',
        }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      ideas: updatedIdeas || [] 
    });
  } catch (error) {
    console.error('Error in add ideas to plan API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 