'use client';

import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { UserPresence, ExtendedUserPresence, PresenceStatus } from '@/types/presence';
import { UserStatusBadge } from './user-status-badge';
import { Pencil } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PresenceIndicatorProps {
  users: ExtendedUserPresence[];
  maxAvatars?: number;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  withTooltip?: boolean;
  /**
   * Whether to show what item each user is editing
   * @default false
   */
  showEditingItem?: boolean;
  /**
   * Map of item IDs to display names
   * If provided and showEditingItem is true, shows what each user is editing
   */
  itemLabels?: Record<string, string>;
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
  showEditingItem = false,
  itemLabels = {},
}: PresenceIndicatorProps) {
  // Filter to only show users who are online or away
  const activeUsers = useMemo(() => {
    return users.filter((user) => ['online', 'away', 'editing'].includes(user.status));
  }, [users]);

  // Group users by what they're editing for better visualization
  const usersByEditingItem = useMemo(() => {
    const grouped: Record<string, ExtendedUserPresence[]> = {};
    if (showEditingItem) {
      activeUsers.forEach((user) => {
        if (user.status === 'editing' && user.editing_item_id) {
          const itemId = user.editing_item_id;
          if (!grouped[itemId]) {
            grouped[itemId] = [];
          }
          grouped[itemId].push(user);
        }
      });
    }
    return grouped;
  }, [activeUsers, showEditingItem]);

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
    <div className="flex items-center gap-1 flex-wrap" role="status" aria-label="Active users">
      <div className="flex items-center -space-x-1.5">
        {visibleUsers.map((user) => {
          const userInitials = getUserInitials(user.name);
          const isEditing = user.status === 'editing';
          const editingItemName =
            isEditing && user.editing_item_id && itemLabels[user.editing_item_id]
              ? itemLabels[user.editing_item_id]
              : user.editing_item_id
                ? 'an item'
                : null;

          const userAvatar = (
            <Avatar
              key={user.user_id}
              className={cn(
                sizeClasses[size],
                'border-2 border-background relative',
                isEditing && 'ring-2 ring-blue-500'
              )}
              aria-label={`${user.name ?? 'Unknown user'} is ${user.status}${isEditing && editingItemName ? ` editing ${editingItemName}` : ``}`}
            >
              <AvatarImage src={user.avatar_url ?? undefined} alt="" />
              <AvatarFallback>{userInitials}</AvatarFallback>

              {showStatus && (
                <div className="absolute bottom-0 right-0">
                  <UserStatusBadge
                    status={user.status as PresenceStatus}
                    className={statusSizeClasses[size]}
                    aria-hidden="true"
                  />

                  {isEditing && (
                    <span
                      className="absolute -top-1 -right-1 rounded-full bg-blue-500 p-0.5"
                      aria-hidden="true"
                    >
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
                <TooltipTrigger asChild>{userAvatar}</TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{user.name ?? 'Unknown user'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                  {isEditing && editingItemName && (
                    <p className="text-xs text-blue-500">Editing: {editingItemName}</p>
                  )}
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
                className={cn(
                  sizeClasses[size],
                  'border-2 border-background bg-muted hover:bg-muted/80 cursor-pointer'
                )}
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
                    <li key={user.user_id} className="flex items-center gap-2" role="listitem">
                      <UserStatusBadge
                        status={user.status as PresenceStatus}
                        className="h-2 w-2"
                        aria-hidden="true"
                      />
                      <span className="text-sm">{user.name ?? 'Unknown user'}</span>
                      {user.status === 'editing' && (
                        <>
                          <Pencil className="h-3 w-3 text-blue-500 ml-auto" aria-hidden="true" />
                          {user.editing_item_id && itemLabels[user.editing_item_id] && (
                            <span className="text-xs text-blue-500">
                              {itemLabels[user.editing_item_id]}
                            </span>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>

      {showEditingItem && Object.keys(usersByEditingItem).length > 0 && (
        <div className="inline-flex flex-wrap gap-1 ml-2 text-xs">
          {Object.entries(usersByEditingItem).map(([itemId, itemUsers]) => (
            <div
              key={itemId}
              className="inline-flex items-center bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5"
            >
              <span className="text-blue-800 dark:text-blue-300 mr-1">
                {itemLabels[itemId] || 'Item'}:
              </span>
              <div className="flex -space-x-1">
                {itemUsers.slice(0, 3).map((user) => (
                  <TooltipProvider key={user.user_id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-4 w-4 border border-blue-100 dark:border-blue-800">
                          <AvatarImage src={user.avatar_url ?? undefined} alt="" />
                          <AvatarFallback className="text-[8px]">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{user.name ?? 'Unknown user'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {itemUsers.length > 3 && (
                  <span className="text-xs text-blue-800 dark:text-blue-300 ml-1">
                    +{itemUsers.length - 3}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
