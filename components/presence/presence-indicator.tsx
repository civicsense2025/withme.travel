'use client';

import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { UserPresence, PresenceStatus } from '@/types/presence';
import { UserStatusBadge } from './user-status-badge';
import { Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PresenceIndicatorProps {
  users: UserPresence[];
  maxAvatars?: number;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  withTooltip?: boolean;
}

// A helper function to get initials from a name
const getUserInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export function PresenceIndicator({
  users,
  maxAvatars = 3,
  showStatus = true,
  size = 'md',
  withTooltip = true,
}: PresenceIndicatorProps) {
  // Filter to only show users who are online or away
  const activeUsers = useMemo(() => {
    return users.filter((user) => ['online', 'away'].includes(user.status));
  }, [users]);

  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  const statusSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  const visibleUsers = activeUsers.slice(0, maxAvatars);
  const extraUsers = activeUsers.length > maxAvatars ? activeUsers.length - maxAvatars : 0;

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div 
      className="flex items-center -space-x-1.5" 
      role="status"
      aria-label="Active users"
    >
      {visibleUsers.map((user) => {
        const userInitials = getUserInitials(user.name);
        
        const userAvatar = (
          <Avatar 
            key={user.user_id} 
            className={cn(
              sizeClasses[size],
              'border-2 border-background relative',
              user.status === 'editing' && 'ring-2 ring-blue-500'
            )}
            aria-label={`${user.name || 'Unknown user'} is ${user.status}`}
          >
            <AvatarImage src={user.avatar_url || undefined} alt="" />
            <AvatarFallback>{userInitials}</AvatarFallback>
            
            {showStatus && (
              <div className="absolute bottom-0 right-0">
                <UserStatusBadge 
                  status={user.status as PresenceStatus}
                  className={statusSizeClasses[size]}
                  aria-hidden="true"
                />
                
                {user.status === 'editing' && (
                  <span className="absolute -top-1 -right-1 rounded-full bg-blue-500 p-0.5" aria-hidden="true">
                    <Pencil className="h-2 w-2 text-white" />
                  </span>
                )}
              </div>
            )}
          </Avatar>
        );

        return withTooltip ? (
          <TooltipProvider key={user.user_id}>
            <Tooltip>
              <TooltipTrigger asChild>
                {userAvatar}
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.name || 'Unknown user'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          userAvatar
        );
      })}

      {extraUsers > 0 && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Avatar 
              className={cn(sizeClasses[size], 'border-2 border-background bg-muted hover:bg-muted/80 cursor-pointer')}
              role="button"
              aria-haspopup="true"
              aria-label={`${extraUsers} more active users`}
            >
              <AvatarFallback>+{extraUsers}</AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto">
            <div className="space-y-2">
              <p className="text-sm font-medium">Additional users</p>
              <ul className="space-y-1">
                {activeUsers.slice(maxAvatars).map((user) => (
                  <li 
                    key={user.user_id} 
                    className="flex items-center gap-2"
                    role="listitem"
                  >
                    <UserStatusBadge 
                      status={user.status as PresenceStatus} 
                      className="h-2 w-2"
                      aria-hidden="true"
                    />
                    <span className="text-sm">{user.name || 'Unknown user'}</span>
                    {user.status === 'editing' && (
                      <Pencil className="h-3 w-3 text-blue-500 ml-auto" aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
}
