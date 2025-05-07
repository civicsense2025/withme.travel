import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/database';
import { GroupIdea, ColumnId, IdeaPosition } from '../../../../../../groups/[id]/plans/[slug]/store/idea-store';
import { cookies } from 'next/headers';

/**
 * GET /api/groups/[id]/plans/[planId]/ideas
 * Get all ideas in a plan
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
    
    // Check if plan exists and belongs to this group
    const { data: plan, error: planError } = await supabase
      .from('group_idea_plans')
      .select('*')
      .eq('id', params.planId)
      .eq('group_id', params.id)
      .single();
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or does not belong to this group' },
        { status: 404 }
      );
    }
    
    // Get ideas for this plan
    const { data: ideas, error: ideasError } = await supabase
      .from('group_ideas')
      .select(`
        *,
        creator:created_by(
          id,
          email,
          user_metadata
        ),
        votes:group_idea_votes(
          id,
          user_id,
          vote_type
        )
      `)
      .eq('group_id', params.id)
      .eq('plan_id', params.planId)
      .order('created_at', { ascending: false });
    
    if (ideasError) {
      console.error('Error fetching ideas:', ideasError);
      return NextResponse.json(
        { error: 'Failed to fetch ideas' },
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

/**
 * POST /api/groups/[id]/plans/[planId]/ideas
 * Add a new idea to a plan directly
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
      .eq('group_id', params.id)
      .eq('user_id', user.id)
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
      .eq('group_id', params.id)
      .single();
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found or does not belong to this group' },
        { status: 404 }
      );
    }
    
    // Get request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }
    
    // Ensure position is properly handled if present
    let position: IdeaPosition | null = null;
    if (body.position) {
      if (typeof body.position !== 'object' || !body.position.columnId || typeof body.position.index !== 'number') {
        return NextResponse.json(
          { error: 'Invalid position format' },
          { status: 400 }
        );
      }
      position = {
        columnId: body.position.columnId,
        index: body.position.index
      };
    }
    
    // Create the new idea
    const { data: idea, error: createError } = await supabase
      .from('group_ideas')
      .insert({
        title: body.name,
        description: body.description || null,
        type: body.type,
        group_id: params.id,
        plan_id: params.planId,
        created_by: user.id,
        position: position,
        notes: body.notes || null,
        link: body.link || null,
        link_meta: body.link_meta || null,
        start_date: body.start_date || null,
        end_date: body.end_date || null
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating idea:', createError);
      return NextResponse.json(
        { error: 'Failed to create idea' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ idea });
  } catch (error) {
    console.error('Error in create plan idea API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 