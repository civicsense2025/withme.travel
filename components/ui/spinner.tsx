/**
 * Spinner (Atom)
 *
 * A themeable, accessible loading spinner component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spinner size in px */
  size?: number;
}

export function Spinner({ size = 24, className, ...props }: SpinnerProps) {
  return (
    <div
      className={cn('inline-block animate-spin text-primary', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  );
}
