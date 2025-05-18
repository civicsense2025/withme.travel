/**
 * Member Status Badge (Atom)
 *
 * Displays a formatted badge representing a member's status in a trip or group.
 *
 * @module manage/atoms
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Clock, Mail } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type MemberStatus = 'active' | 'pending' | 'invited' | 'declined' | 'removed';

export interface MemberStatusBadgeProps {
  /** The status to display */
  status: MemberStatus;
  /** Whether to show the status icon */
  showIcon?: boolean;
  /** Whether to show the status label */
  showLabel?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the color scheme for a status
 */
function getStatusColor(status: MemberStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'pending':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'invited':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'declined':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'removed':
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
}

/**
 * Get the icon for a status
 */
function getStatusIcon(status: MemberStatus, size: number = 14): React.ReactNode {
  switch (status) {
    case 'active':
      return <Check size={size} />;
    case 'pending':
      return <Clock size={size} />;
    case 'invited':
      return <Mail size={size} />;
    case 'declined':
      return <AlertCircle size={size} />;
    case 'removed':
      return <AlertCircle size={size} />;
    default:
      return <Clock size={size} />;
  }
}

/**
 * Get the display label for a status
 */
function getStatusLabel(status: MemberStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MemberStatusBadge({
  status,
  showIcon = true,
  showLabel = true,
  className,
  size = 'md',
}: MemberStatusBadgeProps) {
  // Size-based classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  // Icon size based on badge size
  const iconSize = size === 'lg' ? 16 : 14;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border',
        getStatusColor(status),
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span className="flex-shrink-0">{getStatusIcon(status, iconSize)}</span>}
      {showLabel && (
        <span className="flex-shrink-0 whitespace-nowrap font-medium">
          {getStatusLabel(status)}
        </span>
      )}
    </div>
  );
}
