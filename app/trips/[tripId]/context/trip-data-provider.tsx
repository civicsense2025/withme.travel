'use client';

import { ITEM_STATUSES, TRIP_STATUSES } from '@/utils/constants/status';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import {
  Trip,
  ItineraryItem,
  ItinerarySection as DbItinerarySection,
} from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { TABLES, FIELDS } from '@/utils/constants/database';

// Type for the full trip data with all related entities
export interface TripData {
  trip: Trip | null;
  sections: DbItinerarySection[];
  items: ItineraryItem[];
  members: TripMember[];
  tags: TripTag[];
  manual_expenses: any[]; // Add manual_expenses field
}

export interface TripMember {
  id: string;
  user_id: string;
  trip_id: string;
  role: string;
  joined_at: string;
  created_at: string;
  profile?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
}

export interface TripTag {
  id: string;
  name: string;
}

interface TripContextType {
  tripData: TripData;
  isLoading: boolean;
  isItemsLoading: boolean;
  isMembersLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetchTrip: () => Promise<void>;
  refetchItinerary: () => Promise<void>;
  refetchMembers: () => Promise<void>;
  optimisticUpdate: <T extends keyof TripData>(
    key: T,
    updater: (currentData: TripData[T]) => TripData[T]
  ) => Promise<void>;
}

// Custom fetcher that handles error responses and includes credentials
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authenticated requests
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      const error = new Error(errorData.error || 'An error occurred while fetching the data');
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // Log error to Sentry for monitoring
    console.error(`Fetch error for ${url}:`, err);
    throw err;
  }
};

const TripContext = createContext<TripContextType | null>(null);

interface TripDataProviderProps {
  children: React.ReactNode;
  initialData?: any; // Add initialData prop to allow passing from server component
  tripId?: string;
}

export function TripDataProvider({ children, initialData, tripId }: TripDataProviderProps) {
  // Use initialData's tripId if provided, otherwise use tripId prop
  const id = initialData?.tripId || tripId;

  console.log('[TripDataProvider] Mounting for tripId:', id);

  if (!id) {
    console.error('[TripDataProvider] Requires either initialData with tripId or tripId prop');
  }

  // Fetch trip data, fallback to initialData if provided
  const {
    data: tripResponse,
    error: tripError,
    mutate: refetchTrip,
    isValidating: isTripValidating,
  } = useSWR(`/api/trips/${id}`, fetcher, {
    revalidateOnFocus: true,
    suspense: false,
    dedupingInterval: 2000, // Deduplicate requests within 2 seconds
    fallbackData: initialData
      ? {
          data: {
            id: initialData.tripId,
            name: initialData.tripName,
            description: initialData.tripDescription,
            start_date: initialData.startDate,
            end_date: initialData.endDate,
            cover_image_url: initialData.coverImageUrl,
            destination_id: initialData.destinationId,
            destination_lat: initialData.destinationLat,
            destination_lng: initialData.destinationLng,
            budget: initialData.initialTripBudget,
            tags: initialData.initialTags,
            slug: initialData.slug,
            privacy_setting: initialData.privacySetting,
            playlist_url: initialData.playlistUrl,
          },
        }
      : undefined,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Only retry up to 3 times
      if (retryCount >= 3) return;
      // Retry after 5 seconds
      setTimeout(() => revalidate({ retryCount }), 5000);
    },
  });

  console.log('[TripDataProvider] Trip SWR:', { isTripValidating, tripError, tripDataExists: !!tripResponse?.data });

  // Fetch itinerary data (sections and items)
  const {
    data: itineraryResponse,
    error: itineraryError,
    mutate: refetchItinerary,
    isValidating: isItineraryValidating,
  } = useSWR(`/api/trips/${id}/itinerary`, fetcher, {
    revalidateOnFocus: true,
    suspense: false,
    dedupingInterval: 2000, // Deduplicate requests within 2 seconds
    fallbackData: initialData
      ? {
          data: {
            sections: initialData.initialSections || [],
            items: initialData.initialUnscheduledItems || [],
          },
        }
      : undefined,
  });

  console.log('[TripDataProvider] Itinerary SWR:', { isItineraryValidating, itineraryError, itineraryDataExists: !!itineraryResponse?.data });

  // Fetch members
  const {
    data: membersResponse,
    error: membersError,
    mutate: refetchMembers,
    isValidating: isMembersValidating,
  } = useSWR(`/api/trips/${id}/members`, fetcher, {
    revalidateOnFocus: true,
    suspense: false,
    dedupingInterval: 2000, // Deduplicate requests within 2 seconds
    fallbackData: initialData
      ? {
          data: initialData.initialMembers || [],
        }
      : undefined,
  });

  console.log('[TripDataProvider] Members SWR:', { isMembersValidating, membersError, membersDataExists: !!membersResponse?.data });

  // Extract and validate data
  const trip = tripResponse?.data || null;
  const sections = itineraryResponse?.data?.sections || [];
  const items = itineraryResponse?.data?.items || [];
  const members = membersResponse?.data || [];
  const tags = tripResponse?.data?.tags || [];

  // Validate trip data is complete (has required fields)
  const validTripData = trip && 'id' in trip && 'name' in trip;

  // Loading states - include both initial load and revalidation state
  const isLoading = (!tripResponse && !tripError) || isTripValidating;
  const isItemsLoading = (!itineraryResponse && !itineraryError) || isItineraryValidating;
  const isMembersLoading = (!membersResponse && !membersError) || isMembersValidating;

  // Combine all errors
  const error =
    tripError ||
    itineraryError ||
    membersError ||
    (!validTripData && trip ? new Error('Invalid trip data received') : null);

  // Combined trip data object
  const tripData: TripData = {
    trip: validTripData ? trip : null,
    sections,
    items,
    members,
    tags,
    manual_expenses: [], // Initialize manual_expenses field
  };

  // Optimistic update helper - allows updating any part of the trip data optimistically
  const optimisticUpdate = async <T extends keyof TripData>(
    key: T,
    updater: (currentData: TripData[T]) => TripData[T]
  ) => {
    try {
      // Deep clone the current data to avoid unexpected mutations
      // Track the optimistic update in Sentry
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.addBreadcrumb({
          category: 'optimistic-update',
          message: `Optimistic update for ${String(key)}`,
          level: 'info',
          data: { tripId: id, dataKey: key },
        });
      }

      const currentValue = JSON.parse(JSON.stringify(tripData[key]));

      // Create a new data object with the updated property
      const newData = {
        ...tripData,
        [key]: updater(currentValue),
      };

      // Determine which refetch method to use based on the key
      let refetchMethod;
      switch (key) {
        case 'trip':
          refetchMethod = refetchTrip;
          break;
        case 'sections':
        case 'items':
          refetchMethod = refetchItinerary;
          break;
        case 'members':
          refetchMethod = refetchMembers;
          break;
        case 'tags':
          refetchMethod = refetchTrip;
          break;
        default:
          refetchMethod = refetchTrip;
      }

      // TypeScript interface for SWR response data structure with generic typing
      interface SWRResponseData<D = any> {
        data: D;
        [key: string]: any;
      }

      // Optimistically update the data
      await refetchMethod((oldData: SWRResponseData) => {
        if (!oldData) return { data: newData[key] };

        return {
          ...oldData,
          data:
            key === 'trip'
              ? newData[key]
              : {
                  ...(oldData.data || {}),
                  [key]: newData[key],
                },
        };
      }, false);
    } catch (error) {
      console.error(`Error during optimistic update of ${String(key)}:`, error);
      throw error;
    }
  };

  // Add combined loading state for easier checks
  const isFetching = isLoading || isItemsLoading || isMembersLoading;

  console.log('[TripDataProvider] Context Values:', { isLoading, isItemsLoading, isMembersLoading, isFetching, error: error?.message, hasValidTripData: validTripData });

  const value = {
    tripData,
    isLoading,
    isItemsLoading,
    isMembersLoading,
    isFetching,
    error,
    refetchTrip,
    refetchItinerary,
    refetchMembers,
    optimisticUpdate,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export const useTripData = () => {
  const context = useContext(TripContext);

  if (!context) {
    throw new Error('useTripData must be used within a TripDataProvider');
  }

  return context;
};
