/**
 * useItinerary Hook
 *
 * Custom React hook for managing trip itinerary items with CRUD operations,
 * reordering, filtering, and other itinerary-specific functionality.
 *
 * @module hooks/use-itinerary
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  listItineraryItems,
  getItineraryItem,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
  importFromTemplate,
  type LogisticsItem
} from '@/lib/client/itinerary';
import type { Result } from '@/lib/client/result';

// Use the ItineraryItem type from the API shared types
import type { ItineraryItem } from '@/lib/api/_shared';

/**
 * Parameters for using the itinerary hook
 */
export interface UseItineraryParams {
  /** The trip ID the itinerary is for */
  tripId: string;
  /** Whether to fetch items on component mount */
  fetchOnMount?: boolean;
}

/**
 * Helper to group itinerary items by day
 */
function groupByDay(items: ItineraryItem[]): Record<number, ItineraryItem[]> {
  return items.reduce((acc, item) => {
    const day = item.day ?? 0;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {} as Record<number, ItineraryItem[]>);
}

/**
 * useItinerary hook for managing trip itinerary items
 * @param params - Hook parameters
 * @returns Object with itinerary items, loading states, error handling, and CRUD operations
 */
export function useItinerary({ tripId, fetchOnMount = true }: UseItineraryParams) {
  // State
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [itemsByDay, setItemsByDay] = useState<Record<number, ItineraryItem[]>>({});
  const [currentItem, setCurrentItem] = useState<ItineraryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { toast } = useToast();

  // Update itemsByDay when items change
  useEffect(() => {
    setItemsByDay(groupByDay(items));
  }, [items]);

  // Fetch all itinerary items for the trip
  const fetchItems = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await listItineraryItems(tripId);
      
      if (result.success) {
        // Sort by day and position
        const sortedItems = [...result.data].sort((a, b) => {
          const dayA = a.day ?? 0;
          const dayB = b.day ?? 0;
          if (dayA !== dayB) return dayA - dayB;
          
          const posA = a.position ?? 0;
          const posB = b.position ?? 0;
          return posA - posB;
        });
        
        setItems(sortedItems);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({
        title: 'Failed to load itinerary',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  // Fetch a single itinerary item
  const fetchItem = useCallback(
    async (itemId: string) => {
      if (!tripId || !itemId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getItineraryItem(tripId, itemId);
        
        if (result.success) {
          setCurrentItem(result.data);
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to load itinerary item',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, toast]
  );

  // Create a new itinerary item
  const addItem = useCallback(
    async (data: Partial<ItineraryItem>) => {
      if (!tripId) return;

      setIsCreating(true);
      setError(null);

      try {
        const result = await createItineraryItem(tripId, data);
        
        if (result.success) {
          setItems((prev) => {
            const newItems = [...prev, result.data];
            return newItems.sort((a, b) => {
              const dayA = a.day ?? 0;
              const dayB = b.day ?? 0;
              if (dayA !== dayB) return dayA - dayB;
              
              const posA = a.position ?? 0;
              const posB = b.position ?? 0;
              return posA - posB;
            });
          });
          
          toast({
            title: 'Item added',
            description: 'Itinerary item has been added successfully.',
          });
          
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to add itinerary item',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsCreating(false);
      }
    },
    [tripId, toast]
  );

  // Update an existing itinerary item
  const updateItem = useCallback(
    async (itemId: string, data: Partial<ItineraryItem>) => {
      if (!tripId || !itemId) return;

      setIsUpdating(true);
      setError(null);

      try {
        const result = await updateItineraryItem(tripId, itemId, data);
        
        if (result.success) {
          // Update in items list
          setItems((prev) => {
            const newItems = prev.map((item) => (item.id === itemId ? result.data : item));
            return newItems.sort((a, b) => {
              const dayA = a.day ?? 0;
              const dayB = b.day ?? 0;
              if (dayA !== dayB) return dayA - dayB;
              
              const posA = a.position ?? 0;
              const posB = b.position ?? 0;
              return posA - posB;
            });
          });

          // Update current item if it's the one being edited
          if (currentItem?.id === itemId) {
            setCurrentItem(result.data);
          }

          toast({
            title: 'Item updated',
            description: 'Itinerary item has been updated successfully.',
          });
          
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to update itinerary item',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    [tripId, currentItem, toast]
  );

  // Delete an itinerary item
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!tripId || !itemId) return;

      setIsDeleting(true);
      setError(null);

      try {
        const result = await deleteItineraryItem(tripId, itemId);
        
        if (result.success) {
          // Remove from items list
          setItems((prev) => prev.filter((item) => item.id !== itemId));

          // Clear current item if it's the one being deleted
          if (currentItem?.id === itemId) {
            setCurrentItem(null);
          }

          toast({
            title: 'Item deleted',
            description: 'Itinerary item has been deleted successfully.',
          });
          
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to delete itinerary item',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsDeleting(false);
      }
    },
    [tripId, currentItem, toast]
  );

  // Reorder itinerary items
  const reorderItems = useCallback(
    async (itemsWithOrder: Array<{ id: string; position: number; day?: number }>) => {
      if (!tripId || !itemsWithOrder.length) return;

      setIsReordering(true);
      setError(null);

      try {
        const result = await reorderItineraryItems(tripId, itemsWithOrder);
        
        if (result.success) {
          // Update items with new order
          setItems(result.data);

          toast({
            title: 'Items reordered',
            description: 'Itinerary items have been reordered successfully.',
          });
          
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to reorder items',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsReordering(false);
      }
    },
    [tripId, toast]
  );

  // Import from template
  const importTemplate = useCallback(
    async (templateId: string, options?: { adjustDates?: boolean }) => {
      if (!tripId || !templateId) return;

      setIsImporting(true);
      setError(null);

      try {
        const result = await importFromTemplate(tripId, templateId, options);
        
        if (result.success) {
          // Update with imported items
          await fetchItems();

          toast({
            title: 'Template imported',
            description: 'Itinerary template has been imported successfully.',
          });
          
          return result;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to import template',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsImporting(false);
      }
    },
    [tripId, fetchItems, toast]
  );

  // Get items for a specific day
  const getItemsForDay = useCallback(
    (day: number) => {
      return itemsByDay[day] || [];
    },
    [itemsByDay]
  );

  // Fetch items on mount if enabled
  useEffect(() => {
    if (fetchOnMount && tripId) {
      fetchItems();
    }
  }, [fetchOnMount, tripId, fetchItems]);

  return {
    // Data
    items,
    itemsByDay,
    currentItem,
    error,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isReordering,
    isImporting,

    // Actions
    fetchItems,
    fetchItem,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    importTemplate,
    getItemsForDay,
  };
} 