/**
 * Comments API Client
 * 
 * Client-side wrapper for the Comments API providing type-safe access to comment operations
 */

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import { handleApiResponse } from './index';

// Comment type based on database schema
export interface Comment {
  id: string;
  entity_id: string;
  entity_type: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  parent_id?: string | null;
}

/**
 * List all comments for an entity
 */
export async function listComments(
  entityId: string,
  entityType: string
): Promise<Result<Comment[]>> {
  const params = new URLSearchParams({
    entityId,
    entityType
  });
  
  return tryCatch(
    fetch(`${API_ROUTES.COMMENTS.LIST}?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<Comment[]>(response))
  );
}

/**
 * Get a single comment by ID
 */
export async function getComment(commentId: string): Promise<Result<Comment>> {
  return tryCatch(
    fetch(API_ROUTES.COMMENTS.DETAIL(commentId), {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<Comment>(response))
  );
}

/**
 * Create a new comment
 */
export async function createComment(data: {
  entity_id: string;
  entity_type: string;
  content: string;
  parent_id?: string;
}): Promise<Result<Comment>> {
  return tryCatch(
    fetch(API_ROUTES.COMMENTS.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<Comment>(response))
  );
}

/**
 * Update an existing comment
 */
export async function updateComment(
  commentId: string,
  data: { content: string }
): Promise<Result<Comment>> {
  return tryCatch(
    fetch(API_ROUTES.COMMENTS.UPDATE(commentId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<Comment>(response))
  );
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<Result<void>> {
  return tryCatch(
    fetch(API_ROUTES.COMMENTS.DELETE(commentId), {
      method: 'DELETE',
    }).then((response) => handleApiResponse<void>(response))
  );
}

/**
 * Get replies to a comment
 */
export async function getCommentReplies(commentId: string): Promise<Result<Comment[]>> {
  return tryCatch(
    fetch(API_ROUTES.COMMENTS.REPLIES(commentId), {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<Comment[]>(response))
  );
}

/**
 * Add reaction to a comment
 */
export async function addCommentReaction(
  commentId: string,
  reactionType: string
): Promise<Result<{ id: string }>> {
  return tryCatch(
    fetch(API_ROUTES.COMMENTS.REACTIONS(commentId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: reactionType }),
    }).then((response) => handleApiResponse<{ id: string }>(response))
  );
}

/**
 * Remove reaction from a comment
 */
export async function removeCommentReaction(
  commentId: string,
  reactionType: string
): Promise<Result<void>> {
  const params = new URLSearchParams({
    type: reactionType
  });
  
  return tryCatch(
    fetch(`${API_ROUTES.COMMENTS.REACTIONS(commentId)}?${params.toString()}`, {
      method: 'DELETE',
    }).then((response) => handleApiResponse<void>(response))
  );
} 