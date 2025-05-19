'use client';

import { cn } from '@/lib/utils';
import { TagBadge } from '../atoms/TagBadge';
import { TagVoteButtons } from '../atoms/TagVoteButtons';
import type { Tag, TagBaseProps, VoteDirection } from '../types';

/**
 * Props for InteractiveTag component
 */
export interface InteractiveTagProps extends TagBaseProps {
  /** Tag data to display */
  tag: Tag;
  /** Handler for when the tag is clicked */
  onClick?: (tag: Tag) => void;
  /** Handler for voting */
  onVote?: (tag: Tag, direction: VoteDirection) => void;
  /** Whether the tag is in a loading state */
  isLoading?: boolean;
  /** Whether the tag is interactive (clickable) */
  interactive?: boolean;
  /** Whether to show vote buttons */
  showVoteButtons?: boolean;
  /** Whether to show vote counts */
  showVoteCounts?: boolean;
  /** Whether to show emoji */
  showEmoji?: boolean;
}

/**
 * Displays a tag with interactive elements like voting buttons
 */
export function InteractiveTag({
  tag,
  onClick,
  onVote,
  isLoading = false,
  interactive = true,
  showVoteButtons = true, 
  showVoteCounts = false,
  showEmoji = true,
  className
}: InteractiveTagProps) {
  return (
    <div className={cn('flex items-center', className)}>
      <TagBadge 
        tag={tag} 
        onClick={onClick} 
        interactive={interactive}
        showEmoji={showEmoji}
        className={cn(
          showVoteButtons && "rounded-r-none border-r-0",
          "pr-3"
        )}
      />
      
      {showVoteButtons && onVote && (
        <div className={cn(
          "border border-l-0 rounded-r-md border-input h-8 flex items-center px-2",
          "bg-background"
        )}>
          <TagVoteButtons 
            tag={tag} 
            onVote={onVote} 
            isVoting={isLoading}
            showCounts={showVoteCounts}
          />
        </div>
      )}
    </div>
  );
} 