/**
 * Input (Atom)
 *
 * A themeable, accessible input component with variants, prefixes/suffixes,
 * and validation states.
 *
 * @module ui/atoms
 */
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'outline' | 'underlined';
export type InputState = 'default' | 'error' | 'success' | 'warning';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input size */
  size?: InputSize;
  /** Input variant */
  variant?: InputVariant;
  /** Validation state */
  state?: InputState;
  /** Content before the input */
  prefix?: React.ReactNode;
  /** Content after the input */
  suffix?: React.ReactNode;
  /** Whether the input takes the full width of its container */
  fullWidth?: boolean;
  /** Validation error message */
  error?: string;
  /** Help text */
  helperText?: string;
  /** Whether to show an asterisk to indicate required field */
  required?: boolean;
  /** Class name for the container element */
  containerClassName?: string;
  /** Whether the input should have a larger hitbox for touch devices */
  touchFriendly?: boolean;
  /** Whether the input should appear disabled visually only */
  visuallyDisabled?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    size = 'md',
    variant = 'default',
    state = 'default',
    prefix,
    suffix,
    fullWidth = false,
    error,
    helperText,
    required,
    containerClassName,
    touchFriendly = false,
    visuallyDisabled = false,
    className,
    disabled,
    ...props
  }, ref) => {
    // Determine if showing error state
    const isError = state === 'error' || !!error;
    const isSuccess = state === 'success';
    const isWarning = state === 'warning';
    const isDisabled = disabled || visuallyDisabled;
    
    // Size classes mapping
    const sizeClasses = {
      sm: 'h-8 px-2 text-xs',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    };
    
    // Variant classes mapping
    const variantClasses = {
      default: 'border border-input bg-background',
      filled: 'border-none bg-muted',
      outline: 'border border-input bg-transparent',
      underlined: 'border-b border-t-0 border-l-0 border-r-0 rounded-none border-input bg-transparent',
    };
    
    // State classes mapping
    const stateClasses = {
      default: 'focus:border-primary focus:ring-primary',
      error: 'border-destructive focus:border-destructive focus:ring-destructive text-destructive',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      warning: 'border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500',
    };
    
    return (
      <div className={cn(
        'flex flex-col gap-1',
        fullWidth && 'w-full',
        containerClassName
      )}>
        <div
          className={cn(
            'relative flex items-center rounded',
            variantClasses[variant],
            isError && 'border-destructive',
            isSuccess && 'border-green-500',
            isWarning && 'border-yellow-500',
            isDisabled && 'opacity-60 cursor-not-allowed',
            fullWidth && 'w-full',
            touchFriendly && 'py-2',
          )}
        >
          {prefix && (
            <div className={cn(
              'flex items-center',
              sizeClasses[size].split(' ')[0], // Height only
              'pl-3 text-muted-foreground',
              isDisabled && 'opacity-60'
            )}>
              {prefix}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'flex-1 rounded bg-transparent',
              // Conditionally adjust padding when prefix/suffix is present
              !prefix && sizeClasses[size],
              !suffix && sizeClasses[size],
              prefix && 'pl-1',
              suffix && 'pr-1',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              stateClasses[isError ? 'error' : isSuccess ? 'success' : isWarning ? 'warning' : 'default'],
              isDisabled && 'cursor-not-allowed',
              className
            )}
            disabled={disabled}
            aria-invalid={isError ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            {...props}
          />
          
          {suffix && (
            <div className={cn(
              'flex items-center',
              sizeClasses[size].split(' ')[0], // Height only
              'pr-3 text-muted-foreground',
              isDisabled && 'opacity-60'
            )}>
              {suffix}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ============================================================================
// PASSWORD INPUT COMPONENT
// ============================================================================

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Initial visibility state of password */
  initialVisibility?: boolean;
  /** Custom show/hide password toggle icon */
  toggleIcon?: (isVisible: boolean) => React.ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({
    initialVisibility = false,
    toggleIcon,
    ...props
  }, ref) => {
    const [visible, setVisible] = React.useState(initialVisibility);
    
    // Default toggle icons
    const defaultToggleIcon = (isVisible: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isVisible ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        )}
      </svg>
    );
    
    // Toggle password visibility
    const toggleVisibility = () => {
      setVisible(!visible);
    };
    
    // Suffix with toggle button
    const toggleButton = (
      <button
        type="button"
        onClick={toggleVisibility}
        className="focus:outline-none"
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {toggleIcon ? toggleIcon(visible) : defaultToggleIcon(visible)}
      </button>
    );
    
    return (
      <Input
        {...props}
        ref={ref}
        type={visible ? 'text' : 'password'}
        suffix={toggleButton}
      />
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

// ============================================================================
// SEARCH INPUT COMPONENT
// ============================================================================

export interface SearchInputProps extends Omit<InputProps, 'type'> {
  /** Called when the clear button is clicked */
  onClear?: () => void;
  /** Custom search icon */
  searchIcon?: React.ReactNode;
  /** Custom clear icon */
  clearIcon?: React.ReactNode;
  /** Whether to show the clear button */
  showClear?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    onClear,
    searchIcon,
    clearIcon,
    showClear = true,
    value,
    onChange,
    ...props
  }, ref) => {
    // Default search icon
    const defaultSearchIcon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    );
    
    // Default clear icon
    const defaultClearIcon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
    
    // Internal state for uncontrolled component
    const [internalValue, setInternalValue] = React.useState('');
    
    // Determine if controlled or uncontrolled
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    
    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };
    
    // Handle clear
    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('');
      }
      onClear?.();
    };
    
    return (
      <Input
        {...props}
        ref={ref}
        type="search"
        value={currentValue}
        onChange={handleChange}
        prefix={searchIcon || defaultSearchIcon}
        suffix={
          showClear && currentValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="focus:outline-none"
              tabIndex={-1}
              aria-label="Clear search"
            >
              {clearIcon || defaultClearIcon}
            </button>
          ) : null
        }
      />
    );
  }
);
SearchInput.displayName = 'SearchInput';