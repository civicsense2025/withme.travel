/**
 * Destinations API
 *
 * Provides CRUD operations and custom actions for destinations.
 * Used for managing destination content, including city/country/region data and popularity.
 *
 * @module lib/api/destinations
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, Destination } from './_shared';
import { z } from 'zod';

// Define the missing PaginationParams type if not properly exported from _shared
interface PaginationParams {
  page?: number;
  limit?: number; // Using limit instead of pageSize
}

// Define the error result type to include details and code
interface ErrorResult {
  success: false;
  error: string;
  details?: any;
  code?: string;
}

// Extend the Result type to support error details
type ExtendedResult<T> = { success: true; data: T } | ErrorResult;

// Custom schemas for destinations
const destinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  country_code: z.string().length(2).optional().nullable(),
  region: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  popular_index: z.number().optional().nullable(),
  time_zone: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional().nullable()
});

const destinationFilterSchema = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  tags: z.array(z.string()).optional(),
  hasCoordinates: z.boolean().optional(),
  popularOnly: z.boolean().optional()
});

type DestinationFilters = z.infer<typeof destinationFilterSchema>;

// Define a database destination type that matches Supabase return values
interface DatabaseDestination {
  id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  popular_index: number | null;
  time_zone: string | null;
  image_url: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string | null;
  [key: string]: any; // For any additional fields
}

// Enhanced type for destination with distance property for nearby destinations
interface DestinationWithDistance extends Destination {
  distance: number;
}

// Helper function to convert database result to destination
function toDestination(dbDestination: DatabaseDestination): Destination {
  return {
    id: dbDestination.id,
    name: dbDestination.name || '',
    slug: dbDestination.slug || '',
    description: dbDestination.description || '',
    country_code: dbDestination.country_code || '',
    region: dbDestination.region || '',
    city: dbDestination.city || '',
    latitude: dbDestination.latitude || 0,
    longitude: dbDestination.longitude || 0,
    popular_index: dbDestination.popular_index || 0,
    time_zone: dbDestination.time_zone || '',
      image_url: dbDestination.image_url || '',
    tags: dbDestination.tags || [],
    created_at: dbDestination.created_at,
    updated_at: dbDestination.updated_at
  };
}

// Helper function for pagination
function getPaginationValues(pagination: PaginationParams): { limit: number; offset: number } {
  const { page = 1, limit = 20 } = pagination;
  const finalLimit = Math.min(Math.max(1, limit), 100); // Ensure reasonable limits
  const offset = (Math.max(1, page) - 1) * finalLimit;
  return { limit: finalLimit, offset };
}

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all destinations with advanced filtering and pagination.
 * @param filters - Query/filter parameters
 * @param pagination - Pagination options
 * @returns Result containing an array of destinations and total count
 */
export async function listDestinations(
  filters: DestinationFilters = {},
  pagination: PaginationParams = {}
): Promise<ExtendedResult<{ destinations: Destination[]; total: number }>> {
  try {
    // Validate filters
    const filterValidation = destinationFilterSchema.safeParse(filters);
    if (!filterValidation.success) {
      return {
        success: false,
        error: 'Invalid filter parameters',
        details: filterValidation.error.format()
      };
    }
    
    const { limit, offset } = getPaginationValues(pagination);
    const { search, country, region, tags, hasCoordinates, popularOnly } = filterValidation.data;
    
    const supabase = await createRouteHandlerClient();
    
    // Build query with filters
    let query = supabase
      .from(TABLES.DESTINATIONS)
      .select('*', { count: 'exact' });
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`);
    }
    
    if (country) {
      query = query.eq('country_code', country);
    }
    
    if (region) {
      query = query.eq('region', region);
    }
    
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }
    
    if (hasCoordinates) {
      query = query.not('latitude', 'is', null);
      query = query.not('longitude', 'is', null);
    }
    
    if (popularOnly) {
      query = query.gt('popular_index', 0);
    }
    
    // Apply pagination and order
    query = query
      .order('popular_index', { ascending: false })
      .order('name')
      .range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) return { success: false, error: error.message };
    
    // Convert database results to Destination type with proper type safety
    const destinations = (data || []).map((dbRow) => {
      const dbDestination = dbRow as unknown as DatabaseDestination;
      return toDestination(dbDestination);
    });
    
    return {
      success: true,
      data: {
        destinations,
        total: count || 0 
      } 
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch destinations') as ErrorResult;
  }
}

/**
 * Implements efficient cursor-based pagination for destinations
 */
export async function listDestinationsCursor(
  params: {
    limit?: number;
    cursor?: string;
    direction?: 'next' | 'prev';
    filters?: {
      region?: string;
      country_code?: string;
      tags?: string[];
      popularOnly?: boolean;
    }
  } = {}
): Promise<ExtendedResult<{ destinations: Destination[]; nextCursor?: string; prevCursor?: string }>> {
  try {
    const { 
      limit = 20, 
      cursor, 
      direction = 'next',
      filters = {} 
    } = params;
    
    const supabase = await createRouteHandlerClient();
    let query = supabase.from(TABLES.DESTINATIONS).select('*');
    
    // Apply filters
    if (filters.region) {
      query = query.eq('region', filters.region);
    }
    
    if (filters.country_code) {
      query = query.eq('country_code', filters.country_code);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    if (filters.popularOnly) {
      query = query.gt('popular_index', 0);
    }
    
    // Apply cursor-based pagination
    if (cursor) {
      try {
        // Parse the cursor to get the reference values
        const decodedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString());
        const { id, created_at } = decodedCursor;
        
        if (direction === 'next') {
          // Get items after the cursor
          query = query
            .or(`created_at.gt.${created_at},and(created_at.eq.${created_at},id.gt.${id})`)
            .order('created_at', { ascending: true })
            .order('id', { ascending: true });
        } else {
          // Get items before the cursor
          query = query
            .or(`created_at.lt.${created_at},and(created_at.eq.${created_at},id.lt.${id})`)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false });
        }
      } catch (err) {
        return { 
          success: false, 
          error: 'Invalid cursor format', 
          details: { message: (err as Error).message } 
        };
      }
    } else {
      // No cursor, get first/last page
      query = query.order('created_at', { ascending: direction === 'next' })
                  .order('id', { ascending: direction === 'next' });
    }
    
    // Execute the query with limit + 1 to determine if there are more pages
    const { data, error } = await query.limit(limit + 1);
    
    if (error) return { success: false, error: error.message };
    
    // Check if there are more results
    const hasMore = data && data.length > limit;
    const destinationsData = hasMore && data ? data.slice(0, limit) : data || [];
    
    // Convert database results to Destination type
    const destinations = destinationsData.map((dbRow) => {
      const dbDestination = dbRow as unknown as DatabaseDestination;
      return toDestination(dbDestination);
    });
    
    // Create next/prev cursors
    let nextCursor: string | undefined, prevCursor: string | undefined;
    
    if (destinations.length > 0) {
      if (hasMore) {
        const lastItem = destinationsData[destinationsData.length - 1];
        if (lastItem && lastItem.id && lastItem.created_at) {
          nextCursor = Buffer.from(
            JSON.stringify({ id: lastItem.id, created_at: lastItem.created_at })
          ).toString('base64');
        }
      }
      
      const firstItem = destinationsData[0];
      if (firstItem && firstItem.id && firstItem.created_at) {
        prevCursor = Buffer.from(
          JSON.stringify({ id: firstItem.id, created_at: firstItem.created_at })
        ).toString('base64');
      }
    }
    
    return { 
      success: true, 
      data: { 
        destinations, 
        nextCursor: hasMore ? nextCursor : undefined,
        prevCursor
      } 
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch destinations') as ErrorResult;
  }
}

/**
 * Get a single destination by ID.
 * @param destinationId - The destination's unique identifier
 * @returns Result containing the destination
 */
export async function getDestination(destinationId: string): Promise<ExtendedResult<Destination>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .eq('id', destinationId)
      .single();
      
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Destination not found' };
    
    // Convert database result to Destination type
    return { success: true, data:  toDestination(data as unknown as DatabaseDestination) };
  } catch (error) {
    return handleError(error, 'Failed to fetch destination') as ErrorResult;
  }
}

/**
 * Get a destination by slug.
 * @param slug - The destination's URL slug
 * @returns Result containing the destination
 */
export async function getDestinationBySlug(slug: string): Promise<ExtendedResult<Destination>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Destination not found' };
    
    // Convert database result to Destination type
    return { success: true, data: toDestination(data as unknown as DatabaseDestination) };
  } catch (error) {
    return handleError(error, 'Failed to fetch destination by slug') as ErrorResult;
  }
}

/**
 * Create a new destination with validation.
 * @param data - The destination data
 * @returns Result containing the created destination
 */
export async function createDestination(data: Partial<Destination>): Promise<ExtendedResult<Destination>> {
  try {
    // Validate input data
    const validationResult = destinationSchema.safeParse(data);
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid destination data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    
    // Check if slug already exists
    const { data: existingSlug } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('id')
      .eq('slug', data.slug)
      .maybeSingle();
      
    if (existingSlug) {
      return { 
        success: false, 
        error: 'Destination with this slug already exists',
        code: 'DUPLICATE_SLUG' 
      };
    }
    
    const { data: newDestination, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .insert(validationResult.data)
      .select('*')
      .single();
      
    if (error) return { success: false, error: error.message };
    
    // Convert database result to Destination type
    return { success: true, data: toDestination(newDestination as unknown as DatabaseDestination) };
  } catch (error) {
    return handleError(error, 'Failed to create destination') as ErrorResult;
  }
}

/**
 * Update an existing destination with validation.
 * @param destinationId - The destination's unique identifier
 * @param data - Partial destination data to update
 * @returns Result containing the updated destination
 */
export async function updateDestination(
  destinationId: string,
  data: Partial<Destination>
): Promise<ExtendedResult<Destination>> {
  try {
    // Partial validation
    const partialDestinationSchema = destinationSchema.partial();
    const validationResult = partialDestinationSchema.safeParse(data);
    
    if (!validationResult.success) {
      return { 
        success: false, 
        error: 'Invalid destination data', 
        details: validationResult.error.format() 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    
    // If slug is being updated, check if it already exists
    if (data.slug) {
      const { data: existingSlug } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('id')
        .eq('slug', data.slug)
        .neq('id', destinationId)
        .maybeSingle();
        
      if (existingSlug) {
        return { 
          success: false, 
          error: 'Destination with this slug already exists',
          code: 'DUPLICATE_SLUG' 
        };
      }
    }
    
    const { data: updatedDestination, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .update({
        ...validationResult.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', destinationId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    if (!updatedDestination) return { success: false, error: 'Destination not found' };
    
    // Convert database result to Destination type
    return { success: true, data: toDestination(updatedDestination as unknown as DatabaseDestination) };
  } catch (error) {
    return handleError(error, 'Failed to update destination') as ErrorResult;
  }
}

/**
 * Delete a destination by ID.
 * @param destinationId - The destination's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteDestination(destinationId: string): Promise<ExtendedResult<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Check for references before deleting
    const { count: tripCount, error: tripError } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('destination_id', destinationId);
      
    if (tripError) return { success: false, error: tripError.message };
    
    if (tripCount && tripCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete destination: it is used by ${tripCount} trips`,
        code: 'REFERENCED_BY_TRIPS'
      };
    }
    
    // Delete the destination
    const { error } = await supabase
      .from(TABLES.DESTINATIONS)
      .delete()
      .eq('id', destinationId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete destination') as ErrorResult;
  }
}

// ============================================================================
// CUSTOM ACTIONS
// ============================================================================

/**
 * Get a list of popular destinations with caching.
 * @param limit - Maximum number of destinations to return
 * @returns Result containing an array of popular destinations
 */
export async function getPopularDestinations(limit: number = 10): Promise<ExtendedResult<Destination[]>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Query destinations with popularity index
    const { data, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .gt('popular_index', 0)
      .order('popular_index', { ascending: false })
      .limit(limit);

    if (error) return { success: false, error: error.message };    
    // Convert database results to Destination type with proper type assertion
    const destinations = (data || []).map((dbDest) => 
      toDestination(dbDest as unknown as DatabaseDestination)
    );
    
    return { success: true, data: destinations };
  } catch (error) {
    return handleError(error, 'Failed to fetch popular destinations') as ErrorResult;
  }
}

/**
 * Update destination popularity index.
 * @param destinationId - The destination's unique identifier
 * @param popularityIndex - New popularity index value
 * @returns Result containing the updated destination
 */
export async function updateDestinationPopularity(
  destinationId: string,
  popularityIndex: number
): Promise<ExtendedResult<Destination>> {
  try {
    // Validate input
    if (popularityIndex < 0) {
      return { 
        success: false, 
        error: 'Popularity index must be a non-negative number' 
      };
    }
    
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .update({ 
        popular_index: popularityIndex,
        updated_at: new Date().toISOString()
      })
      .eq('id', destinationId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Destination not found' };
    
    // Convert database result to Destination type
    return { success: true, data: toDestination(data as unknown as DatabaseDestination) };
  } catch (error) {
    return handleError(error, 'Failed to update destination popularity') as ErrorResult;
  }
}

/**
 * Get destinations grouped by region.
 * @param countryCode - Optional country code to filter by
 * @returns Result containing destinations grouped by region
 */
export async function getDestinationsByRegion(
  countryCode?: string
): Promise<ExtendedResult<Record<string, Destination[]>>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Build the query
    let query = supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .not('region', 'is', null)
      .order('name');
      
    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }
    
    const { data, error } = await query;
    
    if (error) return { success: false, error: error.message };
    
    // Convert database results to Destination type
    const destinations = (data || []).map((dbRow) => {
      const dbDestination = dbRow as unknown as DatabaseDestination;
      return toDestination(dbDestination);
    });
    
    // Group destinations by region
    const groupedByRegion: Record<string, Destination[]> = {};
    
    destinations.forEach(destination => {
      const region = destination.region || 'Other';
      if (!groupedByRegion[region]) {
        groupedByRegion[region] = [];
      }
      groupedByRegion[region].push(destination);
    });
    
    return { success: true, data: groupedByRegion };
  } catch (error) {
    return handleError(error, 'Failed to fetch destinations by region') as ErrorResult;
  }
}

/**
 * Get destinations near specified coordinates.
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radiusKm - Search radius in kilometers
 * @param limit - Maximum number of results
 * @returns Result containing nearby destinations
 */
export async function getNearbyDestinations(
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  limit: number = 5
): Promise<ExtendedResult<DestinationWithDistance[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Instead of using RPC which may not be defined in types, use a custom query
    // Note: You would need to create this function in your Supabase database
    // or switch to the approach in the fallback code
    try {
      // This is a hypothetical call - your actual implementation may differ
      const { data, error } = await supabase.from(TABLES.DESTINATIONS)
        .select('*, earth_distance(ll_to_earth($1, $2), ll_to_earth(latitude, longitude)) as distance', {
          count: 'exact'
        })
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('distance')
        .limit(limit)
        .lte('distance', radiusKm * 1000) // Use the computed distance column directly
        .eq('latitude', latitude) // Explicitly filter by coordinates
        .eq('longitude', longitude);
        
      if (error) throw error;
      
      const destinations = (data || []).map((item: unknown) => {
        const dbDestination = item as DatabaseDestination;
        const dest = toDestination(dbDestination);
        return {
          ...dest,
          distance: Number(dbDestination.distance || 0) / 1000 // Convert to km
        };
      });
        
      return { success: true, data: destinations };
    } catch (rpcError) {
      // Fall back to a less efficient method
      console.warn('Custom distance query failed, using fallback method:', rpcError);
      
      // Get all destinations with coordinates
      const { data: allDestinations, error: fetchError } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
        
      if (fetchError) return { success: false, error: fetchError.message };
      
      if (!allDestinations || allDestinations.length === 0) {
        return { success: true, data: [] };
      }
      
      // Calculate distances manually
      const destinationsWithDistance: DestinationWithDistance[] = allDestinations
        .filter((dest): dest is typeof allDestinations[0] => 
          dest !== null && 
          typeof dest.latitude === 'number' && 
          typeof dest.longitude === 'number'
        )
        .map(dest => {
          const distance = calculateDistance(
            latitude, 
            longitude, 
            dest.latitude ?? 0, // Provide fallback for null values
            dest.longitude ?? 0 // Provide fallback for null values
          );
          return {
            ...toDestination(dest as unknown as DatabaseDestination),
            distance
          };
        });
      
      // Filter and sort by distance
      const nearby = destinationsWithDistance
        .filter(dest => dest.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
        
      return { success: true, data: nearby };
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch nearby destinations') as ErrorResult;
  }
}

/**
 * Helper function to calculate distance between coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Type guard to check if an object is a Destination
 */
export function isDestination(obj: any): obj is Destination {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.name === 'string' &&
    typeof obj.slug === 'string';
}