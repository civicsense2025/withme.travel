/**
 * Budget Tab Template (Template)
 *
 * A template for the budget tab, using the atomic components from the expenses library.
 * Provides the layout structure but does not include API functionality.
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BudgetProgress } from '../atoms/budget-progress';
import { BudgetSummary } from '../molecules/budget-summary';
import { ExpenseList } from '../organisms/expense-list';
import { MemberExpensesGrid } from '../organisms/member-expenses-grid';
import type { Expense } from '@/lib/api/_shared';

interface BudgetTabTemplateProps {
  /** Total budget amount */
  budget: number;
  /** Amount spent so far */
  spent: number;
  /** List of expenses */
  expenses: Expense[];
  /** List of planned expenses */
  plannedExpenses?: Expense[];
  /** Whether the user can edit the budget */
  canEdit?: boolean;
  /** Function called when the user clicks the add expense button */
  onAddExpense?: () => void;
  /** Function called when the user edits an expense */
  onEditExpense?: (expense: Expense) => void;
  /** Function called when the user deletes an expense */
  onDeleteExpense?: (expense: Expense) => void;
  /** Function called when the user wants to edit the budget */
  onEditBudget?: () => void;
  /** Trip members with their expense data */
  memberExpenses?: Array<{
    memberId: string;
    name: string;
    avatar: string | null;
    paid: number;
    share: number;
    balance: number;
  }>;
  /** Member debts calculations */
  memberDebts?: Array<{
    fromMemberId: string;
    fromMemberName: string;
    toMemberId: string;
    toMemberName: string;
    amount: number;
  }>;
}

export function BudgetTabTemplate({
  budget,
  spent,
  expenses = [],
  plannedExpenses = [],
  canEdit = false,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onEditBudget,
  memberExpenses = [],
  memberDebts = [],
}: BudgetTabTemplateProps) {
  // Calculate percentages
  const percentSpent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  
  // Handle optional callbacks
  const handleEditExpense = (expense: Expense) => {
    if (onEditExpense) onEditExpense(expense);
  };
  
  const handleDeleteExpense = (expense: Expense) => {
    if (onDeleteExpense) onDeleteExpense(expense);
  };
  
  return (
    <Tabs defaultValue="expenses" className="w-full space-y-4">
      <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="members">Splits</TabsTrigger>
      </TabsList>
      
      <TabsContent value="expenses" className="space-y-4">
        {/* Budget Summary Card */}
        <div className="relative">
          <BudgetSummary
            budget={budget}
            spent={spent}
            className="w-full"
          />
          
          {canEdit && (
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute top-4 right-4"
              onClick={onEditBudget}
            >
              Edit Budget
            </Button>
          )}
        </div>
        
        {/* Expenses List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md">Expense List</CardTitle>
            {canEdit && (
              <Button onClick={onAddExpense} size="sm">
                Add Expense
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ExpenseList
              expenses={expenses}
              plannedExpenses={plannedExpenses}
              canEdit={canEdit}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              noCardWrapper
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="members" className="space-y-4">
        {/* Member expense grid */}
        <MemberExpensesGrid
          members={memberExpenses}
          debts={memberDebts}
          totalAmount={spent}
        />
      </TabsContent>
    </Tabs>
  );
} 