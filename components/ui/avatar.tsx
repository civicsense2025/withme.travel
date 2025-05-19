'use client';

/**
 * Avatar (Molecule)
 * 
 * A composable avatar component with image, fallback, and status indicator options.
 * Based on Radix UI's Avatar primitive for accessibility.
 * 
 * @module ui/molecules
 */

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

// Size type for avatar dimensions
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Status indicator types
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away' | 'none';

// Size mappings
const SIZE_MAPS: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

// Status color mappings
const STATUS_COLOR_MAPS: Record<Exclude<AvatarStatus, 'none'>, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: AvatarSize;
  status?: AvatarStatus;
  statusPosition?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

const Avatar = React.forwardRef<typeof AvatarPrimitive.Root, AvatarProps>(
  ({ 
    className, 
    size = 'md',
    status = 'none',
    statusPosition = 'bottom-right',
    ...props 
}, ref) => (
  <div className="relative inline-block">
    <AvatarPrimitive.Root
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        SIZE_MAPS[size],
        className
      )}
      {...props}
    />
    
    {status !== 'none' && (
      <span 
        className={cn(
          'absolute block rounded-full ring-2 ring-background',
          STATUS_COLOR_MAPS[status],
          {
            'h-2 w-2 xs:h-1.5 xs:w-1.5': size === 'xs' || size === 'sm',
            'h-3 w-3': size === 'md',
            'h-3.5 w-3.5': size === 'lg' || size === 'xl',
            'top-0 right-0': statusPosition === 'top-right',
            'bottom-0 right-0': statusPosition === 'bottom-right',
            'bottom-0 left-0': statusPosition === 'bottom-left',
            'top-0 left-0': statusPosition === 'top-left',
          }
        )}
      />
    )}
  </div>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

export interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void;
}

const AvatarImage = React.forwardRef<typeof AvatarPrimitive.Image, AvatarImageProps>(
  ({ className, onLoadingStatusChange, ...props }, ref) => {
  const [loadingStatus, setLoadingStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  
  React.useEffect(() => {
    onLoadingStatusChange?.(loadingStatus);
  }, [loadingStatus, onLoadingStatusChange]);
  
  return (
    <AvatarPrimitive.Image
      ref={ref as React.Ref<HTMLImageElement>}
      className={cn('aspect-square h-full w-full object-cover', className)}
      onLoadingStatusChange={(status) => {
        setLoadingStatus(status as 'loading' | 'loaded' | 'error');
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<typeof AvatarPrimitive.Fallback, AvatarFallbackProps>(
  ({ className, children, delayMs, ...props }, ref) => {
  // Generate initials if children is a string
  const content = typeof children === 'string' 
    ? children.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
    : children;
    
  return (
    <AvatarPrimitive.Fallback
      ref={ref as React.Ref<HTMLSpanElement>}
      delayMs={delayMs}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted font-medium',
        className
      )}
      {...props}
    >
      {content}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };