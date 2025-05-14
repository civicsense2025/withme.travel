import { getErrorMessage } from './error-handling';

/**
 * A type that represents either a successful result or an error
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Creates a successful result
 */
export function success<T, E = Error>(data: T): Result<T, E> {
  return { success: true, data };
}

/**
 * Creates an error result
 */
export function failure<T, E = Error>(error: E): Result<T, E> {
  return { success: false, error };
}

/**
 * Wraps an async function to return a Result
 *
 * @example
 * const fetchUser = async (id: string): Promise<User> => {
 *   const response = await fetch(`/api/users/${id}`);
 *   if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
 *   return response.json();
 * };
 *
 * // Wrap the function to return a Result
 * const safeUserFetch = wrapAsync(fetchUser);
 *
 * // Usage
 * const result = await safeUserFetch('123');
 * if (result.success) {
 *   console.log(result.data); // User data
 * } else {
 *   console.error(result.error); // Error object
 * }
 */
export function wrapAsync<T, A extends any[]>(
  fn: (...args: A) => Promise<T>
): (...args: A) => Promise<Result<T, Error>> {
  return async (...args: A): Promise<Result<T, Error>> => {
    try {
      const data = await fn(...args);
      return success(data);
    } catch (e) {
      return failure(e instanceof Error ? e : new Error(getErrorMessage(e)));
    }
  };
}

/**
 * Wraps a synchronous function to return a Result
 */
export function wrapSync<T, A extends any[]>(
  fn: (...args: A) => T
): (...args: A) => Result<T, Error> {
  return (...args: A): Result<T, Error> => {
    try {
      const data = fn(...args);
      return success(data);
    } catch (e) {
      return failure(e instanceof Error ? e : new Error(getErrorMessage(e)));
    }
  };
}

/**
 * Maps a successful result to a new result using the provided function
 * If the input is a failure, it is returned unchanged
 */
export function map<T, U, E = Error>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  if (result.success) {
    try {
      return success(fn(result.data));
    } catch (e) {
      return failure(
        e instanceof Error ? (e as unknown as E) : (new Error(getErrorMessage(e)) as unknown as E)
      );
    }
  }
  return result;
}

/**
 * Chains multiple asynchronous operations that return Results
 */
export async function chain<T, U, E = Error>(
  result: Result<T, E>,
  fn: (data: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> {
  if (result.success) {
    return await fn(result.data);
  }
  return result;
}
