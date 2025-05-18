/**
 * GroupTripCount
 * 
 * Displays the number of trips associated with a group
 * 
 * @module groups/atoms
 */

import React from 'react';
import { Map } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupTripCountProps {
  /** Number of trips in the group */
  count: number;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show label text */
  showLabel?: boolean;
  /** Optional icon override */
  icon?: React.ReactNode;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupTripCount({
  count,
  className = '',
  size = 'md',
  showLabel = true,
  icon = <Map className="h-4 w-4" />,
}: GroupTripCountProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];
  
  const label = count === 1 ? 'trip' : 'trips';

  return (
    <div className={cn("flex items-center gap-1.5 text-muted-foreground", sizeClasses, className)}>
      {icon}
      <span>{count}{showLabel ? ` ${label}` : ''}</span>
    </div>
  );
} 