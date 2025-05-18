/**
 * Checkbox (Atom)
 *
 * A themeable, accessible checkbox component.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Checkbox({ checked, onChange, className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={cn('rounded border border-input accent-primary', className)}
      {...props}
    />
  );
}
