import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  className?: string;
  fallbackClassName?: string;
  size?: 'sm' | 'md' | 'lg';
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

export function UserAvatar({
  name,
  src,
  className,
  fallbackClassName,
  size = 'md',
}: UserAvatarProps) {
  const initials = getUserInitials(name);
  
  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };
  
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src || undefined} alt={name || 'User avatar'} />
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
} 