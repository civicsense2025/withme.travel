'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  type CommentWithUser,
  type CommentReactionWithUser,
  type PaginatedCommentsResponse,
} from '@/types/comments';
import type { Database } from '@/utils/constants/database';
import { toast } from '@/components/ui/use-toast';

type Vote = Database['public']['Enums']['vote_type'];

interface UseCommentsOptions {
  contentType: CommentableContentType;
  contentId: string;
  initialLimit?: number;
}

interface UseCommentsResponse {
  comments: CommentWithUser[];
  totalComments: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  addComment: (content: string, parentId?: string | null) => Promise<CommentWithUser | null>;
  updateComment: (commentId: string, content: string) => Promise<CommentWithUser | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  getReplies: (commentId: string) => Promise<CommentWithUser[]>;
  getReactions: (commentId: string) => Promise<CommentReactionWithUser[]>;
  addReaction: (commentId: string, emoji: string) => Promise<CommentReactionWithUser | null>;
  removeReaction: (commentId: string, emoji: string) => Promise<boolean>;
}

export type CommentableContentType =
  | 'trip'
  | 'destination'
  | 'itinerary_item'
  | 'collection'
  | 'template'
  | 'group_idea'
  | 'group_plan_idea';

/**
 * Custom hook for interacting with the comments API
 */
export function useComments({
  contentType,
  contentId,
  initialLimit = 20,
}: UseCommentsOptions): UseCommentsResponse {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch comments for the specified content
   */
  const fetchComments = useCallback(
    async (offset: number = 0, limit: number = initialLimit) => {
      setIsLoading(true);
      setError(null);

      try {
        let response;
        if (contentType === 'group_idea') {
          const queryParams = new URLSearchParams({
            ideaId: contentId,
            limit: limit.toString(),
            offset: offset.toString(),
          });
          response = await fetch(`/api/group-plan-idea-comments?${queryParams.toString()}`);
        } else {
          const queryParams = new URLSearchParams({
            contentType,
            contentId,
            limit: limit.toString(),
            offset: offset.toString(),
          });
          response = await fetch(`/api/comments?${queryParams.toString()}`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch comments');
        }

        const data: PaginatedCommentsResponse = await response.json();

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while fetching comments';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contentType, contentId, initialLimit]
  );

  /**
   * Load initial comments
   */
  const loadInitialComments = useCallback(async () => {
    const data = await fetchComments();

    if (data) {
      setComments(data.comments);
      setTotalComments(data.total);
      setHasMore(data.has_more);
      setNextCursor(data.next_cursor);
    }
  }, [fetchComments]);

  /**
   * Load more comments (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor) return;

    const offset = parseInt(nextCursor, 10);
    const data = await fetchComments(offset);

    if (data) {
      setComments((prevComments) => [...prevComments, ...data.comments]);
      setHasMore(data.has_more);
      setNextCursor(data.next_cursor);
    }
  }, [fetchComments, hasMore, nextCursor]);

  /**
   * Refresh comments
   */
  const refresh = useCallback(async () => {
    await loadInitialComments();
  }, [loadInitialComments]);

  /**
   * Add a new comment
   */
  const addComment = useCallback(
    async (content: string, parentId?: string | null): Promise<CommentWithUser | null> => {
      setError(null);

      try {
        let response;
        if (contentType === 'group_idea') {
          // Get user_id from localStorage or other client-side storage
          const userId =
            typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;

          response = await fetch('/api/group-plan-idea-comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content,
              idea_id: contentId,
              parent_id: parentId || null,
              user_id: userId, // Include user_id in the request
            }),
          });
        } else {
          response = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content,
              content_type: contentType,
              content_id: contentId,
              parent_id: parentId || null,
            }),
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add comment');
        }

        const newComment: CommentWithUser = await response.json();

        // Only add the comment to the state if it's a top-level comment (no parent)
        if (!parentId) {
          setComments((prevComments) => [newComment, ...prevComments]);
          setTotalComments((prev) => prev + 1);
        }

        return newComment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while adding comment';
        setError(errorMessage);
        toast({
          title: 'Comment Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return null;
      }
    },
    [contentType, contentId]
  );

  /**
   * Update an existing comment
   */
  const updateComment = useCallback(
    async (commentId: string, content: string): Promise<CommentWithUser | null> => {
      setError(null);
      try {
        let response;
        if (contentType === 'group_idea') {
          // PATCH to /api/group-plan-idea-comments with id, user_id, content
          const userId =
            typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
          response = await fetch(`/api/group-plan-idea-comments`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: commentId, user_id: userId, content }),
          });
        } else {
          response = await fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
          });
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update comment');
        }
        const updatedComment: CommentWithUser =
          contentType === 'group_idea' ? (await response.json()).comment : await response.json();
        setComments((prevComments) =>
          prevComments.map((comment) => (comment.id === commentId ? updatedComment : comment))
        );
        return updatedComment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while updating comment';
        setError(errorMessage);
        toast({ title: 'Update Error', description: errorMessage, variant: 'destructive' });
        return null;
      }
    },
    [contentType]
  );

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      setError(null);
      try {
        let response;
        if (contentType === 'group_idea') {
          // DELETE to /api/group-plan-idea-comments?id=...&user_id=...
          const userId =
            typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
          const params = new URLSearchParams({ id: commentId, user_id: userId || '' });
          response = await fetch(`/api/group-plan-idea-comments?${params.toString()}`, {
            method: 'DELETE',
          });
        } else {
          response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete comment');
        }
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, is_deleted: true, content: '[Deleted]' }
              : comment
          )
        );
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while deleting comment';
        setError(errorMessage);
        toast({ title: 'Delete Error', description: errorMessage, variant: 'destructive' });
        return false;
      }
    },
    [contentType]
  );

  /**
   * Get replies to a comment
   */
  const getReplies = useCallback(
    async (commentId: string): Promise<CommentWithUser[]> => {
      setError(null);

      try {
        let response;
        if (contentType === 'group_idea') {
          response = await fetch(`/api/group-plan-idea-comments/${commentId}/replies`);
        } else {
          response = await fetch(`/api/comments/${commentId}/replies`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch replies');
        }

        const data: PaginatedCommentsResponse = await response.json();
        return data.comments;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while fetching replies';
        setError(errorMessage);
        console.error('Error fetching replies:', errorMessage);
        return [];
      }
    },
    [contentType]
  );

  /**
   * Get reactions for a comment
   */
  const getReactions = useCallback(
    async (commentId: string): Promise<CommentReactionWithUser[]> => {
      setError(null);

      try {
        let response;
        if (contentType === 'group_idea') {
          response = await fetch(`/api/group-plan-idea-comments/${commentId}/reactions`);
        } else {
          response = await fetch(`/api/comments/${commentId}/reactions`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch reactions');
        }

        const data = await response.json();
        return data.reactions || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while fetching reactions';
        setError(errorMessage);
        console.error('Error fetching reactions:', errorMessage);
        return [];
      }
    },
    [contentType]
  );

  /**
   * Add a reaction to a comment (group_idea)
   */
  const addReaction = useCallback(
    async (commentId: string, emoji: string): Promise<CommentReactionWithUser | null> => {
      setError(null);
      try {
        if (!emoji || typeof emoji !== 'string') {
          throw new Error('Invalid emoji format');
        }
        let response;
        if (contentType === 'group_idea') {
          const userId =
            typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
          response = await fetch(`/api/group-plan-idea-reactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment_id: commentId, user_id: userId, emoji }),
          });
        } else {
          response = await fetch(`/api/comments/${commentId}/reactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emoji }),
          });
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add reaction');
        }
        const reaction: CommentReactionWithUser =
          contentType === 'group_idea' ? (await response.json()).reaction : await response.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, reactions_count: (comment.reactions_count || 0) + 1 }
              : comment
          )
        );
        return reaction;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while adding reaction';
        setError(errorMessage);
        console.error('Error adding reaction:', errorMessage);
        return null;
      }
    },
    [contentType]
  );

  /**
   * Remove a reaction from a comment (group_idea)
   */
  const removeReaction = useCallback(
    async (commentId: string, emoji: string): Promise<boolean> => {
      setError(null);
      try {
        if (!emoji || typeof emoji !== 'string') {
          throw new Error('Invalid emoji format');
        }
        let response;
        if (contentType === 'group_idea') {
          const userId =
            typeof window !== 'undefined' ? window.localStorage.getItem('user_id') : null;
          const params = new URLSearchParams({
            comment_id: commentId,
            user_id: userId || '',
            emoji,
          });
          response = await fetch(`/api/group-plan-idea-reactions?${params.toString()}`, {
            method: 'DELETE',
          });
        } else {
          response = await fetch(
            `/api/comments/${commentId}/reactions?emoji=${encodeURIComponent(emoji)}`,
            { method: 'DELETE' }
          );
        }
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove reaction');
        }
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, reactions_count: Math.max((comment.reactions_count || 1) - 1, 0) }
              : comment
          )
        );
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while removing reaction';
        setError(errorMessage);
        console.error('Error removing reaction:', errorMessage);
        return false;
      }
    },
    [contentType]
  );

  // Load initial comments on mount
  useEffect(() => {
    loadInitialComments();
  }, [loadInitialComments]);

  return {
    comments,
    totalComments,
    hasMore,
    isLoading,
    error,
    loadMore,
    refresh,
    addComment,
    updateComment,
    deleteComment,
    getReplies,
    getReactions,
    addReaction,
    removeReaction,
  };
}
