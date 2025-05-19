/**
 * Textarea (Atom)
 *
 * A themeable, accessible textarea component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the Textarea component
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Textarea size */
  size?: 'sm' | 'md' | 'lg';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'block w-full rounded border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary',
        {
          'h-20 px-2 text-sm': size === 'sm',
          'h-28 px-3 text-base': size === 'md',
          'h-36 px-4 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
