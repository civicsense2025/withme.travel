/**
 * PlaceCategory
 * 
 * Displays a formatted category with icon for places
 */

'use client';

import React from 'react';
import { PlaceCategory as PlaceCategoryEnum } from '@/types/places';
import { cn } from '@/lib/utils';
import { PlaceIcon } from './PlaceIcon';

// ============================================================================
// TYPES
// ============================================================================

export interface PlaceCategoryProps {
  /** The category to display */
  category: PlaceCategoryEnum | string | null;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size of the icon */
  iconSize?: number;
  /** Variant style: 'badge' or 'text' */
  variant?: 'badge' | 'text' | 'inline';
  /** Optional custom styles for the icon */
  iconClassName?: string;
  /** Optional custom styles for the label */
  labelClassName?: string;
}

// Map of categories to friendly display names
const categoryDisplayNames: Record<string, string> = {
  [PlaceCategoryEnum.RESTAURANT]: 'Restaurant',
  [PlaceCategoryEnum.HOTEL]: 'Hotel',
  [PlaceCategoryEnum.CAFE]: 'Café',
  [PlaceCategoryEnum.BAR]: 'Bar',
  [PlaceCategoryEnum.SHOPPING]: 'Shopping',
  [PlaceCategoryEnum.LANDMARK]: 'Landmark',
  [PlaceCategoryEnum.MUSEUM]: 'Museum',
  [PlaceCategoryEnum.PARK]: 'Park',
  [PlaceCategoryEnum.BEACH]: 'Beach',
  [PlaceCategoryEnum.AIRPORT]: 'Airport',
  [PlaceCategoryEnum.TRANSPORTATION]: 'Transportation',
  [PlaceCategoryEnum.ENTERTAINMENT]: 'Entertainment',
  [PlaceCategoryEnum.NIGHTLIFE]: 'Nightlife',
  [PlaceCategoryEnum.SERVICE]: 'Service',
  [PlaceCategoryEnum.SPORTS]: 'Sports',
  [PlaceCategoryEnum.ATTRACTION]: 'Attraction',
  [PlaceCategoryEnum.OTHER]: 'Other',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a formatted place category with optional icon
 */
export function PlaceCategory({
  category,
  showIcon = true,
  showLabel = true,
  className = '',
  iconSize = 18,
  variant = 'text',
  iconClassName = '',
  labelClassName = '',
}: PlaceCategoryProps) {
  if (!category) return null;
  
  // Get friendly display name, with fallback
  const displayName = categoryDisplayNames[category] || 
    (typeof category === 'string' ? category.charAt(0).toUpperCase() + category.slice(1) : 'Unknown');
  
  // Style classes based on variant
  const containerClasses = cn(
    'flex items-center gap-1.5',
    variant === 'badge' && 'rounded-full text-xs py-1 px-3 bg-muted',
    variant === 'inline' && 'inline-flex text-sm',
    className
  );
  
  const iconClasses = cn(
    'flex-shrink-0',
    iconClassName
  );
  
  const labelClasses = cn(
    variant === 'badge' && 'font-medium',
    labelClassName
  );

  return (
    <div className={containerClasses}>
      {showIcon && (
        <PlaceIcon 
          category={category} 
          size={iconSize} 
          className={iconClasses} 
        />
      )}
      {showLabel && (
        <span className={labelClasses}>{displayName}</span>
      )}
    </div>
  );
}

export default PlaceCategory; 