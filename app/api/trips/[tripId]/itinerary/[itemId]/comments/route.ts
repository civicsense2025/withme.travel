import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { TABLES } from '@/utils/constants/database';
import { z } from 'zod';

// Schema for comment request
const commentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  parent_id: z.string().uuid().nullable().optional(),
});

/**
 * GET /api/trips/[tripId]/itinerary/[itemId]/comments
 * Get all comments for an itinerary item
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string; itemId: string } }
) {
  const { tripId, itemId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Authenticate the request
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to this trip
    const { data: tripAccess } = await supabase
      .from(TABLES.TRIPS)
      .select('id')
      .eq('id', tripId)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .single();

    if (!tripAccess) {
      return NextResponse.json(
        { error: 'Trip not found or no access' },
        { status: 404 }
      );
    }

    // Fetch all comments for this item
    const { data: comments, error } = await supabase
      .from('itinerary_item_comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        parent_id,
        profiles:user_id (
          name,
          avatar_url
        ),
        reactions:itinerary_comment_reactions (
          id,
          emoji,
          user_id,
          created_at
        )
      `)
      .eq('item_id', itemId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Process comments to create a nested structure
    const commentMap = new Map();
    const rootComments: any[] = [];

    // First, map all comments by their ID
    comments.forEach((comment: any) => {
      commentMap.set(comment.id, {
        ...comment,
        user: comment.profiles,
        replies: []
      });
      delete comment.profiles; // Remove the nested profiles object
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
      count: rootComments.length + rootComments.reduce((count, comment) => 
        count + (comment.replies?.length || 0), 0)
    });
  } catch (error) {
    console.error('Error processing comment request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trips/[tripId]/itinerary/[itemId]/comments
 * Create a new comment on an itinerary item
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { tripId: string; itemId: string } }
) {
  const { tripId, itemId } = params;
  const supabase = await createRouteHandlerClient();
  
  try {
    // Authenticate the request
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to this trip
    const { data: tripAccess } = await supabase
      .from(TABLES.TRIPS)
      .select('id')
      .eq('id', tripId)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .single();

    if (!tripAccess) {
      return NextResponse.json(
        { error: 'Trip not found or no access' },
        { status: 404 }
      );
    }

    // Get the comment content from the request body
    const { content, parent_id } = await req.json();

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // If this is a reply, verify parent comment exists
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from('itinerary_item_comments')
        .select('id')
        .eq('id', parent_id)
        .eq('item_id', itemId)
        .single();

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create the new comment
    const { data: newComment, error } = await supabase
      .from('itinerary_item_comments')
      .insert({
        content: content.trim(),
        user_id: user.id,
        item_id: itemId,
        parent_id: parent_id || null
      })
      .select(`
        id,
        content,
        created_at,
        user_id,
        parent_id,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedComment = {
      ...newComment,
      user: newComment.profiles,
      reactions: []
    };
    delete formattedComment.profiles;

    return NextResponse.json({ comment: formattedComment });
  } catch (error) {
    console.error('Error processing comment creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/trips/[tripId]/itinerary/[itemId]/comments
 * Update a comment (edit content or mark as deleted)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { tripId: string; itemId: string } }
) {
  const { tripId, itemId } = params;
  const supabase = await createRouteHandlerClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to update a comment' },
        { status: 401 }
      );
    }

    // Get comment ID and update data from request
    const { commentId, content, is_deleted } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Verify the comment exists and belongs to this user
    const { data: comment, error: commentError } = await supabase
      .from('itinerary_item_comments')
      .select('id, user_id')
      .eq('id', commentId)
      .eq('item_id', itemId)
      .single();

    if (commentError) {
      return NextResponse.json(
        { error: 'Comment not found', details: commentError.message },
        { status: 404 }
      );
    }

    // Check if user owns the comment or is a trip admin
    if (comment.user_id !== user.id) {
      // Check if user is trip admin
      const { data: membership, error: membershipError } = await supabase
        .from('trip_members')
        .select('role')
        .eq('trip_id', tripId)
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (membershipError && membershipError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Error checking admin status', details: membershipError.message },
          { status: 500 }
        );
      }

      if (!membership) {
        return NextResponse.json(
          { error: 'You can only edit your own comments' },
          { status: 403 }
        );
      }
    }

    // Build update object based on what's provided
    const updateData: any = {};

    if (typeof is_deleted === 'boolean') {
      updateData.is_deleted = is_deleted;
    }

    if (content) {
      // Validate content
      const contentValidation = z.string().trim().min(1).max(2000).safeParse(content);
      if (!contentValidation.success) {
        return NextResponse.json(
          { error: 'Invalid content', details: contentValidation.error.errors },
          { status: 400 }
        );
      }
      updateData.content = content;
      updateData.is_edited = true;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }

    // Update the comment
    const { data: updatedComment, error: updateError } = await supabase
      .from('itinerary_item_comments')
      .update(updateData)
      .eq('id', commentId)
      .select(`
        id, 
        content,
        created_at,
        updated_at,
        user_id,
        is_edited,
        is_deleted,
        parent_id,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .single();

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