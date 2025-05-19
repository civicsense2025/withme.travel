/**
 * useExpenses Hook
 *
 * Manages trip expenses state, CRUD actions, and loading/error handling.
 * Uses the standardized Result pattern and client API wrapper.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Expense } from '@/lib/api/_shared';
import {
  listTripExpenses,
  getTripExpense,
  createTripExpense,
  updateTripExpense,
  deleteTripExpense,
  getTripExpenseSummary,
} from '@/lib/client/expenses';
import type { Result } from '@/lib/client/result';

/**
 * Hook return type for useExpenses
 */
export interface UseExpensesResult {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  summary: any | null;
  refresh: () => Promise<void>;
  addExpense: (data: Partial<Expense>) => Promise<Result<Expense>>;
  editExpense: (expenseId: string, data: Partial<Expense>) => Promise<Result<Expense>>;
  removeExpense: (expenseId: string) => Promise<Result<null>>;
  fetchSummary: () => Promise<void>;
}

/**
 * useExpenses - React hook for managing trip expenses
 */
export function useExpenses(tripId: string): UseExpensesResult {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any | null>(null);

  // Fetch all expenses for the trip
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await listTripExpenses(tripId);
    if (result.success) {
      setExpenses(result.data);
    } else {
      setError(result.error);
      toast({
        description: `Failed to load expenses: ${result.error}`,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [tripId, toast]);

  // Add a new expense
  const addExpense = useCallback(
    async (data: Partial<Expense>) => {
      setIsLoading(true);
      const result = await createTripExpense(tripId, data);
      if (result.success) {
        setExpenses((prev) => [result.data, ...prev]);
        toast({ description: 'Expense added successfully' });
      } else {
        setError(result.error);
        toast({
          description: `Failed to add expense: ${result.error}`,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Edit an existing expense
  const editExpense = useCallback(
    async (expenseId: string, data: Partial<Expense>) => {
      setIsLoading(true);
      const result = await updateTripExpense(tripId, expenseId, data);
      if (result.success) {
        setExpenses((prev) => prev.map((exp) => (exp.id === expenseId ? result.data : exp)));
        toast({ description: 'Expense updated successfully' });
      } else {
        setError(result.error);
        toast({
          description: `Failed to update expense: ${result.error}`,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Remove an expense
  const removeExpense = useCallback(
    async (expenseId: string) => {
      setIsLoading(true);
      const result = await deleteTripExpense(tripId, expenseId);
      if (result.success) {
        setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
        toast({ description: 'Expense deleted successfully' });
      } else {
        setError(result.error);
        toast({
          description: `Failed to delete expense: ${result.error}`,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getTripExpenseSummary(tripId);
    if (result.success) {
      setSummary(result.data);
    } else {
      setError(result.error);
      toast({
        description: `Failed to load expense summary: ${result.error}`,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [tripId, toast]);

  // Initial load
  useEffect(() => {
    if (tripId) {
      refresh();
      fetchSummary();
    }
  }, [tripId, refresh, fetchSummary]);

  return {
    expenses,
    isLoading,
    error,
    summary,
    refresh,
    addExpense,
    editExpense,
    removeExpense,
    fetchSummary,
  };
} 