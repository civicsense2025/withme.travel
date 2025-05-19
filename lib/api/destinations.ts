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
import { handleError, Result, Destination, PaginationParams, PaginationMeta, PaginatedResult } from './_shared';
import { z } from 'zod';

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
): Promise<Result<{ destinations: Destination[]; total: number }>> {
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
      .order('popular_index', { ascending: false, nullsLast: true })
      .order('name')
      .range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) return { success: false, error: error.message };
    
    return { 
      success: true, 
      data: { 
        destinations: data || [], 
        total: count || 0 
      } 
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch destinations');
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
): Promise<Result<{ destinations: Destination[]; nextCursor?: string; prevCursor?: string }>> {
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
    } else {
      // No cursor, get first/last page
      query = query.order('created_at', { ascending: direction === 'next' })
                  .order('id', { ascending: direction === 'next' });
    }
    
    // Execute the query with limit + 1 to determine if there are more pages
    const { data, error } = await query.limit(limit + 1);
    
    if (error) return { success: false, error: error.message };
    
    // Check if there are more results
    const hasMore = data.length > limit;
    const destinations = hasMore ? data.slice(0, limit) : data;
    
    // Create next/prev cursors
    let nextCursor, prevCursor;
    
    if (destinations.length > 0) {
      if (hasMore) {
        const lastItem = destinations[destinations.length - 1];
        nextCursor = Buffer.from(
          JSON.stringify({ id: lastItem.id, created_at: lastItem.created_at })
        ).toString('base64');
      }
      
      const firstItem = destinations[0];
      prevCursor = Buffer.from(
        JSON.stringify({ id: firstItem.id, created_at: firstItem.created_at })
      ).toString('base64');
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
    return handleError(error, 'Failed to fetch destinations');
  }
}

/**
 * Get a single destination by ID.
 * @param destinationId - The destination's unique identifier
 * @returns Result containing the destination
 */
export async function getDestination(destinationId: string): Promise<Result<Destination>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .eq('id', destinationId)
      .single();
      
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Destination not found' };
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch destination');
  }
}

/**
 * Get a destination by slug.
 * @param slug - The destination's URL slug
 * @returns Result containing the destination
 */
export async function getDestinationBySlug(slug: string): Promise<Result<Destination>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.DESTINATIONS)
      .select('*')
      .eq('slug', slug)
      .single();
      
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Destination not found' };
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch destination by slug');
  }
}

/**
 * Create a new destination with validation.
 * @param data - The destination data
 * @returns Result containing the created destination
 */
export async function createDestination(data: Partial<Destination>): Promise<Result<Destination>> {
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
    
    return { success: true, data: newDestination };
  } catch (error) {
    return handleError(error, 'Failed to create destination');
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
): Promise<Result<Destination>> {
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
    
    return { success: true, data: updatedDestination };
  } catch (error) {
    return handleError(error, 'Failed to update destination');
  }
}

/**
 * Delete a destination by ID.
 * @param destinationId - The destination's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteDestination(destinationId: string): Promise<Result<null>> {
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
    return handleError(error, 'Failed to delete destination');
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
export async function getPopularDestinations(limit: number = 10): Promise<Result<Destination[]>> {
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
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch popular destinations');
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
): Promise<Result<Destination>> {
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
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to update destination popularity');
  }
}

/**
 * Get destinations grouped by region.
 * @param countryCode - Optional country code to filter by
 * @returns Result containing destinations grouped by region
 */
export async function getDestinationsByRegion(countryCode?: string): Promise<Result<Record<string, Destination[]>>> {
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
    
    // Group destinations by region
    const groupedByRegion: Record<string, Destination[]> = {};
    
    data?.forEach(destination => {
      const region = destination.region || 'Other';
      if (!groupedByRegion[region]) {
        groupedByRegion[region] = [];
      }
      groupedByRegion[region].push(destination);
    });
    
    return { success: true, data: groupedByRegion };
  } catch (error) {
    return handleError(error, 'Failed to fetch destinations by region');
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
): Promise<Result<Destination[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Use a database function to calculate distances
    const { data, error } = await supabase.rpc('get_nearby_destinations', {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm,
      result_limit: limit
    });
    
    if (error) {
      // Fall back to a less efficient method if the RPC fails
      console.warn('RPC get_nearby_destinations failed, using fallback method:', error);
      
      // Get all destinations with coordinates
      const { data: allDestinations, error: fetchError } = await supabase
        .from(TABLES.DESTINATIONS)
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
        
      if (fetchError) return { success: false, error: fetchError.message };
      
      // Calculate distances manually (not as efficient as doing it in the database)
      const destinationsWithDistance = allDestinations.map(dest => {
        const distance = calculateDistance(
          latitude, longitude, 
          dest.latitude!, dest.longitude!
        );
        return { ...dest, distance };
      });
      
      // Filter and sort by distance
      const nearby = destinationsWithDistance
        .filter(dest => dest.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
        
      return { success: true, data: nearby };
    }
    
    return { success: true, data: data || [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch nearby destinations');
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