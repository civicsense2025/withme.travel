'use client';

import { useState, useEffect } from 'react';
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
 * A hook for using localStorage with type safety and SSR support
 * @param key - The key to store the value under in localStorage
 * @param initialValue - The initial value to use if no value is found in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // SSR check - don't try to access localStorage during SSR
  const isClient = typeof window !== 'undefined';

  // Initialize state from localStorage if on client
  useEffect(() => {
    if (!isClient) return;

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or if none return initialValue
      const value = item ? JSON.parse(item) : initialValue;
      
      setStoredValue(value);
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading from localStorage:', error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue, isClient]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage, but only if we're on the client
      if (isClient) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
