/**
 * EmptyState
 * 
 * A reusable empty state component with icon, title, description and action
 * 
 * @module groups/molecules
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface EmptyStateProps {
  /** Title text to display */
  title: string;
  /** Description text */
  description: string;
  /** Action element (usually a button) */
  action: React.ReactNode;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Icon background style */
  iconBackground?: string;
  /** Layout of the component */
  layout?: 'vertical' | 'horizontal';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EmptyState({
  title,
  description,
  action,
  icon,
  className = '',
  iconBackground = 'bg-muted',
  layout = 'vertical',
}: EmptyStateProps) {
  if (layout === 'horizontal') {
    return (
      <div className={cn("flex items-center gap-4 p-6 border border-dashed rounded-lg", className)}>
        {icon && (
          <div className={cn("flex-shrink-0 rounded-full p-3", iconBackground)}>
            {icon}
          </div>
        )}
        <div className="flex-grow">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0">
          {action}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("text-center p-6 border border-dashed rounded-lg", className)}>
      {icon && (
        <div className={cn("mx-auto rounded-full p-3 w-fit", iconBackground)}>
          {icon}
        </div>
      )}
      <h3 className="font-medium mt-4">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
} 