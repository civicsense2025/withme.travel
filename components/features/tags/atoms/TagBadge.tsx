'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Tag, TagBaseProps } from '../types';

/**
 * Props for the TagBadge component
 */
export interface TagBadgeProps extends TagBaseProps {
  /** Tag data to display */
  tag: Tag;
  /** Whether to show the tag emoji */
  showEmoji?: boolean;
  /** Handler for when the tag is clicked */
  onClick?: (tag: Tag) => void;
  /** Whether this tag is interactive */
  interactive?: boolean;
}

/**
 * Renders a single tag badge
 */
export function TagBadge({
  tag,
  showEmoji = true,
  onClick,
  interactive = false,
  className
}: TagBadgeProps) {
  const handleClick = () => {
    if (interactive && onClick) {
      onClick(tag);
    }
  };

  return (
    <Badge 
      className={cn(
        "flex items-center gap-2 py-1 px-3",
        interactive && "hover:bg-secondary/80 transition-colors cursor-pointer",
        className
      )}
      onClick={interactive ? handleClick : undefined}
      style={tag.color ? { backgroundColor: tag.color } : undefined}
    >
      {showEmoji && tag.emoji && <span>{tag.emoji}</span>}
      <span>{tag.name}</span>
    </Badge>
  );
} 