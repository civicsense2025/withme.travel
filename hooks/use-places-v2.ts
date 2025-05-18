/**
 * Places Hook
 * 
 * React hook for interacting with the Places API
 */

import { useState, useCallback, useEffect } from 'react';
import * as PlacesClient from '@/lib/client/places';
import type { Place } from '@/types/places';

/**
 * Hook for querying and managing places
 */
export function usePlaces(initialQuery?: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState<string>(initialQuery || '');

  // Fetch places based on query and params
  const fetchPlaces = useCallback(async (searchQuery: string, params?: {
    category?: string;
    limit?: number;
    offset?: number;
  }) => {
    setLoading(true);
    setError(null);

    const result = await PlacesClient.searchPlaces(searchQuery, params);

    if (result.success) {
      setPlaces(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  // Fetch a single place by ID
  const fetchPlace = useCallback(async (placeId: string) => {
    setLoading(true);
    setError(null);

    const result = await PlacesClient.getPlace(placeId);

    setLoading(false);
    return result;
  }, []);

  // Create a new place
  const createPlace = useCallback(async (data: Partial<Place>) => {
    setLoading(true);
    setError(null);

    const result = await PlacesClient.createPlace(data);

    if (result.success) {
      setPlaces(prevPlaces => [...prevPlaces, result.data]);
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

    const result = await PlacesClient.updatePlace(placeId, data);

    if (result.success) {
      setPlaces(prevPlaces => 
        prevPlaces.map(place => place.id === placeId ? result.data : place)
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

    const result = await PlacesClient.deletePlace(placeId);

    if (result.success) {
      setPlaces(prevPlaces => prevPlaces.filter(place => place.id !== placeId));
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  // Lookup or create a place
  const lookupOrCreatePlaceFunc = useCallback(async (data: {
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    category?: string;
  }) => {
    setLoading(true);
    setError(null);

    const result = await PlacesClient.lookupOrCreatePlace(data);

    if (result.success) {
      // Check if place already exists in our list
      const exists = places.some(place => place.id === result.data.id);
      if (!exists) {
        setPlaces(prevPlaces => [...prevPlaces, result.data]);
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, [places]);

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
    lookupOrCreatePlace: lookupOrCreatePlaceFunc
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

    const result = await PlacesClient.getPlace(id);

    if (result.success) {
      setPlace(result.data);
    } else {
      setError(result.error);
      setPlace(null);
    }

    setLoading(false);
    return result;
  }, []);

  const updatePlace = useCallback(async (data: Partial<Place>) => {
    if (!placeId || !place) {
      return { 
        success: false as const, 
        error: new Error('No place loaded') 
      };
    }
    
    setLoading(true);
    setError(null);

    const result = await PlacesClient.updatePlace(placeId, data);

    if (result.success) {
      setPlace(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, [placeId, place]);

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
    updatePlace
  };
} 