/**
 * Places API Client
 *
 * Client-side wrapper for Places API endpoints
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';
import type { Place, CreatePlaceInput, PlaceWithTrips } from '@/types/places';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parameters for listing places
 */
export interface ListPlacesParams {
  destinationId?: string;
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * Search parameters
 */
export interface SearchPlacesParams {
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * Data for creating a new place
 */
export interface CreatePlaceData {
  name: string;
  description?: string;
  category: string;
  address?: string;
  price_level?: number;
  destination_id: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  phone_number?: string;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * List places with optional filtering
 */
export async function listPlaces(params?: ListPlacesParams): Promise<Result<Place[]>> {
  const searchParams = new URLSearchParams();

  if (params?.destinationId) searchParams.set('destination_id', params.destinationId);
  if (params?.query) searchParams.set('q', params.query);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const queryString = searchParams.toString();
  const url = queryString ? `${API_ROUTES.PLACES}?${queryString}` : API_ROUTES.PLACES;

  return tryCatch(
    fetch(url, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<Place[]>(response))
  );
}

/**
 * Get place details by ID
 */
export async function getPlace(placeId: string): Promise<Result<Place>> {
  return tryCatch(
    fetch(API_ROUTES.PLACE_DETAILS(placeId), {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<Place>(response))
  );
}

/**
 * Create a new place
 */
export async function createPlace(data: Partial<Place>): Promise<Result<Place>> {
  return tryCatch(
    fetch(API_ROUTES.PLACES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<Place>(response))
  );
}

/**
 * Update an existing place
 */
export async function updatePlace(
  placeId: string,
  data: Partial<Place>
): Promise<Result<Place>> {
  return tryCatch(
    fetch(API_ROUTES.PLACE_DETAILS(placeId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<Place>(response))
  );
}

/**
 * Delete a place
 */
export async function deletePlace(placeId: string): Promise<Result<void>> {
  return tryCatch(
    fetch(API_ROUTES.PLACE_DETAILS(placeId), {
      method: 'DELETE',
    }).then((response) => handleApiResponse<void>(response))
  );
}

/**
 * Lookup or create a place
 */
export async function lookupOrCreatePlace(data: {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
}): Promise<Result<Place>> {
  return tryCatch(
    fetch(API_ROUTES.PLACE_LOOKUP_OR_CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<Place>(response))
  );
}

/**
 * Search for places
 */
export async function searchPlaces(
  query: string,
  params?: SearchPlacesParams
): Promise<Result<Place[]>> {
  const searchParams = new URLSearchParams({
    q: query,
  });

  if (params?.category) searchParams.set('category', params.category);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  return tryCatch(
    fetch(`${API_ROUTES.PLACES}?${searchParams.toString()}`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<Place[]>(response))
  );
}

/**
 * Get place categories
 */
export async function getPlaceCategories(): Promise<Result<string[]>> {
  return tryCatch(
    Promise.resolve({
      attraction: 'Attraction',
      restaurant: 'Restaurant',
      cafe: 'Café',
      hotel: 'Hotel',
      landmark: 'Landmark',
      shopping: 'Shopping',
      transport: 'Transport',
      other: 'Other',
    }).then((categories) => Object.keys(categories))
  );
}

/**
 * Import places from CSV
 */
export async function importPlacesFromCSV(
  destinationId: string,
  csvFile: File
): Promise<Result<{ added: number; errors: any[] }>> {
  if (!destinationId) {
    return {
      success: false,
      error: 'Destination ID is required',
    };
  }

  const formData = new FormData();
  formData.append('file', csvFile);
  formData.append('destination_id', destinationId);

  return tryCatch(
    fetch(`${API_ROUTES.PLACES}/import-csv`, {
      method: 'POST',
      body: formData,
    }).then((response) => handleApiResponse<{ added: number; errors: any[] }>(response))
  );
}

/**
 * Get places with associated trips for a specific trip
 */
export async function getPlacesWithTrips(tripId: string): Promise<Result<PlaceWithTrips[]>> {
  if (!tripId) {
    return {
      success: false,
      error: 'Trip ID is required',
    };
  }

  return tryCatch(
    fetch(`${API_ROUTES.PLACES}/with-trips?trip_id=${tripId}`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<PlaceWithTrips[]>(response))
  );
}

export type { Result } from '@/lib/client/result';
