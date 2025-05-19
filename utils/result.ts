/**
 * Result Utility
 *
 * Provides a standard Result type and helpers for API and client code.
 * @module utils/result
 */

/**
 * Result type for success/failure handling
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Helper to create a successful result
 */
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

/**
 * Helper to create a failed result
 */
export function err<E = Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Helper to run a promise and return a Result
 */
export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Type guard for successful Result
 */
export function isSuccess<T>(result: Result<T>): result is { ok: true; value: T } {
  return result.ok === true;
} 