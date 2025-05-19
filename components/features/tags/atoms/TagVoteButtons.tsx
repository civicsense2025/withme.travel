'use client';

import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tag, TagBaseProps, VoteDirection } from '../types';

/**
 * Props for TagVoteButtons component
 */
export interface TagVoteButtonsProps extends TagBaseProps {
  /** Tag data */
  tag: Tag;
  /** Handler for voting */
  onVote: (tag: Tag, direction: VoteDirection) => void;
  /** Whether voting is in progress */
  isVoting?: boolean;
  /** Show vote counts if available */
  showCounts?: boolean;
}

/**
 * Renders thumb up/down voting buttons for tags
 */
export function TagVoteButtons({
  tag,
  onVote,
  isVoting = false,
  showCounts = false,
  className
}: TagVoteButtonsProps) {
  const handleUpvote = () => {
    if (!isVoting) {
      onVote(tag, 'up');
    }
  };

  const handleDownvote = () => {
    if (!isVoting) {
      onVote(tag, 'down');
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 relative"
        onClick={handleUpvote}
        disabled={isVoting}
        aria-label="Upvote tag"
      >
        <ThumbsUp className="h-3 w-3" />
        {showCounts && tag.up_votes !== undefined && tag.up_votes > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full w-3 h-3 flex items-center justify-center">
            {tag.up_votes > 99 ? '99+' : tag.up_votes}
          </span>
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 relative"
        onClick={handleDownvote}
        disabled={isVoting}
        aria-label="Downvote tag"
      >
        <ThumbsDown className="h-3 w-3" />
        {showCounts && tag.down_votes !== undefined && tag.down_votes > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-destructive text-destructive-foreground rounded-full w-3 h-3 flex items-center justify-center">
            {tag.down_votes > 99 ? '99+' : tag.down_votes}
          </span>
        )}
      </Button>
    </div>
  );
} 