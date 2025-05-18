/**
 * usePlaces Hook
 *
 * Custom React hook for managing places with full CRUD capabilities,
 * search functionality and loading states.
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
  type Place,
} from '@/lib/client/places';
import type { Result } from '@/lib/client/places';
import { useToast } from '@/components/ui/use-toast';

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

    const result = await listPlaces({
      query: query || undefined,
      category: category || undefined,
      limit,
    });

    if (result.success) {
      setPlaces(result.data);
    } else {
      setError(String(result.error));
      toast({
        title: 'Failed to load places',
        description: String(result.error),
        variant: 'destructive',
      });
    }

    setIsLoading(false);
    return result;
  }, [query, category, limit, toast]);

  // Fetch a single place by ID
  const fetchPlace = useCallback(
    async (placeId: string) => {
      setIsLoading(true);
      setError(null);

      const result = await getPlace(placeId);

      if (result.success) {
        setCurrentPlace(result.data);
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to load place',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  // Create a new place
  const addPlace = useCallback(
    async (data: Partial<Place>) => {
      setIsCreating(true);
      setError(null);

      const result = await createPlace(data);

      if (result.success) {
        setPlaces((prev) => [...prev, result.data]);
        toast({
          title: 'Place created',
          description: `${data.name} has been created successfully.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to create place',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsCreating(false);
      return result;
    },
    [toast]
  );

  // Update an existing place
  const updatePlaceById = useCallback(
    async (placeId: string, data: Partial<Place>) => {
      setIsUpdating(true);
      setError(null);

      const result = await updatePlace(placeId, data);

      if (result.success) {
        // Update in places list
        setPlaces((prev) => prev.map((place) => (place.id === placeId ? result.data : place)));

        // Update current place if it's the one being edited
        if (currentPlace?.id === placeId) {
          setCurrentPlace(result.data);
        }

        toast({
          title: 'Place updated',
          description: `${data.name || 'Place'} has been updated successfully.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to update place',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsUpdating(false);
      return result;
    },
    [currentPlace, toast]
  );

  // Delete a place
  const removePlace = useCallback(
    async (placeId: string) => {
      setIsDeleting(true);
      setError(null);

      const result = await deletePlace(placeId);

      if (result.success) {
        // Remove from places list
        setPlaces((prev) => prev.filter((place) => place.id !== placeId));

        // Clear current place if it's the one being deleted
        if (currentPlace?.id === placeId) {
          setCurrentPlace(null);
        }

        toast({
          title: 'Place deleted',
          description: 'The place has been deleted successfully.',
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to delete place',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsDeleting(false);
      return result;
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

      const result = await searchPlaces(searchQuery, {
        category: searchCategory || category,
        limit,
      });

      if (result.success) {
        setPlaces(result.data);
      } else {
        setError(String(result.error));
        toast({
          title: 'Search failed',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsSearching(false);
      return result;
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
      setIsCreating(true);
      setError(null);

      const result = await lookupOrCreatePlace(data);

      if (result.success) {
        // Check if place already exists in our list
        const placeExists = places.some((place) => place.id === result.data.id);

        if (!placeExists) {
          setPlaces((prev) => [...prev, result.data]);
        }

        setCurrentPlace(result.data);

        toast({
          title: 'Place found',
          description: `${data.name} has been ${placeExists ? 'found' : 'created'}.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to lookup/create place',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsCreating(false);
      return result;
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
