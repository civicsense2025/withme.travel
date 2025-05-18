'use client';

/**
 * Debounce Hook
 * 
 * Custom hook to debounce a value, useful for search inputs and other
 * scenarios where you want to delay updates until typing stops.
 */

import { useState, useEffect } from 'react';

/**
 * Debounces a value, only updating the returned value after the specified delay
 * has passed without the input value changing.
 * 
 * @param value The value to debounce
 * @param delay Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Clean up the timer if the value changes before the delay expires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
