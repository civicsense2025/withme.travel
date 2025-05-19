/**
 * Alert (Molecule)
 *
 * A themeable, accessible alert component with icon, title, and description.
 * Supports variants, dismissal, and animations.
 *
 * @module ui/molecules
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { HTMLAttributes } from 'react';
// ============================================================================
// TYPES & VARIANTS
// ============================================================================

/**
 * Alert variants for styling
 */
export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

/**
 * Props for the Alert component
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional icon to display on the left */
  icon?: React.ReactNode;
  /** Alert title */
  title?: string;
  /** Alert description */
  description?: string;
  /** Visual style variant */
  variant?: AlertVariant;
  /** Make alert dismissible */
  dismissible?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
  /** Auto dismiss after ms (0 = disabled) */
  autoDismiss?: number;
}

// ============================================================================
// VARIANT STYLE MAP
// ============================================================================

/**
 * Maps alert variants to Tailwind class strings.
 */
const ALERT_VARIANT_STYLES: Record<AlertVariant, string> = {
  default:
    'border-primary bg-muted text-foreground',
  destructive:
    'border-destructive bg-destructive/10 text-destructive',
  success:
    'border-green-600 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200',
  warning:
    'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200',
  info:
    'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200',
};

// ============================================================================
// MAIN ALERT COMPONENT
// ============================================================================

/**
 * Alert component for displaying contextual messages.
 */
export function Alert({
  icon,
  title,
  description,
  className,
  children,
  variant = 'default',
  dismissible = false,
  onDismiss,
  autoDismiss = 0,
  ...props
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  
  React.useEffect(() => {
    if (autoDismiss && autoDismiss > 0) {
      const timer = setTimeout(() => {
        setDismissed(true);
        onDismiss?.();
      }, autoDismiss);
      
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);
  
  if (dismissed) {
    return null;
  }
  
  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };
  
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded border-l-4 p-4 animate-in fade-in slide-in-from-top-1 duration-300',
        ALERT_VARIANT_STYLES[variant],
        className
      )}
      role="alert"
      {...props}
    >
      {icon && <div className="mt-1 flex-shrink-0">{icon}</div>}
      <div className="flex-grow">
        {title && (
          <div
            className={cn(
              'font-semibold mb-1',
              variant === 'destructive'
                ? 'text-destructive'
                : variant === 'success'
                ? 'text-green-800 dark:text-green-200'
                : variant === 'warning'
                ? 'text-yellow-900 dark:text-yellow-200'
                : variant === 'info'
                ? 'text-blue-900 dark:text-blue-200'
                : undefined
            )}
          >
            {title}
          </div>
        )}
        {description && (
          <div
            className={cn(
              'text-sm mb-1',
              variant === 'destructive'
                ? 'text-destructive'
                : variant === 'success'
                ? 'text-green-700 dark:text-green-200'
                : variant === 'warning'
                ? 'text-yellow-800 dark:text-yellow-200'
                : variant === 'info'
                ? 'text-blue-800 dark:text-blue-200'
                : 'text-muted-foreground'
            )}
          >
            {description}
          </div>
        )}
        {children}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-auto -mr-1 -mt-1 p-1 rounded-md hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// ALERT TITLE & DESCRIPTION SUBCOMPONENTS
// ============================================================================

/**
 * AlertTitle subcomponent for custom title rendering.
 */
export const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('font-semibold', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

/**
 * AlertDescription subcomponent for custom description rendering.
 */
export const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';