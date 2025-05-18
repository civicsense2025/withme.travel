/**
 * GroupMemberRoleBadge
 * 
 * Badge component for displaying a group member's role
 * 
 * @module groups/atoms
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type GroupMemberRole = 'owner' | 'admin' | 'member' | 'guest';

export interface GroupMemberRoleBadgeProps {
  /** The member's role */
  role: GroupMemberRole;
  /** Whether to show an icon next to the role text */
  showIcon?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupMemberRoleBadge({
  role,
  showIcon = true,
  className,
}: GroupMemberRoleBadgeProps) {
  // Style variations based on role
  const roleStyles = {
    owner: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800/30',
    admin: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30',
    member: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30',
    guest: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800/30',
  };

  // Determine which icon to show based on role
  const renderIcon = () => {
    if (!showIcon) return null;
    
    if (role === 'owner') {
      return <Star className="mr-1 h-3 w-3" />;
    } else if (role === 'admin') {
      return <Shield className="mr-1 h-3 w-3" />;
    }
    
    return null;
  };

  return (
    <Badge 
      variant="outline" 
      className={cn('text-xs border inline-flex items-center', roleStyles[role], className)}
    >
      {renderIcon()}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
} 