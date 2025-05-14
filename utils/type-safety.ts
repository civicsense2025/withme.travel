/**
 * Asserts that a value is not null or undefined.
 */
export function assertNonNull<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Safely get a property from an object, with a default value if null/undefined.
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K]
): T[K] {
  if (obj === null || obj === undefined) {
    return defaultValue;
  }
  return obj[key];
}

/**
 * Handles Supabase query results, returning data or a default value if error/null.
 */
export function handleQueryResult<T>(
  result: { data: T | null; error: any },
  defaultValue: T | null = null
): T | null {
  if (result.error) {
    console.error('Database query error:', result.error);
    return defaultValue;
  }
  return result.data;
}
