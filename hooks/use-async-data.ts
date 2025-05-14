'use client';

import { useState, useEffect, useCallback } from 'react';
import { Result, wrapAsync } from '../utils/result';

/**
 * Represents the state of an async operation
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

/**
 * Options for the useAsyncData hook
 */
export interface UseAsyncDataOptions {
  /**
   * Whether to fetch data immediately on mount
   */
  immediate?: boolean;

  /**
   * Dependencies to trigger a refetch
   */
  deps?: any[];

  /**
   * Initial state
   */
  initialState?: 'idle' | 'loading';
}

/**
 * A hook that handles async data fetching with loading/error states
 *
 * @example
 * const { state, execute, reset } = useAsyncData(
 *   async () => {
 *     const response = await fetch('/api/users');
 *     if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
 *     return response.json();
 *   },
 *   { immediate: true }
 * );
 *
 * if (state.status === 'loading') return <Loading />;
 * if (state.status === 'error') return <Error message={state.error.message} />;
 * if (state.status === 'success') return <UserList users={state.data} />;
 * return null;
 */
export function useAsyncData<T, A extends any[]>(
  asyncFn: (...args: A) => Promise<T>,
  options: UseAsyncDataOptions = {}
) {
  const { immediate = false, deps = [], initialState = 'idle' } = options;

  const [state, setState] = useState<AsyncState<T>>(
    initialState === 'loading' ? { status: 'loading' } : { status: 'idle' }
  );

  // Wrap the async function to return a Result
  const wrappedFn = useCallback(wrapAsync(asyncFn), [asyncFn]);

  // Function to execute the async operation
  const execute = useCallback(
    async (...args: A): Promise<Result<T, Error>> => {
      setState({ status: 'loading' });

      const result = await wrappedFn(...args);

      if (result.success) {
        setState({ status: 'success', data: result.data });
      } else {
        setState({ status: 'error', error: result.error });
      }

      return result;
    },
    [wrappedFn]
  );

  // Function to reset the state
  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  // Auto-execute if immediate is true
  useEffect(() => {
    if (immediate) {
      // Cast empty array to A to satisfy TypeScript
      execute(...([] as unknown as A));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute, ...deps]);

  return {
    state,
    execute,
    reset,
    // Helper getters for common state checks
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    // Data and error (may be undefined)
    data: state.status === 'success' ? state.data : undefined,
    error: state.status === 'error' ? state.error : undefined,
  };
}
