/**
 * Places API Client
 *
 * Client-side wrapper for Places API endpoints
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import { handleApiResponse } from './index';
import type { Place as PlaceType } from '@/types/places';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Place type definition
 */
export interface Place {
  id: string;
  name: string;
  description: string | null;
  category: string;
  address: string | null;
  price_level: number | null;
  destination_id: string;
  is_verified: boolean;
  suggested_by: string | null;
  source: string;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  rating_count: number;
  place_type?: string | null;
  website?: string | null;
  phone_number?: string | null;
}

/**
 * Parameters for listing places
 */
export interface ListPlacesParams {
  destinationId: string;
  query?: string;
  type?: string;
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
export async function listPlaces(params?: {
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Result<PlaceType[]>> {
  const searchParams = new URLSearchParams();

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
    }).then((response) => handleApiResponse<PlaceType[]>(response))
  );
}

/**
 * Get place details by ID
 */
export async function getPlace(placeId: string): Promise<Result<PlaceType>> {
  return tryCatch(
    fetch(API_ROUTES.PLACE_DETAILS(placeId), {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<PlaceType>(response))
  );
}

/**
 * Create a new place
 */
export async function createPlace(data: Partial<PlaceType>): Promise<Result<PlaceType>> {
  return tryCatch(
    fetch(API_ROUTES.PLACES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<PlaceType>(response))
  );
}

/**
 * Update an existing place
 */
export async function updatePlace(
  placeId: string,
  data: Partial<PlaceType>
): Promise<Result<PlaceType>> {
  return tryCatch(
    fetch(API_ROUTES.PLACE_DETAILS(placeId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<PlaceType>(response))
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
}): Promise<Result<PlaceType>> {
  return tryCatch(
    fetch(API_ROUTES.PLACE_LOOKUP_OR_CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<PlaceType>(response))
  );
}

/**
 * Search for places
 */
export async function searchPlaces(
  query: string,
  params?: {
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Result<PlaceType[]>> {
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
    }).then((response) => handleApiResponse<PlaceType[]>(response))
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
      error: new Error('Destination ID is required'),
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

export type { Result } from '@/lib/client/result';
