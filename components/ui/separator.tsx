/**
 * Separator (Atom)
 *
 * A themeable, accessible separator component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the separator */
  orientation?: 'horizontal' | 'vertical';
}

export function Separator({ orientation = 'horizontal', className, ...props }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === 'vertical' ? 'w-px h-full bg-muted' : 'h-px w-full bg-muted',
        className
      )}
      {...props}
    />
  );
}
