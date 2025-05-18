/**
 * Destinations hook
 *
 * Hook for managing destinations with state, loading, and error handling
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Destination,
  DestinationFilter,
  CreateDestinationData,
  UpdateDestinationData,
  listDestinations,
  getDestination,
  getDestinationBySlug,
  createDestination,
  updateDestination,
  deleteDestination,
  getFeaturedDestinations,
  getDestinationTags,
} from '@/lib/client/destinations';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

interface UseDestinationsOptions {
  initialFilter?: DestinationFilter;
  initialDestinations?: Destination[];
  autoFetch?: boolean;
}

interface UseDestinationsReturn {
  destinations: Destination[];
  isLoading: boolean;
  error: Error | null;
  filter: DestinationFilter;
  setFilter: (filter: DestinationFilter) => void;
  refetch: () => Promise<void>;
  getById: (id: string) => Promise<Destination | null>;
  getBySlug: (slug: string) => Promise<Destination | null>;
  create: (data: CreateDestinationData) => Promise<Destination | null>;
  update: (id: string, data: UpdateDestinationData) => Promise<Destination | null>;
  remove: (id: string) => Promise<boolean>;
  getFeatured: (limit?: number) => Promise<Destination[] | null>;
  getTags: () => Promise<string[] | null>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing destinations
 */
export function useDestinations({
  initialFilter = {},
  initialDestinations = [],
  autoFetch = true,
}: UseDestinationsOptions = {}): UseDestinationsReturn {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<DestinationFilter>(initialFilter);
  const { toast } = useToast();

  // Fetch destinations based on filter
  const fetchDestinations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await listDestinations(filter);

    if (result.success) {
      setDestinations(result.data);
    } else {
      setError(new Error(result.error));
      toast({
        title: 'Error',
        description: `Failed to load destinations: ${result.error}`,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }, [filter, toast]);

  // Effect to fetch destinations when filter changes
  useEffect(() => {
    if (autoFetch) {
      fetchDestinations();
    }
  }, [autoFetch, filter, fetchDestinations]);

  // Get destination by ID
  const getById = useCallback(
    async (id: string): Promise<Destination | null> => {
      const result = await getDestination(id);

      if (result.success) {
        return result.data;
      } else {
        toast({
          title: 'Error',
          description: `Failed to get destination: ${result.error}`,
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  // Get destination by slug
  const getBySlug = useCallback(
    async (slug: string): Promise<Destination | null> => {
      const result = await getDestinationBySlug(slug);

      if (result.success) {
        return result.data;
      } else {
        toast({
          title: 'Error',
          description: `Failed to get destination: ${result.error}`,
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  // Create a new destination
  const create = useCallback(
    async (data: CreateDestinationData): Promise<Destination | null> => {
      setIsLoading(true);

      const result = await createDestination(data);

      if (result.success) {
        setDestinations((prev) => [...prev, result.data]);
        toast({
          title: 'Success',
          description: 'Destination created successfully',
        });
        setIsLoading(false);
        return result.data;
      } else {
        setError(new Error(result.error));
        toast({
          title: 'Error',
          description: `Failed to create destination: ${result.error}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
    },
    [toast]
  );

  // Update an existing destination
  const update = useCallback(
    async (id: string, data: UpdateDestinationData): Promise<Destination | null> => {
      setIsLoading(true);

      const result = await updateDestination(id, data);

      if (result.success) {
        setDestinations((prev) =>
          prev.map((destination) => (destination.id === id ? result.data : destination))
        );
        toast({
          title: 'Success',
          description: 'Destination updated successfully',
        });
        setIsLoading(false);
        return result.data;
      } else {
        setError(new Error(result.error));
        toast({
          title: 'Error',
          description: `Failed to update destination: ${result.error}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
    },
    [toast]
  );

  // Delete a destination
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);

      const result = await deleteDestination(id);

      if (result.success) {
        setDestinations((prev) => prev.filter((destination) => destination.id !== id));
        toast({
          title: 'Success',
          description: 'Destination deleted successfully',
        });
        setIsLoading(false);
        return true;
      } else {
        setError(new Error(result.error));
        toast({
          title: 'Error',
          description: `Failed to delete destination: ${result.error}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }
    },
    [toast]
  );

  // Get featured destinations
  const getFeatured = useCallback(
    async (limit = 6): Promise<Destination[] | null> => {
      const result = await getFeaturedDestinations(limit);

      if (result.success) {
        return result.data;
      } else {
        toast({
          title: 'Error',
          description: `Failed to get featured destinations: ${result.error}`,
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  // Get destination tags
  const getTags = useCallback(async (): Promise<string[] | null> => {
    const result = await getDestinationTags();

    if (result.success) {
      return result.data;
    } else {
      toast({
        title: 'Error',
        description: `Failed to get destination tags: ${result.error}`,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  return {
    destinations,
    isLoading,
    error,
    filter,
    setFilter,
    refetch: fetchDestinations,
    getById,
    getBySlug,
    create,
    update,
    remove,
    getFeatured,
    getTags,
  };
}
