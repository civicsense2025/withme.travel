/**
 * Result types and utilities for handling operation outcomes
 *
 * This module provides a standardized way to handle operation results,
 * especially for async operations that might succeed or fail.
 */

/**
 * Represents a successful operation result
 */
export type Success<T> = {
  success: true;
  data: T;
};

/**
 * Represents a failed operation result
 */
export type Failure = {
  success: false;
  error: string;
  details?: unknown;
};

/**
 * Result type that can be either success or failure
 */
export type Result<T> = Success<T> | Failure;

/**
 * Create a successful result
 */
export function createSuccess<T>(data: T): Success<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create a failure result
 */
export function createFailure(error: string | Error, details?: unknown): Failure {
  return {
    success: false,
    error: error instanceof Error ? error.message : error,
    details,
  };
}

/**
 * Type guard to check if a result is a success
 */
export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard to check if a result is a failure
 */
export function isFailure<T>(result: Result<T>): result is Failure {
  return result.success === false;
}

/**
 * Try to execute a promise and convert its result to a Result type
 */
export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return createSuccess(data);
  } catch (error) {
    return createFailure(error instanceof Error ? error : String(error));
  }
}

/**
 * Map the data of a success result using a function
 */
export function mapSuccess<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
  if (isSuccess(result)) {
    return createSuccess(fn(result.data));
  }
  return result;
}

/**
 * Handle a result with separate success and failure callbacks
 */
export function handleResult<T, U = void>(
  result: Result<T>,
  onSuccess: (data: T) => U,
  onFailure?: (error: string, details?: unknown) => U
): U | undefined {
  if (isSuccess(result)) {
    return onSuccess(result.data);
  } else if (onFailure) {
    return onFailure(result.error, result.details);
  }
  return undefined;
}

/**
 * Chain an async operation that returns a Result
 */
export async function chainResults<T, U>(
  result: Result<T>,
  fn: (data: T) => Promise<Result<U>>
): Promise<Result<U>> {
  if (isSuccess(result)) {
    return await fn(result.data);
  }
  return result as unknown as Result<U>;
}

/**
 * Combine multiple results into a single result
 */
export function combineResults<T>(results: Result<T>[]): Result<T[]> {
  const failures = results.filter(isFailure);
  if (failures.length > 0) {
    const firstFailure = failures[0];
    return createFailure(firstFailure.error, firstFailure.details);
  }
  
  return createSuccess(results.filter(isSuccess).map(result => (result as Success<T>).data));
}
