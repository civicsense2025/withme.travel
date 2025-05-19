/**
 * Standardized result type for API operations
 * 
 * Provides type-safe success/failure handling for all client-server communications
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
 * Creates a success result object
 * @param data - The successful result data
 */
export function createSuccess<T>(data: T): Success<T> {
  return { success: true, data };
}

/**
 * Creates a failure result object
 * @param error - Error message or Error object
 * @param details - Additional error details
 */
export function handleError(error: unknown, fallbackMessage = 'Operation failed'): Failure {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error),
    details: error instanceof Error ? error.stack : undefined
  };
}

/**
 * Type guard for success results
 * @param result - The result to check
 */
export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.success;
}

/**
 * Type guard for failure results
 * @param result - The result to check
 */
export function isFailure<T>(result: Result<T>): result is Failure {
  return !result.success;
}

/**
 * Wraps a promise in try/catch and returns a Result type
 * @param promise - The promise to execute
 * @param errorMessage - Custom error message for failures
 */
export async function tryCatch<T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<Result<T>> {
  try {
    const data = await promise;
    return createSuccess(data);
  } catch (error) {
    return handleError(error, errorMessage);
  }
}

/**
 * Handles a result with success/failure callbacks
 * @param result - The result to handle
 * @param onSuccess - Success handler
 * @param onFailure - Failure handler
 */
export function handleResult<T, U = void, V = void>(
  result: Result<T>,
  onSuccess: (data: T) => U,
  onFailure?: (error: string, details?: unknown) => V
): U | V | undefined {
  if (isSuccess(result)) {
    return onSuccess(result.data);
  }
  return onFailure?.(result.error, result.details);
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
    return handleError(
      typeof firstFailure.error === 'string' ? firstFailure.error : 'Unknown error',
      typeof firstFailure.details === 'string' ? firstFailure.details : undefined
    );
  }
  
  return createSuccess(results.filter(isSuccess).map(result => result.data));
}

/**
 * Creates a failure result object
 * @param error - Error message or Error object
 * @param details - Additional error details
 */
export function createFailure(error: string, details?: unknown): Failure {
  return { success: false, error, details };
}
