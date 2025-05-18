/**
 * Trip Card Footer
 * 
 * Displays the footer of a trip card with a call to action
 * 
 * @module trips/atoms
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface TripCardFooterProps {
  /** Text to display as the call to action */
  text?: string;
  /** Additional CSS class name */
  className?: string;
  /** Whether to show the hover effect */
  showHoverEffect?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TripCardFooter({
  text = 'View trip details',
  className,
  showHoverEffect = true,
}: TripCardFooterProps) {
  return (
    <div className={cn('mt-4 pt-3 border-t border-border', className)}>
      <span 
        className={cn(
          'text-sm text-primary font-medium flex items-center gap-1',
          showHoverEffect ? 'opacity-80 group-hover:opacity-100 transition-all duration-300' : ''
        )}
      >
        {text}
        <ArrowRight 
          className={cn(
            'h-4 w-4', 
            showHoverEffect ? 'transition-transform duration-300 group-hover:translate-x-1.5' : ''
          )} 
        />
      </span>
    </div>
  );
} 