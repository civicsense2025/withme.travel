'use client';

import { useCallback, useState, useEffect } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import type { Comment } from '@/lib/client/comments';
import {
  listComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentReplies,
  addCommentReaction,
  removeCommentReaction,
} from '@/lib/client/comments';

/**
 * Comment data with additional UI state
 */
interface CommentWithState extends Comment {
  isEditing?: boolean;
  showReplies?: boolean;
  replies?: CommentWithState[];
  isLoadingReplies?: boolean;
}

/**
 * Hook for working with comments on an entity
 */
export function useComments(entityId: string, entityType: string) {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentWithState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch comments for the entity
   */
  const fetchComments = useCallback(async () => {
    if (!entityId || !entityType) return;

    setIsLoading(true);
    setError(null);

    const result = await listComments(entityId, entityType);

    if (result.success) {
      setComments(
        result.data.map((comment) => ({
          ...comment,
          isEditing: false,
          showReplies: false,
          replies: [],
        }))
      );
    } else {
      setError(new Error(result.error));
      toast({
        title: 'Error loading comments',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }, [entityId, entityType, toast]);

  /**
   * Add a new comment
   */
  const addComment = useCallback(
    async (content: string, parentId?: string): Promise<boolean> => {
      try {
        const result = await createComment({
          entity_id: entityId,
          entity_type: entityType,
          content,
          parent_id: parentId,
        });

        if (result.success) {
          if (parentId) {
            // If this is a reply, add it to the parent comment's replies
            setComments((prevComments) =>
              prevComments.map((comment) =>
                comment.id === parentId
                  ? {
                      ...comment,
                      replies: [
                        ...(comment.replies || []),
                        {
                          ...result.data,
                          isEditing: false,
                          showReplies: false,
                          replies: [],
                        },
                      ],
                    }
                  : comment
              )
            );
          } else {
            // Otherwise add it to the main comments list
            setComments((prevComments) => [
              {
                ...result.data,
                isEditing: false,
                showReplies: false,
                replies: [],
              },
              ...prevComments,
            ]);
          }

          return true;
        } else {
          toast({
            title: 'Error adding comment',
            description: result.error,
            variant: 'destructive',
          });
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast({
          title: 'Error adding comment',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }
    },
    [entityId, entityType, toast]
  );

  /**
   * Update an existing comment
   */
  const editComment = useCallback(
    async (commentId: string, content: string): Promise<boolean> => {
      try {
        const result = await updateComment(commentId, { content });

        if (result.success) {
          // Update the comment in the state
          setComments((prevComments) => {
            // Check if it's a top-level comment
            const topLevelIndex = prevComments.findIndex((c) => c.id === commentId);

            if (topLevelIndex >= 0) {
              return prevComments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, ...result.data, isEditing: false }
                  : comment
              );
            }

            // Check if it's a reply
            return prevComments.map((comment) => {
              if (!comment.replies?.length) return comment;

              const replyIndex = comment.replies.findIndex((r) => r.id === commentId);
              if (replyIndex >= 0) {
                const updatedReplies = [...comment.replies];
                updatedReplies[replyIndex] = {
                  ...updatedReplies[replyIndex],
                  ...result.data,
                  isEditing: false,
                };

                return {
                  ...comment,
                  replies: updatedReplies,
                };
              }

              return comment;
            });
          });

          return true;
        } else {
          toast({
            title: 'Error updating comment',
            description: result.error,
            variant: 'destructive',
          });
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast({
          title: 'Error updating comment',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  /**
   * Remove a comment
   */
  const removeComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      try {
        const result = await deleteComment(commentId);

        if (result.success) {
          // Remove the comment from state
          setComments((prevComments) => {
            // Check if it's a top-level comment
            const filtered = prevComments.filter((comment) => comment.id !== commentId);

            if (filtered.length !== prevComments.length) {
              return filtered;
            }

            // Check if it's a reply
            return prevComments.map((comment) => {
              if (!comment.replies?.length) return comment;

              return {
                ...comment,
                replies: comment.replies.filter((reply) => reply.id !== commentId),
              };
            });
          });

          return true;
        } else {
          toast({
            title: 'Error removing comment',
            description: result.error,
            variant: 'destructive',
          });
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast({
          title: 'Error removing comment',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  /**
   * Toggle the editing state of a comment
   */
  const toggleEditMode = useCallback((commentId: string) => {
    setComments((prevComments) => {
      // Check if it's a top-level comment
      const topLevelIndex = prevComments.findIndex((c) => c.id === commentId);

      if (topLevelIndex >= 0) {
        return prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, isEditing: !comment.isEditing } : comment
        );
      }

      // Check if it's a reply
      return prevComments.map((comment) => {
        if (!comment.replies?.length) return comment;

        const replyIndex = comment.replies.findIndex((r) => r.id === commentId);
        if (replyIndex >= 0) {
          const updatedReplies = [...comment.replies];
          updatedReplies[replyIndex] = {
            ...updatedReplies[replyIndex],
            isEditing: !updatedReplies[replyIndex].isEditing,
          };

          return {
            ...comment,
            replies: updatedReplies,
          };
        }

        return comment;
      });
    });
  }, []);

  /**
   * Load replies for a comment
   */
  const loadReplies = useCallback(
    async (commentId: string): Promise<boolean> => {
      // Find the comment
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return false;

      // Update the loading state
      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === commentId ? { ...c, isLoadingReplies: true, showReplies: true } : c
        )
      );

      try {
        const result = await getCommentReplies(commentId);

        if (result.success) {
          setComments((prevComments) =>
            prevComments.map((c) =>
              c.id === commentId
                ? {
                    ...c,
                    replies: result.data.map((reply) => ({
                      ...reply,
                      isEditing: false,
                      showReplies: false,
                      replies: [],
                    })),
                    isLoadingReplies: false,
                  }
                : c
            )
          );
          return true;
        } else {
          setComments((prevComments) =>
            prevComments.map((c) => (c.id === commentId ? { ...c, isLoadingReplies: false } : c))
          );

          toast({
            title: 'Error loading replies',
            description: result.error,
            variant: 'destructive',
          });
          return false;
        }
      } catch (err) {
        setComments((prevComments) =>
          prevComments.map((c) => (c.id === commentId ? { ...c, isLoadingReplies: false } : c))
        );

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        toast({
          title: 'Error loading replies',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      }
    },
    [comments, toast]
  );

  /**
   * Toggle showing replies for a comment
   */
  const toggleReplies = useCallback(
    (commentId: string) => {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      // If replies are already loaded, just toggle visibility
      if (comment.replies?.length) {
        setComments((prevComments) =>
          prevComments.map((c) => (c.id === commentId ? { ...c, showReplies: !c.showReplies } : c))
        );
        return;
      }

      // Otherwise load the replies
      loadReplies(commentId);
    },
    [comments, loadReplies]
  );

  // Initial load of comments
  useEffect(() => {
    if (entityId && entityType) {
      fetchComments();
    }
  }, [entityId, entityType, fetchComments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    editComment,
    removeComment,
    toggleEditMode,
    loadReplies,
    toggleReplies,
    refreshComments: fetchComments,
  };
}
