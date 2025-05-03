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
import { TABLES } from '@/utils/constants/database';
// Default import for fast-deep-equal
import deepEqual from 'fast-deep-equal';

// Type for the full trip data with all related entities
export interface TripData {
  trip: Trip | null;
  sections: DbItinerarySection[];
  items: ItineraryItem[];
  members: TripMember[];
  tags: any[]; // Using any[] for tags
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

// Define the trip context type
export interface TripContextType {
  tripData: TripData | null;
  error: Error | null;
  isLoading: boolean;
  isItemsLoading: boolean;
  isMembersLoading: boolean;
  isFetching: boolean;
  refetchTrip: () => Promise<void>;
  refetchItinerary: () => Promise<void>;
  refetchMembers: () => Promise<void>;
  optimisticUpdate: <T extends keyof TripData>(
    key: T,
    updater: (currentData: TripData[T] | undefined) => TripData[T]
  ) => Promise<void>;
}

// Create the context 
const TripContext = createContext<TripContextType | null>(null);

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
      let errorData = { error: response.statusText };
      try {
        errorData = await response.json();
      } catch (parseError) {
        const textError = await response.text();
        errorData = { error: textError || response.statusText };
      }
      const error = new Error(errorData.error || 'An error occurred while fetching the data');
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    throw err;
  }
};

// Provider component
export interface TripDataProviderProps {
  children: React.ReactNode;
  initialData?: any;
  tripId?: string;
}

// Named export only (no default export)
export function TripDataProvider({ children, initialData, tripId }: TripDataProviderProps) {
  const id = initialData?.tripId || tripId;

  // --- Manage tripData with useState ---
  const [tripDataState, setTripDataState] = useState<TripData | null>(null);
  const [errorState, setErrorState] = useState<Error | null>(null);
  // --- End useState ---

  if (!id) {
    console.error('[TripDataProvider] Requires either initialData with tripId or tripId prop');
    // Handle error state appropriately, maybe set an error in state
  }

  // Fetch trip data using SWR
  const {
    data: tripResponse,
    error: tripError,
    mutate: refetchTrip,
    isValidating: isTripValidating,
  } = useSWR(
    id ? `/api/trips/${id}` : null, // Only fetch if id is present
    fetcher,
    {
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
    }
  );

  // Fetch itinerary data using SWR
  const {
    data: itineraryResponse,
    error: itineraryError,
    mutate: refetchItinerary,
    isValidating: isItineraryValidating,
  } = useSWR(
    id ? `/api/trips/${id}/itinerary` : null, // Only fetch if id is present
    fetcher,
    {
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
    }
  );

  // Fetch members using SWR
  const {
    data: membersResponse,
    error: membersError,
    mutate: refetchMembers,
    isValidating: isMembersValidating,
  } = useSWR(
    id ? `/api/trips/${id}/members` : null, // Only fetch if id is present
    fetcher,
    {
      revalidateOnFocus: true,
      suspense: false,
      dedupingInterval: 2000, // Deduplicate requests within 2 seconds
      fallbackData: initialData
        ? {
            data: initialData.initialMembers || [],
          }
        : undefined,
    }
  );

  // Effect to consolidate fetched data into the final state
  useEffect(() => {
    const allFetchesDone = !isTripValidating && !isItineraryValidating && !isMembersValidating;
    const firstError = tripError || itineraryError || membersError; // Capture the first error

    // Clear previous errors if fetches are starting/ongoing
    if (isTripValidating || isItineraryValidating || isMembersValidating) {
      setErrorState(null);
    }

    if (allFetchesDone) {
      if (firstError) {
        // Handle errors reported by SWR fetches
        console.error('[TripDataProvider] SWR Error:', firstError);
        setErrorState(firstError); // Set the first error encountered
        setTripDataState(null); // Clear data on error
        return; // Stop processing if there was an error
      }

      // --- Data Consolidation ---
      // Access the actual data objects returned by SWR/fetcher
      const actualTripData = tripResponse; // Trip API doesn't wrap in 'data'
      const actualItineraryData = itineraryResponse?.data; // Itinerary API wraps in 'data'
      const actualMembersData = membersResponse?.data; // Members API wraps in 'data'

      // Validate the core trip data object
      const isValidTripObject =
        actualTripData &&
        typeof actualTripData === 'object' &&
        !Array.isArray(actualTripData) &&
        actualTripData.id;

      if (!isValidTripObject) {
        // If trip fetch succeeded (no error) but data is invalid/missing AFTER fetch completes
        console.error(
          '[TripDataProvider] Invalid or missing core trip object after fetch completed.',
          actualTripData
        );
        setErrorState(new Error('Failed to load essential trip details.'));
        setTripDataState(null);
        return; // Stop processing
      }

      // Proceed only if core trip data is valid
      const newTripData: TripData = {
        trip: actualTripData, // Assign validated data
        // Safely access nested properties for itinerary and members
        sections: actualItineraryData?.sections || [],
        items: actualItineraryData?.items || [],
        members: actualMembersData || [], // Assuming members API returns array directly under 'data'
        tags: actualTripData.trip_tags?.map((t: any) => t.tags) || [], // Use validated actualTripData
        manual_expenses: [], // Fetch separately
      };

      // Use deepEqual to prevent unnecessary updates/re-renders
      if (!deepEqual(newTripData, tripDataState)) {
        console.log('[TripDataProvider] Setting new tripDataState');
        setTripDataState(newTripData);
        setErrorState(null); // Clear error state on successful update
      }
    }
    // If fetches are not done, do nothing yet, wait for the next effect run
  }, [
    tripResponse,
    itineraryResponse,
    membersResponse,
    isTripValidating,
    isItineraryValidating,
    isMembersValidating,
    tripError,
    itineraryError,
    membersError,
    tripDataState, // Include tripDataState for deepEqual comparison
  ]);

  // Loading states
  const isLoading = (!tripResponse && !tripError) || isTripValidating;
  const isItemsLoading = (!itineraryResponse && !itineraryError) || isItineraryValidating;
  const isMembersLoading = (!membersResponse && !membersError) || isMembersValidating;

  // Combine all errors
  const error =
    tripError ||
    itineraryError ||
    membersError ||
    // Check state *after* useEffect might have set it
    (tripDataState && !tripDataState.trip ? new Error('Invalid trip data processed') : null);

  // Optimistic update helper - needs adjustment to work with state
  const optimisticUpdate = useCallback(
    async <T extends keyof TripData>(
      key: T,
      updater: (currentData: TripData[T] | undefined) => TripData[T]
    ) => {
      // Use setTripDataState with a function to get the latest state
      setTripDataState((currentState) => {
        if (!currentState) {
          console.error('Cannot perform optimistic update on null state');
          return null;
        }
        const currentValue = currentState[key];
        const updatedValue = updater(currentValue);

        // Return new state object
        return { ...currentState, [key]: updatedValue };
      });

      // SWR mutation part remains similar but needs careful handling
      // Determine which refetch method to use based on the key
      let swrMutate, swrKey;
      switch (key) {
        case 'trip':
          swrMutate = refetchTrip;
          swrKey = `/api/trips/${id}`;
          break;
        case 'sections':
        case 'items':
          swrMutate = refetchItinerary;
          swrKey = `/api/trips/${id}/itinerary`;
          break;
        case 'members':
          swrMutate = refetchMembers;
          swrKey = `/api/trips/${id}/members`;
          break;
        case 'tags':
          swrMutate = refetchTrip;
          swrKey = `/api/trips/${id}`;
          break;
        default:
          swrMutate = refetchTrip;
          swrKey = `/api/trips/${id}`;
          break;
      }

      // Re-fetch immediately after optimistic update (or use SWR's optimisticData feature)
      // For simplicity, just trigger revalidation here.
      // A more robust implementation might use SWR's mutate(..., { optimisticData: ... })
      if (swrMutate) {
        await swrMutate(); // Revalidate to get fresh data
      } else {
        console.warn('No SWR mutation function found for key:', key);
      }
    },
    [id, refetchTrip, refetchItinerary, refetchMembers]
  ); // Add dependencies

  // Add combined loading state for easier checks
  const isFetching = isLoading || isItemsLoading || isMembersLoading;

  console.log('[TripDataProvider] Context Values:', {
    isLoading,
    isItemsLoading,
    isMembersLoading,
    isFetching,
    error: error?.message,
    hasValidTrip: !!tripDataState?.trip,
  });

  const value = {
    tripData: tripDataState, // Use state variable
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
