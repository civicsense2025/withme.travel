/**
 * Type-safe error handling utilities
 */

export type ErrorWithMessage = {
  message: string;
};

/**
 * Type guard to check if an unknown error has a message property
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Converts any error type to a standardized error with a message
 */
export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // If JSON serialization fails, fallback to String conversion
    return new Error(String(maybeError));
  }
}

/**
 * Safely extracts error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}
