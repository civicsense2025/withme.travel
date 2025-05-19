/**
 * Comments API
 *
 * Provides CRUD operations and custom actions for comments on trips, itinerary items, group ideas, etc.
 * Used for managing collaborative discussions and feedback.
 *
 * @module lib/api/comments
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, Comment } from './_shared';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all comments for a given entity.
 * @param entityId - The entity's unique identifier (trip, item, etc.)
 * @param entityType - The type of entity (e.g., 'trip', 'itinerary_item')
 * @returns Result containing an array of comments
 */
export async function listComments(
  entityId: string,
  entityType: string
): Promise<Result<Comment[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .select('*')
      .eq('content_id', entityId)
      .eq('content_type', entityType);
    if (error) return { success: false, error: error.message };
    
    // Transform data to match Comment interface if needed
    const comments = data?.map(item => ({
      id: item.id,
      entity_id: item.content_id,
      entity_type: item.content_type,
      content: item.content,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at || null,
      parent_id: item.parent_id || null,
      is_edited: item.is_edited || false,
      is_deleted: item.is_deleted || false,
      attachment_url: item.attachment_url || null,
      attachment_type: item.attachment_type || null
    })) || [];
    
    return { success: true, data: comments };
  } catch (error) {
    return handleError(error, 'Failed to fetch comments');
  }
}

/**
 * Get a single comment by ID.
 * @param commentId - The comment's unique identifier
 * @returns Result containing the comment
 */
export async function getComment(commentId: string): Promise<Result<Comment>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .select('*')
      .eq('id', commentId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Comment not found' };
    
    // Transform to match Comment interface
    const comment: Comment = {
      id: data.id,
      entity_id: data.content_id,
      entity_type: data.content_type,
      content: data.content,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at || null,
      parent_id: data.parent_id || null,
      is_edited: data.is_edited || false,
      is_deleted: data.is_deleted || false,
      attachment_url: data.attachment_url || null,
      attachment_type: data.attachment_type || null
    };
    
    return { success: true, data: comment };
  } catch (error) {
    return handleError(error, 'Failed to fetch comment');
  }
}

/**
 * Add a new comment to an entity.
 * @param data - The comment data including entityId, entityType, and content
 * @returns Result containing the created comment
 */
export async function addComment(data: Partial<Comment>): Promise<Result<Comment>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Validate required fields
    if (!data.entity_id || !data.entity_type || !data.content || !data.user_id) {
      return { 
        success: false, 
        error: 'Missing required fields: entity_id, entity_type, content and user_id are required' 
      };
    }
    
    // Prepare the comment data for insertion with correct field mapping
    const commentData = {
      content_id: data.entity_id,
      content_type: data.entity_type,
      content: data.content,
      user_id: data.user_id,
      parent_id: data.parent_id || null,
      attachment_url: data.attachment_url || null,
      attachment_type: data.attachment_type || null,
      is_edited: false,
      is_deleted: false
    };
    
    const { data: newComment, error } = await supabase
      .from(TABLES.COMMENTS)
      .insert(commentData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    
    // Transform to match Comment interface
    const comment: Comment = {
      id: newComment.id,
      entity_id: newComment.content_id,
      entity_type: newComment.content_type,
      content: newComment.content,
      user_id: newComment.user_id,
      created_at: newComment.created_at,
      updated_at: newComment.updated_at || null,
      parent_id: newComment.parent_id || null,
      is_edited: newComment.is_edited || false,
      is_deleted: newComment.is_deleted || false,
      attachment_url: newComment.attachment_url || null,
      attachment_type: newComment.attachment_type || null
    };
    
    return { success: true, data: comment };
  } catch (error) {
    return handleError(error, 'Failed to add comment');
  }
}

/**
 * Update a comment.
 * @param commentId - The comment's unique identifier
 * @param data - The new comment data (typically the content)
 * @returns Result containing the updated comment
 */
export async function updateComment(
  commentId: string,
  data: Partial<Comment>
): Promise<Result<Comment>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Map entity_id/entity_type to content_id/content_type if present
    const updateData: Record<string, any> = {
      is_edited: true,
      updated_at: new Date().toISOString()
    };
    
    // Only add these fields if they exist in the input data
    if (data.content) updateData.content = data.content;
    if (data.entity_id) updateData.content_id = data.entity_id;
    if (data.entity_type) updateData.content_type = data.entity_type;
    if (data.attachment_url !== undefined) updateData.attachment_url = data.attachment_url;
    if (data.attachment_type !== undefined) updateData.attachment_type = data.attachment_type;
    
    const { data: updatedComment, error } = await supabase
      .from(TABLES.COMMENTS)
      .update(updateData)
      .eq('id', commentId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    
    // Transform to match Comment interface
    const comment: Comment = {
      id: updatedComment.id,
      entity_id: updatedComment.content_id,
      entity_type: updatedComment.content_type,
      content: updatedComment.content,
      user_id: updatedComment.user_id,
      created_at: updatedComment.created_at,
      updated_at: updatedComment.updated_at || null,
      parent_id: updatedComment.parent_id || null,
      is_edited: updatedComment.is_edited || false,
      is_deleted: updatedComment.is_deleted || false,
      attachment_url: updatedComment.attachment_url || null,
      attachment_type: updatedComment.attachment_type || null
    };
    
    return { success: true, data: comment };
  } catch (error) {
    return handleError(error, 'Failed to update comment');
  }
}

/**
 * Delete a comment.
 * @param commentId - The comment's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteComment(commentId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.from(TABLES.COMMENTS).delete().eq('id', commentId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete comment');
  }
}

// ============================================================================
// ADDITIONAL FUNCTIONS
// ============================================================================

/**
 * Get replies to a comment.
 * @param commentId - The parent comment's unique identifier
 * @returns Result containing an array of reply comments
 */
export async function getCommentReplies(commentId: string): Promise<Result<Comment[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .select('*')
      .eq('parent_id', commentId);

    if (error) return { success: false, error: error.message };
    
    // Transform data to match Comment interface
    const replies = data?.map(item => ({
      id: item.id,
      entity_id: item.content_id,
      entity_type: item.content_type,
      content: item.content,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at || null,
      parent_id: item.parent_id,
      is_edited: item.is_edited || false,
      is_deleted: item.is_deleted || false,
      attachment_url: item.attachment_url || null,
      attachment_type: item.attachment_type || null
    })) || [];
    
    return { success: true, data: replies };
  } catch (error) {
    return handleError(error, 'Failed to fetch comment replies');
  }
}
