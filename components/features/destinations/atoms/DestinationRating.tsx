/**
 * Destination Rating
 * 
 * Displays a rating for a destination category (cuisine, activities, etc.)
 * 
 * @module destinations/atoms
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DestinationRatingProps {
  /** Label for the rating category */
  label: string;
  /** Rating value (0-5) */
  value: number;
  /** Max rating value (default: 5) */
  maxValue?: number;
  /** Size variant - controls overall dimensions */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationRating({
  label,
  value,
  maxValue = 5,
  size = 'md',
  className,
}: DestinationRatingProps) {
  // Limit value to the range of 0 to maxValue
  const normalizedValue = Math.min(Math.max(0, value), maxValue);
  
  // Calculate percentage for the progress bar
  const percentage = (normalizedValue / maxValue) * 100;
  
  // Determine the color based on the rating value
  const getColor = () => {
    const ratio = normalizedValue / maxValue;
    if (ratio >= 0.8) return 'bg-emerald-500 text-emerald-950';
    if (ratio >= 0.6) return 'bg-green-500 text-green-950';
    if (ratio >= 0.4) return 'bg-amber-500 text-amber-950';
    if (ratio >= 0.2) return 'bg-orange-500 text-orange-950';
    return 'bg-red-500 text-red-950';
  };
  
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'text-xs',
      bar: 'h-1',
      value: 'text-xs',
    },
    md: {
      container: 'text-sm',
      bar: 'h-1.5',
      value: 'text-sm',
    },
    lg: {
      container: 'text-base',
      bar: 'h-2',
      value: 'text-base',
    },
  };

  return (
    <div className={cn("w-full", sizeClasses[size].container, className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{normalizedValue.toFixed(1)}</span>
      </div>
      <div className="w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("rounded-full", getColor(), sizeClasses[size].bar)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
} 