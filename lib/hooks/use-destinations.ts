/**
 * useDestinations Hook
 *
 * Custom React hook for managing destinations with full CRUD capabilities,
 * search functionality and loading states.
 *
 * @module hooks/use-destinations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getDestinationBySlug,
  getFeaturedDestinations,
  type Destination,
  type CreateDestinationData,
  type UpdateDestinationData,
  type DestinationFilter,
} from '@/lib/client/destinations';
import type { Result } from '@/lib/client/result';
import { useToast } from '@/hooks/use-toast';

/**
 * useDestinations hook for managing destinations
 * @param initialFilters - Initial filters to apply
 * @param fetchOnMount - Whether to fetch destinations on mount
 * @returns Object with destinations, loading states, error handling, and CRUD operations
 */
export function useDestinations(initialFilters: DestinationFilter = {}, fetchOnMount = true) {
  // State
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
  const [filters, setFilters] = useState<DestinationFilter>(initialFilters);
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  // Fetch destinations based on filters
  const fetchDestinations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await listDestinations(filters);

    if (result.success) {
      setDestinations(result.data);
    } else {
      setError(String(result.error));
      toast({
        title: 'Failed to load destinations',
        description: String(result.error),
        variant: 'destructive',
      });
    }

    setIsLoading(false);
    return result;
  }, [filters, toast]);

  // Fetch a single destination by ID
  const fetchDestination = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);

      const result = await getDestination(id);

      if (result.success) {
        setCurrentDestination(result.data);
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to load destination',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  // Fetch a single destination by slug
  const fetchDestinationBySlug = useCallback(
    async (slug: string) => {
      setIsLoading(true);
      setError(null);

      const result = await getDestinationBySlug(slug);

      if (result.success) {
        setCurrentDestination(result.data);
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to load destination',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  // Create a new destination
  const addDestination = useCallback(
    async (data: CreateDestinationData) => {
      setIsCreating(true);
      setError(null);

      const result = await createDestination(data);

      if (result.success) {
        setDestinations((prev) => [...prev, result.data]);
        toast({
          title: 'Destination created',
          description: `${data.name} has been created successfully.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to create destination',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsCreating(false);
      return result;
    },
    [toast]
  );

  // Update an existing destination
  const updateDestinationById = useCallback(
    async (id: string, data: UpdateDestinationData) => {
      setIsUpdating(true);
      setError(null);

      const result = await updateDestination(id, data);

      if (result.success) {
        // Update in destinations list
        setDestinations((prev) => prev.map((dest) => (dest.id === id ? result.data : dest)));

        // Update current destination if it's the one being edited
        if (currentDestination?.id === id) {
          setCurrentDestination(result.data);
        }

        toast({
          title: 'Destination updated',
          description: `${data.name || 'Destination'} has been updated successfully.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to update destination',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsUpdating(false);
      return result;
    },
    [currentDestination, toast]
  );

  // Delete a destination
  const removeDestination = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      setError(null);

      const result = await deleteDestination(id);

      if (result.success) {
        // Remove from destinations list
        setDestinations((prev) => prev.filter((dest) => dest.id !== id));

        // Clear current destination if it's the one being deleted
        if (currentDestination?.id === id) {
          setCurrentDestination(null);
        }

        toast({
          title: 'Destination deleted',
          description: 'The destination has been deleted successfully.',
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to delete destination',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsDeleting(false);
      return result;
    },
    [currentDestination, toast]
  );

  // Fetch featured destinations
  const fetchFeaturedDestinations = useCallback(
    async (limit = 6) => {
      setIsLoading(true);
      setError(null);

      const result = await getFeaturedDestinations(limit);

      if (result.success) {
        setDestinations(result.data);
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to load featured destinations',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [toast]
  );

  // Update filters
  const applyFilters = useCallback((newFilters: DestinationFilter) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch destinations on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchDestinations();
    }
  }, [fetchOnMount, fetchDestinations]);

  return {
    // Data
    destinations,
    currentDestination,
    filters,
    error,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Actions
    fetchDestinations,
    fetchDestination,
    fetchDestinationBySlug,
    fetchFeaturedDestinations,
    addDestination,
    updateDestination: updateDestinationById,
    removeDestination,
    applyFilters,
    setFilters,
  };
}
