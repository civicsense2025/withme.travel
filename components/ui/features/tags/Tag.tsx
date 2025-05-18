'use client';

/**
 * Tag Component
 * 
 * Displays a single tag with optional removal functionality
 */

import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface TagProps {
  /** Tag name to display */
  name: string;
  /** Handler called when tag is removed */
  onRemove?: () => void;
  /** Whether tag is being removed (loading state) */
  isRemoving?: boolean;
  /** Tag ID (optional, for internal tracking) */
  id?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Tag component for displaying a single tag with optional remove button
 */
export function Tag({
  name,
  onRemove,
  isRemoving = false,
  id,
  className,
}: TagProps) {
  // When tag removal is triggered
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove && !isRemoving) {
      onRemove();
    }
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
        isRemoving && 'opacity-50',
        className
      )}
      data-tag-id={id}
    >
      <span>{name}</span>
      
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted/20"
          disabled={isRemoving}
          aria-label={`Remove ${name} tag`}
        >
          <X size={12} />
        </button>
      )}
    </Badge>
  );
} 