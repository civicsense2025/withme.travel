/**
 * Client API Module
 *
 * This file exports all client-side API wrappers for use in components and hooks.
 * It provides a single import point for all API functions.
 */

// Re-export all client API types and functions
import * as trips from './trips';
import * as groups from './groups';
import * as destinations from './destinations';
import * as places from './places';
import * as tags from './tags';
import * as comments from './comments';
import * as tripMembers from './tripMembers';
import * as expenses from './expenses';
import * as permissions from './permissions';
import * as notes from './notes';
import * as logistics from './logistics';
import * as activities from './activities';
import * as itinerary from './itinerary';
import * as votes from './votes';
import * as itineraries from './itineraries';
import * as groupPlans from './groupPlans';
import * as auth from './auth';
import * as invitations from './invitations';

export {
  trips,
  groups,
  destinations,
  places,
  tags,
  comments,
  tripMembers,
  expenses,
  permissions,
  notes,
  logistics,
  activities,
  itinerary,
  votes,
  itineraries,
  groupPlans,
  auth,
  invitations,
};

// Export trip management with namespacing to avoid conflicts with tripMembers
import * as tripManagement from './trip-management';
export { tripManagement };

/**
 * Helper function to parse API responses consistently
 * @param response The fetch Response object
 * @returns Parsed response data
 * @throws Error if the response is not OK
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || errorJson.message || 'API request failed');
    } catch (e) {
      throw new Error(errorText || `API request failed with status ${response.status}`);
    }
  }

  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Failed to parse JSON response', e);
    return {} as T;
  }
}
