/**
 * Trips API
 *
 * Provides CRUD operations and custom actions for trips.
 * Used for managing trip creation, updates, invitations, and collaborative features.
 *
 * @module lib/api/trips
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import type { Trip } from '@/utils/constants/database.types';
import { handleError, Result } from './_shared';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all trips for a user.
 * @param userId - The user's unique identifier
 * @returns Result containing an array of trips
 */
export async function listTrips(userId: string): Promise<Result<Trip[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .select('*')
      .eq('created_by', userId);
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch trips');
  }
}

/**
 * Get a single trip by ID.
 * @param tripId - The trip's unique identifier
 * @returns Result containing the trip
 */
export async function getTrip(tripId: string): Promise<Result<Trip>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: trip, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!trip) return { success: false, error: 'Trip not found' };
    return { success: true, data: trip };
  } catch (error) {
    return handleError(error, 'Failed to fetch trip');
  }
}

/**
 * Create a new trip.
 * @param data - The trip data
 * @returns Result containing the created trip
 */
export async function createTrip(data: Partial<Trip>): Promise<Result<Trip>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: newTrip, error } = await supabase
      .from(TABLES.TRIPS)
      .insert(data)
      .select('*')
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: newTrip };
  } catch (error) {
    return handleError(error, 'Failed to create trip');
  }
}

/**
 * Update an existing trip.
 * @param tripId - The trip's unique identifier
 * @param data - Partial trip data to update
 * @returns Result containing the updated trip
 */
export async function updateTrip(tripId: string, data: Partial<Trip>): Promise<Result<Trip>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: updatedTrip, error } = await supabase
      .from(TABLES.TRIPS)
      .update(data)
      .eq('id', tripId)
      .select('*')
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedTrip };
  } catch (error) {
    return handleError(error, 'Failed to update trip');
  }
}

/**
 * Delete a trip by ID.
 * @param tripId - The trip's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteTrip(tripId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);
    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete trip');
  }
}

/**
 * List all public trips with cities.
 * @param params - Pagination params
 * @returns Result containing an array of public trips with cities
 */
export async function listPublicTrips({ limit = 10, offset = 0 }: { limit?: number; offset?: number }): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .select(`*, cities:trip_cities(city:city_id(*))`)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return { success: false, error: error.message };
    // Flatten cities
    const trips = (data ?? []).map(trip => ({ ...trip, cities: (trip.cities || []).map((c: any) => c.city) }));
    return { success: true, data: trips };
  } catch (error) {
    return handleError(error, 'Failed to fetch public trips');
  }
}

/**
 * List all trips for a user, optionally including shared trips (where user is a member).
 * @param userId - The user's unique identifier
 * @param params - includeShared, limit, offset
 * @returns Result containing an array of trips with cities
 */
export async function listUserTripsWithMembership(
  userId: string,
  { includeShared = false, limit = 10, offset = 0 }: { includeShared?: boolean; limit?: number; offset?: number }
): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Get trips created by user
    let tripIds: string[] = [];
    if (includeShared) {
      const { data: memberTrips, error: memberError } = await supabase
        .from(TABLES.TRIP_MEMBERS)
        .select('trip_id')
        .eq('user_id', userId)
        .eq('status', 'active');
      if (memberError) return { success: false, error: memberError.message };
      tripIds = (memberTrips ?? []).map((m: any) => m.trip_id);
    }
    const filter = includeShared && tripIds.length > 0
      ? `created_by.eq.${userId},id.in.(${tripIds.join(',')})`
      : `created_by.eq.${userId}`;
    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .select(`*, cities:trip_cities(city:city_id(*))`)
      .or(filter)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return { success: false, error: error.message };
    const trips = (data ?? []).map(trip => ({ ...trip, cities: (trip.cities || []).map((c: any) => c.city) }));
    return { success: true, data: trips };
  } catch (error) {
    return handleError(error, 'Failed to fetch user trips');
  }
}

/**
 * Get a trip with all related data (members, cities, tags, etc.)
 * @param tripId - The trip's unique identifier
 * @returns Result containing the trip with details
 */
export async function getTripWithDetails(tripId: string): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    // TODO: Add tags, permissions, etc.
    const { data: trip, error } = await supabase
      .from(TABLES.TRIPS)
      .select(`*, cities:trip_cities(city:city_id(*)), members:trip_members(user_id, role, status, profiles:profiles(*))`)
      .eq('id', tripId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!trip) return { success: false, error: 'Trip not found' };
    return { success: true, data: {
      ...trip,
      cities: (trip.cities || []).map((c: any) => c.city),
      members: (trip.members || []).map((m: any) => ({ ...m, profile: m.profiles })),
    }};
  } catch (error) {
    return handleError(error, 'Failed to fetch trip details');
  }
}

/**
 * Update a trip and its related data (cities, tags, etc.)
 * @param tripId - The trip's unique identifier
 * @param data - Trip and related data
 * @returns Result containing the updated trip
 */
export async function updateTripWithDetails(tripId: string, data: any): Promise<Result<any>> {
  // TODO: Implement atomic update for trip, cities, tags, etc.
  // For now, just update trip main fields
  return updateTrip(tripId, data);
}
// (Add more as needed) 