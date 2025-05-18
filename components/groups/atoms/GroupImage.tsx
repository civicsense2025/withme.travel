/**
 * GroupImage
 * 
 * Displays a group image with fallback to emoji or initials
 * 
 * @module groups/atoms
 */

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupImageProps {
  /** Optional image URL for the group */
  imageUrl?: string | null;
  /** Group name for fallback and alt text */
  groupName: string;
  /** Optional emoji to display when no image */
  emoji?: string | null;
  /** Additional CSS classes */
  className?: string;
  /** Image aspect ratio */
  aspectRatio?: 'square' | 'video' | 'wide';
  /** Whether to add a gradient overlay */
  withGradient?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupImage({
  imageUrl,
  groupName,
  emoji,
  className = '',
  aspectRatio = 'wide',
  withGradient = false,
}: GroupImageProps) {
  // Get initials for fallback
  const initials = groupName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Define aspect ratio class
  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[4/3]',
  }[aspectRatio];

  return (
    <div className={cn("relative overflow-hidden rounded-t-lg", aspectRatioClass, className)}>
      {imageUrl ? (
        // Image is provided
        <>
          <Image
            src={imageUrl}
            alt={groupName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
          {withGradient && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          )}
        </>
      ) : (
        // No image, show emoji or initials
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {emoji ? (
            <span className="text-4xl">{emoji}</span>
          ) : (
            <span className="text-2xl font-medium text-muted-foreground">{initials}</span>
          )}
        </div>
      )}
    </div>
  );
} 