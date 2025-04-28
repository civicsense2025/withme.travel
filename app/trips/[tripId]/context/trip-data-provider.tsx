"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { Trip, ItineraryItem, ItinerarySection } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';
import { ITEM_STATUSES, TRIP_STATUSES, DB_TABLES, DB_FIELDS } from '@/utils/constants';

// Type for the full trip data with all related entities
export interface TripData {
  trip: Trip | null;
  sections: ItinerarySection[];
  items: ItineraryItem[];
  members: TripMember[];
  tags: TripTag[];
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
  error: Error | null;
  refetchTrip: () => Promise<void>;
  refetchItinerary: () => Promise<void>;
  refetchMembers: () => Promise<void>;
  optimisticUpdate: <T extends keyof TripData>(
    key: T,
    updater: (currentData: TripData[T]) => TripData[T]
  ) => Promise<void>;
}

// Custom fetcher that handles error responses
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    const error = new Error(errorData.error || 'An error occurred while fetching the data');
    throw error;
  }
  
  return response.json();
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

  if (!id) {
    console.error('TripDataProvider requires either initialData with tripId or tripId prop');
  }
  
  // Fetch trip data, fallback to initialData if provided
  const { 
    data: tripResponse, 
    error: tripError, 
    mutate: refetchTrip 
  } = useSWR(`/api/trips/${id}`, fetcher, {
    revalidateOnFocus: true,
    suspense: false,
    fallbackData: initialData ? {
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
      }
    } : undefined,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Only retry up to 3 times
      if (retryCount >= 3) return;
      // Retry after 5 seconds
      setTimeout(() => revalidate({ retryCount }), 5000);
    }
  });
  
  // Fetch itinerary data (sections and items)
  const { 
    data: itineraryResponse, 
    error: itineraryError, 
    mutate: refetchItinerary 
  } = useSWR(`/api/trips/${id}/itinerary`, fetcher, {
    revalidateOnFocus: true,
    suspense: false,
    fallbackData: initialData ? {
      data: {
        sections: initialData.initialSections || [],
        items: initialData.initialUnscheduledItems || []
      }
    } : undefined
  });
  
  // Fetch members
  const { 
    data: membersResponse, 
    error: membersError, 
    mutate: refetchMembers 
  } = useSWR(`/api/trips/${id}/members`, fetcher, {
    revalidateOnFocus: true,
    suspense: false,
    fallbackData: initialData ? {
      data: initialData.initialMembers || []
    } : undefined
  });
  
  // Extract and validate data
  const trip = tripResponse?.data || null;
  const sections = itineraryResponse?.data?.sections || [];
  const items = itineraryResponse?.data?.items || [];
  const members = membersResponse?.data || [];
  const tags = tripResponse?.data?.tags || [];
  
  // Validate trip data is complete (has required fields)
  const validTripData = trip && 'id' in trip && 'name' in trip;
  
  // Loading states
  const isLoading = !tripResponse && !tripError;
  const isItemsLoading = !itineraryResponse && !itineraryError;
  const isMembersLoading = !membersResponse && !membersError;
  
  // Combine all errors
  const error = tripError || itineraryError || membersError || 
    (!validTripData && trip ? new Error('Invalid trip data received') : null);
  
  // Combined trip data object
  const tripData: TripData = {
    trip: validTripData ? trip : null,
    sections,
    items,
    members,
    tags,
  };
  
  // Optimistic update helper - allows updating any part of the trip data optimistically
  const optimisticUpdate = async <T extends keyof TripData>(
    key: T, 
    updater: (currentData: TripData[T]) => TripData[T]
  ) => {
    // Create a new data object with the updated property
    const newData = {
      ...tripData,
      [key]: updater(tripData[key])
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
      default:
        refetchMethod = refetchTrip;
    }
    
    // TypeScript interface for SWR response data structure
    interface SWRResponseData {
      data: any;
      [key: string]: any;
    }
    
    // Optimistically update the data
    await refetchMethod((oldData: SWRResponseData) => {
      return {
        ...oldData,
        data: key === 'trip' 
          ? newData[key] 
          : {
              ...oldData.data,
              [key]: newData[key]
            }
      };
    }, false);
  };
  
  const value = {
    tripData,
    isLoading,
    isItemsLoading,
    isMembersLoading,
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