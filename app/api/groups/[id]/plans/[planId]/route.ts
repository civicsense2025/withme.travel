import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, FIELDS } from '@/utils/constants/database';
import { cookies } from 'next/headers';

/**
 * Get a specific plan with ideas
 * GET /api/groups/[id]/plans/[planId]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
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
    
    // Fetch the plan with all related data
    const { data: plan, error } = await supabase
      .from(TABLES.GROUP_IDEA_PLANS)
      .select(`
        *,
        creator:${FIELDS.GROUP_IDEA_PLANS.CREATED_BY}(
          id, 
          email,
          user_metadata
        ),
        group:${FIELDS.GROUP_IDEA_PLANS.GROUP_ID}(
          id,
          name,
          emoji
        ),
        ideas:${TABLES.GROUP_IDEAS}(*)
      `)
      .eq(FIELDS.GROUP_IDEA_PLANS.ID, params.planId)
      .eq(FIELDS.GROUP_IDEA_PLANS.GROUP_ID, params.id)
      .single();
    
    if (error) {
      console.error('Error fetching plan:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Plan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch plan' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error processing plan request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Update a plan
 * PUT /api/groups/[id]/plans/[planId]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
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

    // Check membership and permissions (admin or creator only)
    const { data: group } = await supabase
      .from(TABLES.GROUPS)
      .select(`
        *,
        ${TABLES.GROUP_MEMBERS}(
          user_id,
          role
        )
      `)
      .eq(FIELDS.GROUPS.ID, params.id)
      .single();
    
    // Check if user is a member with admin privileges
    const isAdmin = group?.group_members?.some(
      (member: any) => member.user_id === user.id && 
      (member.role === 'admin' || member.role === 'owner')
    );
    
    // Check if user is the creator of the plan
    const { data: plan } = await supabase
      .from(TABLES.GROUP_IDEA_PLANS)
      .select('created_by')
      .eq(FIELDS.GROUP_IDEA_PLANS.ID, params.planId)
      .single();
    
    const isCreator = plan?.created_by === user.id;
    
    // Only allow admins or the creator to update
    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to update this plan' },
        { status: 403 }
      );
    }
    
    // Get and validate the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Update the plan
    const { data: updatedPlan, error } = await supabase
      .from(TABLES.GROUP_IDEA_PLANS)
      .update({
        [FIELDS.GROUP_IDEA_PLANS.NAME]: body.name,
        [FIELDS.GROUP_IDEA_PLANS.DESCRIPTION]: body.description || null,
        [FIELDS.GROUP_IDEA_PLANS.UPDATED_AT]: new Date().toISOString(),
        // Only update archive status if it's included in the request
        ...(body.is_archived !== undefined 
          ? { is_archived: body.is_archived } 
          : {})
      })
      .eq(FIELDS.GROUP_IDEA_PLANS.ID, params.planId)
      .eq(FIELDS.GROUP_IDEA_PLANS.GROUP_ID, params.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating plan:', error);
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error('Error processing update plan request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Delete a plan
 * DELETE /api/groups/[id]/plans/[planId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
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

    // Check membership and permissions (admin or creator only)
    const { data: group } = await supabase
      .from(TABLES.GROUPS)
      .select(`
        *,
        ${TABLES.GROUP_MEMBERS}(
          user_id,
          role
        )
      `)
      .eq(FIELDS.GROUPS.ID, params.id)
      .single();
    
    // Check if user is a member with admin privileges
    const isAdmin = group?.group_members?.some(
      (member: any) => member.user_id === user.id && 
      (member.role === 'admin' || member.role === 'owner')
    );
    
    // Check if user is the creator of the plan
    const { data: plan } = await supabase
      .from(TABLES.GROUP_IDEA_PLANS)
      .select('created_by')
      .eq(FIELDS.GROUP_IDEA_PLANS.ID, params.planId)
      .single();
    
    const isCreator = plan?.created_by === user.id;
    
    // Only allow admins or the creator to delete
    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this plan' },
        { status: 403 }
      );
    }
    
    // Delete the plan (cascades to ideas by RLS)
    const { error } = await supabase
      .from(TABLES.GROUP_IDEA_PLANS)
      .delete()
      .eq(FIELDS.GROUP_IDEA_PLANS.ID, params.planId)
      .eq(FIELDS.GROUP_IDEA_PLANS.GROUP_ID, params.id);
    
    if (error) {
      console.error('Error deleting plan:', error);
      return NextResponse.json(
        { error: 'Failed to delete plan' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing delete plan request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 