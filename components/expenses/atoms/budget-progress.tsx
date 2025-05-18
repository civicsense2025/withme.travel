/**
 * Budget Progress (Atom)
 *
 * A visual progress indicator for budget status showing percentage spent.
 * Used within budget cards and summary components.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface BudgetProgressProps {
  /** Percentage of budget spent (0-100) */
  percent: number;
  /** Custom CSS classes to apply */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the percentage text inside the progress bar */
  showText?: boolean;
  /** Color variant based on percentage */
  variant?: 'default' | 'warning' | 'danger' | 'success';
}

export function BudgetProgress({
  percent,
  className,
  size = 'md',
  showText = false,
  variant = 'default',
}: BudgetProgressProps) {
  // Ensure percent is between 0-100
  const safePercent = Math.max(0, Math.min(100, percent));
  
  // Determine variant based on percentage if not explicitly set
  const computedVariant = variant === 'default'
    ? safePercent < 70 ? 'success' : safePercent < 90 ? 'warning' : 'danger'
    : variant;
  
  // Size-specific styles
  const sizeStyles = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  // Variant-specific styles
  const variantStyles = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    default: 'bg-blue-500',
  };

  return (
    <div 
      className={cn(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        sizeStyles[size],
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300 ease-in-out',
          variantStyles[computedVariant]
        )}
        style={{ width: `${safePercent}%` }}
      >
        {showText && size !== 'sm' && (
          <span 
            className={cn(
              'flex h-full items-center justify-center text-white text-xs font-semibold',
              size === 'lg' && 'text-sm'
            )}
          >
            {safePercent}%
          </span>
        )}
      </div>
    </div>
  );
} 