/**
 * Standardized Result type for API and client operations
 * 
 * This file provides a consistent Result type for use across the codebase,
 * with helper functions for creating success and error results, as well as
 * type guards for checking result types.
 */

/**
 * Success result with data
 */
export type Success<T> = {
  success: true;
  data: T;
};

/**
 * Failure result with error message
 */
export type Failure = {
  success: false;
  error: string;
};

/**
 * Result type combining Success and Failure
 */
export type Result<T> = Success<T> | Failure;

/**
 * Type guard to check if a result is successful
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
 * Create a success result
 */
export function success<T>(data: T): Success<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create a failure result
 */
export function failure(error: string | Error): Failure {
  return {
    success: false,
    error: typeof error === 'string' ? error : error.message || 'Unknown error',
  };
}

/**
 * Handle an error and return a Failure result
 */
export function handleError(error: unknown, fallbackMsg: string): Failure {
  console.error(fallbackMsg, error);

  if (error instanceof Error) {
    return failure(error.message);
  }

  if (typeof error === 'string') {
    return failure(error);
  }

  return failure(fallbackMsg);
}

/**
 * Combine multiple Result<T> values into a single Result<T[]>
 * Returns the first failure if any, otherwise returns all data as a success.
 */
export function combineResults<T>(results: Result<T>[]): Result<T[]> {
  const errors = results.filter(isFailure);
  if (errors.length > 0) {
    return failure(errors[0].error);
  }
  return success(results.map(r => (r as Success<T>).data));
} 