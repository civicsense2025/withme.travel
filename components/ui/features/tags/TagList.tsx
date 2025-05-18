'use client';

/**
 * Tag List Component
 * 
 * Displays multiple tags with optional filtering and grouping
 */

import React from 'react';
import { Tag } from './Tag';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface TagListProps {
  /** Tags to display */
  tags: Array<{
    /** Tag name */
    name: string;
    /** Optional tag ID */
    id?: string;
  }>;
  /** Whether to allow removing tags */
  removable?: boolean;
  /** Handler for tag removal */
  onRemove?: (tagName: string) => void;
  /** Function to determine if a tag is being removed (for loading state) */
  isRemoving?: (tagName: string) => boolean;
  /** Max number of tags to display before showing a "+X more" button */
  maxVisible?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show a tag count */
  showCount?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a list of tags with optional filtering and removal
 */
export function TagList({
  tags = [],
  removable = false,
  onRemove,
  isRemoving = () => false,
  maxVisible,
  className,
  showCount = false,
}: TagListProps) {
  const [showAll, setShowAll] = React.useState(false);
  
  const displayTags = maxVisible && !showAll && tags.length > maxVisible
    ? tags.slice(0, maxVisible)
    : tags;
  
  const hiddenCount = maxVisible && tags.length > maxVisible ? tags.length - maxVisible : 0;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <Tag
            key={tag.id || tag.name}
            name={tag.name}
            id={tag.id}
            onRemove={removable && onRemove ? () => onRemove(tag.name) : undefined}
            isRemoving={isRemoving(tag.name)}
          />
        ))}
        
        {/* Show count badge */}
        {showCount && tags.length > 0 && (
          <span className="inline-flex h-6 items-center rounded-full bg-muted px-2 text-xs font-medium">
            {tags.length}
          </span>
        )}
        
        {/* Show more button */}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex h-6 items-center rounded-full bg-muted px-2 text-xs font-medium hover:bg-muted/80"
          >
            +{hiddenCount} more
          </button>
        )}
        
        {/* Show less button */}
        {showAll && maxVisible && tags.length > maxVisible && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="inline-flex h-6 items-center rounded-full bg-muted px-2 text-xs font-medium hover:bg-muted/80"
          >
            Show less
          </button>
        )}
      </div>
      
      {/* Empty state */}
      {tags.length === 0 && (
        <p className="text-sm text-muted-foreground">No tags</p>
      )}
    </div>
  );
} 