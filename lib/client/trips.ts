/**
 * Trips API Client
 * 
 * Client-side wrapper for the Trips API providing type-safe access to trip operations
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import { handleApiResponse } from './index';
import { API_SETTINGS } from '@/utils/constants/api';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Trip type definition
 */
export interface Trip {
  id: string;
  name: string;
  title?: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
  destination_name?: string | null;
  destination_id?: string | null;
  cover_image_url?: string | null;
  is_public: boolean;
  status?: 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | null;
  city_id?: string | null;
  color_scheme?: string | null;
  budget?: string | null;
  cover_image_position_y?: number | null;
  comments_count?: number | null;
  view_count?: number | null;
}

/**
 * Parameters for trip list operations
 */
export interface TripListParams {
  limit?: number;
  offset?: number;
  includeShared?: boolean;
}

/**
 * Create trip parameters
 */
export type CreateTripParams = Omit<Trip, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * List trips for the current user
 */
export async function listTrips(params: TripListParams = {}): Promise<Result<Trip[]>> {
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.includeShared) queryParams.append('includeShared', 'true');
  
  const url = `/api/trips${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return tryCatch(
    fetch(url, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Trip[]>(response))
  );
}

/**
 * Get a single trip by ID
 */
export async function getTrip(tripId: string): Promise<Result<Trip>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Trip>(response))
  );
}

/**
 * Create a new trip
 */
export async function createTrip(data: CreateTripParams): Promise<Result<Trip>> {
  return tryCatch(
    fetch('/api/trips', {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data)
    }).then((response) => handleApiResponse<Trip>(response))
  );
}

/**
 * Update an existing trip
 */
export async function updateTrip(tripId: string, data: Partial<Trip>): Promise<Result<Trip>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}`, {
      method: 'PATCH',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data)
    }).then((response) => handleApiResponse<Trip>(response))
  );
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId: string): Promise<Result<void>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}`, {
      method: 'DELETE',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<void>(response))
  );
}

/**
 * List public trips
 */
export async function listPublicTrips(params: TripListParams = {}): Promise<Result<Trip[]>> {
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  
  return tryCatch(
    fetch(`/api/trips/public?${queryParams.toString()}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Trip[]>(response))
  );
}

/**
 * Get a trip with full details including members, itinerary, etc.
 */
export async function getTripWithDetails(tripId: string): Promise<Result<Trip & {
  cities?: any[];
  members?: any[];
}>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/details`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Trip & {
      cities?: any[];
      members?: any[];
    }>(response))
  );
}

/**
 * Update a trip with detailed information
 */
export async function updateTripWithDetails(
  tripId: string, 
  data: Partial<Trip> & { cities?: any[]; }
): Promise<Result<Trip>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/details`, {
      method: 'PATCH',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data)
    }).then((response) => handleApiResponse<Trip>(response))
  );
}

/**
 * Duplicate a trip
 */
export async function duplicateTrip(tripId: string, newName?: string): Promise<Result<Trip>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/duplicate`, {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({ newName })
    }).then((response) => handleApiResponse<Trip>(response))
  );
}

/**
 * Archive a trip
 */
export async function archiveTrip(tripId: string): Promise<Result<Trip>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/archive`, {
      method: 'PATCH',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Trip>(response))
  );
}

/**
 * Toggle a trip's public status
 */
export async function toggleTripPublic(tripId: string, isPublic: boolean): Promise<Result<Trip>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/public`, {
      method: 'PATCH',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({ isPublic })
    }).then((response) => handleApiResponse<Trip>(response))
  );
} 