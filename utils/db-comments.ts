/**
 * Comments and Reactions Utility Functions
 * Provides functions for comment reactions interacting with the database
 */

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * Get comments for a specific content
 * @param contentType Type of content (e.g., 'trip', 'itinerary_item')
 * @param contentId ID of the content
 * @param limit Maximum number of comments to retrieve
 * @param offset Offset for pagination
 * @param parentId Optional parent comment ID for replies
 * @returns Comments array and total count
 */
export async function getComments(
  contentType: string,
  contentId: string,
  limit: number = 20,
  offset: number = 0,
  parentId: string | null = null
) {
  try {
    const supabase = await createRouteHandlerClient();

    // Use the database function to get comments with user information
    const { data, error } = await supabase.rpc('get_comments_with_user', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_limit: limit,
      p_offset: offset,
      p_parent_id: parentId,
    });

    if (error) {
      console.error('Error getting comments:', error);
      return { comments: [], count: 0 };
    }

    // Count total comments for pagination
    let countQuery = supabase
      .from(TABLES.COMMENTS)
      .select('id', { count: 'exact' })
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    // Apply parent ID filter for count query
    if (parentId === null) {
      // parent_id IS NULL
      countQuery = countQuery.is('parent_id', null);
    } else {
      // parent_id = parentId
      countQuery = countQuery.eq('parent_id', parentId);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting comments count:', countError);
      return { comments: data || [], count: data?.length || 0 };
    }

    return { comments: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error in getComments:', error);
    return { comments: [], count: 0 };
  }
}

/**
 * Create a new comment
 * @param userId User ID creating the comment
 * @param contentType Type of content being commented on
 * @param contentId ID of the content
 * @param text Comment text content
 * @param parentId Optional parent comment ID for replies
 * @returns The created comment or null if failed
 */
export async function createComment(
  userId: string,
  contentType: string,
  contentId: string,
  text: string,
  parentId: string | null = null
) {
  try {
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .insert({
        user_id: userId,
        content_type: contentType,
        content_id: contentId,
        text,
        parent_id: parentId,
      })
      .select(
        `
        *,
        user:profiles!user_id (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createComment:', error);
    return null;
  }
}

/**
 * Update an existing comment
 * @param commentId ID of the comment to update
 * @param userId User ID updating the comment (for permissions check)
 * @param text New comment text
 * @param attachmentUrl Optional URL to an attachment
 * @param attachmentType Optional type of attachment
 * @param metadata Optional metadata for the comment
 * @returns The updated comment or null if failed
 */
export async function updateComment(
  commentId: string,
  userId: string,
  text: string,
  attachmentUrl: string | null = null,
  attachmentType: string | null = null,
  metadata: Record<string, any> | null = null
) {
  try {
    const supabase = await createRouteHandlerClient();

    // Verify the user owns the comment before updating
    const { data: existingComment } = await supabase
      .from(TABLES.COMMENTS)
      .select('id')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();

    if (!existingComment) {
      console.error('User does not own this comment or comment does not exist');
      return null;
    }

    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .update({
        text,
        updated_at: new Date().toISOString(),
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        metadata,
      })
      .eq('id', commentId)
      .select(
        `
        *,
        user:profiles!user_id (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateComment:', error);
    return null;
  }
}

/**
 * Delete a comment
 * @param commentId ID of the comment to delete
 * @param userId User ID deleting the comment (for permissions check)
 * @returns Boolean indicating success
 */
export async function deleteComment(commentId: string, userId: string) {
  try {
    const supabase = await createRouteHandlerClient();

    // Verify the user owns the comment before deleting
    const { data: existingComment } = await supabase
      .from(TABLES.COMMENTS)
      .select('id')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();

    if (!existingComment) {
      console.error('User does not own this comment or comment does not exist');
      return false;
    }

    const { error } = await supabase.from(TABLES.COMMENTS).delete().eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return false;
  }
}

/**
 * Get all reactions for a specific comment
 * @param commentId The ID of the comment
 * @returns Array of comment reactions with user info
 */
export async function getCommentReactions(commentId: string) {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase.rpc('get_comment_reactions', {
      p_comment_id: commentId,
    });

    if (error) {
      console.error('Error getting comment reactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCommentReactions:', error);
    return [];
  }
}

/**
 * Add a reaction to a comment
 * @param commentId The ID of the comment
 * @param userId The ID of the user adding the reaction
 * @param emoji The emoji to add as a reaction
 * @returns The added reaction or null if failed
 */
export async function addCommentReaction(commentId: string, userId: string, emoji: string) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check if reaction already exists to avoid duplicates
    const { data: existingReaction } = await supabase
      .from(TABLES.COMMENT_REACTIONS)
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
      .single();

    if (existingReaction) {
      // Reaction already exists, return it
      return existingReaction;
    }

    // Add the new reaction
    const { data, error } = await supabase
      .from(TABLES.COMMENT_REACTIONS)
      .insert({
        comment_id: commentId,
        user_id: userId,
        emoji,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment reaction:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in addCommentReaction:', error);
    return null;
  }
}

/**
 * Remove a reaction from a comment
 * @param commentId The ID of the comment
 * @param userId The ID of the user removing the reaction
 * @param emoji The emoji to remove
 * @returns Boolean indicating success
 */
export async function removeCommentReaction(commentId: string, userId: string, emoji: string) {
  try {
    const supabase = await createRouteHandlerClient();

    const { error } = await supabase
      .from(TABLES.COMMENT_REACTIONS)
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (error) {
      console.error('Error removing comment reaction:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in removeCommentReaction:', error);
    return false;
  }
}
