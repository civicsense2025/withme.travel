
/**
 * usePlaces Hook
 * 
 * Custom hook for fetching and managing places data for a trip
 */
import { useState, useCallback, useEffect } from 'react';
import * as placesApi from '@/lib/api/places';
import type { Place as ApiPlace } from '@/lib/api/_shared';
import type { Place } from '@/components/features/places/types';

// ============================================================================
// TYPES
// ============================================================================

interface UsePlacesProps {
  /** The trip ID to fetch places for */
  tripId?: string;
}

interface UsePlacesResult {
  /** List of places for the trip */
  places: Place[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message if places failed to load */
  error: string | null;
  /** Function to refresh places data */
  refreshPlaces: () => Promise<void>;
  /** Function to add a new place */
  addPlace: (place: Omit<Place, 'id'>) => Promise<Place | null>;
  /** Function to update an existing place */
  updatePlace: (id: string, updates: Partial<Omit<Place, 'id'>>) => Promise<Place | null>;
  /** Function to delete a place */
  deletePlace: (id: string) => Promise<boolean>;
}

/**
 * Convert from API Place to component Place format
 */
function mapApiPlaceToComponentPlace(apiPlace: ApiPlace): Place {
  return {
    id: apiPlace.id,
    name: apiPlace.name ?? '',
    category: apiPlace.category ?? undefined,
    address: apiPlace.address ?? undefined,
    rating: undefined, // Not present in ApiPlace
    image_url: apiPlace.image_url ?? undefined,
    description: apiPlace.description ?? undefined
  };
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing places data for a trip
 * 
 * @param tripId - The ID of the trip to fetch places for
 * @returns places, loading state, error state, and mutation functions
 */
export function usePlaces({ tripId }: UsePlacesProps = {}): UsePlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    // Skip if no tripId provided
    if (!tripId) {
      setPlaces([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the listPlaces function with a filter for the trip
      const response = await placesApi.listPlaces({ 
        query: `trip:${tripId}` 
      });
      
      if (!response.success) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Failed to fetch places');
      }
      
      // Map API response to the component's Place type
      const placesData = response.data.map(apiPlace => mapApiPlaceToComponentPlace(apiPlace));
      
      setPlaces(placesData);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError(err instanceof Error ? err.message : 'Failed to load places');
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  // Initial fetch
  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Add a new place
  const addPlace = async (place: Omit<Place, 'id'>): Promise<Place | null> => {
    if (!tripId) return null;

    try {
      const apiPlace: Partial<ApiPlace> = {
        name: place.name, 
        category: place.category || 'other',
        description: place.description || undefined,
        address: place.address || undefined,
      };

      const response = await placesApi.createPlace(apiPlace);
      
      if (!response.success) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Failed to add place');
      }

      // Map the API response to our component's Place type
      const newPlace = mapApiPlaceToComponentPlace(response.data);
      
      setPlaces(currentPlaces => [...currentPlaces, newPlace]);
      return newPlace;
    } catch (err) {
      console.error('Error adding place:', err);
      setError(err instanceof Error ? err.message : 'Failed to add place');
      return null;
    }
  };

  // Update an existing place
  const updatePlace = async (
    id: string, 
    updates: Partial<Omit<Place, 'id'>>
  ): Promise<Place | null> => {
    if (!tripId) return null;

    try {
      // Map our component's Place updates to the API's expected format
      const apiUpdates: Partial<ApiPlace> = {
        name: updates.name,
        id: id,
        category: updates.category || undefined,
        description: updates.description || undefined,
        address: updates.address || undefined,
      };
      
      const response = await placesApi.updatePlace(id, apiUpdates);
      
      if (!response.success) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Failed to update place');
      }

      // Map the API response to our component's Place type
      const updatedPlace = mapApiPlaceToComponentPlace(response.data);
      
      setPlaces(currentPlaces => 
        currentPlaces.map(place => 
          place.id === id ? updatedPlace : place
        )
      );
      return updatedPlace;
    } catch (err) {
      console.error('Error updating place:', err);
      setError(err instanceof Error ? err.message : 'Failed to update place');
      return null;
    }
  };

  // Delete a place
  const deletePlace = async (id: string): Promise<boolean> => {
    if (!tripId) return false;

    try {
      const response = await placesApi.deletePlace(id);
      
      if (!response.success) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Failed to delete place');
      }

      setPlaces(currentPlaces => 
        currentPlaces.filter(place => place.id !== id)
      );
      return true;
    } catch (err) {
      console.error('Error deleting place:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete place');
      return false;
    }
  };

  return {
    places,
    isLoading,
    error,
    refreshPlaces: fetchPlaces,
    addPlace,
    updatePlace,
    deletePlace
  };
} 