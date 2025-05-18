/**
 * Expenses API
 *
 * Provides CRUD operations and custom actions for planned and batch expenses.
 * Used for managing trip budgets and expense tracking.
 *
 * @module lib/api/expenses
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, Expense } from './_shared';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all expenses for a trip.
 * @param tripId - The trip's unique identifier
 * @returns Result containing an array of expenses
 */
export async function listTripExpenses(tripId: string): Promise<Result<Expense[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase.from(TABLES.EXPENSES).select('*').eq('trip_id', tripId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch trip expenses');
  }
}

/**
 * Get a specific trip expense.
 * @param tripId - The trip's unique identifier
 * @param expenseId - The expense's unique identifier
 * @returns Result containing the expense details
 */
export async function getTripExpense(tripId: string, expenseId: string): Promise<Result<Expense>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', expenseId)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch expense');
  }
}

/**
 * Create a new trip expense.
 * @param tripId - The trip's unique identifier
 * @param data - The expense data
 * @returns Result containing the created expense
 */
export async function createTripExpense(
  tripId: string,
  data: Partial<Expense>
): Promise<Result<Expense>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Ensure tripId is set
    const expenseData = { ...data, trip_id: tripId };

    const { data: newExpense, error } = await supabase
      .from(TABLES.EXPENSES)
      .insert(expenseData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newExpense };
  } catch (error) {
    return handleError(error, 'Failed to create expense');
  }
}

/**
 * Update an existing trip expense.
 * @param tripId - The trip's unique identifier
 * @param expenseId - The expense's unique identifier
 * @param data - Partial expense data to update
 * @returns Result containing the updated expense
 */
export async function updateTripExpense(
  tripId: string,
  expenseId: string,
  data: Partial<Expense>
): Promise<Result<Expense>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: updatedExpense, error } = await supabase
      .from(TABLES.EXPENSES)
      .update(data)
      .eq('trip_id', tripId)
      .eq('id', expenseId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedExpense };
  } catch (error) {
    return handleError(error, 'Failed to update expense');
  }
}

/**
 * Delete a trip expense.
 * @param tripId - The trip's unique identifier
 * @param expenseId - The expense's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteTripExpense(tripId: string, expenseId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.EXPENSES)
      .delete()
      .eq('trip_id', tripId)
      .eq('id', expenseId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete expense');
  }
}

/**
 * Batch create multiple expenses for a trip.
 * @param tripId - The trip's unique identifier
 * @param expenses - Array of expense data to create
 * @returns Result containing the created expenses
 */
export async function batchCreateExpenses(
  tripId: string,
  expenses: Partial<Expense>[]
): Promise<Result<Expense[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Ensure tripId is set for all expenses
    const expensesData = expenses.map((expense) => ({
      ...expense,
      trip_id: tripId,
    }));

    const { data, error } = await supabase.from(TABLES.EXPENSES).insert(expensesData).select('*');

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to batch create expenses');
  }
}

/**
 * Calculate trip expense summary.
 * @param tripId - The trip's unique identifier
 * @returns Result containing expense summary (total, by category, etc.)
 */
export async function getTripExpenseSummary(tripId: string): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Get all expenses for the trip
    const { data, error } = await supabase.from(TABLES.EXPENSES).select('*').eq('trip_id', tripId);

    if (error) return { success: false, error: error.message };

    // Calculate summary (simple version - can be expanded)
    const expenses = data ?? [];
    const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    for (const expense of expenses) {
      const category = expense.category || 'Uncategorized';
      byCategory[category] = (byCategory[category] || 0) + (expense.amount || 0);
    }

    return {
      success: true,
      data: {
        total,
        byCategory,
        count: expenses.length,
      },
    };
  } catch (error) {
    return handleError(error, 'Failed to calculate expense summary');
  }
}

// ============================================================================
// CUSTOM ACTIONS
// ============================================================================

/**
 * Batch update multiple expenses for a trip.
 * @param tripId - The trip's unique identifier
 * @param expenses - Array of expense data to update
 * @returns Result indicating success or failure
 */
export async function batchUpdateTripExpenses(tripId: string, expenses: any[]) {}

/**
 * List all planned expenses for a trip.
 * @param tripId - The trip's unique identifier
 * @returns Result containing an array of planned expenses
 */
export async function listPlannedExpenses(tripId: string) {}
// (Add more as needed)
