'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CommentWithUser, CommentReactionWithUser } from '@/types/comments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useComments } from '@/hooks/use-comments';
import { EmojiPicker } from 'frimousse';
import {
  MessageCircle,
  Send,
  ThumbsUp,
  Reply,
  Trash2,
  Edit,
  X,
  Smile,
  RefreshCw,
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { timeAgo } from '../utils/date-utils';
import { AuthModalWithProps } from '@/components/ui/features/auth/organisms/AuthModal';
import { Skeleton } from '@/components/ui/skeleton';

interface IdeaCommentsProps {
  ideaId: string;
  userId: string;
  className?: string;
  isAuthenticated: boolean;
  groupId: string;
}

// Constants for pagination
const COMMENTS_PER_PAGE = 5;
const REPLIES_PER_PAGE = 3;

export default function IdeaComments({
  ideaId,
  userId,
  className = '',
  isAuthenticated,
  groupId,
}: IdeaCommentsProps) {
  // Custom hook for comment operations
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
  } = useComments({
    contentType: 'group_idea' as const,
    contentId: ideaId,
  });

  // Component state
  const [newComment, setNewComment] = useState('');
  const [repliesMap, setRepliesMap] = useState<Record<string, CommentWithUser[]>>({});
  const [reactionsMap, setReactionsMap] = useState<Record<string, CommentReactionWithUser[]>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [loadingReactions, setLoadingReactions] = useState<Record<string, boolean>>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Refs
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Optimization: Prevent excessive renders when changing inputs
  const newCommentTrimmed = newComment.trim();
  const canSubmitComment = newCommentTrimmed.length > 0 && !isLoading;

  // Helper to get guest token from cookies
  const getGuestToken = useCallback(() => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/guest_group_token=([^;]+)/);
    return match ? match[1] : null;
  }, []);

  // Handle submitting a new top-level comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitComment) return;

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await addComment(newComment);
      setNewComment('');
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Handle submitting a reply (optimized to reduce re-renders)
  const handleSubmitReply = useCallback(
    async (parentId: string, content: string) => {
      if (!content.trim()) return;

      try {
        const reply = await addComment(content, parentId);

        if (reply) {
          // Update the replies map
          setRepliesMap((prev) => ({
            ...prev,
            [parentId]: [reply as CommentWithUser, ...(prev[parentId] || [])],
          }));
        }

        // Clear reply state
        setReplyingTo(null);
      } catch (err) {
        console.error('Error adding reply:', err);
      }
    },
    [addComment]
  );

  // Handle toggling replies for a comment (with lazy loading)
  const handleToggleReplies = useCallback(
    async (commentId: string) => {
      // If replies are already loaded but hidden, just show them
      if (repliesMap[commentId]?.length) {
        return;
      }

      // Otherwise, load the first batch of replies
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

      try {
        const replies = await getReplies(commentId);
        setRepliesMap((prev) => ({
          ...prev,
          [commentId]: replies,
        }));
      } catch (err) {
        console.error('Error loading replies:', err);
      } finally {
        setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
      }
    },
    [getReplies, repliesMap]
  );

  // Add reaction with optimistic UI update
  const handleAddReaction = useCallback(
    async (commentId: string, emoji: string) => {
      const userHasReaction = reactionsMap[commentId]?.some(
        (r) => r.user_id === userId && r.emoji === emoji
      );
      if (userHasReaction) {
        setReactionsMap((prev) => ({
          ...prev,
          [commentId]: (prev[commentId] || []).filter(
            (r) => !(r.user_id === userId && r.emoji === emoji)
          ),
        }));
        try {
          await removeReaction(commentId, emoji);
        } catch (err) {
          await getReactions(commentId).then((reactions) => {
            setReactionsMap((prev) => ({ ...prev, [commentId]: reactions }));
          });
        }
        return;
      }
      // Add new reaction optimistically
      setReactionsMap((prev) => ({
        ...prev,
        [commentId]: [
          ...(prev[commentId] || []),
          { user_id: userId, emoji, comment_id: commentId } as CommentReactionWithUser,
        ],
      }));

      try {
        await addReaction(commentId, emoji);
      } catch (err) {
        // If failed, revert the optimistic update
        console.error('Error adding reaction:', err);
        await getReactions(commentId).then((reactions) => {
          setReactionsMap((prev) => ({
            ...prev,
            [commentId]: reactions,
          }));
        });
      }
    },
    [reactionsMap, userId, removeReaction, getReactions, addReaction]
  );

  // Load reactions for a comment (with lazy loading)
  const handleLoadReactions = useCallback(
    async (commentId: string) => {
      if (reactionsMap[commentId]) return;

      setLoadingReactions((prev) => ({ ...prev, [commentId]: true }));

      try {
        const reactions = await getReactions(commentId);
        setReactionsMap((prev) => ({
          ...prev,
          [commentId]: reactions,
        }));
      } catch (err) {
        console.error('Error loading reactions:', err);
      } finally {
        setLoadingReactions((prev) => ({ ...prev, [commentId]: false }));
      }
    },
    [getReactions, reactionsMap]
  );

  // Render a single comment component (memoized)
  const Comment = useCallback(
    ({ comment, isReply = false }: { comment: CommentWithUser; isReply?: boolean }) => {
      const reactions = reactionsMap[comment.id] || [];
      const isEditing = editingId === comment.id;
      const isReplying = replyingTo === comment.id;
      const hasUserReacted = (emoji: string) =>
        reactions.some((r) => r.user_id === userId && r.emoji === emoji);
      const showReplies = Boolean(repliesMap[comment.id]?.length);

      // Lazy load reactions on mouse enter
      const handleMouseEnter = () => {
        handleLoadReactions(comment.id);
      };

      return (
        <div
          key={comment.id}
          className={cn(
            'relative flex flex-col group',
            isReply && 'mt-1',
            comment.is_deleted && 'opacity-60 italic'
          )}
          onMouseEnter={handleMouseEnter}
        >
          <div className="flex items-start gap-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage
                src={(comment.user?.avatar_url || undefined) as string | undefined}
                alt={comment.user?.name || 'User'}
              />
              <AvatarFallback>{comment.user?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xs text-gray-800 dark:text-gray-100 truncate max-w-[120px]">
                  {comment.user?.name || 'Unknown'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {typeof comment.created_at === 'string'
                    ? timeAgo(new Date(comment.created_at))
                    : timeAgo(comment.created_at)}
                </span>
                {comment.is_edited && (
                  <span className="text-[10px] text-gray-400 italic ml-1">(edited)</span>
                )}
              </div>

              {isEditing ? (
                <form
                  className="mt-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editContent.trim()) {
                      updateComment(comment.id, editContent);
                      setEditingId(null);
                    }
                  }}
                >
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-sm mb-1"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line break-words">
                  {comment.content}
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center gap-2 mt-1">
                {/* Reply button */}
                <button
                  onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Reply
                </button>

                {/* Edit button (only show for user's own comments) */}
                {comment.user_id === userId && !comment.is_deleted && (
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Edit
                  </button>
                )}

                {/* Delete button (only show for user's own comments) */}
                {comment.user_id === userId && !comment.is_deleted && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Emoji reactions bar */}
              {reactions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {/* Group reactions by emoji and count them */}
                  {Object.entries(
                    reactions.reduce(
                      (acc, r) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  ).map(([emoji, count]) => {
                    const userReacted = hasUserReacted(emoji);
                    return (
                      <button
                        key={emoji}
                        className={cn(
                          'px-1.5 h-6 flex items-center gap-0.5 text-base font-medium rounded-full transition-all',
                          'border border-gray-100 bg-gray-50',
                          userReacted ? 'ring-1 ring-blue-300' : ''
                        )}
                        onClick={() => handleAddReaction(comment.id, emoji)}
                      >
                        <span className="text-sm" aria-hidden="true">
                          {emoji}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold">{count}</span>
                      </button>
                    );
                  })}

                  {/* Add reaction button */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
                        <Smile className="h-4 w-4 text-gray-400" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-2 rounded-xl shadow-lg w-[220px]">
                      <EmojiPicker.Root>
                        <EmojiPicker.Search className="mb-1 rounded-md px-2 py-1 text-xs" />
                        <EmojiPicker.Viewport className="max-h-40 overflow-y-auto">
                          <EmojiPicker.List
                            className="flex flex-wrap"
                            components={{
                              Emoji: ({ emoji, ...props }) => (
                                <button
                                  {...props}
                                  className="p-1 hover:bg-gray-100 rounded text-lg"
                                  onClick={() => handleAddReaction(comment.id, emoji.emoji)}
                                >
                                  {emoji.emoji}
                                </button>
                              ),
                            }}
                          />
                        </EmojiPicker.Viewport>
                      </EmojiPicker.Root>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Reply form */}
              {isReplying && (
                <form
                  className="mt-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                    if (input.value.trim()) {
                      handleSubmitReply(comment.id, input.value);
                      input.value = '';
                    }
                  }}
                >
                  <div className="relative">
                    <Input
                      placeholder="Write a reply..."
                      className="pr-10 text-sm rounded-full"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* Toggle replies button */}
              {!isReply && (comment.replies_count || 0) > 0 && (
                <button
                  onClick={() => handleToggleReplies(comment.id)}
                  className="mt-1 text-xs text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  {loadingReplies[comment.id] ? (
                    <Spinner className="h-3 w-3" />
                  ) : (
                    <>
                      {showReplies
                        ? 'Hide replies'
                        : `Show ${comment.replies_count} ${comment.replies_count === 1 ? 'reply' : 'replies'}`}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Render replies */}
          {showReplies && (
            <div className="ml-8 mt-1 border-l-2 border-gray-100 pl-2 space-y-2">
              {repliesMap[comment.id]?.map((reply) => (
                <Comment key={reply.id} comment={reply} isReply={true} />
              ))}

              {/* Load more replies button */}
              {(comment.replies_count || 0) > repliesMap[comment.id]?.length && (
                <button
                  onClick={async () => {
                    const moreReplies = await getReplies(comment.id);
                    setRepliesMap((prev) => ({
                      ...prev,
                      [comment.id]: [...(prev[comment.id] || []), ...moreReplies],
                    }));
                  }}
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  Load more replies...
                </button>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      reactionsMap,
      editingId,
      replyingTo,
      userId,
      repliesMap,
      handleLoadReactions,
      updateComment,
      deleteComment,
      handleAddReaction,
      handleSubmitReply,
      handleToggleReplies,
      loadingReplies,
      getReplies,
    ]
  );

  // On mount, update to show keyboard shortcut for sending
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const sendShortcut = isMac ? '⌘+Enter' : 'Ctrl+Enter';
    // You could update placeholder text here if needed
  }, []);

  // After auth modal closes, check if user is now authenticated
  useEffect(() => {
    if (!authModalOpen && isAuthenticated) {
      const guestToken = getGuestToken();
      if (guestToken) {
        fetch('/api/guest/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guest_token: guestToken, group_id: groupId }),
        }).then(() => {
          window.location.reload();
        });
      }
    }
  }, [authModalOpen, isAuthenticated, getGuestToken, groupId]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [comments]);

  // Render the comments list with cleaner Apple-inspired design
  const renderComments = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 py-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-4">
          <p className="text-muted-foreground text-sm mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={refresh} className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Retry
          </Button>
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <p className="text-center text-muted-foreground text-sm py-3">
          No comments yet. Be the first!
        </p>
      );
    }

    return (
      <div
        className="space-y-3 pt-2 max-h-[240px] overflow-y-auto hide-scrollbar"
        ref={commentsContainerRef}
      >
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2 group">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage
                src={(comment.user?.avatar_url || undefined) as string | undefined}
                alt={comment.user?.name || 'User'}
              />
              <AvatarFallback className="text-xs">{comment.user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm font-medium truncate">{comment.user?.name || 'Guest User'}</p>
                <span className="text-xs text-muted-foreground opacity-70">
                  {timeAgo(new Date(comment.created_at))}
                </span>
              </div>
              <p className="text-sm break-words">{comment.content}</p>
            </div>
          </div>
        ))}
        <div ref={commentsEndRef} />
      </div>
    );
  };

  return (
    <>
      <AuthModalWithProps isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <div className={cn('relative mt-2', className)}>
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-blue-400" />
              <span className="font-bold text-base">
                Comments <span>({totalComments ?? 0})</span>
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 p-0"
              aria-label="Refresh comments"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4 text-gray-400', isLoading && 'animate-spin')} />
            </Button>
          </div>

          {/* Initial loading state */}
          {isLoading && comments.length === 0 ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-6 w-6 text-blue-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Empty state */}
              {comments.length === 0 && (
                <div className="text-xs text-gray-400 py-4 text-center">
                  No comments yet. Be the first to comment!
                </div>
              )}

              {/* Comments list with virtual rendering */}
              {renderComments()}

              {/* Loading more indicator */}
              {isLoading && comments.length > 0 && (
                <div className="flex justify-center py-2">
                  <Spinner className="h-4 w-4 text-blue-400" />
                </div>
              )}

              {/* Load more button */}
              {hasMore && !isLoading && (
                <div className="flex justify-center mt-2">
                  <Button size="sm" variant="outline" onClick={loadMore} className="text-xs h-8">
                    Load more
                  </Button>
                </div>
              )}

              <div ref={commentsEndRef} />
            </div>
          )}

          {/* Comment form */}
          <div className="mt-3">
            <form onSubmit={handleSubmitComment} className="relative flex items-center">
              <Input
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="text-sm pr-10 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-blue-400 focus-visible:ring-opacity-40"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (canSubmitComment) handleSubmitComment(e);
                  }
                }}
              />
              <button
                type="submit"
                aria-label="Send comment"
                disabled={!canSubmitComment}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200',
                  !canSubmitComment
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-blue-500 hover:text-blue-600'
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
