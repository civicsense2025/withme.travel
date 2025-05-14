import React, { useState } from 'react';
import type { CommentWithUser, CommentReactionWithUser } from '@/types/comments';
import { Button } from '@/components/ui/button';
// import { EmojiIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

// Fallback EmojiIcon if not found in icons
function EmojiIcon({ className = '' }: { className?: string }) {
  return (
    <span className={cn('inline-block', className)} role="img" aria-label="emoji">
      😊
    </span>
  );
}

interface CommentItemProps {
  comment: CommentWithUser;
  reactions: CommentReactionWithUser[];
  isReply?: boolean;
  isLoadingReplies?: boolean;
  isLoadingReactions?: boolean;
  showReplyForm?: boolean;
  onToggleReplies?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onLoadReactions?: (commentId: string) => void;
  onAddReaction?: (commentId: string, emoji: string) => void;
  onRemoveReaction?: (commentId: string, emoji: string) => void;
  onReplySubmit?: (content: string) => void;
  children?: React.ReactNode;
}

export default function CommentItem({
  comment,
  reactions,
  isReply = false,
  isLoadingReplies = false,
  isLoadingReactions = false,
  showReplyForm = false,
  onToggleReplies,
  onReply,
  onEdit,
  onDelete,
  onLoadReactions,
  onAddReaction,
  onRemoveReaction,
  onReplySubmit,
  children,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReactions, setShowReactions] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // Handler for submitting an edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onEdit && editContent.trim()) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  // Handler for submitting a reply
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onReplySubmit && replyContent.trim()) {
      onReplySubmit(replyContent.trim());
      setReplyContent('');
    }
  };

  // Handler for toggling reactions
  const handleToggleReactions = () => {
    setShowReactions((v) => !v);
    if (onLoadReactions) onLoadReactions(comment.id);
  };

  // Handler for adding a reaction (for demo, just use a few emojis)
  const handleAddReaction = (emoji: string) => {
    if (onAddReaction) onAddReaction(comment.id, emoji);
  };

  // Handler for removing a reaction (for demo, just use a few emojis)
  const handleRemoveReaction = (emoji: string) => {
    if (onRemoveReaction) onRemoveReaction(comment.id, emoji);
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 flex flex-col gap-1 shadow-sm',
        isReply && 'ml-4 bg-muted'
      )}
      aria-label={isReply ? 'Reply' : 'Comment'}
    >
      <div className="flex items-center gap-2">
        <img
          src={comment.user.avatar_url || '/images/default-avatar.png'}
          alt={comment.user.name || 'User avatar'}
          className="w-7 h-7 rounded-full object-cover border"
        />
        <span className="font-medium text-xs text-foreground/90">
          {comment.user.name || 'Anonymous'}
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          {new Date(comment.created_at).toLocaleString()}
        </span>
        {comment.is_edited && (
          <span className="ml-2 text-[10px] text-muted-foreground italic">(edited)</span>
        )}
      </div>
      <div className="mt-1 text-sm text-foreground/90">
        {comment.is_deleted ? (
          <span className="italic text-muted-foreground">[Deleted]</span>
        ) : isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex gap-2 items-center">
            <input
              className="border rounded px-2 py-1 text-xs w-full"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              aria-label="Edit comment"
              autoFocus
            />
            <Button type="submit" size="sm" variant="outline">
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <span>{comment.content}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Button
          size="sm"
          variant="ghost"
          className="text-xs px-1 py-0.5"
          onClick={handleToggleReactions}
          aria-label="Show reactions"
        >
          <EmojiIcon className="w-4 h-4 mr-1" />
          {comment.reactions_count > 0 && (
            <span className="ml-1 text-xs">{comment.reactions_count}</span>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs px-1 py-0.5"
          onClick={() => onReply && onReply(comment.id)}
          aria-label="Reply"
        >
          Reply
        </Button>
        {onEdit && !comment.is_deleted && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs px-1 py-0.5"
            onClick={() => setIsEditing(true)}
            aria-label="Edit comment"
          >
            Edit
          </Button>
        )}
        {onDelete && !comment.is_deleted && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs px-1 py-0.5 text-destructive"
            onClick={() => onDelete(comment.id)}
            aria-label="Delete comment"
          >
            Delete
          </Button>
        )}
        {onToggleReplies && comment.replies_count > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs px-1 py-0.5"
            onClick={() => onToggleReplies(comment.id)}
            aria-label="Show replies"
          >
            {isLoadingReplies
              ? 'Loading...'
              : `${comment.replies_count} repl${comment.replies_count === 1 ? 'y' : 'ies'}`}
          </Button>
        )}
      </div>
      {showReactions && (
        <div className="flex flex-wrap gap-1 mt-1">
          {/* Show existing reactions as chips */}
          {reactions.map((r) => (
            <span
              key={r.emoji + r.user.id}
              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-foreground border border-border cursor-pointer"
              onClick={() => handleRemoveReaction(r.emoji)}
              aria-label={`Remove reaction ${r.emoji}`}
            >
              {r.emoji}
            </span>
          ))}
          {/* Add a few emoji buttons for demo */}
          {['👍', '😂', '😍', '🎉', '😢'].map((emoji) => (
            <button
              key={emoji}
              className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs text-foreground border border-border hover:bg-primary/10"
              onClick={() => handleAddReaction(emoji)}
              aria-label={`Add reaction ${emoji}`}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2">
          <input
            className="border rounded px-2 py-1 text-xs w-full"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            aria-label="Reply to comment"
            autoFocus
          />
          <Button type="submit" size="sm" variant="outline">
            Reply
          </Button>
        </form>
      )}
      {children}
    </div>
  );
}
