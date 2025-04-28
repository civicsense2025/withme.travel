'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PresenceStatus } from '@/types/presence';

interface UserStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * User presence status
   */
  status: PresenceStatus;
}

/**
 * A small colored badge that indicates a user's online status
 */
export function UserStatusBadge({ status, className, ...props }: UserStatusBadgeProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    editing: 'bg-blue-500 animate-pulse',
  };

  const statusDescriptions = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    editing: 'Editing',
  };

  return (
    <div 
      className={cn('rounded-full', statusColors[status], className)}
      aria-label={statusDescriptions[status]}
      role="status"
      {...props}
    />
  );
} 