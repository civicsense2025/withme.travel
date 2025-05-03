'use client';

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => { return setDebouncedValue(value); }, delay);

    return () => { return clearTimeout(timer); };
  }, [value, delay]);

  return debouncedValue;
}