/**
 * Places API Hook
 *
 * React hook for managing places with state, loading, and error handling
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Place,
  ListPlacesParams,
  CreatePlaceData,
  listPlaces,
  createPlace,
  getPlaceCategories,
  importPlacesFromCSV,
  searchPlaces,
  getPlace,
  createPlace as PlacesClientCreatePlace,
  updatePlace as PlacesClientUpdatePlace,
  deletePlace as PlacesClientDeletePlace,
  lookupOrCreatePlace,
} from '@/lib/client/places';
import { useToast } from '@/hooks/use-toast';
import { isSuccess } from '@/utils/result';

// ============================================================================
// TYPES
// ============================================================================

interface UsePlacesOptions {
  initialParams?: ListPlacesParams;
  autoFetch?: boolean;
}

interface UsePlacesReturn {
  places: Place[];
  isLoading: boolean;
  error: Error | null;
  params: ListPlacesParams;
  setParams: (params: ListPlacesParams) => void;
  refetch: () => Promise<void>;
  createPlace: (data: CreatePlaceData) => Promise<Place | null>;
  getCategories: () => Promise<string[] | null>;
  importPlaces: (
    destinationId: string,
    file: File
  ) => Promise<{ added: number; errors: any[] } | null>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing places
 */
export function usePlaces({
  initialParams,
  autoFetch = true,
}: UsePlacesOptions = {}): UsePlacesReturn {
  // Initialize with a default destinationId to avoid type errors
  const [params, setParams] = useState<ListPlacesParams>(initialParams || { destinationId: '' });
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch places based on params
  const fetchPlaces = useCallback(async () => {
    if (!params.destinationId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await listPlaces(params);

    if (isSuccess(result)) {
      setPlaces(result.data);
    } else {
      setError(result.error);
      toast({
        title: 'Error',
        description: `Failed to load places: ${result.error.message}`,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }, [params, toast]);

  // Effect to fetch places when params change
  useEffect(() => {
    if (autoFetch && params.destinationId) {
      fetchPlaces();
    }
  }, [autoFetch, params, fetchPlaces]);

  // Create a new place
  const addPlace = useCallback(
    async (data: CreatePlaceData): Promise<Place | null> => {
      setIsLoading(true);

      const result = await createPlace(data);

      if (isSuccess(result)) {
        setPlaces((prev) => [...prev, result.data]);
        toast({
          title: 'Success',
          description: 'Place created successfully',
        });
        setIsLoading(false);
        return result.data;
      } else {
        setError(result.error);
        toast({
          title: 'Error',
          description: `Failed to create place: ${result.error.message}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
    },
    [toast]
  );

  // Get place categories
  const fetchCategories = useCallback(async (): Promise<string[] | null> => {
    const result = await getPlaceCategories();

    if (isSuccess(result)) {
      return result.data;
    } else {
      toast({
        title: 'Error',
        description: `Failed to get categories: ${result.error.message}`,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Import places from CSV
  const importFromCSV = useCallback(
    async (destinationId: string, file: File): Promise<{ added: number; errors: any[] } | null> => {
      setIsLoading(true);

      const result = await importPlacesFromCSV(destinationId, file);

      if (isSuccess(result)) {
        toast({
          title: 'Success',
          description: `Added ${result.data.added} places successfully`,
        });
        // Refresh the places list
        if (params.destinationId === destinationId) {
          fetchPlaces();
        }
        setIsLoading(false);
        return result.data;
      } else {
        setError(result.error);
        toast({
          title: 'Error',
          description: `Failed to import places: ${result.error.message}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
    },
    [fetchPlaces, params.destinationId, toast]
  );

  return {
    places,
    isLoading,
    error,
    params,
    setParams,
    refetch: fetchPlaces,
    createPlace: addPlace,
    getCategories: fetchCategories,
    importPlaces: importFromCSV,
  };
}

/**
 * Hook for querying and managing places
 */
export function usePlaces(initialQuery?: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState<string>(initialQuery || '');

  // Fetch places based on query and params
  const fetchPlaces = useCallback(
    async (
      searchQuery: string,
      params?: {
        category?: string;
        limit?: number;
        offset?: number;
      }
    ) => {
      setLoading(true);
      setError(null);

      const result = await searchPlaces(searchQuery, params);

      if (result.success) {
        setPlaces(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
      return result;
    },
    []
  );

  // Fetch a single place by ID
  const fetchPlace = useCallback(async (placeId: string) => {
    setLoading(true);
    setError(null);

    const result = await getPlace(placeId);

    setLoading(false);
    return result;
  }, []);

  // Create a new place
  const createPlace = useCallback(async (data: Partial<Place>) => {
    setLoading(true);
    setError(null);

    const result = await PlacesClientCreatePlace(data);

    if (result.success) {
      setPlaces((prevPlaces) => [...prevPlaces, result.data]);
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  // Update an existing place
  const updatePlace = useCallback(async (placeId: string, data: Partial<Place>) => {
    setLoading(true);
    setError(null);

    const result = await PlacesClientUpdatePlace(placeId, data);

    if (result.success) {
      setPlaces((prevPlaces) =>
        prevPlaces.map((place) => (place.id === placeId ? result.data : place))
      );
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  // Delete a place
  const deletePlace = useCallback(async (placeId: string) => {
    setLoading(true);
    setError(null);

    const result = await PlacesClientDeletePlace(placeId);

    if (result.success) {
      setPlaces((prevPlaces) => prevPlaces.filter((place) => place.id !== placeId));
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  // Lookup or create a place
  const lookupOrCreatePlace = useCallback(
    async (data: {
      name: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      category?: string;
    }) => {
      setLoading(true);
      setError(null);

      const result = await lookupOrCreatePlace(data);

      if (result.success) {
        // Check if place already exists in our list
        const exists = places.some((place) => place.id === result.data.id);
        if (!exists) {
          setPlaces((prevPlaces) => [...prevPlaces, result.data]);
        }
      } else {
        setError(result.error);
      }

      setLoading(false);
      return result;
    },
    [places]
  );

  // Perform initial search if query is provided
  useEffect(() => {
    if (initialQuery) {
      fetchPlaces(initialQuery);
    }
  }, [initialQuery, fetchPlaces]);

  return {
    places,
    loading,
    error,
    query,
    setQuery,
    fetchPlaces,
    fetchPlace,
    createPlace,
    updatePlace,
    deletePlace,
    lookupOrCreatePlace,
  };
}

/**
 * Hook for working with a single place
 */
export function usePlaceDetails(placeId?: string) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlace = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    const result = await getPlace(id);

    if (result.success) {
      setPlace(result.data);
    } else {
      setError(result.error);
      setPlace(null);
    }

    setLoading(false);
    return result;
  }, []);

  const updatePlace = useCallback(
    async (data: Partial<Place>) => {
      if (!placeId || !place)
        return { success: false as const, error: new Error('No place loaded') };

      setLoading(true);
      setError(null);

      const result = await PlacesClientUpdatePlace(placeId, data);

      if (result.success) {
        setPlace(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
      return result;
    },
    [placeId, place]
  );

  // Load place on mount if ID is provided
  useEffect(() => {
    if (placeId) {
      fetchPlace(placeId);
    }
  }, [placeId, fetchPlace]);

  return {
    place,
    loading,
    error,
    fetchPlace,
    updatePlace,
  };
}
