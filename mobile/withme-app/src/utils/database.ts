import { createSupabaseClient } from './supabase';
import { TABLES, COLUMNS, SQL_OPERATORS } from '../constants/database';

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
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(COLUMNS.ID, id)
      .single();
      
    if (error) {
      console.error(`Error fetching ${table} by ID:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Exception in getById for ${table}:`, err);
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
  try {
    const supabase = createSupabaseClient();
    let query = supabase
      .from(table)
      .select('*')
      .eq(foreignKey, value);
      
    if (orderBy) {
      query = query.order(orderBy.column, { 
        ascending: orderBy.ascending !== false 
      });
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error(`Error fetching ${table} by ${foreignKey}:`, error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error(`Exception in getByForeignKey for ${table}:`, err);
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
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .insert([record])
      .select()
      .single();
      
    if (error) {
      console.error(`Error creating record in ${table}:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Exception in createRecord for ${table}:`, err);
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
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq(COLUMNS.ID, id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating record in ${table}:`, error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(`Exception in updateRecord for ${table}:`, err);
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
  try {
    const supabase = createSupabaseClient();
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(COLUMNS.ID, id);
      
    if (error) {
      console.error(`Error deleting record from ${table}:`, error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Exception in deleteRecord for ${table}:`, err);
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
  orderBy: { column: string; ascending?: boolean } = { column: COLUMNS.CREATED_AT, ascending: false }
) {
  try {
    const supabase = createSupabaseClient();
    
    // Get count first
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error(`Error getting count for ${table}:`, countError);
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
      console.error(`Error fetching paginated ${table}:`, error);
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }
    
    const totalPages = Math.ceil((count || 0) / pageSize);
    
    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages
    };
  } catch (err) {
    console.error(`Exception in getPaginated for ${table}:`, err);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }
} 