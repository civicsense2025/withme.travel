/**
 * Progress (Atom)
 *
 * A themeable, accessible progress bar component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value */
  value: number;
  /** Maximum value */
  max?: number;
}

export function Progress({ value, max = 100, className, ...props }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('w-full h-2 bg-muted rounded', className)} {...props}>
      <div
        className="h-2 bg-primary rounded"
        style={{ width: `${percent}%` }}
        aria-valuenow={value}
        aria-valuemax={max}
        aria-valuemin={0}
        role="progressbar"
      />
    </div>
  );
}
