/**
 * Badge (Atom)
 *
 * A themeable, accessible badge component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge color */
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = 'default', className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-muted text-foreground': color === 'default',
          'bg-primary text-white': color === 'primary',
          'bg-secondary text-primary': color === 'secondary',
          'bg-green-500 text-white': color === 'success',
          'bg-red-500 text-white': color === 'danger',
          'bg-yellow-400 text-black': color === 'warning',
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';
