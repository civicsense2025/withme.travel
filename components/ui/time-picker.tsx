'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TimePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  className?: string;
  onChange?: (time: string) => void;
}

export function TimePicker({ label, error, className, onChange, ...props }: TimePickerProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    if (onChange) {
      onChange(time);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label htmlFor={props.id || 'time-picker'}>{label}</Label>}
      <Input
        type="time"
        id={props.id || 'time-picker'}
        onChange={handleChange}
        className={cn(error ? 'border-red-500' : '', className)}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
