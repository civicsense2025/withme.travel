import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';

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
      .from('group_members')
      .select('*')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      );
    }
    
    // Fetch the plan with all related data
    const { data: plan, error } = await supabase
      .from(TABLES.GROUP_PLANS)
      .select(`
        *,
        creator:created_by(
          id,
          name,
          emoji
        ),
        ideas:${TABLES.GROUP_PLAN_IDEAS}(*)
      `)
      .eq('id', params.planId)
      .eq('group_id', params.id)
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
      .from('groups')
      .select(`
        *,
        ${'group_members'}(
          user_id,
          role
        )
      `)
      .eq('id', params.id)
      .single();
    
    // Check if user is a member with admin privileges
    const isAdmin = group?.group_members?.some(
      (member: any) => member.user_id === user.id && 
      (member.role === 'admin' || member.role === 'owner')
    );
    
    // Check if user is the creator of the plan
    const { data: plan } = await supabase
      .from(TABLES.GROUP_PLANS)
      .select('created_by')
      .eq('id', params.planId)
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
      .from(TABLES.GROUP_PLANS)
      .update({
        name: body.name,
        description: body.description || null,
        updated_at: new Date().toISOString(),
        // Only update archive status if it's included in the request
        ...(body.is_archived !== undefined 
          ? { is_archived: body.is_archived } 
          : {})
      })
      .eq('id', params.planId)
      .eq('group_id', params.id)
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
      .from('groups')
      .select(`
        *,
        ${'group_members'}(
          user_id,
          role
        )
      `)
      .eq('id', params.id)
      .single();
    
    // Check if user is a member with admin privileges
    const isAdmin = group?.group_members?.some(
      (member: any) => member.user_id === user.id && 
      (member.role === 'admin' || member.role === 'owner')
    );
    
    // Check if user is the creator of the plan
    const { data: plan } = await supabase
      .from(TABLES.GROUP_PLANS)
      .select('created_by')
      .eq('id', params.planId)
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
      .from(TABLES.GROUP_PLANS)
      .delete()
      .eq('id', params.planId)
      .eq('group_id', params.id);
    
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