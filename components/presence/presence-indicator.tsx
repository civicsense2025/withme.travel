'use client';

import React, { useCallback, useMemo } from 'react';
import { UserPresence, PresenceStatus } from '@/types/presence';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Edit, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserStatusBadge } from './user-status-badge';

interface PresenceIndicatorProps {
  users: UserPresence[];
  maxAvatars?: number;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  withTooltip?: boolean;
}

// Map of status to colors
const statusColors: Record<PresenceStatus, string> = {
  online: 'bg-green-500',
  away: 'bg-amber-500',
  offline: 'bg-gray-400',
  editing: 'bg-blue-500',
};

// Map of status to descriptive text
const statusText: Record<PresenceStatus, string> = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
  editing: 'Editing',
};

export function PresenceIndicator({
  users,
  maxAvatars = 3,
  showStatus = true,
  size = 'md',
  withTooltip = true,
}: PresenceIndicatorProps) {
  // Filter users to only show online or away users
  const filteredUsers = useMemo(() => users.filter(user => 
    (user.status === 'online' || user.status === 'away')
  ), [users]);
  
  // Get the users that will be shown in the avatar stack
  const visibleUsers = useMemo(() => 
    filteredUsers.slice(0, maxAvatars), 
    [filteredUsers, maxAvatars]
  );
  
  // Calculate how many users are not shown in the avatar stack
  const remainingCount = Math.max(0, filteredUsers.length - maxAvatars);
  
  // Helper to get initials from a name
  const getUserInitials = useCallback((name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);

  // Function to handle keyboard events for tooltip triggers
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // The tooltip is automatically shown on focus, so this is primarily
      // to prevent default space behavior (scrolling)
    }
  }, []);
  
  // Avatar sizes based on the size prop
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };
  
  // If no active users, return nothing
  if (filteredUsers.length === 0) {
    return null;
  }
  
  return (
    <div 
      className="flex -space-x-2" 
      role="region" 
      aria-label="Active collaborators"
    >
      {visibleUsers.map(user => {
        const avatar = (
          <div className="relative" key={user.id}>
            <Avatar 
              className={`border-2 border-background ${sizeClasses[size]}`}
              aria-label={`${user.name || 'Unknown user'} is ${user.status}`}
            >
              {user.avatar_url ? (
                <AvatarImage 
                  src={user.avatar_url} 
                  alt=""
                  onError={(e) => {
                    // Remove src on error to show fallback
                    (e.target as HTMLImageElement).src = '';
                  }} 
                />
              ) : null}
              
              <AvatarFallback>
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            
            {showStatus && (
              <UserStatusBadge 
                status={user.status} 
                className={`absolute bottom-0 right-0 ${size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'}`}
                aria-hidden="true" 
              />
            )}
          </div>
        );
        
        if (withTooltip) {
          return (
            <TooltipProvider key={user.id}>
              <Tooltip delayDuration={300}>
                <TooltipTrigger
                  asChild
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                >
                  {avatar}
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="center"
                  className="max-w-[200px] break-words text-center"
                  aria-live="polite"
                >
                  <div>
                    <p className="font-semibold">{user.name || 'Unknown user'}</p>
                    <p className="text-xs capitalize">
                      {user.status} 
                      {user.status === 'editing' && user.editing_item_id && (
                        <span className="ml-1">• Editing</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Active {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        
        return avatar;
      })}
      
      {remainingCount > 0 && (
        <div
          className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-background`}
          aria-label={`${remainingCount} more active ${remainingCount === 1 ? 'user' : 'users'}`}
          tabIndex={0}
          role="button"
          onKeyDown={handleKeyDown}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
