import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input */
  label: string;
  /** Optional error message */
  error?: string | null;
  /** Optional helper text */
  helperText?: string;
  /** Container class name */
  containerClassName?: string;
  /** Label class name */
  labelClassName?: string;
}

/**
 * InputField - A reusable form input field with label and error handling
 * 
 * @param props - Component props
 * @returns The input field component
 */
export function InputField({
  label,
  error = null,
  helperText,
  containerClassName,
  labelClassName,
  className,
  id,
  required,
  ...props
}: InputFieldProps) {
  // Generate a consistent ID from the label if not provided
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Determine aria attributes based on error state
  const ariaAttributes = error 
    ? { 
        'aria-invalid': true,
        'aria-errormessage': `${inputId}-error`
      } 
    : { 'aria-invalid': false };
  
  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Label 
        htmlFor={inputId} 
        className={cn(
          error ? 'text-destructive' : '', 
          labelClassName
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input 
        id={inputId}
        className={cn(
          error ? 'border-destructive focus:ring-destructive' : '', 
          className
        )}
        required={required}
        {...ariaAttributes}
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