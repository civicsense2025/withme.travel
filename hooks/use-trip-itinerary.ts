/**
 * useTripItinerary Hook
 *
 * Manages trip itinerary state, CRUD actions, and loading/error handling.
 * Uses the standardized Result pattern and client API wrapper.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ItineraryItem } from '@/lib/api/_shared';
import {
  listItineraryItems,
  getItineraryItem,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
  importFromTemplate,
} from '@/lib/client/itinerary';
import type { Result } from '@/lib/client/result';

/**
 * Hook return type for useTripItinerary
 */
export interface UseTripItineraryResult {
  items: ItineraryItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addItem: (data: Partial<ItineraryItem>) => Promise<Result<ItineraryItem>>;
  editItem: (itemId: string, data: Partial<ItineraryItem>) => Promise<Result<ItineraryItem>>;
  removeItem: (itemId: string) => Promise<Result<null>>;
  reorderItems: (items: Array<{ id: string; position: number; day?: number }>) => Promise<Result<ItineraryItem[]>>;
  importTemplate: (templateId: string, options?: { adjustDates?: boolean }) => Promise<Result<ItineraryItem[]>>;
}

/**
 * useTripItinerary - React hook for managing trip itinerary
 */
export function useTripItinerary(tripId: string): UseTripItineraryResult {
  const { toast } = useToast();
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all itinerary items for the trip
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await listItineraryItems(tripId);
    if (result.success) {
      setItems(result.data);
    } else {
      setError(result.error);
      toast({
        title: 'Failed to load itinerary',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [tripId, toast]);

  // Add a new itinerary item
  const addItem = useCallback(
    async (data: Partial<ItineraryItem>) => {
      setIsLoading(true);
      const result = await createItineraryItem(tripId, data);
      if (result.success) {
        setItems((prev) => [...prev, result.data]);
        toast({ title: 'Item added to itinerary' });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to add item',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Edit an existing itinerary item
  const editItem = useCallback(
    async (itemId: string, data: Partial<ItineraryItem>) => {
      setIsLoading(true);
      const result = await updateItineraryItem(tripId, itemId, data);
      if (result.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? result.data : item))
        );
        toast({ title: 'Item updated' });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to update item',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Remove an itinerary item
  const removeItem = useCallback(
    async (itemId: string) => {
      setIsLoading(true);
      const result = await deleteItineraryItem(tripId, itemId);
      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        toast({ title: 'Item removed from itinerary' });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to remove item',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Reorder itinerary items
  const reorderItems = useCallback(
    async (itemsToReorder: Array<{ id: string; position: number; day?: number }>) => {
      setIsLoading(true);
      const result = await reorderItineraryItems(tripId, itemsToReorder);
      if (result.success) {
        setItems(result.data);
        toast({ title: 'Itinerary order updated' });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to reorder items',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Import from template
  const importTemplate = useCallback(
    async (templateId: string, options?: { adjustDates?: boolean }) => {
      setIsLoading(true);
      const result = await importFromTemplate(tripId, templateId, options);
      if (result.success) {
        setItems((prev) => [...prev, ...result.data]);
        toast({ 
          title: 'Template imported',
          description: `${result.data.length} items added to itinerary`,
        });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to import template',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Initial load
  useEffect(() => {
    if (tripId) {
      refresh();
    }
  }, [tripId, refresh]);

  return {
    items,
    isLoading,
    error,
    refresh,
    addItem,
    editItem,
    removeItem,
    reorderItems,
    importTemplate,
  };
}
