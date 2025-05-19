/**
 * Itineraries Client
 *
 * Client-side API functions for itinerary management
 *
 * @module lib/features/itineraries/client
 */

import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/tables';
import { ItineraryItem, ItineraryTemplate, TemplateSection, ListTemplatesParams, CreateTemplateParams } from './types';
import { API_ROUTES } from '@/utils/constants/routes';

// ============================================================================
// ITINERARY ITEMS API
// ============================================================================

/**
 * Fetch all itinerary items for a trip
 */
export async function fetchItineraryItems(tripId: string): Promise<ItineraryItem[]> {
  const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId));
  
  if (!response.ok) {
    throw new Error(`Failed to fetch itinerary items: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || [];
}

/**
 * Create a new itinerary item
 */
export async function createItineraryItem(
  tripId: string,
  item: Omit<ItineraryItem, 'id' | 'created_at' | 'trip_id'>
): Promise<ItineraryItem> {
  const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...item, trip_id: tripId }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to create itinerary item: ${error.message || response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Update an existing itinerary item
 */
export async function updateItineraryItem(
  tripId: string,
  itemId: string,
  updates: Partial<Omit<ItineraryItem, 'id' | 'created_at' | 'trip_id'>>
): Promise<ItineraryItem> {
  const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to update itinerary item: ${error.message || response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Delete an itinerary item
 */
export async function deleteItineraryItem(tripId: string, itemId: string): Promise<void> {
  const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to delete itinerary item: ${error.message || response.statusText}`);
  }
}

/**
 * Reorder itinerary items
 */
export async function reorderItineraryItems(
  tripId: string,
  items: { id: string; order: number; day?: number }[]
): Promise<void> {
  const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to reorder itinerary items: ${error.message || response.statusText}`);
  }
}

// ============================================================================
// TEMPLATES API
// ============================================================================

/**
 * Fetch templates with filtering options
 */
export async function fetchTemplates(
  params: ListTemplatesParams = {}
): Promise<ItineraryTemplate[]> {
  const queryParams = new URLSearchParams();
  
  if (params.limit !== undefined) {
    queryParams.append('limit', params.limit.toString());
  }
  
  if (params.offset !== undefined) {
    queryParams.append('offset', params.offset.toString());
  }
  
  if (params.isPublished !== undefined) {
    queryParams.append('isPublished', params.isPublished.toString());
  }

  const response = await getBrowserClient().from(TABLES.ITINERARY_TEMPLATES).select('*').range(params.offset, params.offset + params.limit - 1);
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch a specific template by ID
 */
export async function fetchTemplateById(
  templateId: string
): Promise<{ template: ItineraryTemplate; sections: TemplateSection[] } | null> {
  const response = await getBrowserClient().from(TABLES.ITINERARY_TEMPLATES).select('*').eq('id', templateId).single();
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error(`Failed to fetch template: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Create a new template
 */
export async function createTemplate(
  templateData: CreateTemplateParams
): Promise<ItineraryTemplate> {
    const response = await getBrowserClient().from(TABLES.ITINERARY_TEMPLATES).insert(templateData).select().single();
  
  if (!response.ok) {
    throw new Error(`Failed to create template: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<CreateTemplateParams>
): Promise<ItineraryTemplate> {
    const response = await getBrowserClient().from(TABLES.ITINERARY_TEMPLATES).update(updates).eq('id', templateId).select().single();
  
  if (!response.ok) {
    throw new Error(`Failed to update template: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data;
}   


/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  const response = await getBrowserClient().from(TABLES.ITINERARY_TEMPLATES).delete().eq('id', templateId);
  
  if (!response.ok) {
    throw new Error(`Failed to delete template: ${response.statusText}`);
  }
}

/**
 * Apply a template to a trip
 */
export async function applyTemplateToTrip(
  templateId: string,
  tripId: string
): Promise<ItineraryItem[]> {
  const response = await getBrowserClient().from(TABLES.ITINERARY_TEMPLATES).insert({
    template_id: templateId,
    trip_id: tripId,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to apply template: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.data || [];
} 