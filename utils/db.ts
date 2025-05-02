import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { ApiResponse, DbQueryParams } from './types';
import type { Database } from '@/types/database.types';
import { getServerComponentClient } from '@/utils/supabase/unified';
import { cache } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { TABLES } from '@/utils/constants/database';


// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

// Define interfaces for our data types
interface TripMember {
  trip_id: string;
  user_id: string;
  role: string;
}

interface Trip {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  destination?: string;
  created_by?: string;
  is_public?: boolean;
  cover_image_url?: string;
  cover_image?: string;
  created_at?: string;
  updated_at?: string;
  deleted?: boolean;
  trip_members?: Array<{user_id: string; role?: string}>;
  [key: string]: any;
}

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
  private supabase: any;

  constructor() {
    // Initialize supabase client if in browser environment
    if (typeof window !== 'undefined') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = createBrowserClient(supabaseUrl, supabaseKey);
      }
    }
  }

  // Helper to get supabase client (server or client side)
  private async getSupabaseClient() {
    // If we already have a client (client-side), use it
    if (this.supabase) {
      return this.supabase;
    }
    
    // Otherwise create a server-side client
    try {
      return await getServerComponentClient();
    } catch (error) {
      console.error('Error creating supabase client:', error);
      throw error;
    }
  }

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
      const supabase = await this.getSupabaseClient();

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
              .select(
                `
                *,
                trip_members!inner(role, user_id),
                trip_members(user_id)
              `
              )
              .eq('trip_members.user_id', userId)
              .limit(limit)
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Database query error:', error);
              throw error;
            }

            // Process the data to match the expected format
            if (data) {
              return data.map((trip: Trip) => {
                // Count unique members
                const memberIds = new Set();
                if (trip.trip_members) {
                  trip.trip_members.forEach((member: {user_id: string}) => {
                    if (member.user_id) memberIds.add(member.user_id);
                  });
                }

                return {
                  ...trip,
                  role:
                    trip.trip_members && trip.trip_members[0] ? trip.trip_members[0].role : null,
                  members: memberIds.size,
                  // Remove nested members to match original format
                  trip_members: undefined,
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
        console.error(
          'The execute_sql function is not available. Please convert this query to use Supabase client directly.'
        );
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
  async getRecentTrips(userId: string, limit: number = 3): Promise<Trip[]> {
    try {
      const supabase = await this.getSupabaseClient();
      
      // First get trip IDs where user is a member
      const { data: memberTrips, error: memberError } = await supabase
        .from('trip_members')
        .select('trip_id, role')
        .eq('user_id', userId)
        .limit(limit);
      
      if (memberError || !memberTrips || memberTrips.length === 0) {
        console.error('Error fetching member trips:', memberError);
        return [];
      }
      
      // Get the trip IDs
      const tripIds = memberTrips.map((mt: TripMember) => mt.trip_id);
      const tripRoles = new Map(memberTrips.map((mt: TripMember) => [mt.trip_id, mt.role]));
      
      // Now fetch the actual trips
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*, trip_members(user_id)')
        .in('id', tripIds)
        .not('deleted', 'is', true)
        .order('created_at', { ascending: false });
        
      if (tripsError || !trips) {
        console.error('Error fetching trips:', tripsError);
        return [];
      }
      
      // Process trips to add member count and role information
      return trips.map((trip: Trip) => {
        const memberCount = trip.trip_members 
          ? new Set(trip.trip_members.map((m: {user_id: string}) => m.user_id)).size 
          : 0;
        
        return {
          ...trip,
          role: tripRoles.get(trip.id) || null,
          members: memberCount,
          title: trip.name || trip.title,
          cover_image: trip.cover_image_url || trip.cover_image,
          // Remove nested fields from the response
          trip_members: undefined
        };
      });
    } catch (error) {
      console.error('Error in getRecentTrips:', error);
      return [];
    }
  }

  /**
   * Get total trip count for a user
   * @param userId User ID
   * @returns Number of trips
   */
  async getTripCount(userId: string): Promise<number> {
    try {
      const supabase = await this.getSupabaseClient();
      
      // Use a more appropriate query that gets trips for a specific user
      const { count, error } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('trip_members.user_id', userId)
        .not('deleted', 'is', true);

      if (error) {
        console.error('Error fetching trip count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getTripCount:', error);
      return 0;
    }
  }
}

// Export a singleton instance
const db = new DatabaseClient();
export default db;
