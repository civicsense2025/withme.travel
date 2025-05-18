/**
 * Expenses API Client
 *
 * Client-side wrapper for the Expenses API providing type-safe access to expense operations
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from './result';
import type { Result } from './result';
import { handleApiResponse } from './index';
import type { Expense } from '@/lib/api/_shared';

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * List all expenses for a trip
 */
export async function listTripExpenses(tripId: string): Promise<Result<Expense[]>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_EXPENSES(tripId), {
      method: 'GET',
    }).then((response) =>
      handleApiResponse<{ expenses: Expense[] }>(response).then((r) => r.expenses)
    )
  );
}

/**
 * Get a specific expense for a trip
 */
export async function getTripExpense(tripId: string, expenseId: string): Promise<Result<Expense>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_EXPENSE(tripId, expenseId), {
      method: 'GET',
    }).then((response) => handleApiResponse<{ expense: Expense }>(response).then((r) => r.expense))
  );
}

/**
 * Create a new expense for a trip
 */
export async function createTripExpense(
  tripId: string,
  data: Partial<Expense>
): Promise<Result<Expense>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_EXPENSES(tripId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<{ expense: Expense }>(response).then((r) => r.expense))
  );
}

/**
 * Update an existing expense for a trip
 */
export async function updateTripExpense(
  tripId: string,
  expenseId: string,
  data: Partial<Expense>
): Promise<Result<Expense>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_EXPENSE(tripId, expenseId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<{ expense: Expense }>(response).then((r) => r.expense))
  );
}

/**
 * Delete an expense for a trip
 */
export async function deleteTripExpense(tripId: string, expenseId: string): Promise<Result<null>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_EXPENSE(tripId, expenseId), {
      method: 'DELETE',
    }).then(() => null)
  );
}

/**
 * Get a summary of expenses for a trip
 */
export async function getTripExpenseSummary(tripId: string): Promise<Result<any>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIP_EXPENSES(tripId)}/summary`, {
      method: 'GET',
    }).then((response) => handleApiResponse<any>(response))
  );
}
