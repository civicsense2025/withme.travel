/**
 * Popular Destinations Hook
 * 
 * Provides functionality for fetching popular destinations.
 * 
 * @module features/destinations/hooks/use-popular-destinations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import { getFeaturedDestinations } from '@/lib/client/destinations';
import type { Destination } from '@/lib/client/destinations';
import { 
  getDestinationDisplayName, 
  getDestinationImageUrl,
  getDestinationPath,
  formatDestinationLocation,
  getDestinationExcerpt
} from '@/lib/features/destinations/utils/destination-formatter';

// ============================================================================
// TYPES
// ============================================================================

/**
 * State of an async fetch operation
 */
interface FetchState {
  /** Current status of the fetch operation */
  status: 'idle' | 'loading' | 'success' | 'error';
  /** Error message if status is 'error' */
  error?: string;
}

/**
 * Enhanced destination with display properties for UI
 */
interface EnhancedDestination extends Destination {
  /** Formatted display name */
  displayName: string;
  /** Formatted location string */
  locationString: string;
  /** URL for the destination image */
  imageUrl: string;
  /** Short excerpt/description */
  excerpt: string;
  /** Path/URL for the destination page */
  path: string;
}

/**
 * Response from the hook with all available operations and state
 */
export interface UsePopularDestinationsResult {
  /** List of popular destinations */
  destinations: EnhancedDestination[];
  /** Fetch state object containing loading and error information */
  fetchState: FetchState;
  /** Function to manually refresh the destinations list */
  refetch: () => Promise<void>;
  /** Limit of destinations to fetch */
  limit: number;
  /** Function to update the limit */
  setLimit: (limit: number) => void;
}

/**
 * Enhances a destination with display properties
 */
function enhanceDestination(destination: Destination): EnhancedDestination {
  return {
    ...destination,
    // Add derived properties for UI display
    displayName: getDestinationDisplayName(destination),
    locationString: formatDestinationLocation(destination),
    imageUrl: getDestinationImageUrl(destination),
    excerpt: getDestinationExcerpt(destination),
    path: getDestinationPath(destination)
  };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook to fetch and manage popular destinations
 * 
 * @param initialLimit - Number of destinations to fetch
 * @returns Popular destinations data and state
 */
export function usePopularDestinations(
  initialLimit = 8
): UsePopularDestinationsResult {
  // ========== State ==========
  const [destinations, setDestinations] = useState<EnhancedDestination[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });
  const [limit, setLimit] = useState<number>(initialLimit);
  
  // ========== Dependencies ==========
  const { toast } = useToast();

  // ========== Fetch Logic ==========
  const fetchDestinations = useCallback(async (): Promise<void> => {
    try {
      setFetchState({ status: 'loading' });
      
      const result = await getFeaturedDestinations(limit);
      
      if (result.success) {
        // Format destinations for display
        const enhancedDestinations = result.data.map(enhanceDestination);
        setDestinations(enhancedDestinations);
        setFetchState({ status: 'success' });
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      
      const error = new Error(errorMessage);
      setFetchState({ status: 'error', error: error.message });
      
      toast({
        title: 'Error loading popular destinations',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [limit, toast]);

  // ========== Update Limit ==========
  const handleSetLimit = useCallback((newLimit: number) => {
    if (newLimit < 1) {
      console.warn('Limit must be at least 1, using 1 instead');
      setLimit(1);
    } else {
      setLimit(newLimit);
    }
  }, []);

  // ========== Initial Data Loading ==========
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Return the hook's API
  return {
    destinations,
    fetchState,
    refetch: fetchDestinations,
    limit,
    setLimit: handleSetLimit,
  };
} 