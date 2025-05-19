/**
 * Destinations Hooks (Modern AsyncData Version)
 *
 * Provides hooks for fetching and managing destination data using useAsyncData.
 *
 * @module features/destinations/hooks/use-destinations
 */
'use client';

import { useCallback } from 'react';
import { useAsyncData } from '@/lib/hooks/use-async-data';
import {
  listDestinations,
  getDestination,
  getFeaturedDestinations,
  type Destination,
  type DestinationFilter,
} from '@/lib/client/destinations';
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
 * Filter options for fetching destinations
 */
export interface DestinationFilters extends DestinationFilter {
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Sort field */
  sortBy?: 'name' | 'created_at' | 'popularity';
}

/**
 * State for managing loading and error states
 */
export type FetchState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success' };

/**
 * Destination with display-related properties for UI rendering
 */
export interface EnhancedDestination extends Destination {
  displayName: string;
  locationString: string;
  imageUrl: string;
  excerpt: string;
  path: string;
}

/**
 * Response from the hook with all available operations and state
 */
export interface UseDestinationsResult {
  /** List of destinations matching filters */
  destinations: EnhancedDestination[];
  /** Total count of destinations matching filter (for pagination) */
  totalCount: number;
  /** Fetch state object containing loading and error information */
  fetchState: FetchState;
  /** Current filter parameters */
  filters: DestinationFilters;
  /** Function to update filters and refetch */
  updateFilters: (newFilters: Partial<DestinationFilters>) => void;
  /** Function to fetch a single destination by ID */
  getDestinationById: (id: string) => Promise<EnhancedDestination | null>;
  /** Function to manually refresh the destinations list */
  refetch: () => Promise<void>;
  /** Function to handle pagination */
  handlePagination: (page: number) => void;
}

/**
 * Format a raw destination for display with useful derived properties
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
// HOOKS
// ============================================================================

/**
 * Hook for fetching a list of destinations with filters, pagination, and sorting.
 *
 * @param filter - Filter options for destinations
 * @param options - Additional async data options
 */
export function useDestinations(
  filter: DestinationFilter = {},
  options = {}
) {
  return useAsyncData<Destination[]>(
    () =>
      listDestinations(filter).then((res) =>
        res.success ? res.data : Promise.reject(res.error)
      ),
    {
      ...options,
      dependencies: [JSON.stringify(filter)],
      errorMessage: 'Failed to load destinations',
    }
  );
}

/**
 * Hook for fetching a single destination by ID.
 *
 * @param id - The destination ID
 * @param options - Additional async data options
 */
export function useSingleDestination(
  id: string | null,
  options = {}
) {
  return useAsyncData<Destination | undefined>(
    () =>
      id
        ? getDestination(id).then((res) =>
            res.success ? res.data : Promise.reject(res.error)
          )
        : Promise.resolve(undefined),
    {
      ...options,
      dependencies: [id],
      errorMessage: 'Failed to load destination',
      loadOnMount: !!id,
    }
  );
}

/**
 * Hook for fetching popular/featured destinations.
 *
 * @param limit - Number of destinations to fetch
 * @param options - Additional async data options
 */
export function usePopularDestinations(
  limit = 8,
  options = {}
) {
  return useAsyncData<Destination[]>(
    () =>
      getFeaturedDestinations(limit).then((res) =>
        res.success ? res.data : Promise.reject(res.error)
      ),
    {
      ...options,
      dependencies: [limit],
      errorMessage: 'Failed to load popular destinations',
    }
  );
} 