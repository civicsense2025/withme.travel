/**
 * Places API Hook
 *
 * React hook for managing places with state, loading, and error handling
 * 
 * @deprecated Use the version from '@/lib/features/places/hooks/use-places' instead.
 * This file will be removed in a future release.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
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
  lookupOrCreatePlace as apiLookupOrCreatePlace,
  getPlacesWithTrips,
} from '@/lib/client/places';
import type { Place, PlaceWithTrips } from '@/types/places';
import { useToast } from '@/lib/hooks/use-toast';
import { isSuccess, isFailure, Result } from '@/lib/utils/result';

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
  error: string | null;
  params: ListPlacesParams;
  setParams: (params: ListPlacesParams) => void;
  refetch: () => Promise<void>;
  createPlace: (data: CreatePlaceData) => Promise<Place | null>;
  getCategories: () => Promise<string[] | null>;
  importPlaces: (
    destinationId: string,
    file: File
  ) => Promise<{ added: number; errors: string[] } | null>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing places
 * 
 * @deprecated Use the version from '@/lib/features/places/hooks/use-places' instead.
 */
export function usePlaces({
  initialParams,
  autoFetch = true,
}: UsePlacesOptions = {}): UsePlacesReturn {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<ListPlacesParams>(initialParams || {});
  const { toast } = useToast();

  /**
   * Fetch places with current parameters
   */
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listPlaces(params);
      
      if (isSuccess(result)) {
        setPlaces(result.data);
      } else {
        setError(typeof result.error === 'string' ? result.error : String(result.error));
        toast({
          title: 'Error',
          description: `Failed to fetch places: ${typeof result.error === 'string' ? result.error : String(result.error)}`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to fetch places: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [params, toast]);

  /**
   * Create a new place
   */
  const handleCreatePlace = useCallback(async (data: CreatePlaceData): Promise<Place | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createPlace(data);
      
      if (isSuccess(result)) {
        const newPlace = result.data;
        // Refresh places list if we're not filtering
        if (!params.category && !params.query) {
          setPlaces((prev) => [...prev, newPlace]);
        }
        toast({
          title: 'Success',
          description: 'Place created successfully',
        });
        return newPlace;
      } else {
        setError(typeof result.error === 'string' ? result.error : String(result.error));
        toast({
          title: 'Error',
          description: `Failed to create place: ${typeof result.error === 'string' ? result.error : String(result.error)}`,
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to create place: ${errorMessage}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [params, toast]);

  /**
   * Get available place categories
   */
  const getPlaceCats = useCallback(async (): Promise<string[] | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getPlaceCategories();
      
      if (isSuccess(result)) {
        return result.data;
      } else {
        setError(typeof result.error === 'string' ? result.error : String(result.error));
        toast({
          title: 'Error',
          description: `Failed to fetch categories: ${typeof result.error === 'string' ? result.error : String(result.error)}`,
          variant: 'destructive',
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to fetch categories: ${errorMessage}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Import places from a file
   */
  const handleImportPlaces = useCallback(
    async (
      destinationId: string,
      file: File
    ): Promise<{ added: number; errors: string[] } | null> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await importPlacesFromCSV(destinationId, file);
        
        if (isSuccess(result)) {
          toast({
            title: 'Success',
            description: `Added ${result.data.added} places successfully`,
          });
          // Refresh places after import
          await fetchPlaces();
          return result.data;
        } else {
          setError(typeof result.error === 'string' ? result.error : String(result.error));
          toast({
            title: 'Error',
            description: `Failed to import places: ${typeof result.error === 'string' ? result.error : String(result.error)}`,
            variant: 'destructive',
          });
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Error',
          description: `Failed to import places: ${errorMessage}`,
          variant: 'destructive',
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPlaces, toast]
  );

  // Update params without triggering fetch
  const updateParams = useCallback((newParams: ListPlacesParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Run initial fetch if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchPlaces();
    }
  }, [autoFetch, fetchPlaces]);

  return {
    places,
    isLoading,
    error,
    params,
    setParams: updateParams,
    refetch: fetchPlaces,
    createPlace: handleCreatePlace,
    getCategories: getPlaceCats,
    importPlaces: handleImportPlaces,
  };
}

/**
 * Hook for querying and managing places
 * 
 * @deprecated Use the version from '@/lib/features/places/hooks/use-places' instead.
 */
interface UsePlacesQueryReturn {
  places: Place[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  fetchPlaces: (
    searchQuery: string,
    params?: {
      category?: string;
      limit?: number;
      offset?: number;
    }
  ) => Promise<Place[]>;
  fetchPlace: (placeId: string) => Promise<Place | null>;
  createPlace: (data: Partial<Place>) => Promise<Place | null>;
  updatePlace: (placeId: string, data: Partial<Place>) => Promise<Place | null>;
  deletePlace: (placeId: string) => Promise<boolean>;
  lookupOrCreatePlace: (data: {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    category?: string;
  }) => Promise<Place | null>;
}

export function usePlacesQuery(initialQuery?: string): UsePlacesQueryReturn {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
    ): Promise<Place[]> => {
      setLoading(true);
      setError(null);
      try {
        const result = await searchPlaces(searchQuery, params || {});
        if (!result.success) {
          setError(result.error);
          return [];
        }
        const placesData = result.data;
        setPlaces(placesData);
        return placesData;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch places';
        setError(errorMsg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch a single place by ID
  const fetchPlace = useCallback(async (placeId: string): Promise<Place | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPlace(placeId);
      if (!result.success) {
        setError(result.error);
        return null;
      }
      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch place';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new place
  const createPlace = useCallback(async (data: Partial<Place>): Promise<Place | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await PlacesClientCreatePlace(data);
      if (!result.success) {
        setError(result.error);
        return null;
      }
      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create place';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing place
  const updatePlace = useCallback(async (placeId: string, data: Partial<Place>): Promise<Place | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await PlacesClientUpdatePlace(placeId, data);
      if (!result.success) {
        setError(result.error);
        return null;
      }
      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update place';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a place
  const deletePlace = useCallback(async (placeId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await PlacesClientDeletePlace(placeId);
      if (!result.success) {
        setError(result.error);
        return false;
      }
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete place';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lookup or create a place
  const lookupOrCreatePlace = useCallback(
    async (data: {
      name: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      category?: string;
    }): Promise<Place | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiLookupOrCreatePlace(data);
        if (!result.success) {
          setError(result.error);
          return null;
        }
        return result.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to lookup or create place';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Perform initial search if query is provided
  useEffect(() => {
    if (initialQuery) {
      fetchPlaces(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
interface UsePlaceDetailsReturn {
  place: Place | null;
  loading: boolean;
  error: string | null;
  fetchPlace: (id: string) => Promise<Place | null>;
  updatePlace: (data: Partial<Place>) => Promise<Place | null>;
}

export function usePlaceDetails(placeId?: string): UsePlaceDetailsReturn {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlace = useCallback(async (id: string): Promise<Place | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPlace(id);
      if (!result.success) {
        setError(result.error);
        return null;
      }
      
      setPlace(result.data);
      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch place details';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlace = useCallback(
    async (data: Partial<Place>): Promise<Place | null> => {
      if (!placeId || !place) {
        setError('No place loaded');
        return null;
      }
      
      setLoading(true);
      setError(null);
      try {
        const result = await PlacesClientUpdatePlace(placeId, data);
        if (!result.success) {
          setError(result.error);
          return null;
        }
        
        setPlace(result.data);
        return result.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update place';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [placeId, place]
  );

  // Load place on mount if ID is provided
  useEffect(() => {
    if (placeId) {
      fetchPlace(placeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, fetchPlace]);

  return {
    place,
    loading,
    error,
    fetchPlace,
    updatePlace,
  };
}

interface UsePlacesSearchQueryReturn {
  places: Place[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  search: (category?: string, limit?: number) => Promise<Place[]>;
}

export function usePlacesSearchQuery(): UsePlacesSearchQueryReturn {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const search = useCallback(
    async (category?: string, limit?: number): Promise<Place[]> => {
      if (!query.trim()) {
        setPlaces([]);
        return [];
      }

      setLoading(true);
      setError(null);
      try {
        const result = await searchPlaces(query, { category, limit });
        if (!result.success) {
          setError(result.error);
          return [];
        }
        setPlaces(result.data);
        return result.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to search places';
        setError(errorMsg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  return { places, loading, error, query, setQuery, search };
}

interface UsePlacesWithTripsReturn {
  places: PlaceWithTrips[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlacesWithTrips(tripId: string): UsePlacesWithTripsReturn {
  const [places, setPlaces] = useState<PlaceWithTrips[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlacesWithTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getPlacesWithTrips(tripId);
      if (!result.success) {
        setError(result.error);
        setPlaces([]);
        return;
      }
      
      setPlaces(result.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch places with trips';
      setError(errorMsg);
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchPlacesWithTrips();
  }, [fetchPlacesWithTrips]);

  return {
    places,
    isLoading,
    error,
    refetch: fetchPlacesWithTrips,
  };
}
