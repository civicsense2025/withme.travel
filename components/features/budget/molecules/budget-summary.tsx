/**
 * BudgetSummary Component (Molecule)
 * 
 * Displays a summary of budget information including total spent, 
 * remaining budget, and a breakdown by category.
 *
 * @module budget/molecules
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { BudgetProgress } from '../atoms/budget-progress';
import { ExpenseAmount } from '../atoms/expense-amount';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ============================================================================
// TYPES
// ============================================================================

export interface CategoryTotal {
  category: string;
  amount: number;
  color: string;
}

export interface BudgetSummaryProps {
  /** Current total spending */
  totalSpent: number;
  /** Total budget amount */
  totalBudget: number;
  /** Breakdown of spending by category */
  categoryTotals: CategoryTotal[];
  /** Optional custom class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BudgetSummary({
  totalSpent,
  totalBudget,
  categoryTotals,
  className,
}: BudgetSummaryProps) {
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;
  
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Budget Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget progress bar */}
        <BudgetProgress current={totalSpent} total={totalBudget} />
        
        {/* Budget amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">Total Spent</div>
            <ExpenseAmount amount={totalSpent} className="text-xl font-bold" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Remaining</div>
            <ExpenseAmount 
              amount={Math.abs(remaining)} 
              isCredit={isOverBudget}
              className={cn(
                'text-xl font-bold',
                isOverBudget ? 'text-destructive' : 'text-green-600'
              )}
            />
          </div>
        </div>
        
        {/* Category breakdown */}
        {categoryTotals.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Spending by Category</div>
            <div className="space-y-2">
              {categoryTotals.map((category) => (
                <div key={category.category} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">
                      {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                    </span>
                  </div>
                  <ExpenseAmount amount={category.amount} className="text-sm" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
