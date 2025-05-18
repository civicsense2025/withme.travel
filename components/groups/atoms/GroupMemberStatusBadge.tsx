/**
 * GroupMemberStatusBadge
 * 
 * Badge component for displaying a group member's status
 * 
 * @module groups/atoms
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type GroupMemberStatus = 'active' | 'invited' | 'left' | 'removed';

export interface GroupMemberStatusBadgeProps {
  /** The member's status */
  status: GroupMemberStatus;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupMemberStatusBadge({
  status,
  className,
}: GroupMemberStatusBadgeProps) {
  // Style variations based on status
  const statusStyles = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30',
    invited: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30',
    left: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800/30',
    removed: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn('text-xs border', statusStyles[status], className)}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
} 