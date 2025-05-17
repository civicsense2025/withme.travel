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
export async function listComments(entityId: string, entityType: string): Promise<Result<Comment[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType);
    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
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
    return { success: true, data };
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
    const { data: newComment, error } = await supabase
      .from(TABLES.COMMENTS)
      .insert(data)
      .select('*')
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: newComment };
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
export async function updateComment(commentId: string, data: Partial<Comment>): Promise<Result<Comment>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: updatedComment, error } = await supabase
      .from(TABLES.COMMENTS)
      .update(data)
      .eq('id', commentId)
      .select('*')
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedComment };
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
    const { error } = await supabase
      .from(TABLES.COMMENTS)
      .delete()
      .eq('id', commentId);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete comment');
  }
}
// (Add more as needed) 