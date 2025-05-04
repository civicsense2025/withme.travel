/**
 * API helper functions for trip-related API calls
 */

/**
 * Fetches destination information for a trip
 * @param tripId The trip ID
 * @returns The destination information or null if not found
 */
export async function fetchTripDestination(tripId: string) {
  try {
    // Include credentials to ensure auth cookies are sent
    const response = await fetch(`/api/trips/${tripId}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      // Handle specific status codes
      if (response.status === 401) {
        throw new Error('Unauthorized: Please login to access this trip');
      }
      throw new Error(`Failed to fetch trip details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data?.trip?.destination_id) {
      // Include credentials to ensure auth cookies are sent
      const destResponse = await fetch(`/api/destinations/by-id/${data.trip.destination_id}`, {
        credentials: 'include'
      });
      
      if (destResponse.ok) {
        return await destResponse.json();
      } else {
        throw new Error(`Failed to fetch destination: ${destResponse.status} ${destResponse.statusText}`);
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching trip destination:', error);
    // Re-throw auth errors so they can be handled by the UI
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw error;
    }
    return null;
  }
} 
