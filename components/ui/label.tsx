/**
 * Label (Atom)
 *
 * A themeable, accessible label component with variants and optional
 * required indicator.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export type LabelSize = 'sm' | 'md' | 'lg';
export type LabelVariant = 'default' | 'muted' | 'colored';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** The id of the input this label is for */
  htmlFor?: string;
  /** Label size */
  size?: LabelSize;
  /** Label visual style */
  variant?: LabelVariant;
  /** Whether to display a required indicator */
  required?: boolean;
  /** Text for the required indicator */
  requiredIndicator?: React.ReactNode;
  /** Optional label description text */
  description?: React.ReactNode;
  /** Whether label is disabled */
  disabled?: boolean;
  /** Whether to include spacing below the label */
  withMargin?: boolean;
  /** Optional icon */
  icon?: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({
    className,
    size = 'md',
    variant = 'default',
    required = false,
    requiredIndicator = '*',
    description,
    disabled = false,
    withMargin = true,
    icon,
    children,
    ...props
  }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };
    
    // Variant classes
    const variantClasses = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      colored: 'text-primary',
    };
    
    return (
      <div
        className={cn(
          'flex flex-col',
          withMargin && 'mb-1.5',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
      >
        <label
          ref={ref}
          className={cn(
            'flex items-center font-medium leading-none',
            sizeClasses[size],
            variantClasses[variant],
          )}
          {...props}
        >
          {icon && (
            <span className="mr-1.5 flex items-center">{icon}</span>
          )}
          {children}
          {required && (
            <span className="ml-1 text-destructive">{requiredIndicator}</span>
          )}
        </label>
        
        {description && (
          <span className="mt-1 text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </div>
    );
  }
);
Label.displayName = 'Label';

// ============================================================================
// FIELD LABEL COMPONENT
// ============================================================================

export interface FieldLabelProps extends Omit<LabelProps, 'htmlFor'> {
  /** Input ID */
  inputId: string;
  /** Input help text */
  helpText?: React.ReactNode;
  /** Input error message */
  error?: string;
}

export const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({
    inputId,
    children,
    helpText,
    error,
    ...props
  }, ref) => {
    return (
      <div className="space-y-1">
        <Label ref={ref} htmlFor={inputId} {...props}>
          {children}
        </Label>
        
        {helpText && !error && (
          <div className="text-xs text-muted-foreground">{helpText}</div>
        )}
        
        {error && (
          <div className="text-xs text-destructive">{error}</div>
        )}
      </div>
    );
  }
);
FieldLabel.displayName = 'FieldLabel';