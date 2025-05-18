/**
 * ExpenseAmount Component (Atom)
 *
 * Displays a formatted currency amount for expenses.
 *
 * @module budget/atoms
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ExpenseAmountProps {
  /** Amount to display */
  amount: number;
  /** Whether the amount is a credit (negative value will be displayed as positive) */
  isCredit?: boolean;
  /** Currency symbol to use (default: $) */
  currencySymbol?: string;
  /** Optional custom class names */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a number as currency
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ExpenseAmount({
  amount,
  isCredit = false,
  currencySymbol = '$',
  className,
}: ExpenseAmountProps) {
  // Format the amount to always have 2 decimal places
  const formattedAmount = Math.abs(amount).toFixed(2);

  // Determine if this is a negative value
  const isNegative = isCredit ? amount > 0 : amount < 0;

  // Determine display amount (with sign)
  const displayAmount = isNegative
    ? `-${currencySymbol}${formattedAmount}`
    : `${currencySymbol}${formattedAmount}`;

  return (
    <span
      className={cn(
        'font-medium',
        isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
        className
      )}
    >
      {displayAmount}
    </span>
  );
}
