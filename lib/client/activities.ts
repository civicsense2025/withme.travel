/**
 * Activities API Client
 * 
 * Client-side wrapper for the Activities API providing type-safe access to activity operations
 */

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import { handleApiResponse } from './index';
import { API_SETTINGS } from '@/utils/constants/api';
import type { Activity } from '@/lib/api/_shared';

/**
 * Activity type definition
 */
export interface Activity {
  id: string;
  name: string;
  description: string;
  trip_id?: string;
  group_id?: string;
  category?: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  status?: 'suggested' | 'planned' | 'confirmed' | 'cancelled';
  is_suggestion?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for searching activities
 */
export interface ActivitySearchParams {
  query: string;
  category?: string;
  location?: string;
  limit?: number;
  offset?: number;
}

/**
 * Parameters for activity recommendations
 */
export interface ActivityRecommendationParams {
  tripId: string;
  limit?: number;
  category?: string;
}

/**
 * List all activities for a parent entity
 * 
 * @param parentId - ID of the parent entity (trip or group)
 * @param parentType - Type of the parent entity ('trip' or 'group')
 */
export async function listActivities(
  parentId: string,
  parentType: 'trip' | 'group'
): Promise<Result<Activity[]>> {
  return tryCatch(
    fetch(`/api/activities?parentId=${parentId}&parentType=${parentType}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Activity[]>(response))
  );
}

/**
 * Get a specific activity by ID
 * 
 * @param activityId - ID of the activity to retrieve
 */
export async function getActivity(activityId: string): Promise<Result<Activity>> {
  return tryCatch(
    fetch(`/api/activities/${activityId}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Activity>(response))
  );
}

/**
 * Create a new activity
 * 
 * @param parentId - ID of the parent entity (trip or group)
 * @param parentType - Type of the parent entity ('trip' or 'group')
 * @param data - Activity data
 */
export async function createActivity(
  parentId: string,
  parentType: 'trip' | 'group',
  data: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
): Promise<Result<Activity>> {
  return tryCatch(
    fetch('/api/activities', {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({
        ...data,
        [`${parentType}_id`]: parentId
      })
    }).then((response) => handleApiResponse<Activity>(response))
  );
}

/**
 * Update an existing activity
 * 
 * @param activityId - ID of the activity to update
 * @param data - Updated activity data
 */
export async function updateActivity(
  activityId: string,
  data: Partial<Activity>
): Promise<Result<Activity>> {
  return tryCatch(
    fetch(`/api/activities/${activityId}`, {
      method: 'PATCH',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data)
    }).then((response) => handleApiResponse<Activity>(response))
  );
}

/**
 * Delete an activity
 * 
 * @param activityId - ID of the activity to delete
 */
export async function deleteActivity(activityId: string): Promise<Result<void>> {
  return tryCatch(
    fetch(`/api/activities/${activityId}`, {
      method: 'DELETE',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<void>(response))
  );
}

/**
 * Search for activities
 * 
 * @param params - Search parameters
 */
export async function searchActivities(params: ActivitySearchParams): Promise<Result<Activity[]>> {
  const searchParams = new URLSearchParams({
    q: params.query
  });
  
  if (params.category) searchParams.append('category', params.category);
  if (params.location) searchParams.append('location', params.location);
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.offset) searchParams.append('offset', params.offset.toString());
  
  return tryCatch(
    fetch(`/api/activities/search?${searchParams.toString()}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Activity[]>(response))
  );
}

/**
 * Suggest a new activity
 * 
 * @param parentId - ID of the parent entity (trip or group)
 * @param parentType - Type of the parent entity ('trip' or 'group')
 * @param suggestion - Activity suggestion data
 */
export async function suggestActivity(
  parentId: string,
  parentType: 'trip' | 'group',
  suggestion: Omit<Activity, 'id' | 'created_at' | 'updated_at'>
): Promise<Result<Activity>> {
  return tryCatch(
    fetch(`/api/activities/suggest`, {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({
        ...suggestion,
        [`${parentType}_id`]: parentId,
        is_suggestion: true,
        status: 'suggested'
      })
    }).then((response) => handleApiResponse<Activity>(response))
  );
}

/**
 * Vote on a suggested activity
 * 
 * @param activityId - ID of the activity to vote on
 * @param vote - Vote direction ('up' or 'down')
 */
export async function voteOnActivity(
  activityId: string,
  vote: 'up' | 'down'
): Promise<Result<{ activityId: string; vote: string }>> {
  return tryCatch(
    fetch(`/api/activities/${activityId}/vote`, {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({ vote })
    }).then((response) => handleApiResponse<{ activityId: string; vote: string }>(response))
  );
}

/**
 * Generate activity ideas for a destination
 * 
 * @param destinationId - ID of the destination
 * @param tripId - Optional trip ID for context
 */
export async function generateActivityIdeas(
  destinationId: string,
  tripId?: string
): Promise<Result<{ activities: Activity[] }>> {
  return tryCatch(
    fetch('/api/activities/generate', {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({
        destinationId,
        tripId
      })
    }).then((response) => handleApiResponse<{ activities: Activity[] }>(response))
  );
}

/**
 * Get recommended activities
 * 
 * @param params - Recommendation parameters
 */
export async function getRecommendedActivities(
  params: ActivityRecommendationParams
): Promise<Result<Activity[]>> {
  const queryParams = new URLSearchParams({
    tripId: params.tripId
  });
  
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  
  return tryCatch(
    fetch(`/api/activities/recommended?${queryParams.toString()}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS
    }).then((response) => handleApiResponse<Activity[]>(response))
  );
}

/**
 * List all activities for a trip
 */
export async function listTripActivities(tripId: string): Promise<Result<Activity[]>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS.DETAIL(tripId)}/activities`, {
      method: 'GET',
    }).then((response) => handleApiResponse<{ activities: Activity[] }>(response).then(r => r.activities))
  );
}

/**
 * Get a specific activity for a trip
 */
export async function getTripActivity(tripId: string, activityId: string): Promise<Result<Activity>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS.DETAIL(tripId)}/activities/${activityId}`, {
      method: 'GET',
    }).then((response) => handleApiResponse<{ activity: Activity }>(response).then(r => r.activity))
  );
}

/**
 * Create a new activity for a trip
 */
export async function createTripActivity(tripId: string, data: Partial<Activity>): Promise<Result<Activity>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS.DETAIL(tripId)}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<{ activity: Activity }>(response).then(r => r.activity))
  );
}

/**
 * Update an existing activity for a trip
 */
export async function updateTripActivity(tripId: string, activityId: string, data: Partial<Activity>): Promise<Result<Activity>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS.DETAIL(tripId)}/activities/${activityId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<{ activity: Activity }>(response).then(r => r.activity))
  );
}

/**
 * Delete an activity for a trip
 */
export async function deleteTripActivity(tripId: string, activityId: string): Promise<Result<null>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS.DETAIL(tripId)}/activities/${activityId}`, {
      method: 'DELETE',
    }).then(() => null)
  );
}

/**
 * Generate activity suggestions for a trip
 */
export async function generateActivitySuggestions(
  tripId: string, 
  params: { count?: number; category?: string }
): Promise<Result<Activity[]>> {
  const queryParams = new URLSearchParams();
  if (params.count) queryParams.append('count', String(params.count));
  if (params.category) queryParams.append('category', params.category);

  return tryCatch(
    fetch(`${API_ROUTES.TRIPS.DETAIL(tripId)}/activities/suggestions?${queryParams.toString()}`, {
      method: 'GET',
    }).then((response) => handleApiResponse<{ suggestions: Activity[] }>(response).then(r => r.suggestions))
  );
} 