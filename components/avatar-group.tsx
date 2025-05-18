'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface User {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ users, max = 4, size = 'md', className }: AvatarGroupProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const visibleUsers = users.slice(0, max);
  const remainingUsers = users.length > max ? users.length - max : 0;

  const getInitials = (user: User): string => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const getColor = (userId: string): string => {
    // Generate a consistent color based on the user ID
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    
    const hashCode = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hashCode) % colors.length];
  };

  return (
    <div className={cn('flex -space-x-2', className)}>
      <TooltipProvider>
        {visibleUsers.map((user, index) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className={cn('ring-2 ring-background rounded-full', sizeClasses[size])}>
                <Avatar className={cn('h-full w-full border-2 border-background', sizeClasses[size])}>
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name || user.email || 'User'} />
                  ) : (
                    <AvatarFallback className={getColor(user.id)}>
                      {getInitials(user)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.name || user.email || 'Unknown user'}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingUsers > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  'ring-2 ring-background rounded-full bg-muted flex items-center justify-center', 
                  sizeClasses[size]
                )}
              >
                <span className="text-muted-foreground font-medium">+{remainingUsers}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingUsers} more {remainingUsers === 1 ? 'user' : 'users'}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
} 