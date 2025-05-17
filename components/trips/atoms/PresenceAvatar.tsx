'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Props for the PresenceAvatar component
 */
export interface PresenceAvatarProps {
  /** User name */
  name: string;
  /** Avatar image URL */
  imageUrl?: string | null;
  /** Size of the avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Online status of the user */
  status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  /** Optional additional CSS classes */
  className?: string;
  /** Whether to show the status indicator */
  showStatus?: boolean;
  /** Border style */
  border?: 'none' | 'thin' | 'thick';
  /** Z-index for stacking contexts */
  zIndex?: number;
  /** Optional click handler */
  onClick?: () => void;
}

/**
 * Component for displaying user avatars with presence indicators
 */
export function PresenceAvatar({
  name,
  imageUrl,
  size = 'md',
  status = 'none',
  className,
  showStatus = true,
  border = 'thin',
  zIndex,
  onClick
}: PresenceAvatarProps) {
  // Size classes for avatar
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  // Size values for status indicator
  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  // Get the initials from the name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Status color classes
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    none: 'hidden'
  };

  // Border classes
  const borderClasses = {
    none: 'border-0',
    thin: 'border',
    thick: 'border-2'
  };

  // Background color for fallback (deterministic based on name)
  const colors = [
    'bg-blue-200 text-blue-800',
    'bg-green-200 text-green-800',
    'bg-purple-200 text-purple-800',
    'bg-yellow-200 text-yellow-800',
    'bg-pink-200 text-pink-800',
    'bg-indigo-200 text-indigo-800',
    'bg-red-200 text-red-800',
    'bg-teal-200 text-teal-800'
  ];
  
  // Simple hash function to determine color based on name
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % colors.length;
  const bgColorClass = colors[colorIndex];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        sizeClasses[size],
        borderClasses[border],
        'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        className
      )}
      style={zIndex ? { zIndex } : undefined}
      onClick={onClick}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${name}'s avatar`}
          fill
          className="object-cover"
        />
      ) : (
        <div className={cn(
          'flex items-center justify-center w-full h-full font-medium',
          bgColorClass
        )}>
          {initials}
        </div>
      )}
      
      {showStatus && status !== 'none' && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-gray-800',
          statusSizes[size],
          statusColors[status]
        )} />
      )}
    </div>
  );
} 