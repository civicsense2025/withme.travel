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
import { handleError, Result, Expense, expenseSchema } from './_shared';
import { z } from 'zod';

// Additional expense-specific schemas
const expenseSummaryResponseSchema = z.object({
  total: z.number(),
  byCategory: z.record(z.string(), z.number()),
  byPaidBy: z.record(z.string(), z.number()).optional(),
  count: z.number(),
  currency: z.string().optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
});

type ExpenseSummary = z.infer<typeof expenseSummaryResponseSchema>;

const batchExpenseSchema = z.array(expenseSchema);

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all expenses for a trip with advanced filtering and pagination.
 * @param tripId - The trip's unique identifier
 * @param options - Filtering and pagination options
 * @returns Result containing an array of expenses and total count
 */
export async function listTripExpenses(
  tripId: string,
  options: {
    limit?: number;
    page?: number;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    paidBy?: string;
    sortBy?: 'date' | 'amount' | 'category';
    sortDirection?: 'asc' | 'desc';
  } = {}
): Promise<Result<{ expenses: Expense[]; total: number }>> {
  try {
    const {
      limit = 20,
      page = 1,
      category,
      dateFrom,
      dateTo,
      paidBy,
      sortBy = 'date',
      sortDirection = 'desc'
    } = options;
    
    const offset = (page - 1) * limit;
    const supabase = await createRouteHandlerClient();
    
    // Build the query with filters
    let query = supabase
      .from(TABLES.EXPENSES)
      .select('*', { count: 'exact' })
      .eq('trip_id', tripId);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('date', dateTo);
    }
    
    if (paidBy) {
      query = query.eq('paid_by', paidBy);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;

    if (error) return { success: false, error: error.message };
    
    return { 
      success: true, 
      data: { 
        expenses: data || [], 
        total: count || 0 
      } 
    };
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
    if (!data) return { success: false, error: 'Expense not found' };
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch expense');
  }
}

/**
 * Create a new trip expense with validation.
 * @param tripId - The trip's unique identifier
 * @param data - The expense data
 * @returns Result containing the created expense
 */
export async function createTripExpense(
  tripId: string,
  data: Partial<Expense>
): Promise<Result<Expense>> {
  try {
    // Ensure tripId is set
    const expenseData = { ...data, trip_id: tripId };
    
    // Validate input data
    const validationResult = expenseSchema.safeParse(expenseData);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid expense data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    const { data: newExpense, error } = await supabase
      .from(TABLES.EXPENSES)
      .insert(validationResult.data)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newExpense };
  } catch (error) {
    return handleError(error, 'Failed to create expense');
  }
}

/**
 * Update an existing trip expense with validation.
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
    // Partial validation of update data
    const partialExpenseSchema = expenseSchema.partial();
    const validationResult = partialExpenseSchema.safeParse(data);
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid expense data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    const { data: updatedExpense, error } = await supabase
      .from(TABLES.EXPENSES)
      .update({
        ...validationResult.data,
        updated_at: new Date().toISOString()
      })
      .eq('trip_id', tripId)
      .eq('id', expenseId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    if (!updatedExpense) return { success: false, error: 'Expense not found' };
    
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
 * Batch create multiple expenses for a trip with validation.
 * @param tripId - The trip's unique identifier
 * @param expenses - Array of expense data to create
 * @returns Result containing the created expenses
 */
export async function batchCreateExpenses(
  tripId: string,
  expenses: Partial<Expense>[]
): Promise<Result<Expense[]>> {
  try {
    // Ensure tripId is set for all expenses
    const expensesData = expenses.map((expense) => ({
      ...expense,
      trip_id: tripId,
    }));
    
    // Validate all expenses
    const validationResult = batchExpenseSchema.safeParse(expensesData);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid expense data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .insert(validationResult.data)
      .select('*');

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to batch create expenses');
  }
}

/**
 * Calculate trip expense summary with advanced grouping options.
 * @param tripId - The trip's unique identifier
 * @param options - Summary calculation options
 * @returns Result containing expense summary (total, by category, etc.)
 */
export async function getTripExpenseSummary(
  tripId: string,
  options: {
    dateFrom?: string;
    dateTo?: string;
    includePaidBy?: boolean;
    currency?: string;
  } = {}
): Promise<Result<ExpenseSummary>> {
  try {
    const { dateFrom, dateTo, includePaidBy = false, currency } = options;
    const supabase = await createRouteHandlerClient();
    
    // Build the query with filters
    let query = supabase.from(TABLES.EXPENSES).select('*').eq('trip_id', tripId);
    
    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('date', dateTo);
    }
    
    if (currency) {
      query = query.eq('currency', currency);
    }
    
    // Get all expenses for the trip
    const { data, error } = await query;

    if (error) return { success: false, error: error.message };

    // Calculate summary
    const expenses = data ?? [];
    const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    for (const expense of expenses) {
      const category = expense.category || 'Uncategorized';
      byCategory[category] = (byCategory[category] || 0) + (expense.amount || 0);
    }
    
    // Group by paid_by if requested
    let byPaidBy: Record<string, number> | undefined;
    if (includePaidBy) {
      byPaidBy = {};
      for (const expense of expenses) {
        const paidBy = expense.paid_by || 'Unspecified';
        byPaidBy[paidBy] = (byPaidBy[paidBy] || 0) + (expense.amount || 0);
      }
    }
    
    // Get date range
    let dateRange;
    if (expenses.length > 0) {
      const dates = expenses.map(exp => exp.date).sort();
      dateRange = {
        start: dates[0],
        end: dates[dates.length - 1]
      };
    }
    
    const summary: ExpenseSummary = {
      total,
      byCategory,
      count: expenses.length,
      currency: currency || (expenses[0]?.currency ?? undefined),
      dateRange,
    };
    
    if (byPaidBy) {
      summary.byPaidBy = byPaidBy;
    }

    return { success: true, data: summary };
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
 * @returns Result containing the updated expenses
 */
export async function batchUpdateTripExpenses(
  tripId: string, 
  expenses: Array<{ id: string } & Partial<Expense>>
): Promise<Result<Expense[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Validate all expense IDs belong to the trip first
    const expenseIds = expenses.map(e => e.id);
    const { data: existingExpenses, error: checkError } = await supabase
      .from(TABLES.EXPENSES)
      .select('id')
      .eq('trip_id', tripId)
      .in('id', expenseIds);
      
    if (checkError) {
      return { success: false, error: checkError.message };
    }
    
    // Make sure all expenses exist and belong to trip
    if (existingExpenses.length !== expenseIds.length) {
      return { 
        success: false, 
        error: 'Some expenses do not exist or do not belong to this trip' 
      };
    }
    
    // Try to use RPC for a server-side transaction if available
    try {
      const { data, error } = await supabase.rpc('batch_update_expenses', {
        p_expenses: expenses.map(e => ({
          id: e.id,
          amount: e.amount,
          currency: e.currency,
          title: e.title,
          description: e.description,
          date: e.date,
          category: e.category,
          paid_by: e.paid_by,
          split_type: e.split_type,
          participants: e.participants,
          is_reimbursed: e.is_reimbursed
        }))
      });
      
      if (!error && data) {
        return { success: true, data };
      }
    } catch (rpcError) {
      console.warn('RPC batch update failed, falling back to individual updates:', rpcError);
    }
    
    // Fallback: Perform individual updates
    const results = await Promise.all(
      expenses.map(async (expense) => {
        const { id, ...updateData } = expense;
        const { data, error } = await supabase
          .from(TABLES.EXPENSES)
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('trip_id', tripId)
          .select('*')
          .single();
          
        if (error) throw new Error(`Failed to update expense ${id}: ${error.message}`);
        return data;
      })
    );
    
    return { success: true, data: results };
  } catch (error) {
    return handleError(error, 'Failed to batch update expenses');
  }
}

/**
 * List all planned expenses for a trip.
 * @param tripId - The trip's unique identifier
 * @returns Result containing an array of planned expenses
 */
export async function listPlannedExpenses(tripId: string): Promise<Result<Expense[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .select('*')
      .eq('trip_id', tripId)
      .is('is_planned', true);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch planned expenses');
  }
}

/**
 * Duplicate an expense
 * @param tripId - The trip's unique identifier
 * @param expenseId - The expense's unique identifier
 * @returns Result containing the duplicated expense
 */
export async function duplicateExpense(tripId: string, expenseId: string): Promise<Result<Expense>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the original expense
    const { data: original, error: fetchError } = await supabase
      .from(TABLES.EXPENSES)
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', expenseId)
      .single();
      
    if (fetchError) return { success: false, error: fetchError.message };
    if (!original) return { success: false, error: 'Expense not found' };
    
    // Create a duplicate without the id
    const { id, created_at, updated_at, ...expenseData } = original;
    
    const { data: newExpense, error: createError } = await supabase
      .from(TABLES.EXPENSES)
      .insert({
        ...expenseData,
        title: `${original.title} (Copy)`
      })
      .select('*')
      .single();
      
    if (createError) return { success: false, error: createError.message };
    return { success: true, data: newExpense };
  } catch (error) {
    return handleError(error, 'Failed to duplicate expense');
  }
}

/**
 * Split an expense among multiple users
 * @param tripId - The trip's unique identifier
 * @param expenseId - The expense's unique identifier
 * @param splits - Array of user IDs and their split amounts
 * @returns Result containing the split expenses
 */
export async function splitExpense(
  tripId: string,
  expenseId: string,
  splits: Array<{ userId: string; amount: number }>
): Promise<Result<Expense[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Validate the splits
    if (!splits.length) {
      return { success: false, error: 'No splits provided' };
    }
    
    const totalAmount = splits.reduce((sum, split) => sum + split.amount, 0);
    if (totalAmount <= 0) {
      return { success: false, error: 'Total split amount must be greater than zero' };
    }
    
    // Get the original expense
    const { data: original, error: fetchError } = await supabase
      .from(TABLES.EXPENSES)
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', expenseId)
      .single();
      
    if (fetchError) return { success: false, error: fetchError.message };
    if (!original) return { success: false, error: 'Expense not found' };
    
    // Create split expenses
    const splitExpenses = splits.map(split => ({
      trip_id: tripId,
      user_id: split.userId,
      amount: split.amount,
      currency: original.currency,
      title: `${original.title} (Split)`,
      description: original.description,
      date: original.date,
      category: original.category,
      paid_by: original.paid_by,
      split_type: 'custom',
      parent_expense_id: original.id
    }));
    
    const { data: newExpenses, error: createError } = await supabase
      .from(TABLES.EXPENSES)
      .insert(splitExpenses)
      .select('*');
      
    if (createError) return { success: false, error: createError.message };
    
    // Update the original expense to mark it as split
    await supabase
      .from(TABLES.EXPENSES)
      .update({ is_split: true })
      .eq('id', expenseId);
      
    return { success: true, data: newExpenses };
  } catch (error) {
    return handleError(error, 'Failed to split expense');
  }
}