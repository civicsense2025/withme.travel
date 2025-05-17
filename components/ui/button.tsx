'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';
import { cva, VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

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
  /** Render as child (for custom elements like Link) */
  asChild?: boolean;
}

/**
 * Button component with multiple variants and sizes, respecting color themes.
 * Now supports loading and improved hover states.
 * Supports asChild pattern for custom elements.
 *
 * @example
 * <Button variant="primary" size="md" loading loadingText="Submitting...">
 *   Submit
 * </Button>
 *
 * <Button asChild>
 *   <Link href="/foo">Go to Foo</Link>
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
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
      asChild = false,
      ...props
    },
    ref
  ) => {
    // Create a variable for the combined className
    const buttonClassName = cn(buttonVariants({ variant, size, width }), className);

    // If using asChild, we need to handle the case where the child might be a Fragment
    if (asChild) {
      // Prepare content that will be slotted
      const content = loading ? (
        <div className="flex items-center">
          <Spinner size="sm" className="mr-2" />
          {loadingText || 'Loading...'}
        </div>
      ) : (
        <>
          {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
        </>
      );

      // Only pass props that the Slot component can accept
      return (
        <Slot 
          className={buttonClassName}
          ref={ref}
          // Omit props that can cause issues with Fragment
          {...(props as React.ComponentPropsWithoutRef<typeof Slot>)}
        >
          {content}
        </Slot>
      );
    }

    // Regular button rendering (not using asChild)
    return (
      <button
        className={buttonClassName}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-description={ariaDescription}
        ref={ref}
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
);

Button.displayName = 'Button';
