'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';
import { cva, VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        accent: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90',
        outline: 'border-2 border-primary bg-transparent text-primary hover:bg-muted',
        ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-md',
        md: 'h-10 px-4 py-2 rounded-md',
        lg: 'h-12 px-6 py-3 text-lg rounded-lg',
      },
      width: {
        auto: '',
        full: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      width: 'auto',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Optional additional description for screen readers */
  ariaDescription?: string;
  /** Optional leading icon */
  leftIcon?: React.ReactNode;
  /** Optional trailing icon */
  rightIcon?: React.ReactNode;
  /** Show a loading spinner and disable the button */
  loading?: boolean;
  /** Text to show when loading (replaces children) */
  loadingText?: string;
  /** The content of the button */
  children: React.ReactNode;
}

/**
 * Button component with multiple variants and sizes, respecting color themes.
 * Now supports loading and improved hover states.
 *
 * @example
 * <Button variant="primary" size="md" loading loadingText="Submitting...">
 *   Submit
 * </Button>
 */
export function Button({
  className,
  variant,
  size,
  width,
  children,
  disabled,
  leftIcon,
  rightIcon,
  loading = false,
  loadingText,
  ariaDescription,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, width }), className)}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-description={ariaDescription}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          {loadingText || 'Loading...'}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
