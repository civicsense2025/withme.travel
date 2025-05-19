/**
 * Trips hooks
 *
 * React hooks for trip-related functionality
 */

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import {
  listTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripWithDetails,
  Trip as TripType,
  CreateTripData,
  UpdateTripData,
  listPublicTrips,
  updateTripWithDetails,
  duplicateTrip,
  archiveTrip,
  toggleTripPublic,
} from '@/lib/client/trips';
import { isSuccess } from '@/lib/client/result';

// Simplified Trip interface for the hook
// This is a projection of the more complex TripType
export interface Trip {
  id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  destination_id?: string | null; // Maps to city_id in the API
  created_by: string;
  created_at: string;
  updated_at?: string | null;
  status?: string | null;
  duration_days?: number | null;
  destination_name?: string | null;
}

/**
 * Parameters for useTrips hook
 */
export interface UseTripsParams {
  /** Whether to include trips shared with the user */
  includeShared?: boolean;
  /** Initial pagination limit */
  limit?: number;
  /** Initial pagination offset */
  offset?: number;
  /** Whether to load trips immediately */
  autoLoad?: boolean;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for accessing and managing trips
 */
export function useTrips({
  includeShared = false,
  limit = 10,
  offset = 0,
  autoLoad = true,
}: UseTripsParams = {}) {
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    limit,
    offset,
    totalCount: 0,
  });

  /**
   * Load trips for the current user
   */
  const loadTrips = useCallback(
    async (params: TripListParams = {}) => {
      const loadParams = {
        includeShared,
        limit: pagination.limit,
        offset: pagination.offset,
        ...params,
      };

      setIsLoading(true);
      setError(null);

      const result = await listTrips(loadParams);

      if (result.success) {
        setTrips(result.data);
      } else {
        setError(result.error);
        toast({
          title: 'Error loading trips',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [includeShared, pagination.limit, pagination.offset, toast]
  );

  /**
   * Load public trips
   */
  const loadPublicTrips = useCallback(
    async (params: TripListParams = {}) => {
      const loadParams = {
        limit: pagination.limit,
        offset: pagination.offset,
        ...params,
      };

      setIsLoading(true);
      setError(null);

      const result = await listPublicTrips(loadParams);

      if (result.success) {
        setTrips(result.data);
      } else {
        setError(result.error);
        toast({
          title: 'Error loading public trips',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [pagination.limit, pagination.offset, toast]
  );

  /**
   * Get a trip by ID
   */
  const fetchTrip = useCallback(
    async (tripId: string) => {
      setIsLoading(true);
      setError(null);

      const result = await getTrip(tripId);

      setIsLoading(false);

      if (!result.success) {
        setError(result.error);
        toast({
          title: 'Error loading trip',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      return result;
    },
    [toast]
  );

  /**
   * Get a trip with detailed information
   */
  const fetchTripWithDetails = useCallback(
    async (tripId: string) => {
      setIsLoading(true);
      setError(null);

      const result = await getTripWithDetails(tripId);

      setIsLoading(false);

      if (!result.success) {
        setError(result.error);
        toast({
          title: 'Error loading trip details',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      return result;
    },
    [toast]
  );

  /**
   * Create a new trip
   */
  const addTrip = useCallback(
    async (data: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => {
      setIsLoading(true);

      const result = await createTrip(data);

      if (result.success) {
        setTrips((prev) => [...prev, result.data]);
        toast({
          title: 'Trip created',
          description: 'Your trip has been created successfully.',
        });
      } else {
        toast({
          title: 'Error creating trip',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  /**
   * Update an existing trip
   */
  const editTrip = useCallback(
    async (tripId: string, data: Partial<Trip>) => {
      setIsLoading(true);

      const result = await updateTrip(tripId, data);

      if (result.success) {
        setTrips((prev) =>
          prev.map((trip) => (trip.id === tripId ? { ...trip, ...result.data } : trip))
        );
        toast({
          title: 'Trip updated',
          description: 'Your trip has been updated successfully.',
        });
      } else {
        toast({
          title: 'Error updating trip',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  /**
   * Update a trip with detailed information
   */
  const editTripWithDetails = useCallback(
    async (tripId: string, data: Partial<Trip> & { cities?: any[] }) => {
      setIsLoading(true);

      const result = await updateTripWithDetails(tripId, data);

      if (result.success) {
        setTrips((prev) =>
          prev.map((trip) => (trip.id === tripId ? { ...trip, ...result.data } : trip))
        );
        toast({
          title: 'Trip updated',
          description: 'Trip details have been updated successfully.',
        });
      } else {
        toast({
          title: 'Error updating trip',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  /**
   * Remove a trip
   */
  const removeTrip = useCallback(
    async (tripId: string) => {
      setIsLoading(true);

      const result = await deleteTrip(tripId);

      if (result.success) {
        setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
        toast({
          title: 'Trip deleted',
          description: 'The trip has been deleted successfully.',
        });
      } else {
        toast({
          title: 'Error deleting trip',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  /**
   * Duplicate a trip
   */
  const duplicate = useCallback(
    async (tripId: string, newName?: string) => {
      setIsLoading(true);

      const result = await duplicateTrip(tripId, newName);

      if (result.success) {
        setTrips((prev) => [...prev, result.data]);
        toast({
          title: 'Trip duplicated',
          description: 'The trip has been duplicated successfully.',
        });
      } else {
        toast({
          title: 'Error duplicating trip',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  /**
   * Archive a trip
   */
  const archive = useCallback(
    async (tripId: string) => {
      setIsLoading(true);

      const result = await archiveTrip(tripId);

      if (result.success) {
        setTrips((prev) =>
          prev.map((trip) => (trip.id === tripId ? { ...trip, ...result.data } : trip))
        );
        toast({
          title: 'Trip archived',
          description: 'The trip has been archived successfully.',
        });
      } else {
        toast({
          title: 'Error archiving trip',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  /**
   * Toggle a trip's public status
   */
  const togglePublic = useCallback(
    async (tripId: string, isPublic: boolean) => {
      setIsLoading(true);

      const result = await toggleTripPublic(tripId, isPublic);

      if (result.success) {
        setTrips((prev) =>
          prev.map((trip) => (trip.id === tripId ? { ...trip, ...result.data } : trip))
        );
        toast({
          title: isPublic ? 'Trip made public' : 'Trip made private',
          description: `The trip is now ${isPublic ? 'public' : 'private'}.`,
        });
      } else {
        toast({
          title: 'Error updating trip',
          description: result.error.message,
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  /**
   * Change pagination parameters
   */
  const changePagination = useCallback((newParams: { limit?: number; offset?: number }) => {
    setPagination((prev) => ({
      ...prev,
      ...newParams,
    }));
  }, []);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  }, []);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  }, []);

  // Load trips on mount or when pagination/includeShared changes
  useEffect(() => {
    if (autoLoad) {
      loadTrips();
    }
  }, [autoLoad, loadTrips, pagination.limit, pagination.offset, includeShared]);

  return {
    trips,
    isLoading,
    error,
    pagination,
    loadTrips,
    loadPublicTrips,
    fetchTrip,
    fetchTripWithDetails,
    addTrip,
    editTrip,
    editTripWithDetails,
    removeTrip,
    duplicateTrip: duplicate,
    archiveTrip: archive,
    togglePublic,
    changePagination,
    nextPage,
    prevPage,
  };
}
