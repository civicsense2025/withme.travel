/**
 * Slider (Atom)
 *
 * A themeable, accessible slider (range input) component (stub).
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step value */
  step?: number;
  /** Current value */
  value?: number;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS classes */
  className?: string;
}

export function Slider({ min = 0, max = 100, step = 1, value, onChange, className, ...props }: SliderProps) {
  // Stub: Replace with a real slider implementation
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className={cn('w-full accent-primary', className)}
      {...props}
    />
  );
} 