/**
 * useComments Hook
 *
 * Custom React hook for managing comments with full CRUD capabilities,
 * replies, reactions, and loading states.
 *
 * @module hooks/use-comments
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  getCommentReplies,
  addCommentReaction,
  removeCommentReaction,
  type Comment,
} from '@/lib/client/comments';
import type { Result } from '@/lib/client/comments';
import { useToast } from '@/hooks/use-toast';

/**
 * Parameters for using the comments hook
 */
export interface UseCommentsParams {
  /** The ID of the entity the comments are for */
  entityId: string;
  /** The type of entity the comments are for */
  entityType: string;
  /** Whether to fetch comments on component mount */
  fetchOnMount?: boolean;
}

/**
 * useComments hook for managing comments
 * @param params - Hook parameters
 * @returns Object with comments, loading states, error handling, and CRUD operations
 */
export function useComments({ entityId, entityType, fetchOnMount = true }: UseCommentsParams) {
  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  const { toast } = useToast();

  // Fetch all comments for the entity
  const fetchComments = useCallback(async () => {
    if (!entityId || !entityType) return;

    setIsLoading(true);
    setError(null);

    const result = await listComments(entityId, entityType);

    if (result.success) {
      setComments(result.data);
    } else {
      setError(String(result.error));
      toast({
        title: 'Failed to load comments',
        description: String(result.error),
        variant: 'destructive',
      });
    }

    setIsLoading(false);
    return result;
  }, [entityId, entityType, toast]);

  // Fetch a single comment by ID
  const fetchComment = useCallback(
    async (commentId: string) => {
      setIsLoading(true);
      setError(null);

      const result = await getComment(commentId);

      if (result.success) {
        setCurrentComment(result.data);
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to load comment',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  // Fetch replies to a comment
  const fetchCommentReplies = useCallback(
    async (commentId: string) => {
      setIsLoadingReplies(true);
      setError(null);

      const result = await getCommentReplies(commentId);

      if (result.success) {
        // Store the replies somewhere - we could add them to a map of comment ID -> replies
        // or update the comments list directly, depending on the UI structure

        // For this example, we'll just return the result
        toast({
          title: 'Replies loaded',
          description: `${result.data.length} replies found.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to load replies',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsLoadingReplies(false);
      return result;
    },
    [toast]
  );

  // Create a new comment
  const addComment = useCallback(
    async (content: string, parentId?: string) => {
      if (!entityId || !entityType || !content.trim()) return;

      setIsCreating(true);
      setError(null);

      const commentData = {
        entity_id: entityId,
        entity_type: entityType,
        content,
        parent_id: parentId,
      };

      const result = await createComment(commentData);

      if (result.success) {
        // If it's a reply and we're viewing the parent, add it to replies
        if (parentId && currentComment?.id === parentId) {
          // We might need to fetch replies again to get the updated list
          fetchCommentReplies(parentId);
        } else {
          // Otherwise add to main comments list
          setComments((prev) => [result.data, ...prev]);
        }

        toast({
          title: parentId ? 'Reply added' : 'Comment added',
          description: 'Your comment has been posted successfully.',
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to add comment',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsCreating(false);
      return result;
    },
    [entityId, entityType, currentComment, fetchCommentReplies, toast]
  );

  // Update an existing comment
  const editComment = useCallback(
    async (commentId: string, content: string) => {
      if (!content.trim()) return;

      setIsUpdating(true);
      setError(null);

      const result = await updateComment(commentId, { content });

      if (result.success) {
        // Update in comments list
        setComments((prev) =>
          prev.map((comment) => (comment.id === commentId ? result.data : comment))
        );

        // Update current comment if it's the one being edited
        if (currentComment?.id === commentId) {
          setCurrentComment(result.data);
        }

        toast({
          title: 'Comment updated',
          description: 'Your comment has been updated successfully.',
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to update comment',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsUpdating(false);
      return result;
    },
    [currentComment, toast]
  );

  // Delete a comment
  const removeComment = useCallback(
    async (commentId: string) => {
      setIsDeleting(true);
      setError(null);

      const result = await deleteComment(commentId);

      if (result.success) {
        // Remove from comments list
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));

        // Clear current comment if it's the one being deleted
        if (currentComment?.id === commentId) {
          setCurrentComment(null);
        }

        toast({
          title: 'Comment deleted',
          description: 'The comment has been deleted successfully.',
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to delete comment',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsDeleting(false);
      return result;
    },
    [currentComment, toast]
  );

  // Add a reaction to a comment
  const addReaction = useCallback(
    async (commentId: string, reactionType: string) => {
      setIsReacting(true);
      setError(null);

      const result = await addCommentReaction(commentId, reactionType);

      if (result.success) {
        toast({
          title: 'Reaction added',
          description: `You reacted with ${reactionType}.`,
        });

        // In a real implementation, we would update the comment with the new reaction
        // This would require us to know the structure of the reaction data
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to add reaction',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsReacting(false);
      return result;
    },
    [toast]
  );

  // Remove a reaction from a comment
  const removeReaction = useCallback(
    async (commentId: string, reactionType: string) => {
      setIsReacting(true);
      setError(null);

      const result = await removeCommentReaction(commentId, reactionType);

      if (result.success) {
        toast({
          title: 'Reaction removed',
          description: `You removed your ${reactionType} reaction.`,
        });

        // In a real implementation, we would update the comment with the removed reaction
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to remove reaction',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsReacting(false);
      return result;
    },
    [toast]
  );

  // Fetch comments on mount if enabled
  useEffect(() => {
    if (fetchOnMount && entityId && entityType) {
      fetchComments();
    }
  }, [fetchOnMount, entityId, entityType, fetchComments]);

  return {
    // Data
    comments,
    currentComment,
    error,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingReplies,
    isReacting,

    // Actions
    fetchComments,
    fetchComment,
    addComment,
    editComment,
    removeComment,
    fetchReplies: fetchCommentReplies,
    addReaction,
    removeReaction,
  };
}
