import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/tables';
import { z } from 'zod';

// Schema for comment request
const commentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  parent_id: z.number().nullable().optional(),
});

/**
 * GET /api/trips/[tripId]/itinerary/[itemId]/comments
 * Get all comments for an itinerary item
 */
export async function GET(
  req: NextRequest,
  context: { params: { tripId: string; itemId: string } }
) {
  // Await the params object before using its properties
  const { tripId, itemId } = await context.params;
  const supabase = await createRouteHandlerClient();

  try {
    // Authenticate the request
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this trip
    const { data: tripAccess } = await supabase
      .from(TABLES.TRIPS)
      .select('id')
      .eq('id', tripId)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .single();

    if (!tripAccess) {
      return NextResponse.json({ error: 'Trip not found or no access' }, { status: 404 });
    }

    // Fetch all comments for this item
    const { data: comments, error } = await supabase
      .from('itinerary_item_comments')
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        user_id,
        parent_id,
        is_deleted,
        is_edited
      `
      )
      .eq('item_id', itemId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Process comments to create a nested structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First, map all comments by their ID
    comments.forEach((comment: any) => {
      const { profiles, ...commentWithoutProfiles } = comment;
      commentMap.set(comment.id, {
        ...commentWithoutProfiles,
        user: profiles,
        replies: [],
      });
    });

    // Now, create the tree structure
    comments.forEach((comment: any) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.parent_id) {
        // This is a reply, add it to its parent's replies array
        const parentComment = commentMap.get(comment.parent_id);
        if (parentComment) {
          parentComment.replies.push(commentWithReplies);
        } else {
          // If parent not found (shouldn't happen), treat as root
          rootComments.push(commentWithReplies);
        }
      } else {
        // This is a root comment
        rootComments.push(commentWithReplies);
      }
    });

    return NextResponse.json({
      comments: rootComments,
      count:
        rootComments.length +
        rootComments.reduce((count, comment) => count + (comment.replies?.length || 0), 0),
    });
  } catch (error) {
    console.error('Error processing comment request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/trips/[tripId]/itinerary/[itemId]/comments
 * Create a new comment on an itinerary item
 */
export async function POST(
  req: NextRequest,
  context: { params: { tripId: string; itemId: string } }
) {
  // Await the params object before using its properties
  const { tripId, itemId } = await context.params;
  const supabase = await createRouteHandlerClient();

  try {
    // Authenticate the request
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to this trip
    const { data: tripAccess } = await supabase
      .from(TABLES.TRIPS)
      .select('id')
      .eq('id', tripId)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .single();

    if (!tripAccess) {
      return NextResponse.json({ error: 'Trip not found or no access' }, { status: 404 });
    }

    // Parse and validate the request body
    const requestBody = await req.json();
    const validationResult = commentSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid comment data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { content, parent_id } = validationResult.data;

    // Insert the new comment
    const { data: newComment, error } = await supabase
      .from('itinerary_item_comments')
      .insert({
        item_id: itemId,
        user_id: user.id,
        content,
        parent_id,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({ comment: newComment });
  } catch (error) {
    console.error('Error processing comment creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/trips/[tripId]/itinerary/[itemId]/comments
 * Update a comment (edit content or mark as deleted)
 */
export async function PATCH(
  request: Request,
  context: { params: { tripId: string; itemId: string } }
) {
  // Await the params object before using its properties
  const { tripId, itemId } = await context.params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get comment ID and update data from request
    const { commentId, content, is_deleted } = await request.json();

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Verify ownership of the comment
    const { data: comment, error: commentError } = await supabase
      .from('itinerary_item_comments')
      .select('user_id')
      .eq('id', commentId)
      .eq('item_id', itemId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user owns the comment
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this comment' }, { status: 403 });
    }

    // Build update object based on what's provided
    const updateData: any = {};

    if (content) {
      updateData.content = content;
      updateData.is_edited = true;
    }

    if (typeof is_deleted === 'boolean') {
      updateData.is_deleted = is_deleted;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 });
    }

    // Update the comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('itinerary_item_comments')
      .update(updateData)
      .eq('id', commentId)
      .eq('item_id', itemId)
      .select('*');

    if (updateError) {
      return NextResponse.json(
        { error: 'Error updating comment', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: updatedComment });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Unexpected error', details: error.message },
      { status: 500 }
    );
  }
}
