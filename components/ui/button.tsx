/**
 * Button (Atom)
 *
 * A themeable, accessible button component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-primary',
        {
          'bg-primary text-white hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-primary hover:bg-secondary/80': variant === 'secondary',
          'border border-input bg-background hover:bg-muted': variant === 'outline',
          'bg-transparent hover:bg-muted': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
