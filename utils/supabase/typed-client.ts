/**
 * Type-Safe Supabase Client
 *
 * This utility provides type-safe wrappers for Supabase client methods to ensure
 * consistent use of table names and proper typing across the application.
 *
 * USAGE:
 * ```
 * // Instead of:
 * const { data } = await supabase.from('trips').select('*');
 *
 * // Use:
 * const { data } = await fromTable(supabase, TABLES.TRIPS).select('*');
 * ```
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { TABLES } from '@/utils/constants/tables';

/**
 * Type-safe way to access a Supabase table
 *
 * @param client The Supabase client instance
 * @param tableName A table name from the TABLES constants object
 * @returns The properly typed query builder for the specified table
 */
export function fromTable<T extends string>(client: SupabaseClient, tableName: T) {
  return client.from(tableName);
}

/**
 * Type for tables that are known to exist in our database
 */
export type KnownTable = (typeof TABLES)[keyof typeof TABLES];

/**
 * Type utility to check if a string is a known table name
 */
export function isKnownTable(table: string): table is KnownTable {
  return Object.values(TABLES).includes(table as KnownTable);
}

/**
 * Type guard for checking if an object has expected properties
 *
 * @param obj The object to check
 * @param properties Array of property names that should exist
 * @returns Boolean indicating if all properties exist
 */
export function hasProperties<T extends object, K extends keyof any>(
  obj: T | null | undefined,
  properties: K[]
): obj is T & Record<K, unknown> {
  if (!obj) return false;
  return properties.every((prop) => prop in obj);
}

/**
 * Safely extract a property from an object with type checking
 *
 * @param obj The object to extract from
 * @param key The property key to extract
 * @param defaultValue Optional default value if property doesn't exist
 * @returns The property value or default value
 */
export function getProperty<T, K extends keyof any, D = undefined>(
  obj: T | null | undefined,
  key: K,
  defaultValue?: D
): K extends keyof T ? T[K] : D {
  if (obj && key in (obj as object)) {
    return (obj as any)[key];
  }
  return defaultValue as any;
}
