/**
 * Logistics API Client
 *
 * Client-side wrapper for the Logistics API providing type-safe access to 
 * trip logistics operations including accommodations, transportation, and forms.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_SETTINGS } from '@/utils/constants/api';
import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';
import { AccommodationData, LogisticsItem, TransportationData } from './itinerary';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Form data for creating/updating
 */
export interface FormData {
  title: string;
  description?: string;
  templateId?: string | null;
  fields?: Record<string, any>[];
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * List all logistics items for a trip
 */
export async function listLogisticsItems(tripId: string): Promise<Result<LogisticsItem[]>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/logistics`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => handleApiResponse<LogisticsItem[]>(response))
  );
}

/**
 * Add an accommodation to a trip
 */
export async function addAccommodation(
  tripId: string,
  data: AccommodationData
): Promise<Result<LogisticsItem>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/logistics`, {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({
        type: 'accommodation',
        ...data,
      }),
    }).then((response) => handleApiResponse<LogisticsItem>(response))
  );
}

/**
 * Add transportation to a trip
 */
export async function addTransportation(
  tripId: string,
  data: TransportationData
): Promise<Result<LogisticsItem>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/logistics`, {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({
        type: 'transportation',
        ...data,
      }),
    }).then((response) => handleApiResponse<LogisticsItem>(response))
  );
}

/**
 * Add a form to a trip
 */
export async function addForm(
  tripId: string,
  data: FormData
): Promise<Result<LogisticsItem>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/logistics`, {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({
        type: 'form',
        ...data,
      }),
    }).then((response) => handleApiResponse<LogisticsItem>(response))
  );
}

/**
 * Delete a logistics item
 */
export async function deleteLogisticsItem(
  tripId: string,
  itemId: string
): Promise<Result<void>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/logistics/${itemId}`, {
      method: 'DELETE',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => handleApiResponse<void>(response))
  );
}

/**
 * Update a logistics item
 */
export async function updateLogisticsItem(
  tripId: string,
  itemId: string,
  data: Partial<AccommodationData | TransportationData | FormData> & { type: string }
): Promise<Result<LogisticsItem>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/logistics/${itemId}`, {
      method: 'PATCH',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<LogisticsItem>(response))
  );
} 