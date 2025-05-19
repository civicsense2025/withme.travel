/**
 * Checkbox (Atom)
 *
 * A themeable, accessible custom checkbox component with label,
 * indeterminate state, and proper focus handling.
 *
 * @module ui/atoms
 */
import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Controlled checked state */
  checked?: boolean;
  /** Callback when checked state changes */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Alternative callback for checked changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Label for the checkbox */
  label?: React.ReactNode;
  /** Description text displayed below the label */
  description?: React.ReactNode;
  /** Error message displayed below the checkbox */
  error?: string;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to display label text after the checkbox */
  labelPosition?: 'right' | 'left';
  /** Unique component ID (auto-generated if not provided) */
  id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    checked,
    onChange,
    onCheckedChange,
    label,
    description,
    error,
    indeterminate = false,
    size = 'md',
    labelPosition = 'right',
    disabled = false,
    className,
    id: propId,
    ...props
  }, ref) => {
    const generatedId = useId();
    const id = propId || `checkbox-${generatedId}`;
    
    // Handle checkbox input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };
    
    // Handle internal ref
    const internalRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(internalRef, ref);
    
    // Set indeterminate state (not possible via HTML attribute)
    React.useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    
    // Size classes
    const sizeClasses = {
      sm: {
        container: 'h-3.5 w-3.5',
        input: 'h-3.5 w-3.5',
        checkIcon: 'h-2.5 w-2.5',
        text: 'text-sm',
      },
      md: {
        container: 'h-4 w-4',
        input: 'h-4 w-4',
        checkIcon: 'h-3 w-3',
        text: 'text-sm',
      },
      lg: {
        container: 'h-5 w-5',
        input: 'h-5 w-5',
        checkIcon: 'h-4 w-4',
        text: 'text-base',
      },
    };
    
    const checkboxContent = (
      <div className={cn('flex items-center', className)}>
        <div className="relative flex items-center">
          {/* Hidden native checkbox (for accessibility) */}
          <input
            type="checkbox"
            id={id}
            ref={combinedRef}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              "sr-only", // visually hidden but accessible
              sizeClasses[size].input
            )}
            aria-invalid={!!error}
            aria-checked={indeterminate ? 'mixed' : checked}
            {...props}
          />
          
          {/* Custom checkbox visual */}
          <div
            className={cn(
              'border flex items-center justify-center rounded transition-colors',
              sizeClasses[size].container,
              checked
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background',
              indeterminate && 'border-primary bg-primary text-primary-foreground',
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && checked && 'hover:bg-primary/90',
              !disabled && !checked && 'hover:border-primary/50',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2'
            )}
            aria-hidden="true"
          >
            {checked && !indeterminate && (
              <Check className={cn('stroke-current', sizeClasses[size].checkIcon)} />
            )}
            {indeterminate && (
              <Minus className={cn('stroke-current', sizeClasses[size].checkIcon)} />
            )}
          </div>
        </div>
        
        {label && (
          <label
            htmlFor={id}
            className={cn(
              sizeClasses[size].text,
              'ml-2',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'text-destructive'
            )}
          >
            <div>{label}</div>
            {description && (
              <div className="text-muted-foreground text-xs mt-0.5">{description}</div>
            )}
          </label>
        )}
      </div>
    );
    
    // Render label on left if specified
    if (labelPosition === 'left' && label) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor={id}
              className={cn(
                sizeClasses[size].text,
                disabled && 'opacity-50 cursor-not-allowed',
                error && 'text-destructive'
              )}
            >
              {label}
            </label>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id={id}
                ref={combinedRef}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                className={cn(
                  "sr-only", // visually hidden but accessible
                  sizeClasses[size].input
                )}
                aria-invalid={!!error}
                aria-checked={indeterminate ? 'mixed' : checked}
                {...props}
              />
              
              <div
                className={cn(
                  'border flex items-center justify-center rounded transition-colors',
                  sizeClasses[size].container,
                  checked
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background',
                  indeterminate && 'border-primary bg-primary text-primary-foreground',
                  disabled && 'opacity-50 cursor-not-allowed',
                  !disabled && checked && 'hover:bg-primary/90',
                  !disabled && !checked && 'hover:border-primary/50',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2'
                )}
                aria-hidden="true"
              >
                {checked && !indeterminate && (
                  <Check className={cn('stroke-current', sizeClasses[size].checkIcon)} />
                )}
                {indeterminate && (
                  <Minus className={cn('stroke-current', sizeClasses[size].checkIcon)} />
                )}
              </div>
            </div>
          </div>
          
          {description && (
            <div className="text-muted-foreground text-xs">{description}</div>
          )}
          
          {error && (
            <div className="text-destructive text-xs mt-1">{error}</div>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-1">
        {checkboxContent}
        {error && labelPosition === 'right' && (
          <div className="text-destructive text-xs mt-1 ml-6">{error}</div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// Helper to combine refs
function useCombinedRefs<T>(
  ...refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | null | undefined>
): React.RefCallback<T> {
  return React.useCallback((element: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<T | null>).current = element;
      }
    });
  }, [refs]);
}