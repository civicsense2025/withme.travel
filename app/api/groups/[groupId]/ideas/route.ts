import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { GROUP_PLAN_IDEA_TYPE } from '@/utils/constants/status';
import { z } from 'zod';
import { 
  listGroupIdeas, 
  createGroupIdea, 
  checkGroupMemberRole 
} from '@/lib/api/groups';

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
    const memberCheckResult = await checkGroupMemberRole(
      params.groupId,
      user.id,
      ['owner', 'admin', 'member']
    );

    if (!memberCheckResult.success) {
      return NextResponse.json(
        { error: 'Error checking group membership' }, 
        { status: 500 }
      );
    }

    if (!memberCheckResult.data) {
      return NextResponse.json(
        { error: 'Not a member of this group' }, 
        { status: 403 }
      );
    }

    // Fetch ideas using centralized API
    const result = await listGroupIdeas(params.groupId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
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
    const memberCheckResult = await checkGroupMemberRole(
      params.groupId,
      user.id,
      ['owner', 'admin', 'member']
    );

    if (!memberCheckResult.success) {
      return NextResponse.json(
        { error: 'Error checking group membership' }, 
        { status: 500 }
      );
    }

    if (!memberCheckResult.data) {
      return NextResponse.json(
        { error: 'Not a member of this group' }, 
        { status: 403 }
      );
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

    // Create the idea using centralized API
    const result = await createGroupIdea(params.groupId, body, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/groups/[groupId]/ideas:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
