import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES, ENUMS } from '@/utils/constants/tables';
import { z } from 'zod';

// Validation schema for updating an idea
const updateIdeaSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  type: z.enum([
    ENUMS.GROUP_PLAN_IDEA_TYPE.DESTINATION,
    ENUMS.GROUP_PLAN_IDEA_TYPE.DATE,
    ENUMS.GROUP_PLAN_IDEA_TYPE.ACTIVITY,
    ENUMS.GROUP_PLAN_IDEA_TYPE.BUDGET,
    ENUMS.GROUP_PLAN_IDEA_TYPE.OTHER,
    ENUMS.GROUP_PLAN_IDEA_TYPE.QUESTION,
    ENUMS.GROUP_PLAN_IDEA_TYPE.NOTE,
    ENUMS.GROUP_PLAN_IDEA_TYPE.PLACE
  ]).optional(),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
  meta: z.record(z.any()).optional(),
  selected: z.boolean().optional()
});

/**
 * GET /api/groups/[id]/ideas/[ideaId]
 * Get a specific idea
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string; ideaId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if the user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (membershipError) {
      console.error('Error checking group membership:', membershipError);
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }
    
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }
    
    // Fetch the specific idea
    const { data: idea, error: ideaError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .select('*')
      .eq('id', params.ideaId)
      .eq('group_id', params.id)
      .single();
    
    if (ideaError) {
      console.error('Error fetching idea:', ideaError);
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    return NextResponse.json(idea);
    
  } catch (error) {
    console.error('Error in GET /api/groups/[id]/ideas/[ideaId]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * PATCH /api/groups/[id]/ideas/[ideaId]
 * Update a specific idea
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; ideaId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if the user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (membershipError) {
      console.error('Error checking group membership:', membershipError);
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }
    
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }
    
    // Check if the idea exists and belongs to the group
    const { data: idea, error: ideaError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .select('*')
      .eq('id', params.ideaId)
      .eq('group_id', params.id)
      .single();
    
    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate the request body
    try {
      updateIdeaSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json({ error: 'Invalid idea data', details: validationError }, { status: 400 });
    }
    
    // Update the idea
    const updateData = {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.start_date !== undefined && { start_date: body.start_date }),
      ...(body.end_date !== undefined && { end_date: body.end_date }),
      ...(body.meta !== undefined && { meta: body.meta }),
      ...(body.selected !== undefined && { selected: body.selected }),
      updated_at: new Date().toISOString()
    };
    
    const { data: updatedIdea, error: updateError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .update(updateData)
      .eq('id', params.ideaId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating idea:', updateError);
      return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
    }
    
    return NextResponse.json(updatedIdea);
    
  } catch (error) {
    console.error('Error in PATCH /api/groups/[id]/ideas/[ideaId]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * DELETE /api/groups/[id]/ideas/[ideaId]
 * Delete a specific idea
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; ideaId: string } }
) {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if the user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (membershipError) {
      console.error('Error checking group membership:', membershipError);
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }
    
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }
    
    // Check if the idea exists and belongs to the group
    const { data: idea, error: ideaError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .select('created_by')
      .eq('id', params.ideaId)
      .eq('group_id', params.id)
      .single();
    
    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    // Only allow the creator or a group admin to delete the idea
    if (idea.created_by !== user.id) {
      // Check if the user is a group admin
      const { data: adminCheck, error: adminCheckError } = await supabase
        .from(TABLES.GROUP_MEMBERS)
        .select('role')
        .eq('group_id', params.id)
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (adminCheckError || !adminCheck) {
        return NextResponse.json({ error: 'You do not have permission to delete this idea' }, { status: 403 });
      }
    }
    
    // Delete the idea
    const { error: deleteError } = await supabase
      .from(TABLES.GROUP_IDEAS)
      .delete()
      .eq('id', params.ideaId);
    
    if (deleteError) {
      console.error('Error deleting idea:', deleteError);
      return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]/ideas/[ideaId]:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 