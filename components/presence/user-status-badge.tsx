'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PresenceStatus } from '@/types/presence';

interface UserStatusBadgeProps {
  status: PresenceStatus;
  className?: string;
  'aria-hidden'?: boolean;
}

/**
 * A visual indicator showing a user's presence status
 * It renders a colored dot that represents different statuses:
 * - green for online
 * - amber/yellow for away
 * - gray for offline 
 * - blue for editing
 */
export function UserStatusBadge({
  status,
  className,
  'aria-hidden': ariaHidden = false,
  ...props
}: UserStatusBadgeProps & React.HTMLAttributes<HTMLSpanElement>) {
  // Status colors mapping
  const statusColors: Record<PresenceStatus, string> = {
    online: 'bg-green-500',
    away: 'bg-amber-500',
    offline: 'bg-gray-400',
    editing: 'bg-blue-500',
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full ring-1 ring-background",
        statusColors[status],
        className
      )}
      aria-hidden={ariaHidden}
      {...props}
    />
  );
} 