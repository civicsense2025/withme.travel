import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { ApiResponse, DbQueryParams } from './types';
import type { Database } from '@/types/database.types';
import { createServerComponentClient } from '@/utils/supabase/server';
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
        count: count || data?.length || 0
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
    const {data: { result, error }} = await supabaseAdmin.from(table).insert(data).select().single();

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
    const {data: { result, error }} = await supabaseAdmin
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
 * Get recent trips for a user (Standalone Server Function)
 * @param userId User ID
 * @param limit Maximum number of trips to return
 * @returns List of trips
 */
export async function getRecentTripsDB(userId: string, limit: number = 3): Promise<Trip[]> {
  console.log(`[db] Fetching recent trips for user ${userId}`);
  try {
    // Use the server-specific client creator
    const supabase = await createServerComponentClient();
    if (!supabase) {
      throw new Error('Failed to get Supabase client for server component');
    }

    // Fetch membership first
    const { data: members, error: membersError } = await supabase
      .from(Tables.TRIP_MEMBERS)
      .select('trip_id')
      .eq('user_id', userId);

    if (membersError) {
      console.error('[db] Error fetching user trip memberships:', membersError);
      throw membersError;
    }

    if (!members || members.length === 0) {
      console.log(`[db] User ${userId} is not part of any trips.`);
      return []; // User is not part of any trips
    }

    const tripIds = members.map((m: { trip_id: string }) => m.trip_id);
    console.log(`[db] User ${userId} is member of trip IDs:`, tripIds);

    // Fetch trips
    const { data: trips, error: tripsError } = await supabase
      .from(Tables.TRIPS)
      .select(`
        id,
        name,
        destination_id,
        destination_name,
        start_date,
        end_date,
        cover_image_url,
        created_at,
        updated_at,
        is_public,
        slug
      `)
      .in('id', tripIds)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (tripsError) {
      console.error('[db] Error fetching trip details:', tripsError);
      throw tripsError;
    }

    console.log(`[db] Found ${trips?.length || 0} recent trips for user ${userId}`);
    return (trips as Trip[]) || []; // Cast to Trip[]

  } catch (error) {
    console.error('[db] Error in getRecentTripsDB:', error);
    // Re-throw to allow higher-level error handling (e.g., in Server Action)
    // Return empty array as fallback if needed by calling component
    // throw error;
    return []; // Return empty array to prevent crash, log happened above
  }
}

/**
 * Get total trip count for a user (Standalone Server Function)
 * @param userId User ID
 * @returns Number of trips
 */
export async function getTripCountDB(userId: string): Promise<number> {
  console.log(`[db] Fetching trip count for user ${userId}`);
  try {
    // Use the server-specific client creator
    const supabase = await createServerComponentClient();
    if (!supabase) {
      throw new Error('Failed to get Supabase client for server component');
    }

    // Simpler count query using trip_members join
    const { count, error } = await supabase
      .from(Tables.TRIP_MEMBERS)
      .select('trip_id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('[db] Error fetching trip count:', error);
      return 0;
    }

    console.log(`[db] User ${userId} has ${count} trips.`);
    return count || 0;

  } catch (error) {
    console.error('[db] Error in getTripCountDB:', error);
    return 0;
  }
}