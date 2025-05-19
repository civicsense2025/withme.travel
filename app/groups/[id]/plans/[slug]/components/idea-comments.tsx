'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { MessageCircle, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/app/groups/[id]/plans/[slug]/utils/date-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthModal } from '@/components/features/groups/organisms/AuthModal';

interface CommentUser {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_edited?: boolean;
  is_deleted?: boolean;
  user?: CommentUser;
  replies_count?: number;
}

interface IdeaCommentsProps {
  ideaId: string;
  userId: string;
  className?: string;
  isAuthenticated: boolean;
  groupId: string;
}

export default function IdeaComments({
  ideaId,
  userId,
  className = '',
  isAuthenticated,
  groupId,
}: IdeaCommentsProps) {
  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Refs
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Check if comment is valid
  const canSubmitComment = newComment.trim().length > 0 && !isLoading;

  // Mock function to add a comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitComment) return;

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    // In a real implementation, this would call an API
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newCommentObj: Comment = {
        id: Math.random().toString(36).substring(2, 9),
        content: newComment,
        created_at: new Date().toISOString(),
        user_id: userId,
        user: {
          id: userId,
          name: 'Current User',
        },
        replies_count: 0
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      setIsLoading(false);
    }, 500);
  };

  // Render a single comment
  const renderComment = (comment: Comment) => {
    return (
      <div 
        key={comment.id}
        className={cn(
          'relative flex flex-col group p-2 border-b',
          comment.is_deleted && 'opacity-60 italic'
        )}
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
              <span className="font-medium text-xs">
                {comment.user?.name || 'Unknown'}
              </span>
              <span className="text-[10px] text-gray-400">
                {timeAgo(new Date(comment.created_at))}
              </span>
              {comment.is_edited && (
                <span className="text-[10px] text-gray-400 italic">(edited)</span>
              )}
            </div>
            <div className="text-sm whitespace-pre-line break-words">
              {comment.content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('comments-container relative h-full flex flex-col', className)} ref={commentsContainerRef}>
      <div className="flex items-center mb-3 pb-2 border-b">
        <MessageCircle className="h-4 w-4 text-blue-400 mr-2" />
        <span className="font-bold text-base">
          Comments <span>({comments.length})</span>
        </span>
      </div>

      {/* Comment input form */}
      <form onSubmit={handleSubmitComment} className="mb-4">
        <div className="relative">
          <Input
            ref={commentInputRef}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="pr-10"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            disabled={!canSubmitComment}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="flex-1 overflow-auto space-y-1">
        {comments.length === 0 && !isLoading ? (
          <div className="text-center p-4 text-sm text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(renderComment)
        )}

        {isLoading && (
          <div className="flex justify-center py-2">
            <Spinner className="h-4 w-4 text-blue-400" />
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal 
          onSignIn={() => {
            // Redirect to sign in
            window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`;
          }}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
