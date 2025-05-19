/**
 * Logistics management hook
 *
 * Manages accommodations and transportation items for trips
 *
 * @module hooks/logistics
 */

'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import {
  addAccommodationToTrip,
  addTransportationToTrip,
  listTripLogistics,
} from '@/lib/client/itinerary';
import { isSuccess } from '@/lib/client/result';

// ============================================================================
// TYPES
// ============================================================================

export interface LogisticsItem {
  id: string;
  type: 'accommodation' | 'transportation';
  title: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  trip_id?: string;
  meta?: Record<string, any>;
}

export interface AccommodationData {
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface TransportationData {
  title: string;
  departureLocation?: string;
  arrivalLocation?: string;
  departureDate?: string;
  arrivalDate?: string;
  description?: string;
}

export interface UseLogisticsResult {
  accommodations: LogisticsItem[];
  transportation: LogisticsItem[];
  isLoading: boolean;
  error: Error | null;
  addAccommodation: (data: AccommodationData) => Promise<boolean>;
  addTransportation: (data: TransportationData) => Promise<boolean>;
  refresh: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing trip logistics (accommodations and transportation)
 *
 * @param tripId - The ID of the trip
 */
export function useLogistics(tripId: string): UseLogisticsResult {
  const [accommodations, setAccommodations] = useState<LogisticsItem[]>([]);
  const [transportation, setTransportation] = useState<LogisticsItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Fetch all logistics items for a trip
   */
  const refresh = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await listTripLogistics(tripId);

      if (isSuccess(result)) {
        const items = result.data || [];

        // Split items by type
        const accommodationItems = items.filter((item) => item.type === 'accommodation');
        const transportationItems = items.filter((item) => item.type === 'transportation');

        setAccommodations(accommodationItems);
        setTransportation(transportationItems);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load logistics';
      setError(new Error(errorMessage));
      toast({
        title: 'Error loading logistics',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  /**
   * Add an accommodation to the trip
   */
  const addAccommodation = useCallback(
    async (accommodationData: AccommodationData): Promise<boolean> => {
      if (!tripId) return false;

      setIsLoading(true);
      try {
        const result = await addAccommodationToTrip(tripId, accommodationData);

        if (isSuccess(result)) {
          // Add to local state for immediate UI update
          const newItem: LogisticsItem = {
            id: result.data.id || `temp-${Date.now()}`,
            type: 'accommodation',
            title: accommodationData.title,
            location: accommodationData.location,
            startDate: accommodationData.startDate,
            endDate: accommodationData.endDate,
            description: accommodationData.description,
            trip_id: tripId,
          };

          setAccommodations((prev) => [...prev, newItem]);

          toast({
            title: 'Accommodation added',
            description: 'Your accommodation has been added to the trip',
          });

          return true;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add accommodation';
        setError(new Error(errorMessage));
        toast({
          title: 'Error adding accommodation',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, toast]
  );

  /**
   * Add transportation to the trip
   */
  const addTransportation = useCallback(
    async (transportData: TransportationData): Promise<boolean> => {
      if (!tripId) return false;

      setIsLoading(true);
      try {
        const result = await addTransportationToTrip(tripId, transportData);

        if (isSuccess(result)) {
          // Add to local state for immediate UI update
          const newItem: LogisticsItem = {
            id: result.data.id || `temp-${Date.now()}`,
            type: 'transportation',
            title: transportData.title,
            location: `${transportData.departureLocation || ''} to ${transportData.arrivalLocation || ''}`,
            startDate: transportData.departureDate,
            endDate: transportData.arrivalDate,
            description: transportData.description,
            trip_id: tripId,
          };

          setTransportation((prev) => [...prev, newItem]);

          toast({
            title: 'Transportation added',
            description: 'Your transportation has been added to the trip',
          });

          return true;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add transportation';
        setError(new Error(errorMessage));
        toast({
          title: 'Error adding transportation',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, toast]
  );

  return {
    accommodations,
    transportation,
    isLoading,
    error,
    addAccommodation,
    addTransportation,
    refresh,
  };
}
