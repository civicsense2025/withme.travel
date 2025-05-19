/**
 * Itinerary API Client
 *
 * Client-side wrapper for the Itinerary API providing type-safe access to itinerary operations
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';
import type { ItineraryItem } from '@/lib/api/_shared';

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

function toStringResult<T, E = unknown>(
  result: { success: true; data: T } | { success: false; error: E }
): Result<T> {
  if (!result.success) {
    return { 
      success: false, 
      error: typeof result.error === 'string' ? result.error : 'Unknown error' 
    };
  }
  return { success: true, data: result.data };
}

/**
 * List all itinerary items for a trip
 */
export async function listItineraryItems(tripId: string): Promise<Result<ItineraryItem[]>> {
  const result = await tryCatch(
    fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
      method: 'GET',
    }).then((response) =>
      handleApiResponse<{ items: ItineraryItem[] }>(response).then((r) => r.items)
    )
  );
  return toStringResult(result);
}

/**
 * Get a specific itinerary item
 */
export async function getItineraryItem(
  tripId: string,
  itemId: string
): Promise<Result<ItineraryItem>> {
  const result = await tryCatch(
    fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
      method: 'GET',
    }).then((response) =>
      handleApiResponse<{ item: ItineraryItem }>(response).then((r) => r.item)
    )
  );
  return toStringResult(result);
}

/**
 * Create a new itinerary item
 */
export async function createItineraryItem(
  tripId: string,
  data: Partial<ItineraryItem>
): Promise<Result<ItineraryItem>> {
  const result = await tryCatch(
    fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) =>
      handleApiResponse<{ item: ItineraryItem }>(response).then((r) => r.item)
    )
  );
  return toStringResult(result);
}

/**
 * Update an existing itinerary item
 */
export async function updateItineraryItem(
  tripId: string,
  itemId: string,
  data: Partial<ItineraryItem>
): Promise<Result<ItineraryItem>> {
  const result = await tryCatch(
    fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) =>
      handleApiResponse<{ item: ItineraryItem }>(response).then((r) => r.item)
    )
  );
  return toStringResult(result);
}

/**
 * Delete an itinerary item
 */
export async function deleteItineraryItem(tripId: string, itemId: string): Promise<Result<null>> {
  const result = await tryCatch(
    fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
      method: 'DELETE',
    }).then(() => null)
  );
  return toStringResult(result);
}

/**
 * Reorder itinerary items
 */
export async function reorderItineraryItems(
  tripId: string,
  items: Array<{ id: string; position: number; day?: number }>
): Promise<Result<ItineraryItem[]>> {
  const result = await tryCatch(
    fetch(API_ROUTES.TRIP_ITINERARY_REORDER(tripId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    }).then((response) =>
      handleApiResponse<{ items: ItineraryItem[] }>(response).then((r) => r.items)
    )
  );
  return toStringResult(result);
}

/**
 * Import itinerary items from a template
 */
export async function importFromTemplate(
  tripId: string,
  templateId: string,
  options?: { adjustDates?: boolean }
): Promise<Result<ItineraryItem[]>> {
  const result = await tryCatch(
    fetch(API_ROUTES.TRIP_APPLY_TEMPLATE(tripId, templateId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {}),
    }).then((response) =>
      handleApiResponse<{ items: ItineraryItem[] }>(response).then((r) => r.items)
    )
  );
  return toStringResult(result);
}

/**
 * Interface for logistics item data
 */
export interface LogisticsItem {
  id: string;
  type: 'accommodation' | 'transportation';
  title: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  trip_id?: string;
  meta?: Record<string, any>;
}

/**
 * Interface for accommodation data
 */
export interface AccommodationData {
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

/**
 * Interface for transportation data
 */
export interface TransportationData {
  title: string;
  departureLocation?: string;
  arrivalLocation?: string;
  departureDate?: string;
  arrivalDate?: string;
  description?: string;
}

/**
 * List all logistics items for a trip
 */
export async function listTripLogistics(tripId: string): Promise<Result<LogisticsItem[]>> {
  const result = await tryCatch(
    fetch(`/api/trips/${tripId}/logistics`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<LogisticsItem[]>(response))
  );
  return toStringResult(result);
}

/**
 * Add an accommodation item to a trip's itinerary
 */
export async function addAccommodationToTrip(
  tripId: string,
  data: AccommodationData
): Promise<Result<LogisticsItem>> {
  const result = await tryCatch(
    fetch(`/api/trips/${tripId}/logistics/accommodation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<LogisticsItem>(response))
  );
  return toStringResult(result);
}

/**
 * Add a transportation item to a trip's itinerary
 */
export async function addTransportationToTrip(
  tripId: string,
  data: TransportationData
): Promise<Result<LogisticsItem>> {
  const result = await tryCatch(
    fetch(`/api/trips/${tripId}/logistics/transportation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<LogisticsItem>(response))
  );
  return toStringResult(result);
}

/**
 * Add a form to a trip
 */
export async function addFormToTrip(
  tripId: string,
  data: {
    title: string;
    description?: string;
    template_id?: string | null;
  }
): Promise<Result<any>> {
  const result = await tryCatch(
    fetch(`/api/trips/${tripId}/logistics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'form', ...data }),
    }).then((response) => handleApiResponse(response))
  );
  return toStringResult(result);
}
