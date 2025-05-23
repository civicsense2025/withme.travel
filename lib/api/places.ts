/**
 * Places API
 *
 * Provides CRUD operations and custom actions for places (POIs, venues, etc.).
 * Used for managing place search, details, and collaborative trip planning.
 *
 * @module lib/api/places
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================
'use server'
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, Place } from './_shared';
import { cookies } from 'next/headers';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all places for a trip or search query.
 * @param params - Query/filter parameters (TODO: define type)
 * @returns Result containing an array of places
 */
export async function listPlaces(params: any): Promise<Result<Place[]>> {
  const cookieStore = cookies();
  const supabase = await createRouteHandlerClient();
  try {
    // TODO: Add search/filter logic based on params
    const { data, error } = await supabase.from(TABLES.PLACES).select('*');
    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch places');
  }
}

/**
 * Get a single place by ID.
 * @param placeId - The place's unique identifier
 * @returns Result containing the place
 */
export async function getPlace(placeId: string): Promise<Result<Place>> {
  const cookieStore = await cookies();
  const supabase = await createRouteHandlerClient();
  try {
    const { data, error } = await supabase
      .from(TABLES.PLACES)
      .select('*')
      .eq('id', placeId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Place not found' };
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch place');
  }
}

/**
 * Create a new place.
 * @param data - The place data
 * @returns Result containing the created place
 */
export async function createPlace(data: Partial<Place>): Promise<Result<Place>> {
  const cookieStore = await cookies();
  const supabase = await createRouteHandlerClient();
  try {
    const { data: newPlace, error } = await supabase
      .from(TABLES.PLACES)
      .insert(data)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newPlace };
  } catch (error) {
    return handleError(error, 'Failed to create place');
  }
}

/**
 * Update an existing place.
 * @param placeId - The place's unique identifier
 * @param data - Partial place data to update
 * @returns Result containing the updated place
 */
export async function updatePlace(placeId: string, data: Partial<Place>): Promise<Result<Place>> {
  const cookieStore = await cookies();
  const supabase = await createRouteHandlerClient();
  try {
    const { data: updatedPlace, error } = await supabase
      .from(TABLES.PLACES)
      .update(data)
      .eq('id', placeId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedPlace };
  } catch (error) {
    return handleError(error, 'Failed to update place');
  }
}

/**
 * Delete a place by ID.
 * @param placeId - The place's unique identifier
 * @returns Result indicating success or failure
 */
export async function deletePlace(placeId: string): Promise<Result<null>> {
  const cookieStore = await cookies();  
  const supabase = await createRouteHandlerClient();
  try {
    const { error } = await supabase.from(TABLES.PLACES).delete().eq('id', placeId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete place');
  }
}

/**
 * Type guard to check if an object is a Place
 */
export async function isPlace(obj: any): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = await createRouteHandlerClient();
  const { data, error } = await supabase.from(TABLES.PLACES).select('*').eq('id', obj.id).single();
  return !!data;
}

// (Add more as needed)
