'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CommentWithUser, CommentReactionWithUser } from '@/types/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useComments } from '@/hooks/use-comments';
import { EmojiPicker } from 'frimousse';
import { MessageCircle, Send, ThumbsUp, Reply, Trash2, Edit, X, Smile, RefreshCw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { timeAgo } from '../utils/date-utils';

interface IdeaCommentsProps {
  ideaId: string;
  userId: string;
  className?: string;
}

export default function IdeaComments({ ideaId, userId, className = '' }: IdeaCommentsProps) {
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
    removeReaction
  } = useComments({ 
    contentType: 'group_idea', 
    contentId: ideaId 
  });

  const [newComment, setNewComment] = useState('');
  const [repliesMap, setRepliesMap] = useState<Record<string, CommentWithUser[]>>({});
  const [reactionsMap, setReactionsMap] = useState<Record<string, CommentReactionWithUser[]>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [loadingReactions, setLoadingReactions] = useState<Record<string, boolean>>({});
  const [deepRepliesMap, setDeepRepliesMap] = useState<Record<string, CommentWithUser[]>>({});
  const [loadingDeepReplies, setLoadingDeepReplies] = useState<Record<string, boolean>>({});

  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Helper to determine nesting level (0 = top-level, 1 = first-level reply, 2 = second-level reply)
  const getNestingLevel = (comment: CommentWithUser): number => {
    if (!comment.parent_id) return 0;
    
    // Check if parent is a top-level comment
    for (const topLevel of comments) {
      if (topLevel.id === comment.parent_id) return 1;
    }
    
    // Check if parent is a first-level reply
    for (const parentId in repliesMap) {
      for (const firstLevel of repliesMap[parentId]) {
        if (firstLevel.id === comment.parent_id) return 2;
      }
    }
    
    return 3; // Maximum allowed nesting level
  };

  // Handle submitting a new top-level comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await addComment(newComment);
      setNewComment('');
      // Scroll to bottom after comment is added
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Handle submitting a reply
  const handleSubmitReply = async (parentId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      const reply = await addComment(content, parentId);
      
      if (reply) {
        // Update the replies map
        const level = getNestingLevel({ ...reply, parent_id: parentId } as CommentWithUser);
        
        if (level === 1) {
          // First level reply
          setRepliesMap(prev => ({
            ...prev,
            [parentId]: [...(prev[parentId] || []), reply as CommentWithUser],
            [`${parentId}_cache`]: [...(prev[`${parentId}_cache`] || []), reply as CommentWithUser]
          }));
        } else if (level === 2) {
          // Second level reply (deep reply)
          setDeepRepliesMap(prev => ({
            ...prev,
            [parentId]: [...(prev[parentId] || []), reply as CommentWithUser],
            [`${parentId}_cache`]: [...(prev[`${parentId}_cache`] || []), reply as CommentWithUser]
          }));
        }
      }
      
      // Clear reply state
      setReplyingTo(null);
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  // Handle editing a comment
  const handleEditComment = async (commentId: string, content: string) => {
    if (!content.trim()) return;
    
    try {
      const updated = await updateComment(commentId, content);
      
      if (updated) {
        // Update in main comments list if it's there
        const mainIndex = comments.findIndex(c => c.id === commentId);
        if (mainIndex !== -1) {
          comments[mainIndex] = updated as CommentWithUser;
        }
        
        // Update in replies maps if needed
        Object.keys(repliesMap).forEach(parentId => {
          const replyIndex = repliesMap[parentId]?.findIndex(r => r.id === commentId);
          if (replyIndex !== -1 && replyIndex !== undefined) {
            setRepliesMap(prev => {
              const newReplies = [...prev[parentId]];
              newReplies[replyIndex] = updated as CommentWithUser;
              return {
                ...prev,
                [parentId]: newReplies,
                [`${parentId}_cache`]: newReplies
              };
            });
          }
        });
        
        // Update in deep replies maps if needed
        Object.keys(deepRepliesMap).forEach(parentId => {
          const replyIndex = deepRepliesMap[parentId]?.findIndex(r => r.id === commentId);
          if (replyIndex !== -1 && replyIndex !== undefined) {
            setDeepRepliesMap(prev => {
              const newReplies = [...prev[parentId]];
              newReplies[replyIndex] = updated as CommentWithUser;
              return {
                ...prev,
                [parentId]: newReplies,
                [`${parentId}_cache`]: newReplies
              };
            });
          }
        });
      }
      
      // Clear editing state
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const success = await deleteComment(commentId);
      
      if (success) {
        // Update UI state based on where the comment is
        // For top-level comments, the refresh will handle it
        refresh();
        
        // For replies, update the appropriate maps
        Object.keys(repliesMap).forEach(parentId => {
          if (repliesMap[parentId]?.some(r => r.id === commentId)) {
            setRepliesMap(prev => ({
              ...prev,
              [parentId]: prev[parentId].map(r => 
                r.id === commentId 
                  ? { ...r, is_deleted: true, content: '[Deleted]' } 
                  : r
              ),
              [`${parentId}_cache`]: prev[`${parentId}_cache`].map(r => 
                r.id === commentId 
                  ? { ...r, is_deleted: true, content: '[Deleted]' } 
                  : r
              )
            }));
          }
        });
        
        // For deep replies
        Object.keys(deepRepliesMap).forEach(parentId => {
          if (deepRepliesMap[parentId]?.some(r => r.id === commentId)) {
            setDeepRepliesMap(prev => ({
              ...prev,
              [parentId]: prev[parentId].map(r => 
                r.id === commentId 
                  ? { ...r, is_deleted: true, content: '[Deleted]' } 
                  : r
              ),
              [`${parentId}_cache`]: prev[`${parentId}_cache`].map(r => 
                r.id === commentId 
                  ? { ...r, is_deleted: true, content: '[Deleted]' } 
                  : r
              )
            }));
          }
        });
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // Handle toggling replies for a comment
  const handleToggleReplies = async (commentId: string) => {
    // If we already loaded replies for this comment, just show/hide them
    if (repliesMap[commentId]) {
      setRepliesMap(prev => ({
        ...prev,
        [commentId]: prev[commentId]?.length ? [] : [...(prev[`${commentId}_cache`] || [])]
      }));
      return;
    }
    
    // Otherwise, load replies from the API
    setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
    
    try {
      const replies = await getReplies(commentId);
      
      setRepliesMap(prev => ({
        ...prev,
        [commentId]: replies,
        [`${commentId}_cache`]: replies
      }));
    } catch (err) {
      console.error('Error loading replies:', err);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle toggling deep replies (second level)
  const handleToggleDeepReplies = async (commentId: string) => {
    // If we already loaded replies for this comment, just show/hide them
    if (deepRepliesMap[commentId]) {
      setDeepRepliesMap(prev => ({
        ...prev,
        [commentId]: prev[commentId]?.length ? [] : [...(prev[`${commentId}_cache`] || [])]
      }));
      return;
    }
    
    // Otherwise, load replies from the API
    setLoadingDeepReplies(prev => ({ ...prev, [commentId]: true }));
    
    try {
      const replies = await getReplies(commentId);
      
      setDeepRepliesMap(prev => ({
        ...prev,
        [commentId]: replies,
        [`${commentId}_cache`]: replies
      }));
    } catch (err) {
      console.error('Error loading deep replies:', err);
    } finally {
      setLoadingDeepReplies(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Load reactions for a comment
  const handleLoadReactions = async (commentId: string) => {
    if (reactionsMap[commentId]) return;
    
    setLoadingReactions(prev => ({ ...prev, [commentId]: true }));
    
    try {
      const reactions = await getReactions(commentId);
      
      setReactionsMap(prev => ({
        ...prev,
        [commentId]: reactions
      }));
    } catch (err) {
      console.error('Error loading reactions:', err);
    } finally {
      setLoadingReactions(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Handle adding a reaction
  const handleAddReaction = async (commentId: string, emoji: string) => {
    try {
      const reaction = await addReaction(commentId, emoji);
      
      if (reaction) {
        setReactionsMap(prev => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), reaction]
        }));
      }
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
  };

  // Handle removing a reaction
  const handleRemoveReaction = async (commentId: string, emoji: string) => {
    try {
      const success = await removeReaction(commentId, emoji);
      
      if (success) {
        setReactionsMap(prev => ({
          ...prev,
          [commentId]: (prev[commentId] || [])
            .filter(r => !(r.user_id === userId && r.emoji === emoji))
        }));
      }
    } catch (err) {
      console.error('Error removing reaction:', err);
    }
  };

  // Render a single comment component
  const renderComment = (comment: CommentWithUser, level: number = 0, isReply: boolean = false) => {
    const reactions = reactionsMap[comment.id] || [];
    const isEditing = editingId === comment.id;
    const isReplying = replyingTo === comment.id;
    const hasUserReacted = (emoji: string) => reactions.some(r => r.user_id === userId && r.emoji === emoji);
    
    // Determine indentation based on nesting level
    const indent = Math.min(level, 2) * 14; // 0, 14, 28px
    
    return (
      <div
        key={comment.id}
        className={cn(
          'relative flex flex-col group',
          level > 0 && 'mt-1',
          comment.is_deleted && 'opacity-60 italic',
        )}
        style={{ marginLeft: indent }}
        aria-label={comment.is_deleted ? 'Deleted comment' : 'Comment'}
      >
        {/* Vertical connector for nesting */}
        {level > 0 && (
          <div className="absolute -left-3 top-2 h-full border-l-2 border-gray-200 dark:border-gray-700" style={{ height: 'calc(100% - 8px)' }} />
        )}
        <div className="flex items-start gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={comment.user?.avatar_url || undefined} alt={comment.user?.name || 'User'} />
            <AvatarFallback>{comment.user?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs text-gray-800 dark:text-gray-100 truncate max-w-[120px]">{comment.user?.name || 'Unknown'}</span>
              <span className="text-[10px] text-gray-400">{timeAgo(comment.created_at)}</span>
              {comment.is_edited && <span className="text-[10px] text-gray-400 italic ml-1">(edited)</span>}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line break-words">
              {comment.content}
            </div>
            {/* Emoji reactions bar */}
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {/* Show up to 3 unique emoji reactions */}
              {(() => {
                const reactions = reactionsMap[comment.id] || [];
                const uniqueEmojis = Array.from(new Set(reactions.map(r => r.emoji)));
                const maxToShow = 3;
                const overflow = uniqueEmojis.length > maxToShow ? uniqueEmojis.length - maxToShow : 0;
                return (
                  <>
                    {uniqueEmojis.slice(0, maxToShow).map(emoji => {
                      const count = reactions.filter(r => r.emoji === emoji).length;
                      const userReacted = reactions.some(r => r.emoji === emoji && r.user_id === userId);
                      return (
                        <button
                          key={emoji}
                          className={cn(
                            'px-1.5 h-6 flex items-center gap-0.5 text-base font-medium rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 transition-all',
                            userReacted ? 'ring-2 ring-blue-300' : ''
                          )}
                          style={{ background: 'none', border: 'none' }}
                          onClick={() => handleAddReaction(comment.id, emoji)}
                          aria-label={`React with ${emoji}`}
                        >
                          <span className="text-sm" aria-hidden="true">{emoji}</span>
                          <span className="text-[10px] text-gray-500 font-semibold">{count}</span>
                        </button>
                      );
                    })}
                    {/* +N badge for overflow */}
                    {overflow > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="px-1.5 h-6 flex items-center gap-0.5 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60"
                            aria-label={`Show all reactions`}
                          >
                            +{overflow}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 min-w-[120px]">
                          <div className="flex flex-col gap-1">
                            {uniqueEmojis.slice(maxToShow).map(emoji => {
                              const count = reactions.filter(r => r.emoji === emoji).length;
                              return (
                                <div key={emoji} className="flex items-center gap-2">
                                  <span className="text-base">{emoji}</span>
                                  <span className="text-xs text-gray-500">{count} reaction{count > 1 ? 's' : ''}</span>
                                </div>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </>
                );
              })()}
              {/* Add reaction button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    aria-label="Add reaction"
                  >
                    <Smile className="h-4 w-4 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 rounded-2xl shadow-xl bg-white/95 border border-gray-100 min-w-[220px] max-w-xs">
                  <EmojiPicker.Root>
                    <EmojiPicker.Search className="mb-1 rounded-md bg-gray-100 px-2 py-1 text-xs" />
                    <EmojiPicker.Viewport className="max-h-40 overflow-y-auto">
                      <EmojiPicker.Loading className="text-gray-400 text-xs">Loading…</EmojiPicker.Loading>
                      <EmojiPicker.Empty className="text-gray-400 text-xs">No emoji found.</EmojiPicker.Empty>
                      <EmojiPicker.List
                        className="select-none pb-1"
                        components={{
                          Emoji: ({ emoji, ...props }) => (
                            <button
                              {...props}
                              onClick={() => handleAddReaction(comment.id, emoji)}
                              className="p-1 hover:bg-gray-100 rounded"
                              aria-label={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          )
                        }}
                      />
                    </EmojiPicker.Viewport>
                  </EmojiPicker.Root>
                </PopoverContent>
              </Popover>
            </div>
            {/* Reply, edit, delete actions, etc. (not shown here for brevity) */}
          </div>
        </div>
        {/* Render replies recursively, up to 3 levels */}
        {level < 2 && repliesMap[comment.id]?.length > 0 && (
          <div className="mt-1">
            {repliesMap[comment.id].map(reply => renderComment(reply, level + 1, true))}
          </div>
        )}
      </div>
    );
  };

  // Focus the reply input when replying changes
  useEffect(() => {
    if (replyingTo) {
      const form = document.querySelector(`#comment-${replyingTo} form textarea`);
      if (form) {
        (form as HTMLTextAreaElement).focus();
      }
    }
  }, [replyingTo]);

  return (
    <div className={cn('relative mt-2', className)}>
      {/* Remove colored border and extra container, just render the comments */}
      <div className="">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm text-gray-700 dark:text-gray-200 flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-blue-400" />
            Comments
            <span className="ml-1 text-xs text-gray-400">({totalComments})</span>
          </div>
          {/* Refresh button: icon only, tooltip, no spinner */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 p-0"
                aria-label="Refresh comments"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 text-gray-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </div>
        {/* Loading spinner only in comments area */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="h-6 w-6 text-blue-400" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Render comments tree with vertical connectors and compact indentation */}
            {comments.length === 0 && (
              <div className="text-xs text-gray-400 py-4 text-center">No comments yet. Be the first to comment!</div>
            )}
            {comments.map((comment) => renderComment(comment, 0, false))}
            {/* Load more button for pagination */}
            {hasMore && (
              <div className="flex justify-center mt-2">
                <Button size="sm" variant="outline" onClick={loadMore} aria-label="Load more comments">
                  Load more
                </Button>
              </div>
            )}
            <div ref={commentsEndRef} />
          </div>
        )}
        {/* Inline comment form always visible at bottom */}
        <div className="mt-3">
          <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
            <Input
              ref={commentInputRef}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="text-sm flex-1 resize-none pr-10"
              disabled={isLoading}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newComment.trim()) handleSubmitComment(e);
                }
              }}
            />
            <button
              type="submit"
              aria-label="Send comment"
              disabled={!newComment.trim() || isLoading}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                !newComment.trim() ? 'text-gray-300' : 'text-primary',
                'transition-colors'
              )}
              style={{ pointerEvents: newComment.trim() ? 'auto' : 'none' }}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 