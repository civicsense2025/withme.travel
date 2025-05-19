/**
 * Badge (Atom)
 *
 * A themeable, accessible badge component with multiple variants,
 * sizes, and optional dot indicator.
 *
 * @module ui/atoms
 */
import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'destructive';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeColor = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge color - legacy support */
  color?: BadgeColor;
  /** Badge variant - preferred styling method */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Display dot indicator */
  withDot?: boolean;
  /** Dot color */
  dotColor?: BadgeColor;
  /** Left icon */
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    color, 
    variant = 'default', 
    size = 'md',
    withDot = false,
    dotColor = 'primary',
    icon,
    className,
    children,
    ...props 
  }, ref) => {
    // Map legacy color prop to variant if variant is not explicitly set
    const effectiveVariant = variant === 'default' && color ? 
      (color === 'default' ? 'default' : color === 'primary' ? 'primary' : color === 'secondary' ? 'secondary' : color === 'danger' ? 'destructive' : 'default') : 
      variant;
    
    // Variant classes mapping
    const variantClasses = {
      default: 'bg-muted text-foreground border border-transparent',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      outline: 'bg-background text-foreground border border-input',
      destructive: 'bg-destructive text-destructive-foreground',
      // Legacy color mapping
      success: 'bg-green-500 text-white',
      danger: 'bg-red-500 text-white',
      warning: 'bg-yellow-400 text-black',
    };
    
    // Dot color mapping
    const dotColorClasses = {
      default: 'bg-foreground',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-green-500',
      danger: 'bg-red-500',
      warning: 'bg-yellow-500',
    };
    
    // Size classes mapping
    const sizeClasses = {
      sm: 'text-xs px-1.5 py-0.5 rounded',
      md: 'text-xs px-2.5 py-0.5 rounded-full',
      lg: 'text-sm px-3 py-1 rounded-full',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium transition-colors',
          sizeClasses[size],
          variantClasses[effectiveVariant as keyof typeof variantClasses] || variantClasses.default,
          className
        )}
        {...props}
      >
        {withDot && (
          <span 
            className={cn(
              'mr-1 rounded-full',
              dotColorClasses[dotColor],
              size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
            )} 
          />
        )}
        
        {icon && (
          <span className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')}>
            {icon}
          </span>
        )}
        
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';