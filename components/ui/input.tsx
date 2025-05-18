/**
 * Input (Atom)
 *
 * A themeable, accessible input component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'block w-full rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary',
        {
          'h-8 px-2 text-sm': size === 'sm',
          'h-10 px-3 text-base': size === 'md',
          'h-12 px-4 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
