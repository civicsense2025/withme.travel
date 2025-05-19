'use client';

import { useState, useCallback } from 'react';
import { produce } from 'immer';

/**
 * A hook that uses immer's produce function with React's useState
 * to provide immutable state updates with simpler syntax.
 *
 * @example
 * const [state, setState] = useImmer({ count: 0 });
 * // Update state immutably with direct mutations
 * setState(draft => { draft.count += 1; });
 */
export function useImmer<T>(initialState: T | (() => T)) {
  const [state, setState] = useState<T>(initialState);

  const updateState = useCallback((recipe: (draft: T) => void) => {
    setState((currentState) => produce(currentState, recipe));
  }, []);

  return [state, updateState] as const;
}
