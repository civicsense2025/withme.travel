/**
 * Utility types for better TypeScript support
 */

/**
 * Makes all properties and nested properties of T optional
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Removes null and undefined from type T
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Makes specific properties in T required
 */
export type RequireProps<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Creates a type that picks specific keys from T with type K
 */
export type PickByType<T, K> = {
  [P in keyof T as T[P] extends K ? P : never]: T[P];
};

/**
 * Creates a type with all properties of T except those that extend type K
 */
export type OmitByType<T, K> = {
  [P in keyof T as T[P] extends K ? never : P]: T[P];
};
