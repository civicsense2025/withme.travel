/**
 * Itineraries API Client
 * 
 * Client-side wrapper for the Itineraries API providing type-safe access to
 * itinerary template operations.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_SETTINGS } from '@/utils/constants/api';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import { handleApiResponse } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Itinerary template interface
 */
export interface ItineraryTemplate {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  duration_days?: number | null;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
  image_url?: string | null;
  is_published: boolean;
  view_count: number;
  use_count: number;
  metadata?: Record<string, any> | null;
}

/**
 * Template section interface
 */
export interface TemplateSection {
  id: string;
  template_id: string;
  day_number: number;
  title?: string | null;
  position: number;
  items?: TemplateItem[];
}

/**
 * Template item interface
 */
export interface TemplateItem {
  id: string;
  section_id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  duration_minutes?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  category?: string | null;
  position: number;
}

/**
 * Create template parameters
 */
export interface CreateTemplateParams {
  title: string;
  description?: string;
  durationDays?: number;
  imageUrl?: string;
}

/**
 * List templates parameters
 */
export interface ListTemplatesParams {
  limit?: number;
  offset?: number;
  isPublished?: boolean;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * List itinerary templates
 */
export async function listTemplates(params: ListTemplatesParams = {}): Promise<Result<ItineraryTemplate[]>> {
  const queryParams = new URLSearchParams();
  
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  if (params.isPublished !== undefined) queryParams.append('published', params.isPublished.toString());
  
  return tryCatch(
    fetch(`/api/itineraries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => handleApiResponse<ItineraryTemplate[]>(response))
  );
}

/**
 * Get a template by ID or slug
 */
export async function getTemplate(idOrSlug: string): Promise<Result<ItineraryTemplate & { sections: TemplateSection[] }>> {
  // Determine if this is a slug or ID
  const path = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
    ? `/api/itineraries/${idOrSlug}`
    : `/api/itineraries/${idOrSlug}`;
    
  return tryCatch(
    fetch(path, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => 
      handleApiResponse<ItineraryTemplate & { sections: TemplateSection[] }>(response)
    )
  );
}

/**
 * Create a new template
 */
export async function createTemplate(data: CreateTemplateParams): Promise<Result<ItineraryTemplate>> {
  return tryCatch(
    fetch('/api/itineraries', {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<ItineraryTemplate>(response))
  );
}

/**
 * Update a template
 */
export async function updateTemplate(
  id: string,
  data: Partial<CreateTemplateParams> & { sections?: Partial<TemplateSection>[] }
): Promise<Result<ItineraryTemplate>> {
  return tryCatch(
    fetch(`/api/itineraries/${id}`, {
      method: 'PUT',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<ItineraryTemplate>(response))
  );
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<Result<void>> {
  return tryCatch(
    fetch(`/api/itineraries/${id}`, {
      method: 'DELETE',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => handleApiResponse<void>(response))
  );
}

/**
 * Use a template to create a trip
 */
export async function useTemplate(
  slug: string, 
  data: { name: string; description?: string; startDate?: string }
): Promise<Result<{ tripId: string }>> {
  return tryCatch(
    fetch(`/api/itineraries/${slug}/use`, {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<{ tripId: string }>(response))
  );
}

/**
 * Get popular templates
 */
export async function getPopularTemplates(limit: number = 5): Promise<Result<ItineraryTemplate[]>> {
  return tryCatch(
    fetch(`/api/itineraries/popular?limit=${limit}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => handleApiResponse<ItineraryTemplate[]>(response))
  );
} 