/**
 * Result Pattern for API Responses
 *
 * Standardized way to handle success and error states from API calls
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Success result with data
 */
export type Success<T> = {
  success: true;
  data: T;
};

/**
 * Error result with message and optional details
 */
export type Failure = {
  success: false;
  error: string;
  details?: unknown;
};

/**
 * Result type combining success and failure
 */
export type Result<T> = Success<T> | Failure;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a success result
 */
export function createSuccess<T>(data: T): Success<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates a failure result
 */
export function createFailure(error: string, details?: unknown): Failure {
  return {
    success: false,
    error,
    details,
  };
}

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
 * Helper to safely execute an async function and return a Result
 */
export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return createSuccess(data);
  } catch (error) {
    if (error instanceof Error) {
      return createFailure(error.message, error);
    }
    return createFailure(String(error));
  }
}

/**
 * Maps a successful result to a new value
 */
export function mapSuccess<T, U>(result: Result<T>, fn: (data: T) => U): Result<U> {
  if (isSuccess(result)) {
    try {
      return createSuccess(fn(result.data));
    } catch (error) {
      if (error instanceof Error) {
        return createFailure(error.message, error);
      }
      return createFailure(String(error));
    }
  }
  return result;
}

/**
 * Handle a result with success and error callbacks
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
 * Chains multiple async operations that return Results
 */
export async function chainResults<T, U>(
  result: Result<T>,
  fn: (data: T) => Promise<Result<U>>
): Promise<Result<U>> {
  if (isSuccess(result)) {
    return await fn(result.data);
  }
  return result;
}

/**
 * Combines multiple results into a single result with an array of data
 */
export function combineResults<T>(results: Result<T>[]): Result<T[]> {
  const failures = results.filter(isFailure);
  if (failures.length > 0) {
    return createFailure(
      `Multiple errors: ${failures.map((f) => f.error).join(', ')}`,
      failures.map((f) => f.details)
    );
  }

  return createSuccess(results.filter(isSuccess).map((r) => (r as Success<T>).data));
}
