'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Array of avatar data (alternative to using children)
   */
  items?: {
    src?: string;
    fallback: string;
    alt?: string;
  }[];
  /**
   * Maximum number of visible avatars
   * @default 3
   */
  max?: number;
  /**
   * Whether to show count of additional avatars
   * @default true
   */
  showCount?: boolean;
  /**
   * Avatar size (className passed to each Avatar)
   */
  avatarSize?: string;
  /**
   * Children components (typically Avatar components)
   */
  children?: React.ReactNode;
}

/**
 * AvatarGroup component for displaying multiple avatars with overlap
 *
 * Can be used in two ways:
 * 1. With items prop: <AvatarGroup items={[...]} />
 * 2. With children: <AvatarGroup>{avatars}</AvatarGroup>
 */
export function AvatarGroup({
  items,
  children,
  max = 3,
  showCount = true,
  avatarSize = 'h-8 w-8',
  className,
  ...props
}: AvatarGroupProps) {
  // If children are provided, render those with max limit
  if (children) {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const extraCount = Math.max(0, childrenArray.length - max);

    return (
      <div className={cn('flex items-center -space-x-2', className)} {...props}>
        {visibleChildren.map((child, i) => (
          <div key={i} className="relative">
            {child}
          </div>
        ))}

        {showCount && extraCount > 0 && (
          <Avatar className={cn(avatarSize, 'border-2 border-background bg-muted')}>
            <AvatarFallback>+{extraCount}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  // Otherwise use items prop approach
  const itemsToRender = items || [];
  const visibleItems = itemsToRender.slice(0, max);
  const extraCount = Math.max(0, itemsToRender.length - max);

  return (
    <div className={cn('flex items-center -space-x-2', className)} {...props}>
      {visibleItems.map((item, i) => (
        <Avatar
          key={i}
          className={cn(
            avatarSize,
            'border-2 border-background',
            // Add a subtle hover effect
            'hover:translate-y-[-2px] transition-transform duration-200'
          )}
        >
          {item.src && <AvatarImage src={item.src} alt={item.alt || ''} />}
          <AvatarFallback>{item.fallback}</AvatarFallback>
        </Avatar>
      ))}

      {showCount && extraCount > 0 && (
        <Avatar className={cn(avatarSize, 'border-2 border-background bg-muted')}>
          <AvatarFallback>+{extraCount}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}