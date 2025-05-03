'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingProps {
  /**
   * The current rating value
   */
  value: number;
  /**
   * The maximum rating value
   * @default 5
   */
  max?: number;
  /**
   * Whether the rating is read-only
   * @default true
   */
  readOnly?: boolean;
  /**
   * Optional className for the container
   */
  className?: string;
  /**
   * Callback when rating changes
   */
  onChange?: (value: number) => void;
  /**
   * Size of the rating stars
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Rating component displays a star rating and optionally allows users to set a rating
 */
export function Rating({
  value,
  max = 5,
  readOnly = true,
  className,
  onChange,
  size = 'md',
}: RatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const sizeClass = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleClick = (newValue: number) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center',
        readOnly ? 'pointer-events-none' : 'cursor-pointer',
        className
      )}
    >
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass[size],
            'transition-colors mr-0.5',
            star <= value
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-transparent text-muted-foreground'
          )}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
}