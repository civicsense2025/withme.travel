'use client';

import { API_ROUTES } from '@/utils/constants/routes';
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@hooks/use-toast'
import { formatError } from '@/utils/lib-utils';
import type { DisplayItineraryItem } from '@/types/itinerary';

// Define ManualDbExpense type
export interface ManualDbExpense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paid_by: string; // User ID
  date: string; // ISO string
  created_at: string;
  updated_at?: string | null;
  source?: string | null;
}

export interface UnifiedExpense {
  id: string | number;
  title: string | null;
  amount: number | null;
  currency: string | null;
  category: string | null;
  date: string | null;
  paidBy?: string | null; // Optional for planned items
  source: 'manual' | 'planned';
}

export interface NewExpenseFormData {
  title: string;
  amount: string;
  category: string;
  date: string;
  paidById: string;
}

interface TripBudgetProps {
  tripId: string;
  initialBudget: number | null;
  initialExpenses: ManualDbExpense[];
  allItineraryItems: DisplayItineraryItem[];
  canEdit: boolean;
}

/**
 * Hook to manage trip budget data and expenses
 */
export function useTripBudget({
  tripId,
  initialBudget,
  initialExpenses,
  allItineraryItems,
  canEdit,
}: TripBudgetProps) {
  const { toast } = useToast();

  // Budget state
  const [budget, setBudget] = useState<number | null>(initialBudget);
  const [expenses, setExpenses] = useState<ManualDbExpense[]>(initialExpenses || []);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // New expense form state
  const [newExpense, setNewExpense] = useState<NewExpenseFormData>({
    title: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paidById: '',
  });

  /**
   * Calculate planned expenses from itinerary items
   */
  const plannedExpenses = useMemo(() => {
    // Map itinerary items with costs to UnifiedExpense format
    return allItineraryItems
      .filter((item) => item.estimated_cost && item.estimated_cost > 0)
      .map((item) => ({
        id: item.id,
        title: item.title,
        amount: item.estimated_cost ?? null,
        currency: item.currency ?? null,
        category: item.category || null,
        date: item.day_number ? item.date : null,
        source: 'planned' as const,
        paidBy: null,
      }));
  }, [allItineraryItems]);

  /**
   * Calculate total planned expense amount
   */
  const totalPlannedExpenses = useMemo(() => {
    return plannedExpenses.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }, [plannedExpenses]);

  /**
   * Calculate total spent amount
   */
  const totalSpent = useMemo(() => {
    // Make sure expenses is an array and handle null/undefined values
    const manualExpenses = Array.isArray(expenses) ? expenses : [];
    const manualTotal = manualExpenses.reduce((sum, expense) => {
      // Make sure amount is a number, default to 0 if null/undefined/NaN
      const amount =
        typeof expense.amount === 'number' && !isNaN(expense.amount) ? expense.amount : 0;
      return sum + amount;
    }, 0);
    return manualTotal;
  }, [expenses]);

  /**
   * Save updated budget to API
   */
  const handleSaveBudget = useCallback(
    async (newBudget: number) => {
      if (!canEdit) return;

      setIsSavingBudget(true);
      try {
        const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ budget: newBudget }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update budget');
        }

        setBudget(newBudget);
        setIsEditingBudget(false);
        toast({
          title: 'Budget Updated',
          description: `Trip budget set to $${newBudget.toFixed(2)}`,
        });
      } catch (error: any) {
        console.error('Error updating budget:', error);
        toast({
          title: 'Failed to update budget',
          description: formatError(error),
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsSavingBudget(false);
      }
    },
    [tripId, canEdit, toast]
  );

  /**
   * Add new expense
   */
  const handleAddExpense = useCallback(async () => {
    try {
      if (!newExpense.title || !newExpense.amount || !newExpense.category || !newExpense.paidById) {
        toast({
          title: 'Missing information',
          description: 'Please fill all fields including Paid By',
          variant: 'destructive',
        });
        return;
      }

      const amountValue = Number.parseFloat(newExpense.amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid positive amount.',
          variant: 'destructive',
        });
        return;
      }

      const expensePayload = {
        title: newExpense.title,
        amount: amountValue,
        category: newExpense.category,
        date: newExpense.date,
        paid_by: newExpense.paidById,
        currency: 'USD',
        trip_id: tripId,
      };

      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId) + '/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expensePayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add expense');
      }

      const newManualExpenseEntry: ManualDbExpense = {
        id: result.expense?.id || `temp-${Date.now()}`,
        trip_id: tripId,
        title: expensePayload.title,
        amount: expensePayload.amount,
        currency: expensePayload.currency,
        category: expensePayload.category,
        paid_by: expensePayload.paid_by,
        date: expensePayload.date,
        created_at: new Date().toISOString(),
        source: 'manual',
      };

      setExpenses((prev) => [newManualExpenseEntry, ...prev]);

      toast({ title: 'Expense Added' });

      // Reset form
      setNewExpense({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paidById: '',
      });

      setIsAddExpenseOpen(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast({
        title: 'Error',
        description: formatError(error),
        variant: 'destructive',
      });
    }
  }, [newExpense, tripId, toast]);

  /**
   * Delete an expense
   */
  const handleDeleteExpense = useCallback(
    async (expenseId: string) => {
      try {
        const response = await fetch(`${API_ROUTES.TRIP_DETAILS(tripId)}/expenses/${expenseId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete expense');
        }

        setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
        toast({
          title: 'Expense Deleted',
          description: 'The expense has been removed successfully.',
        });
      } catch (error) {
        console.error('Failed to delete expense:', error);
        toast({
          title: 'Error',
          description: formatError(error),
          variant: 'destructive',
        });
      }
    },
    [tripId, toast]
  );

  // Combine manual and planned expenses for display
  const combinedExpenses = useMemo(() => {
    // Transform manual expenses to unified format
    const manualUnified: UnifiedExpense[] = (expenses || []).map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      currency: expense.currency || 'USD',
      category: expense.category,
      date: expense.date,
      paidBy: expense.paid_by,
      source: 'manual',
    }));

    // Combine and sort by date (newest first)
    return [...manualUnified, ...plannedExpenses].sort((a, b) => {
      // Handle null dates
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [expenses, plannedExpenses]);

  return {
    // State
    budget,
    expenses,
    isEditingBudget,
    isSavingBudget,
    isAddExpenseOpen,
    newExpense,
    
    // Computed values
    plannedExpenses,
    totalPlannedExpenses,
    totalSpent,
    combinedExpenses,
    
    // Remaining budget (if budget is set)
    remainingBudget: budget !== null ? budget - totalSpent : null,
    
    // Actions
    setBudget,
    setIsEditingBudget,
    setIsAddExpenseOpen,
    setNewExpense,
    handleSaveBudget,
    handleAddExpense,
    handleDeleteExpense,
  };
} 