/**
 * Calendar (Atom)
 *
 * A themeable, accessible calendar component (stub).
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface CalendarProps {
  /** Selected date */
  value?: Date;
  /** Alternative prop name for selected date */
  selected?: Date;
  /** Callback when date changes */
  onChange?: (date: Date) => void;
  /** Alternative callback name */
  onSelect?: (date: Date) => void;
  /** Calendar mode: single, multiple, or range */
  mode?: 'single' | 'multiple' | 'range';
  /** Additional CSS classes */
  className?: string;
}

export function Calendar({ 
  value, 
  selected, 
  onChange, 
  onSelect, 
  mode = 'single', 
  className 
}: CalendarProps) {
  // Use value or selected prop (value takes precedence)
  const selectedDate = value || selected;
  
  // Use onChange or onSelect callback (onChange takes precedence)
  const handleDateChange = (date: Date) => {
    if (onChange) onChange(date);
    else if (onSelect) onSelect(date);
  };
  
  // Stub: Replace with a real calendar implementation
  return (
    <div className={cn('rounded border bg-background p-4 text-center', className)}>
      <span>Calendar component (coming soon)</span>
      <p className="text-xs text-muted-foreground mt-2">Mode: {mode}</p>
      {selectedDate && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedDate.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
