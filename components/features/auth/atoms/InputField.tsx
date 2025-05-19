import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input */
  label: string;
  /** Optional error message */
  error?: string;
  /** Optional helper text */
  helperText?: string;
  /** Container class name */
  containerClassName?: string;
  /** Label class name */
  labelClassName?: string;
}

export function InputField({
  label,
  error,
  helperText,
  containerClassName,
  labelClassName,
  className,
  id,
  ...props
}: InputFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Label 
        htmlFor={inputId} 
        className={cn(error ? 'text-destructive' : '', labelClassName)}
      >
        {label}
      </Label>
      <Input 
        id={inputId}
        className={cn(error ? 'border-destructive' : '', className)}
        aria-invalid={!!error}
        aria-errormessage={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-sm text-destructive font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}