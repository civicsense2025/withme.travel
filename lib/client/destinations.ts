/**
 * Destinations API client functions
 *
 * Client-side wrappers for destination-related API calls
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';

// ============================================================================
// TYPES
// ============================================================================

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description?: string;
  country?: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  hero_image_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DestinationFilter {
  search?: string;
  country?: string;
  region?: string;
  tags?: string[];
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateDestinationData {
  name: string;
  slug?: string;
  description?: string;
  country?: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  hero_image_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  is_featured?: boolean;
}

export interface UpdateDestinationData {
  name?: string;
  slug?: string;
  description?: string;
  country?: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  hero_image_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  is_featured?: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get a list of destinations with optional filters
 * @param filters - Optional filters to apply
 */
export async function listDestinations(
  filters: DestinationFilter = {}
): Promise<Result<Destination[]>> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.country) params.append('country', filters.country);
  if (filters.region) params.append('region', filters.region);
  if (filters.tags) filters.tags.forEach((tag) => params.append('tags', tag));
  if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';

  return tryCatch(
    fetch(`/api/destinations${queryString}`, {
      method: 'GET',
      next: { revalidate: 3600 }, // Cache for 1 hour
    }).then((response) => handleApiResponse<Destination[]>(response))
  );
}

/**
 * Get a single destination by ID
 * @param id - The destination's unique identifier
 */
export async function getDestination(id: string): Promise<Result<Destination>> {
  return tryCatch(
    fetch(`/api/destinations/${id}`, {
      method: 'GET',
      next: { revalidate: 3600 }, // Cache for 1 hour
    }).then((response) => handleApiResponse<Destination>(response))
  );
}

/**
 * Get a single destination by slug
 * @param slug - The destination's URL slug
 */
export async function getDestinationBySlug(slug: string): Promise<Result<Destination>> {
  return tryCatch(
    fetch(`/api/destinations?slug=${slug}`, {
      method: 'GET',
      next: { revalidate: 3600 }, // Cache for 1 hour
    }).then(async (response) => {
      const result = await handleApiResponse<Destination[]>(response);
      if (result.length > 0) {
        return result[0];
      }
      throw new Error('Destination not found');
    })
  );
}

/**
 * Create a new destination
 * @param data - The destination data to create
 */
export async function createDestination(data: CreateDestinationData): Promise<Result<Destination>> {
  return tryCatch(
    fetch('/api/destinations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<Destination>(response))
  );
}

/**
 * Update an existing destination
 * @param id - The destination's unique identifier
 * @param data - The destination data to update
 */
export async function updateDestination(
  id: string,
  data: UpdateDestinationData
): Promise<Result<Destination>> {
  return tryCatch(
    fetch(`/api/destinations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<Destination>(response))
  );
}

/**
 * Delete a destination
 * @param id - The destination's unique identifier
 */
export async function deleteDestination(id: string): Promise<Result<null>> {
  return tryCatch(
    fetch(`/api/destinations/${id}`, {
      method: 'DELETE',
    }).then((response) => handleApiResponse<null>(response))
  );
}

/**
 * Get featured destinations
 * @param limit - Maximum number of destinations to return
 */
export async function getFeaturedDestinations(limit = 6): Promise<Result<Destination[]>> {
  return tryCatch(
    fetch(`/api/destinations?featured=true&limit=${limit}`, {
      method: 'GET',
      next: { revalidate: 3600 }, // Cache for 1 hour
    }).then((response) => handleApiResponse<Destination[]>(response))
  );
}

/**
 * Get destination tags
 */
export async function getDestinationTags(): Promise<Result<string[]>> {
  return tryCatch(
    fetch('/api/destinations/tags', {
      method: 'GET',
      next: { revalidate: 86400 }, // Cache for 24 hours
    }).then((response) => handleApiResponse<string[]>(response))
  );
}

/**
 * Type guard to check if an object is a Destination
 */
export function isDestination(obj: any): obj is Destination {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}
