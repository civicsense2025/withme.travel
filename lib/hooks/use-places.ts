/**
 * usePlaces Hook
 *
 * Custom React hook for managing places with full CRUD capabilities,
 * search functionality and loading states.
 * 
 * @deprecated Use the version from '@/lib/features/places/hooks/use-places' instead.
 * This version will be removed in a future release.
 *
 * @module hooks/use-places
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listPlaces,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace,
  searchPlaces,
  lookupOrCreatePlace,
} from '@/lib/client/places';
import type { Result } from '@/lib/client/result';
import { useToast } from '@/hooks/use-toast';
import type { Place } from '@/types/places';

/**
 * Parameters for using the places hook
 */
export interface UsePlacesParams {
  /** Destination ID to filter places */
  destinationId?: string;
  /** Initial search query */
  query?: string;
  /** Category to filter by */
  category?: string;
  /** Limit number of results */
  limit?: number;
  /** Fetch on component mount */
  fetchOnMount?: boolean;
}

/**
 * Helper to create a standardized error message
 */
function formatErrorMessage(operation: string, error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return `Failed to ${operation}: ${errorMessage}`;
}

/**
 * Helper to log errors with context
 */
function logError(operation: string, error: unknown): void {
  const errorDetails = {
    operation,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };
  
  console.error('[usePlaces]', errorDetails);
}

/**
 * usePlaces hook for managing places
 * @param params - Hook parameters
 * @returns Object with places, loading states, error handling, and CRUD operations
 */
export function usePlaces(params: UsePlacesParams = {}) {
  const {
    destinationId,
    query: initialQuery = '',
    category: initialCategory = '',
    limit = 20,
    fetchOnMount = true,
  } = params;

  // State
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { toast } = useToast();

  // Fetch places based on params
  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listPlaces({
        destinationId,
        query: query || undefined,
        category: category || undefined,
        limit,
      });

      if (result.success) {
        setPlaces(result.data as Place[]);
      } else {
        const errorMsg = formatErrorMessage('load places', result.error);
        setError(errorMsg);
        logError('fetchPlaces', result.error);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
      }
    } catch (err) {
      const errorMsg = formatErrorMessage('load places', err);
      setError(errorMsg);
      logError('fetchPlaces', err);
      toast({
        children: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, category, limit, destinationId, toast]);

  // Fetch a single place by ID
  const fetchPlace = useCallback(
    async (placeId: string) => {
      if (!placeId) {
        const errorMsg = 'Place ID is required';
        setError(errorMsg);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const result = await getPlace(placeId);

        if (result.success) {
          setCurrentPlace(result.data as Place);
          return result;
        } else {
          const errorMsg = formatErrorMessage('load place', result.error);
          setError(errorMsg);
          logError('fetchPlace', result.error);
          toast({
            children: errorMsg,
            variant: 'destructive'
          });
          return result;
        }
      } catch (err) {
        const errorMsg = formatErrorMessage('load place', err);
        setError(errorMsg);
        logError('fetchPlace', err);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Create a new place
  const addPlace = useCallback(
    async (data: Partial<Place>) => {
      if (!data.name) {
        const errorMsg = 'Place name is required';
        setError(errorMsg);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      }
      
      setIsCreating(true);
      setError(null);

      try {
        const result = await createPlace(data);

        if (result.success) {
          setPlaces((prev) => [...prev, result.data as Place]);
          toast({
            children: `Place created: ${data.name} has been created successfully.`
          });
          return result;
        } else {
          const errorMsg = formatErrorMessage('create place', result.error);
          setError(errorMsg);
          logError('addPlace', result.error);
          toast({
            children: errorMsg,
            variant: 'destructive'
          });
          return result;
        }
      } catch (err) {
        const errorMsg = formatErrorMessage('create place', err);
        setError(errorMsg);
        logError('addPlace', err);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      } finally {
        setIsCreating(false);
      }
    },
    [toast]
  );

  // Update an existing place
  const updatePlaceById = useCallback(
    async (placeId: string, data: Partial<Place>) => {
      if (!placeId) {
        const errorMsg = 'Place ID is required';
        setError(errorMsg);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      }
      
      setIsUpdating(true);
      setError(null);

      try {
        const result = await updatePlace(placeId, data);

        if (result.success) {
          // Update in places list
          setPlaces((prev) => 
            prev.map((place) => (place.id === placeId ? (result.data as Place) : place))
          );

          // Update current place if it's the one being edited
          if (currentPlace?.id === placeId) {
            setCurrentPlace(result.data as Place);
          }

          toast({
            children: `Place updated: ${data.name || 'Place'} has been updated successfully.`
          });
          return result;
        } else {
          const errorMsg = formatErrorMessage('update place', result.error);
          setError(errorMsg);
          logError('updatePlaceById', result.error);
          toast({
            children: errorMsg,
            variant: 'destructive'
          });
          return result;
        }
      } catch (err) {
        const errorMsg = formatErrorMessage('update place', err);
        setError(errorMsg);
        logError('updatePlaceById', err);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      } finally {
        setIsUpdating(false);
      }
    },
    [currentPlace, toast]
  );

  // Delete a place
  const removePlace = useCallback(
    async (placeId: string) => {
      if (!placeId) {
        const errorMsg = 'Place ID is required';
        setError(errorMsg);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      }
      
      setIsDeleting(true);
      setError(null);

      try {
        const result = await deletePlace(placeId);

        if (result.success) {
          // Remove from places list
          setPlaces((prev) => prev.filter((place) => place.id !== placeId));

          // Clear current place if it's the one being deleted
          if (currentPlace?.id === placeId) {
            setCurrentPlace(null);
          }

          toast({
            children: 'Place deleted: The place has been deleted successfully.'
          });
          return result;
        } else {
          const errorMsg = formatErrorMessage('delete place', result.error);
          setError(errorMsg);
          logError('removePlace', result.error);
          toast({
            children: errorMsg,
            variant: 'destructive'
          });
          return result;
        }
      } catch (err) {
        const errorMsg = formatErrorMessage('delete place', err);
        setError(errorMsg);
        logError('removePlace', err);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      } finally {
        setIsDeleting(false);
      }
    },
    [currentPlace, toast]
  );

  // Search for places
  const search = useCallback(
    async (searchQuery: string, searchCategory?: string) => {
      setIsSearching(true);
      setError(null);

      // Update local state for the filters
      setQuery(searchQuery);
      if (searchCategory) setCategory(searchCategory);

      try {
        const result = await searchPlaces(searchQuery, {
          category: searchCategory || category,
          limit,
        });

        if (result.success) {
          setPlaces(result.data as Place[]);
          return result;
        } else {
          const errorMsg = formatErrorMessage('search places', result.error);
          setError(errorMsg);
          logError('search', result.error);
          toast({
            children: errorMsg,
            variant: 'destructive'
          });
          return result;
        }
      } catch (err) {
        const errorMsg = formatErrorMessage('search places', err);
        setError(errorMsg);
        logError('search', err);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      } finally {
        setIsSearching(false);
      }
    },
    [category, limit, toast]
  );

  // Lookup or create a place
  const lookupOrCreate = useCallback(
    async (data: {
      name: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      category?: string;
    }) => {
      if (!data.name) {
        const errorMsg = 'Place name is required';
        setError(errorMsg);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      }
      
      setIsCreating(true);
      setError(null);

      try {
        const result = await lookupOrCreatePlace(data);

        if (result.success) {
          const placeData = result.data as Place;
          
          // Check if place already exists in our list
          const placeExists = places.some((place) => place.id === placeData.id);

          if (!placeExists) {
            setPlaces((prev) => [...prev, placeData]);
          }

          setCurrentPlace(placeData);

          toast({
            children: `Place found: ${data.name} has been ${placeExists ? 'found' : 'created'}.`
          });
          return result;
        } else {
          const errorMsg = formatErrorMessage('lookup/create place', result.error);
          setError(errorMsg);
          logError('lookupOrCreate', result.error);
          toast({
            children: errorMsg,
            variant: 'destructive'
          });
          return result;
        }
      } catch (err) {
        const errorMsg = formatErrorMessage('lookup/create place', err);
        setError(errorMsg);
        logError('lookupOrCreate', err);
        toast({
          children: errorMsg,
          variant: 'destructive'
        });
        return { success: false, error: errorMsg };
      } finally {
        setIsCreating(false);
      }
    },
    [places, toast]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setQuery('');
    setCategory('');
  }, []);

  // Fetch places on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchPlaces();
    }
  }, [fetchOnMount, fetchPlaces]);

  return {
    // Data
    places,
    currentPlace,
    query,
    category,
    error,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isSearching,

    // Actions
    fetchPlaces,
    fetchPlace,
    addPlace,
    updatePlace: updatePlaceById,
    removePlace,
    search,
    lookupOrCreate,

    // Filter actions
    setQuery,
    setCategory,
    resetFilters,
  };
}
