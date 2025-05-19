/**
 * DatePicker (Atom)
 *
 * A themeable, accessible date picker component (stub).
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  // Stub: Replace with a real date picker implementation
  return (
    <div className={cn('rounded border bg-background p-4 text-center', className)}>
      <span>DatePicker component (coming soon)</span>
    </div>
  );
} 