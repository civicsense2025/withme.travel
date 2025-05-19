/**
 * ExpenseListConnected Component (Organism)
 * 
 * A connected version of the ExpenseList component that uses the useExpenses hook
 * to fetch and manage expense data
 *
 * @module budget/organisms
 */

'use client';

import React from 'react';
import { useExpenses } from '@/hooks';
import { ExpenseList } from './expense-list';
import { ExpenseCategory } from '../atoms/expense-category-badge';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface ExpenseListConnectedProps {
  /** ID of the trip */
  tripId: string;
  /** Whether user can add new expenses */
  canEdit?: boolean;
  /** Optional custom class names */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ExpenseListConnected({
  tripId,
  canEdit = false,
  className,
}: ExpenseListConnectedProps) {
  const { expenses, isLoading, error, addExpense, removeExpense } = useExpenses(tripId);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  
  // Map API expenses to ExpenseList component format
  const mappedExpenses = expenses.map((exp) => ({
    id: exp.id,
    description: exp.title || '',
    amount: exp.amount,
    category: (exp.category || 'other') as ExpenseCategory,
    date: exp.paid_at || new Date().toISOString(),
    createdBy: typeof exp.created_by === 'object' && exp.created_by !== null
      ? {
          id: typeof exp.created_by === 'string' ? exp.created_by : 'unknown',
          name: 'Unknown',
          avatarUrl: undefined,
        }
      : undefined,
  }));

  const handleDeleteExpense = async (id: string) => {
    await removeExpense(id);
  };

  return (
    <ExpenseList
      expenses={mappedExpenses}
      canAdd={canEdit}
      isLoading={isLoading}
      error={error}
      onAddExpense={() => setIsAddDialogOpen(true)}
      onExpenseClick={(id) => {
        // Show expense details or edit dialog
        console.log('Clicked expense:', id);
      }}
      className={className}
    />
  );
} 