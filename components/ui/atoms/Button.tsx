/**
 * Button Component
 * 
 * A versatile button component that serves as a primary interactive element.
 * Follows design system principles with consistent styling and behavior.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Props for the Button component
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  /** The content to display inside the button */
  children: React.ReactNode;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Optional icon to display before the button text */
  startIcon?: React.ReactNode;
  /** Optional icon to display after the button text */
  endIcon?: React.ReactNode;
  /** Whether to display a loading indicator */
  isLoading?: boolean;
  /** Class name to be applied to the button */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Button component for user interactions
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click Me
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'button',
          `button-${variant}`,
          `button-${size}`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button; 