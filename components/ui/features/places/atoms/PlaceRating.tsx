/**
 * PlaceRating Component
 * 
 * Displays a place's rating as stars
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface PlaceRatingProps {
  /** Rating value (0-5) */
  rating: number | null;
  /** Number of ratings */
  count?: number;
  /** Show the rating value as text */
  showText?: boolean;
  /** Max rating (default: 5) */
  maxRating?: number;
  /** Additional CSS classes */
  className?: string;
  /** Size of the stars */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a place's rating as stars
 */
export function PlaceRating({ 
  rating,
  count,
  showText = true,
  maxRating = 5,
  className,
  size = 'md'
}: PlaceRatingProps) {
  // If rating is null or undefined, show N/A
  if (rating === null || rating === undefined) {
    return (
      <div className={cn("flex items-center text-muted-foreground text-sm", className)}>
        N/A
      </div>
    );
  }
  
  // Determine star size based on component size
  const starSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };
  
  const starSize = starSizes[size];
  
  // Determine text size based on component size
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const textSize = textSizes[size];
  
  // Calculate filled stars, half stars, and empty stars
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - filledStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {/* Render filled stars */}
        {Array.from({ length: filledStars }).map((_, i) => (
          <Star 
            key={`filled-${i}`} 
            size={starSize}
            className="text-yellow-500 fill-yellow-500" 
          />
        ))}
        
        {/* Render half star if needed */}
        {hasHalfStar && (
          <StarHalf 
            size={starSize}
            className="text-yellow-500 fill-yellow-500" 
          />
        )}
        
        {/* Render empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            size={starSize}
            className="text-yellow-500" 
          />
        ))}
      </div>
      
      {/* Show rating as text with count if requested */}
      {showText && (
        <span className={cn("font-medium", textSize)}>
          {rating.toFixed(1)}
          {count !== undefined && count > 0 && (
            <span className="text-muted-foreground ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  );
} 