/**
 * Label (Atom)
 *
 * A themeable, accessible label component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** The id of the input this label is for */
  htmlFor?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';
