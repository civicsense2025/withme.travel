'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

/**
 * Options for useLocalStorage hook
 */
interface UseLocalStorageOptions<T> {
  /**
   * Zod schema for validation
   */
  schema?: z.ZodType<T>;

  /**
   * Whether to log validation errors to console
   */
  logErrors?: boolean;
}

/**
 * A hook for typesafe local storage access
 *
 * @example
 * // Basic usage
 * const [value, setValue] = useLocalStorage('darkMode', false);
 *
 * // With schema validation
 * const UserSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 *   email: z.string().email()
 * });
 *
 * type User = z.infer<typeof UserSchema>;
 *
 * const [user, setUser] = useLocalStorage<User>(
 *   'currentUser',
 *   null,
 *   { schema: UserSchema }
 * );
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
) {
  const { schema, logErrors = true } = options;

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);

      // Parse stored json or if none return initialValue
      if (!item) {
        return initialValue;
      }

      const parsedItem = JSON.parse(item);

      // Validate with schema if provided
      if (schema) {
        const result = schema.safeParse(parsedItem);
        if (!result.success) {
          if (logErrors) {
            console.error(`Validation error for ${key}:`, result.error.format());
          }
          return initialValue;
        }
        return result.data;
      }

      return parsedItem;
    } catch (error) {
      // If error also return initialValue
      if (logErrors) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Validate with schema if provided
        if (schema) {
          const result = schema.safeParse(valueToStore);
          if (!result.success) {
            if (logErrors) {
              console.error(`Validation error for ${key}:`, result.error.format());
            }
            throw new Error(`Invalid value for ${key}`);
          }
        }

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        if (logErrors) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }
    },
    [key, storedValue, schema, logErrors]
  );

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);

          // Validate with schema if provided
          if (schema) {
            const result = schema.safeParse(newValue);
            if (!result.success) {
              if (logErrors) {
                console.error(`Validation error for ${key}:`, result.error.format());
              }
              return;
            }
            setStoredValue(result.data);
            return;
          }

          setStoredValue(newValue);
        } catch (error) {
          if (logErrors) {
            console.error(`Error parsing localStorage change for key "${key}":`, error);
          }
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, schema, logErrors]);

  return [storedValue, setValue] as const;
}
