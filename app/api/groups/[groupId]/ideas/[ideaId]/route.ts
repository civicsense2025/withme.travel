/**
 * Group Plan Idea API Routes
 * 
 * Handles operations for a specific idea within a group:
 * - GET: Fetch a specific idea
 * - PUT: Update an idea
 * - DELETE: Remove an idea
 */

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { GROUP_PLAN_IDEA_TYPE } from '@/utils/constants/status';
import { 
  getGroupIdea, 
  updateGroupIdea, 
  deleteGroupIdea, 
  checkGroupMemberRole,
  voteGroupIdea
} from '@/lib/api/groups';

// Validation schema for updating an idea
const updateIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
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

// Validation schema for voting
const voteSchema = z.object({
  vote_type: z.enum(['up', 'down'])
});

/**
 * GET /api/groups/[groupId]/ideas/[ideaId]
 * Fetch a specific idea from a group
 */
export async function GET(
  request: Request, 
  { params }: { params: { groupId: string; ideaId: string } }
) {
  try {
    const { groupId, ideaId } = params;
    
    if (!groupId || !ideaId) {
      return NextResponse.json({ 
        error: 'Group ID and Idea ID are required' 
      }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Check if the user is a member of the group
    const memberResult = await checkGroupMemberRole(
      groupId,
      user.id,
      ['owner', 'admin', 'member']
    );

    if (!memberResult.success) {
      return NextResponse.json(
        { error: 'Error checking group membership' }, 
        { status: 500 }
      );
    }

    if (!memberResult.data) {
      return NextResponse.json(
        { error: 'Not a member of this group' }, 
        { status: 403 }
      );
    }

    // Fetch the idea
    const result = await getGroupIdea(groupId, ideaId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error }, 
        { status: result.error === 'Idea not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error in GET /api/groups/[groupId]/ideas/[ideaId]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/groups/[groupId]/ideas/[ideaId]
 * Update a specific idea
 */
export async function PUT(
  request: Request, 
  { params }: { params: { groupId: string; ideaId: string } }
) {
  try {
    const { groupId, ideaId } = params;
    
    if (!groupId || !ideaId) {
      return NextResponse.json({ 
        error: 'Group ID and Idea ID are required' 
      }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Check if the user is a member of the group
    const memberResult = await checkGroupMemberRole(
      groupId,
      user.id,
      ['owner', 'admin', 'member']
    );

    if (!memberResult.success) {
      return NextResponse.json(
        { error: 'Error checking group membership' }, 
        { status: 500 }
      );
    }

    if (!memberResult.data) {
      return NextResponse.json(
        { error: 'Not a member of this group' }, 
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Determine if this is a vote request
    const url = new URL(request.url);
    const isVote = url.searchParams.get('vote') === 'true';

    if (isVote) {
      try {
        const { vote_type } = voteSchema.parse(body);
        
        // Handle vote
        const voteResult = await voteGroupIdea(
          groupId, 
          ideaId,
          user.id,
          vote_type
        );
        
        if (!voteResult.success) {
          return NextResponse.json(
            { error: voteResult.error }, 
            { status: 500 }
          );
        }
        
        return NextResponse.json({ data: voteResult.data });
      } catch (validationError) {
        return NextResponse.json(
          { error: 'Invalid vote data', details: validationError },
          { status: 400 }
        );
      }
    } else {
      // Regular update
      try {
        updateIdeaSchema.parse(body);
      } catch (validationError) {
        return NextResponse.json(
          { error: 'Invalid idea data', details: validationError },
          { status: 400 }
        );
      }

      // Update the idea
      const result = await updateGroupIdea(groupId, ideaId, body);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error }, 
          { status: 500 }
        );
      }

      return NextResponse.json({ data: result.data });
    }
  } catch (error) {
    console.error('Error in PUT /api/groups/[groupId]/ideas/[ideaId]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[groupId]/ideas/[ideaId]
 * Delete a specific idea
 */
export async function DELETE(
  request: Request, 
  { params }: { params: { groupId: string; ideaId: string } }
) {
  try {
    const { groupId, ideaId } = params;
    
    if (!groupId || !ideaId) {
      return NextResponse.json({ 
        error: 'Group ID and Idea ID are required' 
      }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Check if the user is a member of the group with admin rights
    const memberResult = await checkGroupMemberRole(
      groupId,
      user.id,
      ['owner', 'admin']
    );

    if (!memberResult.success) {
      return NextResponse.json(
        { error: 'Error checking group membership' }, 
        { status: 500 }
      );
    }

    if (!memberResult.data) {
      return NextResponse.json(
        { error: 'You do not have permission to delete ideas' }, 
        { status: 403 }
      );
    }

    // Delete the idea
    const result = await deleteGroupIdea(groupId, ideaId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/groups/[groupId]/ideas/[ideaId]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
} 