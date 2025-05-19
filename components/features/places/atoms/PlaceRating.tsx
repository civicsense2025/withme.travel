/**
 * PlaceRating
 * 
 * Displays a star rating for places
 */

'use client';

import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface PlaceRatingProps {
  /** Rating value (0-5) */
  rating: number | null;
  /** Number of ratings (for display) */
  count?: number | null;
  /** Max number of stars to display (default: 5) */
  maxRating?: number;
  /** Size of the stars in pixels */
  starSize?: number;
  /** Whether to show the numeric rating beside the stars */
  showNumeric?: boolean;
  /** Whether to show the count of ratings */
  showCount?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Color for filled stars */
  colorFilled?: string;
  /** Color for empty stars */
  colorEmpty?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a star rating for places with optional count
 */
export function PlaceRating({
  rating,
  count,
  maxRating = 5,
  starSize = 16,
  showNumeric = true,
  showCount = true,
  className = '',
  colorFilled = 'text-yellow-400',
  colorEmpty = 'text-gray-300',
}: PlaceRatingProps) {
  // If no rating, return null or a placeholder
  if (rating === null || rating === undefined) {
    return null;
  }

  // Clamp rating between 0 and maxRating
  const clampedRating = Math.max(0, Math.min(rating, maxRating));

  // Generate array of stars
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= maxRating; i++) {
      const difference = clampedRating - i + 1;
      
      if (difference >= 1) {
        // Full star
        stars.push(
          <Star 
            key={i}
            size={starSize} 
            className={colorFilled}
            fill="currentColor" 
          />
        );
      } else if (difference > 0 && difference < 1) {
        // Half star
        stars.push(
          <StarHalf 
            key={i}
            size={starSize} 
            className={colorFilled}
            fill="currentColor" 
          />
        );
      } else {
        // Empty star
        stars.push(
          <Star 
            key={i}
            size={starSize} 
            className={colorEmpty}
          />
        );
      }
    }
    
    return stars;
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      
      {/* Numeric rating */}
      {showNumeric && (
        <span className="font-medium ml-1">{clampedRating.toFixed(1)}</span>
      )}
      
      {/* Rating count */}
      {showCount && count !== null && count !== undefined && count > 0 && (
        <span className="text-sm text-gray-500">
          ({count > 1000 ? `${(count / 1000).toFixed(1)}k` : count})
        </span>
      )}
    </div>
  );
}

export default PlaceRating; 