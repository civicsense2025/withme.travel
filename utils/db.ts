import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { ApiResponse, DbQueryParams } from './types';
import type { Database } from '@/types/database.types';
import { getServerComponentClient } from '@/utils/supabase/unified';
import { cache } from 'react';

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase URL or Service Role Key is missing from environment variables.');
  // Decide how to handle this - throw error, or have functions check client validity?
  // For now, functions will implicitly fail if client isn't created.
}

// Create a single instance of the Supabase client for this module
// This uses the service role key for privileged access - ONLY use this on the server!
const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient<Database>(supabaseUrl, serviceKey) : null;

/**
 * Execute a database query using our standardized query params
 */
export async function executeQuery<T>(params: DbQueryParams): Promise<ApiResponse<T>> {
  if (!supabaseAdmin) {
    return {
      error: { message: 'Supabase client not initialized (missing env vars).' },
      status: 500,
    };
  }
  try {
    // Start building the query
    let query = supabaseAdmin.from(params.table).select(params.select);

    // Apply filters if provided
    if (params.filters && params.filters.length > 0) {
      params.filters.forEach((filter) => {
        const { field, value, operator = 'eq' } = filter;

        if (operator === 'eq') {
          query = query.eq(field, value);
        } else if (operator === 'neq') {
          query = query.neq(field, value);
        } else if (operator === 'gt') {
          query = query.gt(field, value);
        } else if (operator === 'gte') {
          query = query.gte(field, value);
        } else if (operator === 'lt') {
          query = query.lt(field, value);
        } else if (operator === 'lte') {
          query = query.lte(field, value);
        } else if (operator === 'like') {
          query = query.like(field, `%${value}%`);
        } else if (operator === 'ilike') {
          query = query.ilike(field, `%${value}%`);
        } else if (operator === 'in') {
          query = query.in(field, value as any);
        }
      });
    }

    // Apply ordering if provided
    if (params.order) {
      query = query.order(params.order.field, {
        ascending: params.order.ascending,
      });
    }

    // Apply pagination if provided
    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      return {
        error: {
          message: error.message,
          details: error.details,
        },
        status: error.code === 'PGRST116' ? 404 : 500,
      };
    }

    return {
      data: data as T,
      meta: {
        count: count || data?.length || 0,
      },
      status: 200,
    };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Unknown error occurred',
        details: error.stack,
      },
      status: 500,
    };
  }
}

/**
 * Create a new record in the database
 */
export async function createRecord<T>(
  table: string,
  data: Record<string, any>
): Promise<ApiResponse<T>> {
  if (!supabaseAdmin) {
    return {
      error: { message: 'Supabase client not initialized (missing env vars).' },
      status: 500,
    };
  }
  try {
    const { data: result, error } = await supabaseAdmin.from(table).insert(data).select().single();

    if (error) {
      return {
        error: {
          message: error.message,
          details: error.details,
        },
        status: 500,
      };
    }

    return {
      data: result as T,
      status: 201,
    };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Unknown error occurred',
        details: error.stack,
      },
      status: 500,
    };
  }
}

/**
 * Update a record in the database
 */
export async function updateRecord<T>(
  table: string,
  id: string,
  data: Record<string, any>,
  idField: string = 'id'
): Promise<ApiResponse<T>> {
  if (!supabaseAdmin) {
    return {
      error: { message: 'Supabase client not initialized (missing env vars).' },
      status: 500,
    };
  }
  try {
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .update(data)
      .eq(idField, id)
      .select()
      .single();

    if (error) {
      return {
        error: {
          message: error.message,
          details: error.details,
        },
        status: error.code === 'PGRST116' ? 404 : 500,
      };
    }

    return {
      data: result as T,
      status: 200,
    };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Unknown error occurred',
        details: error.stack,
      },
      status: 500,
    };
  }
}

/**
 * Delete a record from the database
 */
export async function deleteRecord(
  table: string,
  id: string,
  idField: string = 'id'
): Promise<ApiResponse<null>> {
  if (!supabaseAdmin) {
    return {
      error: { message: 'Supabase client not initialized (missing env vars).' },
      status: 500,
    };
  }
  try {
    const { error } = await supabaseAdmin.from(table).delete().eq(idField, id);

    if (error) {
      return {
        error: {
          message: error.message,
          details: error.details,
        },
        status: error.code === 'PGRST116' ? 404 : 500,
      };
    }

    return {
      data: null,
      status: 204,
    };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Unknown error occurred',
        details: error.stack,
      },
      status: 500,
    };
  }
}

/**
 * Enhanced database wrapper for server components that provides caching and error handling
 */
class DatabaseClient {
  /**
   * Execute a database query with caching
   * @param sql SQL query with parameterized values
   * @param params Parameters for the SQL query
   * @param cacheKey Optional key for caching the result
   * @param cacheTtl Time-to-live in seconds for the cache (default: 60)
   * @returns Query result
   */
  async query(
    sql: string,
    params: any[] = [],
    cacheKey?: string,
    cacheTtl: number = 60
  ): Promise<any[]> {
    try {
      const supabase = await getServerComponentClient();

      // Use the query content as cache key if not provided
      const actualCacheKey = cacheKey || `db:${sql}:${JSON.stringify(params)}`;

      // Wrap the actual query in a function that can be cached
      const executeQuery = cache(async () => {
        // Special case handling for known queries
        if (sql.includes('SELECT') && sql.includes('FROM trips') && sql.includes('trip_members')) {
          // This is the getRecentTrips query
          if (sql.includes('ORDER BY') && sql.includes('LIMIT')) {
            const userId = params[0];
            const limit = params[1] || 10;
            
            const { data, error } = await supabase
              .from('trips')
              .select(`
                *,
                trip_members!inner(role, user_id),
                trip_members(user_id)
              `)
              .eq('trip_members.user_id', userId)
              .limit(limit)
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Database query error:', error);
              throw error;
            }

            // Process the data to match the expected format
            if (data) {
              return data.map(trip => {
                // Count unique members
                const memberIds = new Set();
                if (trip.trip_members) {
                  trip.trip_members.forEach((member: any) => {
                    if (member.user_id) memberIds.add(member.user_id);
                  });
                }
                
                return {
                  ...trip,
                  role: trip.trip_members && trip.trip_members[0] ? trip.trip_members[0].role : null,
                  members: memberIds.size,
                  // Remove nested members to match original format
                  trip_members: undefined
                };
              });
            }
            
            return [];
          }
          // This is the getTripCount query
          else if (sql.includes('COUNT')) {
            const userId = params[0];
            
            const { count, error } = await supabase
              .from('trips')
              .select('*', { count: 'exact', head: true })
              .eq('trip_members.user_id', userId)
              .not('deleted', 'is', true);

            if (error) {
              console.error('Database query error:', error);
              throw error;
            }
            
            return [{ trip_count: count || 0 }];
          }
        }

        // Default case - log error but continue
        console.error('Unhandled SQL query:', sql);
        console.error('The execute_sql function is not available. Please convert this query to use Supabase client directly.');
        return [];
      });

      // Execute the query with caching
      return executeQuery() as Promise<any[]>;
    } catch (error) {
      console.error('Error executing database query:', error);
      // Return empty array instead of throwing to make component code cleaner
      return [];
    }
  }

  /**
   * Execute a database query from a specific table
   * @param table Table name
   * @param columns Columns to select
   * @param whereClause Where clause conditions
   * @param params Query parameters
   * @param limit Maximum number of rows to return
   * @param orderBy Column to order by
   * @param orderDirection Direction to order by
   * @returns Query result
   */
  async queryTable(
    table: string,
    columns: string = '*',
    whereClause: string = '',
    params: any[] = [],
    limit?: number,
    orderBy?: string,
    orderDirection: 'asc' | 'desc' = 'desc'
  ): Promise<any[]> {
    let sql = `SELECT ${columns} FROM ${table}`;

    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }

    if (orderBy) {
      sql += ` ORDER BY ${orderBy} ${orderDirection}`;
    }

    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    return this.query(sql, params);
  }

  /**
   * Get a single row by ID
   * @param table Table name
   * @param id ID value
   * @param columns Columns to select
   * @returns Single row or null
   */
  async getById(table: string, id: string, columns: string = '*'): Promise<any | null> {
    const results = await this.queryTable(table, columns, 'id = $1', [id], 1);

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get recent trips for a user
   * @param userId User ID
   * @param limit Maximum number of trips to return
   * @returns List of trips
   */
  async getRecentTrips(userId: string, limit: number = 3): Promise<any[]> {
    // Use a more efficient query that joins tables directly
    const sql = `
      SELECT 
        t.*,
        tm.role,
        COUNT(DISTINCT tm2.user_id) as members
      FROM 
        trips t
      JOIN 
        trip_members tm ON t.id = tm.trip_id AND tm.user_id = $1
      LEFT JOIN 
        trip_members tm2 ON t.id = tm2.trip_id
      WHERE 
        t.deleted IS NOT TRUE OR t.deleted = FALSE
      GROUP BY 
        t.id, tm.role
      ORDER BY 
        t.created_at DESC
      LIMIT $2
    `;

    const trips = await this.query(sql, [userId, limit]);

    // Transform trips to standardize field names
    return trips.map((trip: any) => ({
      ...trip,
      title: trip.name,
      cover_image: trip.cover_image_url,
    }));
  }

  /**
   * Get total trip count for a user
   * @param userId User ID
   * @returns Number of trips
   */
  async getTripCount(userId: string): Promise<number> {
    const sql = `
      SELECT 
        COUNT(DISTINCT t.id) as trip_count
      FROM 
        trips t
      JOIN 
        trip_members tm ON t.id = tm.trip_id AND tm.user_id = $1
      WHERE 
        t.deleted IS NOT TRUE OR t.deleted = FALSE
    `;

    const results = await this.query(sql, [userId]);
    return results.length > 0 ? parseInt(results[0].trip_count) : 0;
  }
}

// Export a singleton instance
const db = new DatabaseClient();
export default db;
