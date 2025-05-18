/**
 * PlaceBadge Component
 * 
 * Displays a place category in a badge format with appropriate icon
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { Badge } from '@/components/ui/badge';
import { PlaceIcon } from './PlaceIcon';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface PlaceBadgeProps {
  /** Category of the place */
  category: string;
  /** Additional CSS classes */
  className?: string;
  /** Size of the icon */
  size?: 'sm' | 'md' | 'lg';
  /** Optional variant */
  variant?: 'default' | 'outline' | 'secondary';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a badge with place category and appropriate icon
 */
export function PlaceBadge({ 
  category,
  className,
  size = 'md',
  variant = 'secondary'
}: PlaceBadgeProps) {
  // Determine icon size based on badge size
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };
  
  const iconSize = iconSizes[size];
  
  // Determine text size based on badge size
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const textSize = textSizes[size];
  
  // Format category for display (capitalize first letter)
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        "flex items-center gap-1.5 font-normal", 
        textSize,
        className
      )}
    >
      <PlaceIcon category={category} size={iconSize} />
      <span>{displayCategory}</span>
    </Badge>
  );
} 