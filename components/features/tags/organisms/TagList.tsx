'use client';

import { useState } from 'react';
import { Tag as TagIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractiveTag } from '../molecules/InteractiveTag';
import { cn } from '@/lib/utils';
import type { Tag, TagBaseProps, VoteDirection } from '../types';

/**
 * Props for TagList component
 */
export interface TagListProps extends TagBaseProps {
  /** Array of tags to display */
  tags: Tag[];
  /** Handler for when a tag is clicked */
  onTagClick?: (tag: Tag) => void;
  /** Handler for voting on a tag */
  onVote?: (tag: Tag, direction: VoteDirection) => Promise<void> | void;
  /** Handler for adding a new tag */
  onAddTag?: () => void;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Show voting controls on tags */
  showVoteControls?: boolean;
  /** Show vote counts */
  showVoteCounts?: boolean;
  /** Allow adding new tags */
  allowAddingTags?: boolean;
  /** Empty state text */
  emptyStateText?: string;
  /** Title text */
  title?: string;
}

/**
 * Displays a list of tags with interactive capabilities
 */
export function TagList({
  tags,
  onTagClick,
  onVote,
  onAddTag,
  isLoading = false,
  showVoteControls = true,
  showVoteCounts = false,
  allowAddingTags = true,
  emptyStateText = 'No tags yet',
  title = 'Tags',
  className
}: TagListProps) {
  const [votingTagId, setVotingTagId] = useState<string | null>(null);

  const handleVote = (tag: Tag, direction: VoteDirection) => {
    if (onVote) {
      setVotingTagId(tag.id);
      const result = onVote(tag, direction);
      
      // Check if result is a Promise
      if (result instanceof Promise) {
        result.finally(() => {
          setVotingTagId(null);
        });
      } else {
        // If not a Promise, reset immediately
        setVotingTagId(null);
      }
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        {allowAddingTags && onAddTag && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddTag}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <InteractiveTag
            key={tag.id}
            tag={tag}
            onClick={onTagClick}
            onVote={showVoteControls ? handleVote : undefined}
            isLoading={votingTagId === tag.id}
            showVoteButtons={showVoteControls}
            showVoteCounts={showVoteCounts}
          />
        ))}
        
        {tags.length === 0 && (
          <div className="text-muted-foreground text-sm flex items-center gap-2 py-4">
            <TagIcon className="h-4 w-4" />
            <span>{emptyStateText}</span>
          </div>
        )}
      </div>
    </div>
  );
} 