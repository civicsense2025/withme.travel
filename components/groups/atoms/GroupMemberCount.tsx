/**
 * GroupMemberCount
 * 
 * Displays the number of members in a group with an icon
 * 
 * @module groups/atoms
 */

import React from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupMemberCountProps {
  /** Number of members in the group */
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

export function GroupMemberCount({
  count,
  className = '',
  size = 'md',
  showLabel = true,
  icon = <Users className="h-4 w-4" />,
}: GroupMemberCountProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];
  
  const label = count === 1 ? 'member' : 'members';

  return (
    <div className={cn("flex items-center gap-1.5 text-muted-foreground", sizeClasses, className)}>
      {icon}
      <span>{count}{showLabel ? ` ${label}` : ''}</span>
    </div>
  );
} 