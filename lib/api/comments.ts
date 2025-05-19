// lib/api/comments.ts
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, Comment, commentSchema } from './_shared';
import { z } from 'zod';

/**
 * List all comments for a given entity with efficient pagination.
 */
export async function listComments(
  entityId: string,
  entityType: string,
  options: {
    limit?: number;
    page?: number;
    includeReplies?: boolean;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<Result<{ comments: Comment[]; total: number }>> {
  try {
    const { limit = 20, page = 1, includeReplies = false, sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;
    
    const supabase = await createRouteHandlerClient();
    
    // Get total count first (more efficient than counting full result set)
    const countQuery = supabase
      .from(TABLES.COMMENTS)
      .select('*', { count: 'exact', head: true })
      .eq('content_id', entityId)
      .eq('content_type', entityType);
      
    if (!includeReplies) {
      countQuery.is('parent_id', null);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) return { success: false, error: countError.message };
    
    // Then get paginated data
    let query = supabase
      .from(TABLES.COMMENTS)
      .select('*')
      .eq('content_id', entityId)
      .eq('content_type', entityType)
      .order('created_at', { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
      
    if (!includeReplies) {
      query = query.is('parent_id', null);
    }
    
    const { data, error } = await query;
    
    if (error) return { success: false, error: error.message };
    
    // Transform data to match Comment interface
    const comments = data.map(item => ({
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
    }));
    
    return { 
      success: true, 
      data: { 
        comments, 
        total: count || 0 
      } 
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch comments');
  }
}

/**
 * Get a single comment by ID with optimistic caching support.
 */
export async function getComment(
  commentId: string, 
  options: { includeReplies?: boolean } = {}
): Promise<Result<Comment & { replies?: Comment[] }>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the comment
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
    
    // Include replies if requested
    if (options.includeReplies) {
      const repliesResult = await getCommentReplies(commentId);
      if (repliesResult.success) {
        return { 
          success: true, 
          data: { ...comment, replies: repliesResult.data } 
        };
      }
    }
    
    return { success: true, data: comment };
  } catch (error) {
    return handleError(error, 'Failed to fetch comment');
  }
}

/**
 * Add a new comment to an entity with input validation.
 */
export async function addComment(data: Partial<Comment>): Promise<Result<Comment>> {
  try {
    // Validate input data
    const validationResult = commentSchema.safeParse(data);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid comment data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    
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
 * Update a comment with optimistic concurrency control.
 */
export async function updateComment(
  commentId: string,
  data: Partial<Comment>,
  options: { checkVersion?: string } = {}
): Promise<Result<Comment>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // If version checking is enabled, verify the comment hasn't been modified
    if (options.checkVersion) {
      const { data: current } = await supabase
        .from(TABLES.COMMENTS)
        .select('updated_at')
        .eq('id', commentId)
        .single();
        
      if (current && current.updated_at !== options.checkVersion) {
        return { 
          success: false, 
          error: 'Comment has been modified since you last loaded it',
          code: 'STALE_DATA'
        };
      }
    }
    
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
 * Get replies to a comment with optional pagination.
 */
export async function getCommentReplies(
  commentId: string,
  options: { limit?: number; page?: number } = {}
): Promise<Result<Comment[]>> {
  try {
    const { limit = 20, page = 1 } = options;
    const offset = (page - 1) * limit;
    
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.COMMENTS)
      .select('*')
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) return { success: false, error: error.message };
    
    // Transform data to match Comment interface
    const replies = data.map(item => ({
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
    }));
    
    return { success: true, data: replies };
  } catch (error) {
    return handleError(error, 'Failed to fetch comment replies');
  }
}

/**
 * Soft delete a comment instead of hard deleting.
 */
export async function softDeleteComment(commentId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.COMMENTS)
      .update({ 
        is_deleted: true,
        content: '[deleted]',
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete comment');
  }
}

/**
 * Hard delete a comment (admin only).
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