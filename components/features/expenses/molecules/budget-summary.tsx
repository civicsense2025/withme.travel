/**
 * Budget Summary (Molecule)
 *
 * A summary card showing budget information with progress indicator.
 * Composed of multiple atoms including the BudgetProgress component.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { BudgetProgress } from '../atoms/budget-progress';

export interface BudgetSummaryProps {
  /** Total budget amount */
  budget: number;
  /** Amount spent so far */
  spent: number;
  /** Budget amount remaining */
  remaining?: number;
  /** Custom CSS classes */
  className?: string;
  /** Currency symbol to display */
  currency?: string;
  /** Optional title */
  title?: string;
}

export function BudgetSummary({
  budget,
  spent,
  remaining = budget - spent,
  className,
  currency = '$',
  title = 'Budget Summary',
}: BudgetSummaryProps) {
  // Calculate percentage spent
  const percentSpent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  
  // Determine if we're over budget
  const isOverBudget = spent > budget;

  // Format currency values
  const formatCurrency = (value: number) => {
    return `${currency}${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className={cn('rounded-lg border p-4 shadow-sm', className)}>
      {title && (
        <h3 className="text-lg font-medium mb-3">{title}</h3>
      )}
      
      <div className="space-y-4">
        {/* Budget/Spent Summary */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
            <p className="text-lg font-semibold">{formatCurrency(budget)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
            <p 
              className={cn(
                "text-lg font-semibold",
                isOverBudget && "text-red-600 dark:text-red-400"
              )}
            >
              {formatCurrency(spent)}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <BudgetProgress 
          percent={percentSpent} 
          size="md" 
          showText={true}
          variant={isOverBudget ? 'danger' : undefined}
        />
        
        {/* Remaining Amount */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
          <p 
            className={cn(
              "font-medium",
              isOverBudget ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
            )}
          >
            {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      </div>
    </div>
  );
} 