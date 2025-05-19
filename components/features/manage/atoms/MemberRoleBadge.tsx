/**
 * Member Role Badge (Atom)
 *
 * Displays a formatted badge representing a member's role in a trip or group.
 *
 * @module manage/atoms
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, ShieldCheck, ShieldX, User } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type MemberRole = 'owner' | 'admin' | 'editor' | 'member' | 'viewer' | 'guest';

export interface MemberRoleBadgeProps {
  /** The role to display */
  role: MemberRole;
  /** Whether to show the role icon */
  showIcon?: boolean;
  /** Whether to show the role label */
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
 * Get the color scheme for a role
 */
function getRoleColor(role: MemberRole): string {
  switch (role) {
    case 'owner':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'admin':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'editor':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'member':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    case 'viewer':
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    case 'guest':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
}

/**
 * Get the icon for a role
 */
function getRoleIcon(role: MemberRole, size: number = 14): React.ReactNode {
  switch (role) {
    case 'owner':
      return <ShieldCheck size={size} />;
    case 'admin':
      return <Shield size={size} />;
    case 'editor':
      return <ShieldCheck size={size} />;
    case 'member':
      return <User size={size} />;
    case 'viewer':
      return <User size={size} />;
    case 'guest':
      return <ShieldX size={size} />;
    default:
      return <User size={size} />;
  }
}

/**
 * Get the display label for a role
 */
function getRoleLabel(role: MemberRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MemberRoleBadge({
  role,
  showIcon = true,
  showLabel = true,
  className,
  size = 'md',
}: MemberRoleBadgeProps) {
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
        getRoleColor(role),
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span className="flex-shrink-0">{getRoleIcon(role, iconSize)}</span>}
      {showLabel && (
        <span className="flex-shrink-0 whitespace-nowrap font-medium">{getRoleLabel(role)}</span>
      )}
    </div>
  );
}
