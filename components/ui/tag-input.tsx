/**
 * TagInput (Atom)
 *
 * A themeable, accessible tag input component (stub).
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

export function TagInput({ value, onChange, className }: TagInputProps) {
  // Stub: Replace with a real tag input implementation
  return (
    <div className={cn('rounded border bg-background p-2', className)}>
      <span>TagInput component (coming soon)</span>
    </div>
  );
}
