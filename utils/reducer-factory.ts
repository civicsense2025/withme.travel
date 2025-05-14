/**
 * Type-safe reducer factory for creating reducers with properly typed actions
 */

/**
 * Represents an action with a type and optional payload
 */
export type Action<T extends string, P = undefined> = P extends undefined
  ? { type: T }
  : { type: T; payload: P };

/**
 * Creates a function that generates an action with the given type
 */
export function createAction<T extends string>(type: T): () => Action<T>;
export function createAction<T extends string, P>(type: T): (payload: P) => Action<T, P>;
export function createAction<T extends string, P>(type: T) {
  return ((payload?: P) => {
    return payload === undefined ? { type } : { type, payload };
  }) as any; // Using 'any' here because TypeScript can't infer the correct return type
}

/**
 * A type that maps action types to their payload types
 */
export type ActionMap<M extends { [index: string]: any }> = {
  [K in keyof M]: M[K] extends undefined ? { type: K } : { type: K; payload: M[K] };
};

/**
 * Creates a type-safe reducer function from a set of handler functions
 *
 * @example
 * type CounterState = { count: number };
 *
 * type CounterActionMap = {
 *   increment: undefined;
 *   decrement: undefined;
 *   set: number;
 * };
 *
 * const counterReducer = createReducer<CounterState, CounterActionMap>({
 *   increment: (state) => ({ ...state, count: state.count + 1 }),
 *   decrement: (state) => ({ ...state, count: state.count - 1 }),
 *   set: (state, payload) => ({ ...state, count: payload }),
 * });
 */
export function createReducer<State, M extends { [index: string]: any }>(handlers: {
  [K in keyof M]: M[K] extends undefined
    ? (state: State) => State
    : (state: State, payload: M[K]) => State;
}) {
  return (state: State, action: ActionMap<M>[keyof M]): State => {
    if (!action || typeof action !== 'object' || !('type' in action)) {
      return state;
    }

    const handler = handlers[action.type as keyof M];

    if (!handler) {
      return state;
    }

    if ('payload' in action) {
      return (handler as any)(state, action.payload);
    } else {
      return (handler as any)(state);
    }
  };
}
