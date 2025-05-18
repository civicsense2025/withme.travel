/**
 * GroupMemberItem
 * 
 * A card displaying group member information including avatar, role, and status
 * 
 * @module groups/molecules
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  GroupMemberAvatar,
  GroupMemberRoleBadge,
  GroupMemberStatusBadge,
  GroupMemberRole,
  GroupMemberStatus,
} from '../atoms';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface GroupMemberItemProps {
  /** Member's unique ID */
  id: string;
  /** Member's display name */
  name: string;
  /** Member's email address */
  email: string;
  /** Optional avatar URL */
  avatarUrl?: string;
  /** Member's role in the group */
  role: GroupMemberRole;
  /** Current membership status */
  status: GroupMemberStatus;
  /** When the member joined */
  joinedAt?: string;
  /** Whether this is the current user */
  isCurrentUser?: boolean;
  /** Action buttons/menu to render in the right side */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a date as a relative time string
 */
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return '';
  
  // Simple implementation - in a real app, use a proper date library like date-fns
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function GroupMemberItem({
  id,
  name,
  email,
  avatarUrl,
  role,
  status,
  joinedAt,
  isCurrentUser = false,
  actions,
  className,
  onClick,
}: GroupMemberItemProps) {
  return (
    <div 
      className={cn(
        'flex items-center justify-between p-3 rounded-md border bg-card hover:bg-muted/50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <GroupMemberAvatar
          name={name}
          avatarUrl={avatarUrl}
        />
        
        <div>
          <div className="flex items-center">
            <p className="font-medium">
              {name}
              {isCurrentUser && <span className="ml-1.5 text-xs text-muted-foreground">(You)</span>}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{email}</p>
          
          <div className="flex items-center mt-1 space-x-2">
            <GroupMemberRoleBadge role={role} />
            <GroupMemberStatusBadge status={status} />
            
            {joinedAt && (
              <span className="text-xs text-muted-foreground">
                Joined {formatTimeAgo(joinedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {actions && (
        <div className="ml-2">
          {actions}
        </div>
      )}
    </div>
  );
} 