import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { GROUP_PLAN_IDEA_TYPE } from '@/utils/constants/status';
import { z } from 'zod';

// Validation schema for creating a new idea
const createIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum([
    GROUP_PLAN_IDEA_TYPE.DESTINATION,
    GROUP_PLAN_IDEA_TYPE.DATE,
    GROUP_PLAN_IDEA_TYPE.ACTIVITY,
    GROUP_PLAN_IDEA_TYPE.BUDGET,
    GROUP_PLAN_IDEA_TYPE.OTHER,
    GROUP_PLAN_IDEA_TYPE.QUESTION,
    GROUP_PLAN_IDEA_TYPE.NOTE,
    GROUP_PLAN_IDEA_TYPE.PLACE,
  ]),
  start_date: z.string().datetime().optional().nullable(),
  end_date: z.string().datetime().optional().nullable(),
  meta: z.record(z.any()).optional(),
});

/**
 * GET /api/groups/[groupId]/ideas
 * Fetch ideas for a specific group
 */
export async function GET(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', params.groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      console.error('Error checking group membership:', membershipError);
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Fetch all ideas for the group
    const { data: ideas, error: ideasError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .select('*')
      .eq('group_id', params.groupId)
      .order('created_at', { ascending: false });

    if (ideasError) {
      console.error('Error fetching ideas:', ideasError);
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
    }

    return NextResponse.json({ data: ideas });
  } catch (error) {
    console.error('Error in GET /api/groups/[groupId]/ideas:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

/**
 * POST /api/groups/[groupId]/ideas
 * Create a new idea for a group
 */
export async function POST(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if the user is a member of the group
    const { data: membership, error: membershipError } = await supabase
      .from(TABLES.GROUP_MEMBERS)
      .select('*')
      .eq('group_id', params.groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError) {
      console.error('Error checking group membership:', membershipError);
      return NextResponse.json({ error: 'Error checking group membership' }, { status: 500 });
    }

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Validate the request body
    try {
      createIdeaSchema.parse(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: 'Invalid idea data', details: validationError },
        { status: 400 }
      );
    }

    // Create the idea
    const ideaData = {
      group_id: params.groupId,
      title: body.title,
      description: body.description,
      type: body.type,
      created_by: user.id,
      start_date: body.start_date,
      end_date: body.end_date,
      meta: body.meta,
      votes_up: 0,
      votes_down: 0,
    };

    const { data: newIdea, error: createError } = await supabase
      .from(TABLES.GROUP_PLAN_IDEAS)
      .insert(ideaData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating idea:', createError);
      return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
    }

    return NextResponse.json({ data: newIdea }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/groups/[groupId]/ideas:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
