import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';

/**
 * PATCH /api/groups/[id]/plans/[planId]/ideas/position
 * Update the positions of ideas in a plan
 */
export async function PATCH(
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
    
    // Get the request body containing idea positions
    const { positions } = await request.json();
    
    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        { error: 'Invalid positions data' },
        { status: 400 }
      );
    }
    
    // Validate that these ideas belong to this plan and group
    const ideaIds = positions.map(p => p.ideaId);
    
    const { data: ideas, error: ideasError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .select('id')
      .eq(FIELDS.GROUP_IDEAS.GROUP_ID, params.id)
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
    
    // Update each idea's position
    const updates = positions.map(async ({ ideaId, position }) => {
      const { error } = await supabase
        .from(TABLES.GROUP_IDEAS)
        .update({ position })
        .eq('id', ideaId)
        .eq(FIELDS.GROUP_IDEAS.GROUP_ID, params.id)
        .eq('plan_id', params.planId);
      
      if (error) {
        console.error(`Error updating position for idea ${ideaId}:`, error);
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
          message: 'Some position updates failed',
          failures
        },
        { status: 207 } // Multi-Status
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update idea positions API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 