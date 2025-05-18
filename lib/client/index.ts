/**
 * Client API Module
 * 
 * This file exports all client-side API wrappers for use in components and hooks.
 * It provides a single import point for all API functions.
 */

// Re-export all API wrappers
export * from './tags';
export * from './tasks';
export * from './trips';
export * from './comments';
export * from './groups';
export * from './groupPlans';
export * from './votes';
export * from './places';
export * from './destinations';
export * from './tripMembers';
export * from './expenses';
export * from './activities';
export * from './itinerary';
export * from './notes';

// Export trip management with namespacing to avoid conflicts with tripMembers
import * as tripManagement from './trip-management';
export { tripManagement };

// Add additional exports as they become available
// export * from './permissions';
// export * from './itineraries';

/**
 * Helper function to parse API responses consistently
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