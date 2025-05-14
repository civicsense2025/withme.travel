/**
 * TypeScript Type Guards
 *
 * This utility provides type guards and type narrowing helpers to improve
 * type safety throughout the application, especially when dealing with
 * database query results and API responses.
 */

/**
 * Type guard for checking if value is non-null and defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for checking if value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for checking if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for checking if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard for checking if an object has a specific property
 */
export function hasProperty<K extends string>(obj: unknown, prop: K): obj is Record<K, unknown> {
  return isObject(obj) && prop in obj;
}

/**
 * Type guard for checking if an object has a specific property of a given type
 */
export function hasPropertyOfType<K extends string, T>(
  obj: unknown,
  prop: K,
  typePredicate: (val: unknown) => val is T
): obj is Record<K, T> {
  return hasProperty(obj, prop) && typePredicate(obj[prop]);
}

/**
 * Type guard for checking if object has a string property
 */
export function hasStringProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, string> {
  return hasPropertyOfType(obj, prop, isString);
}

/**
 * Type guard for checking if object has a number property
 */
export function hasNumberProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, number> {
  return hasPropertyOfType(obj, prop, isNumber);
}

/**
 * Type guard for checking if object has a boolean property
 */
export function hasBooleanProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, boolean> {
  return hasPropertyOfType(obj, prop, isBoolean);
}

/**
 * Type guard for checking if object implements trip membership interface
 */
export interface TripMembership {
  role: string;
  is_active: boolean;
}

export function isTripMembership(obj: unknown): obj is TripMembership {
  return isObject(obj) && hasStringProperty(obj, 'role') && hasBooleanProperty(obj, 'is_active');
}

/**
 * Type guard for checking if object is a trip
 */
export interface Trip {
  id: string;
  name: string;
  created_by: string;
  is_public?: boolean;
}

export function isTrip(obj: unknown): obj is Trip {
  return (
    isObject(obj) &&
    hasStringProperty(obj, 'id') &&
    hasStringProperty(obj, 'name') &&
    hasStringProperty(obj, 'created_by')
  );
}

/**
 * Type guard for checking if object is an itinerary item
 */
export interface ItineraryItem {
  id: string;
  title: string;
  trip_id: string;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
}

export function isItineraryItem(obj: unknown): obj is ItineraryItem {
  return (
    isObject(obj) &&
    hasStringProperty(obj, 'id') &&
    hasStringProperty(obj, 'title') &&
    hasStringProperty(obj, 'trip_id')
  );
}

/**
 * Safe type assertion helper - throws error if assertion fails
 */
export function assertType<T>(
  value: unknown,
  typePredicate: (val: unknown) => val is T,
  errorMessage: string = 'Type assertion failed'
): T {
  if (typePredicate(value)) {
    return value;
  }
  throw new Error(errorMessage);
}

/**
 * Helper to safely cast database response with fallback
 */
export function safeGet<T>(
  data: unknown,
  typePredicate: (val: unknown) => val is T,
  fallback: T
): T {
  return typePredicate(data) ? data : fallback;
}
