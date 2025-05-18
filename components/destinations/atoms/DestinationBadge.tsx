/**
 * Destination Badge
 * 
 * A styled badge for destination metadata like seasons or categories
 * 
 * @module destinations/atoms
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type BadgeVariant = 
  | 'default' 
  | 'season' 
  | 'continent' 
  | 'category' 
  | 'cost' 
  | 'highlight';

export interface DestinationBadgeProps {
  /** Badge text content */
  children: React.ReactNode;
  /** Optional icon to display before the text */
  icon?: React.ReactNode;
  /** Badge variant determines styling */
  variant?: BadgeVariant;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Map variants to color schemes
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary hover:bg-primary/20',
  season: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40',
  continent: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/40',
  category: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/40',
  cost: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40',
  highlight: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/40',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationBadge({
  children,
  icon,
  variant = 'default',
  className,
}: DestinationBadgeProps) {
  return (
    <Badge 
      variant="outline"
      className={cn(
        "font-medium",
        "border-transparent transition-colors",
        { "flex items-center gap-1": !!icon },
        variantClasses[variant],
        className
      )}
    >
      {icon}
      {children}
    </Badge>
  );
} 