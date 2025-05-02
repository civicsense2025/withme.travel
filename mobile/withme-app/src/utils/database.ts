import { createSupabaseClient } from './supabase';
import { TABLES, COLUMNS, SQL_OPERATORS } from '../constants/database';

// Debug mode flag
const DEBUG_MODE = __DEV__;

// Debug utility
const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`[Database] ${message}`, data);
    } else {
      console.log(`[Database] ${message}`);
    }
  }
};

// Type definition for query options
interface QueryOptions {
  limit?: number;
  column?: string;
  ascending?: boolean;
}

/**
 * Utility functions for common database operations using constants
 */

/**
 * Get a record by ID
 * @param table Table name from TABLES constant
 * @param id Record ID
 * @returns The record or null
 */
export async function getById(table: string, id: string) {
  debugLog(`Getting ${table} by ID: ${id}`);
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      debugLog(`Supabase client not available for ${table} getById`);
      return null;
    }

    const { data, error } = await supabase.from(table).select('*').eq(COLUMNS.ID, id).single();

    if (error) {
      debugLog(`Error fetching ${table} by ID:`, error);
      return null;
    }

    debugLog(`Successfully fetched ${table} by ID`);
    return data;
  } catch (err) {
    debugLog(`Exception in getById for ${table}:`, err);
    return null;
  }
}

/**
 * Get records by a foreign key
 * @param table Table name from TABLES constant
 * @param foreignKey Foreign key column name from COLUMNS constant
 * @param value Foreign key value
 * @param orderBy Optional column to order by
 * @returns Array of records or empty array
 */
export async function getByForeignKey(
  table: string,
  foreignKey: string,
  value: string,
  orderBy?: { column: string; ascending?: boolean }
) {
  debugLog(`Getting ${table} by ${foreignKey}: ${value}`);
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      debugLog(`Supabase client not available for ${table} getByForeignKey`);
      return [];
    }

    let query = supabase.from(table).select('*').eq(foreignKey, value);

    if (orderBy) {
      query = query.order(orderBy.column, {
        ascending: orderBy.ascending !== false,
      });
    }

    const { data, error } = await query;

    if (error) {
      debugLog(`Error fetching ${table} by ${foreignKey}:`, error);
      return [];
    }

    debugLog(`Successfully fetched ${table} by ${foreignKey}: ${data?.length || 0} records`);
    return data || [];
  } catch (err) {
    debugLog(`Exception in getByForeignKey for ${table}:`, err);
    return [];
  }
}

/**
 * Create a new record
 * @param table Table name from TABLES constant
 * @param record Record data
 * @returns The created record or null
 */
export async function createRecord(table: string, record: any) {
  debugLog(`Creating record in ${table}`);
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      debugLog(`Supabase client not available for ${table} createRecord`);
      return null;
    }

    const { data, error } = await supabase.from(table).insert([record]).select().single();

    if (error) {
      debugLog(`Error creating record in ${table}:`, error);
      return null;
    }

    debugLog(`Successfully created record in ${table}`);
    return data;
  } catch (err) {
    debugLog(`Exception in createRecord for ${table}:`, err);
    return null;
  }
}

/**
 * Update a record
 * @param table Table name from TABLES constant
 * @param id Record ID
 * @param updates Fields to update
 * @returns The updated record or null
 */
export async function updateRecord(table: string, id: string, updates: any) {
  debugLog(`Updating record in ${table} with ID: ${id}`);
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      debugLog(`Supabase client not available for ${table} updateRecord`);
      return null;
    }

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq(COLUMNS.ID, id)
      .select()
      .single();

    if (error) {
      debugLog(`Error updating record in ${table}:`, error);
      return null;
    }

    debugLog(`Successfully updated record in ${table}`);
    return data;
  } catch (err) {
    debugLog(`Exception in updateRecord for ${table}:`, err);
    return null;
  }
}

/**
 * Delete a record
 * @param table Table name from TABLES constant
 * @param id Record ID
 * @returns Success boolean
 */
export async function deleteRecord(table: string, id: string) {
  debugLog(`Deleting record from ${table} with ID: ${id}`);
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      debugLog(`Supabase client not available for ${table} deleteRecord`);
      return false;
    }

    const { error } = await supabase.from(table).delete().eq(COLUMNS.ID, id);

    if (error) {
      debugLog(`Error deleting record from ${table}:`, error);
      return false;
    }

    debugLog(`Successfully deleted record from ${table}`);
    return true;
  } catch (err) {
    debugLog(`Exception in deleteRecord for ${table}:`, err);
    return false;
  }
}

/**
 * Get records with pagination
 * @param table Table name from TABLES constant
 * @param page Page number (1-based)
 * @param pageSize Number of records per page
 * @param orderBy Optional column to order by
 * @returns Object with data array and pagination info
 */
export async function getPaginated(
  table: string,
  page: number = 1,
  pageSize: number = 20,
  orderBy: { column: string; ascending?: boolean } = {
    column: COLUMNS.CREATED_AT,
    ascending: false,
  }
) {
  debugLog(`Getting paginated ${table}, page ${page}, size ${pageSize}`);
  try {
    const supabase = createSupabaseClient();
    if (!supabase) {
      debugLog(`Supabase client not available for ${table} getPaginated`);
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // Get count first
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      debugLog(`Error getting count for ${table}:`, countError);
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    // Calculate range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get data
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy.column, { ascending: orderBy.ascending !== false })
      .range(from, to);

    if (error) {
      debugLog(`Error fetching paginated ${table}:`, error);
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    debugLog(`Successfully fetched paginated ${table}: ${data?.length || 0} records`);
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
    };
  } catch (err) {
    debugLog(`Exception in getPaginated for ${table}:`, err);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }
}

/**
 * Fetches all itinerary templates from the database.
 * @param options Optional query options (limit, order).
 * @returns Promise resolving to an array of itinerary templates.
 */
export async function getAllItineraryTemplates(options?: QueryOptions): Promise<any[]> {
  const supabase = createSupabaseClient();
  let query = supabase
    .from('itinerary_templates')
    .select('* (id, name, description, image_url, duration_days, destination_city, tags)');

  // Apply sorting if provided
  if (options?.column && options?.ascending !== undefined) {
    query = query.order(options.column, { ascending: options.ascending });
  }

  // Apply limit if provided
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching itinerary templates:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}
