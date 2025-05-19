/**
 * Async Data Hook
 * 
 * A generic hook for fetching any async data with consistent error handling,
 * loading states, and optional caching.
 * 
 * @module hooks/use-async-data
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/lib/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Configuration options for async data fetching
 */
export interface AsyncDataOptions<T> {
  /** Initial value to use before data is loaded */
  initialData?: T;
  /** Whether to fetch data immediately on mount */
  loadOnMount?: boolean;
  /** Callback function to run when data is successfully loaded */
  onSuccess?: (data: T) => void;
  /** Callback function to run when fetch fails */
  onError?: (error: Error) => void;
  /** Whether to show default toast notifications on error */
  showErrorToast?: boolean;
  /** Custom error message for toast on failure */
  errorMessage?: string;
  /** Dependencies that should trigger a reload when changed */
  dependencies?: unknown[];
  /** Whether to use localStorage caching */
  useCache?: boolean;
  /** Cache key when using localStorage */
  cacheKey?: string;
  /** Time in milliseconds to consider the cache valid */
  cacheTtl?: number;
}

/**
 * Result of the useAsyncData hook
 */
export interface AsyncDataResult<T> {
  /** The fetched data */
  data: T | undefined;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error object if request failed */
  error: Error | null;
  /** Function to manually trigger a reload */
  reload: () => Promise<T | undefined>;
  /** Timestamp when data was last fetched */
  lastFetched: number | null;
}

/**
 * Cache entry format for localStorage
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Save data to localStorage with timestamp
 */
function saveToCache<T>(key: string, data: T): void {
  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (e) {
    console.warn('Failed to cache data:', e);
  }
}

/**
 * Get data from localStorage if it exists and is not expired
 */
function getFromCache<T>(key: string, ttl: number): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheEntry = JSON.parse(cached) as CacheEntry<T>;
    const now = Date.now();
    const isExpired = now - cacheEntry.timestamp > ttl;

    return isExpired ? null : cacheEntry.data;
  } catch (e) {
    console.warn('Failed to retrieve cached data:', e);
    return null;
  }
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Generic hook for handling async data fetching with consistent patterns
 * 
 * @param asyncFn - The async function to fetch data
 * @param options - Configuration options
 * @returns Object containing data, loading state, and control functions
 */
export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  options: AsyncDataOptions<T> = {}
): AsyncDataResult<T> {
  // Extract options with defaults
  const {
    initialData,
    loadOnMount = true,
    onSuccess,
    onError,
    showErrorToast = true,
    errorMessage = 'Failed to load data',
    dependencies = [],
    useCache = false,
    cacheKey,
    cacheTtl = 5 * 60 * 1000, // 5 minutes default
  } = options;

  // Check if cacheKey is provided when useCache is true
  if (useCache && !cacheKey) {
    console.warn('useCache is true but no cacheKey provided in useAsyncData');
  }

  // State
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(loadOnMount);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  
  // Prevent state updates if the component unmounts during fetch
  const isMounted = useRef(true);
  const { toast } = useToast();

  // Function to fetch data with error handling
  const fetchData = useCallback(async (): Promise<T | undefined> => {
    // Try to get from cache first if useCache is enabled
    if (useCache && cacheKey) {
      const cachedData = getFromCache<T>(cacheKey, cacheTtl);
      if (cachedData) {
        if (isMounted.current) {
          setData(cachedData);
          setIsLoading(false);
          setLastFetched(Date.now());
        }
        onSuccess?.(cachedData);
        return cachedData;
      }
    }

    // Otherwise, fetch fresh data
    if (isMounted.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const result = await asyncFn();
      
      if (isMounted.current) {
        setData(result);
        setIsLoading(false);
        setError(null);
        setLastFetched(Date.now());
      }
      
      // Save to cache if enabled
      if (useCache && cacheKey) {
        saveToCache(cacheKey, result);
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (!isMounted.current) return undefined;
      
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setIsLoading(false);
      
      console.error(errorMessage, errorObj);
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      onError?.(errorObj);
      return undefined;
    }
  }, [
    asyncFn,
    useCache,
    cacheKey,
    cacheTtl,
    onSuccess,
    onError,
    showErrorToast,
    errorMessage,
    toast,
  ]);

  // Effect to fetch data on mount or when dependencies change
  useEffect(() => {
    if (loadOnMount) {
      fetchData();
    }
    
    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [fetchData, loadOnMount, ...dependencies]);

  // Reset mounted ref when the component remounts
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    reload: fetchData,
    lastFetched,
  };
}
