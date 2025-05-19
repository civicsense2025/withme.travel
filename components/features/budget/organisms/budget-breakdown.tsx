/**
 * BudgetBreakdown Component (Organism)
 * 
 * Displays a visual breakdown of expenses by category and over time.
 *
 * @module budget/organisms
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetSummary, CategoryTotal } from '../molecules/budget-summary';
import { ExpenseCategory } from '../atoms/expense-category-badge';

// ============================================================================
// TYPES
// ============================================================================

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface BudgetBreakdownProps {
  /** List of expenses to analyze */
  expenses: Expense[];
  /** Total budget amount */
  totalBudget: number;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error message, if any */
  error?: string | null;
  /** Optional custom class names */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  // Define category colors
  const categoryColors: Record<string, string> = {
    food: '#f97316',          // orange-500
    transportation: '#3b82f6', // blue-500
    accommodation: '#22c55e', // green-500
    activities: '#a855f7',    // purple-500
    shopping: '#ec4899',      // pink-500
    other: '#6b7280',         // gray-500
  };
  
  // Group expenses by category
  const categoryMap = expenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Convert to array and sort by amount (descending)
  return Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category] || categoryColors.other,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function getMonthlyData(expenses: Expense[]) {
  if (!expenses.length) {
    return { labels: [], monthlyData: [] };
  }
  
  // Sort expenses by date
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Get date range (first to last expense)
  const firstDate = parseISO(sortedExpenses[0].date);
  const lastDate = parseISO(sortedExpenses[sortedExpenses.length - 1].date);
  
  // Generate all months in the range
  const months = eachMonthOfInterval({
    start: startOfMonth(firstDate),
    end: endOfMonth(lastDate),
  });
  
  // Group expenses by month and category
  const monthlyData: Record<string, Record<string, number>> = {};
  
  // Initialize all months with zero values for all categories
  months.forEach(month => {
    const monthKey = format(month, 'yyyy-MM');
    monthlyData[monthKey] = {
      food: 0,
      transportation: 0,
      accommodation: 0,
      activities: 0,
      shopping: 0,
      other: 0,
    };
  });
  
  // Add expense amounts to the appropriate month and category
  expenses.forEach(expense => {
    const date = parseISO(expense.date);
    const monthKey = format(date, 'yyyy-MM');
    const category = expense.category || 'other';
    
    if (monthlyData[monthKey]) {
      monthlyData[monthKey][category] += expense.amount;
    }
  });
  
  return {
    // Format month labels (e.g., "Jan 2023")
    labels: months.map(month => format(month, 'MMM yyyy')),
    // Convert to chart data format
    monthlyData: Object.values(monthlyData),
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BudgetBreakdown({
  expenses,
  totalBudget,
  isLoading = false,
  error = null,
  className,
}: BudgetBreakdownProps) {
  // Calculate total spent and remaining budget
  const totalSpent = useMemo(() => 
    expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses]
  );
  
  // Get category totals for breakdown
  const categoryTotals = useMemo(() => 
    getCategoryTotals(expenses),
    [expenses]
  );
  
  // Get monthly data for charts
  const { labels, monthlyData } = useMemo(() => 
    getMonthlyData(expenses),
    [expenses]
  );
  
  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="text-lg">Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Loading budget data...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="text-lg">Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-destructive">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (!expenses.length) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="text-lg">Budget Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No expenses yet to analyze
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg">Budget Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Budget summary with category breakdown */}
        <BudgetSummary
          totalSpent={totalSpent}
          totalBudget={totalBudget}
          categoryTotals={categoryTotals}
        />
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Avg. per Day"
            value={`$${(totalSpent / Math.max(expenses.length, 1)).toFixed(2)}`}
            description="Average daily expense"
          />
          <StatCard
            title="Most Expensive"
            value={`$${Math.max(...expenses.map(e => e.amount)).toFixed(2)}`}
            description="Highest single expense"
          />
          <StatCard
            title="Top Category"
            value={categoryTotals.length > 0 ? categoryTotals[0].category : 'N/A'}
            description={categoryTotals.length > 0 ? `$${categoryTotals[0].amount.toFixed(2)}` : ''}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{description}</div>
    </div>
  );
}
