import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

/**
 * POST /api/groups/[id]/plans/[planId]/remove-ideas
 * Remove ideas from a plan (doesn't delete them, just unlinks them)
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
      .from('group_members')
      .select('*')
      .eq('GROUP_ID', params.id)
      .eq('USER_ID', user.id)
      .maybeSingle();
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }
    
    // Check if plan exists and belongs to this group
    const { data: plan, error: planError } = await supabase
      .from('group_idea_plans')
      .select('*')
      .eq('id', params.planId)
      .eq('GROUP_ID', params.id)
      .single();
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or does not belong to this group' },
        { status: 404 }
      );
    }
    
    // Get the request body containing idea IDs to remove
    const { ideaIds } = await request.json();
    
    if (!ideaIds || !Array.isArray(ideaIds) || ideaIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid idea IDs data' },
        { status: 400 }
      );
    }
    
    // Validate that these ideas belong to this plan and group
    const { data: ideas, error: ideasError } = await supabase
      .from('group_ideas')
      .select('id')
      .eq('GROUP_ID', params.id)
      .eq('plan_id', params.planId)
      .in('id', ideaIds);
    
    if (ideasError) {
      console.error('Error validating ideas:', ideasError);
      return NextResponse.json(
        { error: 'Failed to validate ideas' },
        { status: 500 }
      );
    }
    
    // Check if all ideas exist in the plan
    if (!ideas || ideas.length !== ideaIds.length) {
      return NextResponse.json(
        { error: 'Some ideas do not belong to this plan or group' },
        { status: 400 }
      );
    }
    
    // Update each idea to remove it from the plan
    const updates = ideaIds.map(async (ideaId) => {
      const { error } = await supabase
        .from('group_ideas')
        .update({ plan_id: null })
        .eq('id', ideaId)
        .eq('GROUP_ID', params.id)
        .eq('plan_id', params.planId);
      
      if (error) {
        console.error(`Error removing idea ${ideaId} from plan:`, error);
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
          message: 'Some ideas could not be removed from the plan',
          failures
        },
        { status: 207 } // Multi-Status
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      removedIdeaIds: ideaIds
    });
  } catch (error) {
    console.error('Error in remove ideas from plan API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 