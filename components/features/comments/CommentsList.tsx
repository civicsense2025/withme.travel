'use client';

import { useRef, useState } from 'react';
import { CommentWithUser, CommentReactionWithUser } from '@/types/comments';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import CommentItem from '@/components/comments/comment-item';
import CommentForm from '@/components/comments/comment-form';
import { useComments } from '@/hooks/use-comments';
import { CommentableContentType } from '@/utils/constants/tables';
import { useResearchTracking } from '@/hooks/use-research-tracking';

interface CommentsListProps {
  contentType: CommentableContentType;
  contentId: string;
  showTitle?: boolean;
  limitHeight?: boolean;
  className?: string;
}

export default function CommentsList({
  contentType,
  contentId,
  showTitle = true,
  limitHeight = true,
  className = '',
}: CommentsListProps) {
  const {
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
  } = useComments({ contentType, contentId });

  const [repliesMap, setRepliesMap] = useState<Record<string, CommentWithUser[]>>({});
  const [reactionsMap, setReactionsMap] = useState<Record<string, CommentReactionWithUser[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [loadingReactions, setLoadingReactions] = useState<Record<string, boolean>>({});
  const [replyToComment, setReplyToComment] = useState<string | null>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const { trackEvent } = useResearchTracking();

  // Handler for toggling display of replies
  const handleToggleReplies = async (commentId: string) => {
    // If we already loaded replies for this comment, just hide/show them
    if (repliesMap[commentId]) {
      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: prev[commentId] ? [] : [...(prev[`${commentId}_cache`] || [])],
      }));
      return;
    }

    // Otherwise, load replies from the API
    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

    try {
      const replies = await getReplies(commentId);

      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: replies,
        [`${commentId}_cache`]: replies,
      }));
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Handler for loading reactions
  const handleLoadReactions = async (commentId: string) => {
    if (reactionsMap[commentId]) return;

    setLoadingReactions((prev) => ({ ...prev, [commentId]: true }));

    try {
      const reactions = await getReactions(commentId);

      setReactionsMap((prev) => ({
        ...prev,
        [commentId]: reactions,
      }));
    } catch (error) {
      console.error('Error loading reactions:', error);
    } finally {
      setLoadingReactions((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Handler for adding reactions
  const handleAddReaction = async (commentId: string, emoji: string) => {
    try {
      const reaction = await addReaction(commentId, emoji);

      if (reaction) {
        setReactionsMap((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), reaction],
        }));

        // Track successful reaction addition
        try {
          await trackEvent('comment_reacted', {
            commentId,
            emoji,
            action: 'add',
            contentType,
            contentId,
            source: 'comments-list',
            component: 'CommentsList'
          });
        } catch (trackingError) {
          console.error('Failed to track comment_reacted event:', trackingError);
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Handler for removing reactions
  const handleRemoveReaction = async (commentId: string, emoji: string) => {
    try {
      const success = await removeReaction(commentId, emoji);

      if (success) {
        setReactionsMap((prev) => ({
          ...prev,
          [commentId]: (prev[commentId] || []).filter(
            (r) => !(r.user_id === 'currentUser' && r.emoji === emoji)
          ),
        }));

        // Track successful reaction removal
        try {
          await trackEvent('comment_reacted', {
            commentId,
            emoji,
            action: 'remove',
            contentType,
            contentId,
            source: 'comments-list',
            component: 'CommentsList'
          });
        } catch (trackingError) {
          console.error('Failed to track comment_reacted event:', trackingError);
        }
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  // Handler for submitting a new comment
  const handleSubmitComment = async (content: string) => {
    const comment = await addComment(content);
    if (comment) {
      trackEvent('comment_posted', { commentId: comment.id, contentType });
    }
  };

  // Handler for submitting a reply
  const handleSubmitReply = async (content: string) => {
    if (!replyToComment) return;
    const reply = await addComment(content, replyToComment);
    if (reply) {
      trackEvent('comment_posted', { commentId: reply.id, contentType, parentId: replyToComment });
      // Add the new reply to the repliesMap
      setRepliesMap((prev) => ({
        ...prev,
        [replyToComment]: [reply, ...(prev[replyToComment] || [])],
        [`${replyToComment}_cache`]: [reply, ...(prev[`${replyToComment}_cache`] || [])],
      }));
      // Clear the reply state
      setReplyToComment(null);
    }
  };

  // Handler for initiating a reply
  const handleReply = (commentId: string) => {
    setReplyToComment(replyToComment === commentId ? null : commentId);
  };

  // Handler for editing a comment
  const handleEditComment = async (commentId: string, content: string) => {
    const updated = await updateComment(commentId, content);

    if (updated) {
      // If it's a reply, update it in the repliesMap
      Object.keys(repliesMap).forEach((parentId) => {
        const replies = repliesMap[parentId];
        if (replies.some((r) => r.id === commentId)) {
          setRepliesMap((prev) => ({
            ...prev,
            [parentId]: prev[parentId].map((r) => (r.id === commentId ? updated : r)),
            [`${parentId}_cache`]: prev[`${parentId}_cache`].map((r) =>
              r.id === commentId ? updated : r
            ),
          }));
        }
      });
    }
  };

  // Handler for deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    const success = await deleteComment(commentId);

    if (success) {
      // If it's a reply, update it in the repliesMap
      Object.keys(repliesMap).forEach((parentId) => {
        const replies = repliesMap[parentId];
        if (replies.some((r) => r.id === commentId)) {
          setRepliesMap((prev) => ({
            ...prev,
            [parentId]: prev[parentId].map((r) =>
              r.id === commentId ? { ...r, is_deleted: true, content: '[Deleted]' } : r
            ),
            [`${parentId}_cache`]: prev[`${parentId}_cache`].map((r) =>
              r.id === commentId ? { ...r, is_deleted: true, content: '[Deleted]' } : r
            ),
          }));
        }
      });
    }
  };

  // Scroll to the end of the comments list
  const scrollToBottom = () => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`flex flex-col w-full bg-transparent border-0 shadow-none ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Comments <span className="font-normal text-muted-foreground">({totalComments})</span>
          </h3>
          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      )}

      <div className={`w-full mb-4 ${limitHeight ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
        {isLoading && comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    reactions={reactionsMap[comment.id] || []}
                    onToggleReplies={handleToggleReplies}
                    onReply={handleReply}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    onLoadReactions={handleLoadReactions}
                    onAddReaction={handleAddReaction}
                    onRemoveReaction={handleRemoveReaction}
                    isLoadingReplies={loadingReplies[comment.id] || false}
                    isLoadingReactions={loadingReactions[comment.id] || false}
                    showReplyForm={replyToComment === comment.id}
                    onReplySubmit={handleSubmitReply}
                  >
                    {/* Show replies if they exist */}
                    {repliesMap[comment.id] && repliesMap[comment.id].length > 0 && (
                      <div className="ml-8 mt-2 space-y-3">
                        {repliesMap[comment.id].map((reply) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            reactions={reactionsMap[reply.id] || []}
                            onToggleReplies={() => {}}
                            onReply={() => {}}
                            onEdit={handleEditComment}
                            onDelete={handleDeleteComment}
                            onLoadReactions={handleLoadReactions}
                            onAddReaction={handleAddReaction}
                            onRemoveReaction={handleRemoveReaction}
                            isLoadingReactions={loadingReactions[reply.id] || false}
                            isReply
                          />
                        ))}
                      </div>
                    )}
                  </CommentItem>
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                  {isLoading ? <Spinner /> : 'Load More'}
                </Button>
              </div>
            )}

            <div ref={commentsEndRef} />
          </>
        )}
      </div>

      <div className="mt-2">
        <CommentForm onSubmit={handleSubmitComment} />
      </div>

      {error && <div className="text-red-500 mt-2 text-sm">Error: {error}</div>}
    </div>
  );
}
