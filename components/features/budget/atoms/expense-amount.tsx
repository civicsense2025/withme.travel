/**
 * ExpenseAmount Component
 * 
 * Displays formatted currency amounts with proper locale formatting
 */

'use client';

import { formatCurrency } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ExpenseAmountProps {
  /** Numeric amount to display */
  amount: number;
  /** Currency code (e.g. USD, EUR) */
  currency: string;
  /** Optional className for styling */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Renders a formatted currency amount
 * 
 * @param amount - Numeric amount to display
 * @param currency - Currency code (e.g. USD, EUR)
 * @param className - Optional className for styling
 */
export function ExpenseAmount({ amount, currency, className = '' }: ExpenseAmountProps) {
  const formattedAmount = formatCurrency(amount, currency);
  
  return (
    <span className={`font-medium tabular-nums ${className}`}>
      {formattedAmount}
    </span>
  );
}
