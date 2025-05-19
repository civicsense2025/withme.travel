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
  /** Badge variant */
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = 'default', variant, className, ...props }, ref) => {
    // If variant is provided, use it (for compatibility with older code)
    const variantClasses = {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      outline: 'bg-background text-foreground border border-input',
      destructive: 'bg-destructive text-destructive-foreground'
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variant ? variantClasses[variant] : {
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
    );
  }
);
Badge.displayName = 'Badge';
