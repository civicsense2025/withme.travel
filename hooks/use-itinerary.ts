/**
 * useItinerary
 *
 * Custom hook for managing trip itinerary items, CRUD, reordering, and voting.
 *
 * @module hooks/use-itinerary
 */

'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  listItineraryItems,
  createItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
} from '@/lib/client/itinerary';
import { isSuccess } from '@/lib/client/result';
import type { ItineraryItem } from '@/lib/api/_shared';

export interface UseItineraryResult {
  items: ItineraryItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (data: Partial<ItineraryItem>) => Promise<ItineraryItem | null>;
  updateItem: (itemId: string, data: Partial<ItineraryItem>) => Promise<ItineraryItem | null>;
  deleteItem: (itemId: string) => Promise<boolean>;
  reorderItems: (items: Array<{ id: string; position: number; day?: number }>) => Promise<boolean>;
}

export function useItinerary(tripId: string): UseItineraryResult {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all itinerary items
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await listItineraryItems(tripId);
    if (isSuccess(result)) {
      setItems(result.data || []);
    } else {
      setError(typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error));
      toast({
        title: 'Error loading itinerary',
        description: typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error),
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [tripId, toast]);

  // Add a new item
  const addItem = useCallback(async (data: Partial<ItineraryItem>) => {
    setIsLoading(true);
    setError(null);
    const result = await createItineraryItem(tripId, data);
    if (isSuccess(result)) {
      setItems((prev) => [...prev, result.data]);
      toast({ title: 'Item added', description: 'Itinerary updated.' });
      setIsLoading(false);
      return result.data;
    } else {
      setError(typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error));
      toast({
        title: 'Error adding item',
        description: typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error),
        variant: 'destructive',
      });
      setIsLoading(false);
      return null;
    }
  }, [tripId, toast]);

  // Update an item
  const updateItem = useCallback(async (itemId: string, data: Partial<ItineraryItem>) => {
    setIsLoading(true);
    setError(null);
    const result = await updateItineraryItem(tripId, itemId, data);
    if (isSuccess(result)) {
      setItems((prev) => prev.map((item) => (item.id === itemId ? result.data : item)));
      toast({ title: 'Item updated', description: 'Itinerary updated.' });
      setIsLoading(false);
      return result.data;
    } else {
      setError(typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error));
      toast({
        title: 'Error updating item',
        description: typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error),
        variant: 'destructive',
      });
      setIsLoading(false);
      return null;
    }
  }, [tripId, toast]);

  // Delete an item
  const deleteItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    setError(null);
    const result = await deleteItineraryItem(tripId, itemId);
    if (isSuccess(result)) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast({ title: 'Item deleted', description: 'Itinerary updated.' });
      setIsLoading(false);
      return true;
    } else {
      setError(typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error));
      toast({
        title: 'Error deleting item',
        description: typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error),
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  }, [tripId, toast]);

  // Reorder items
  const reorderItems = useCallback(async (itemsToReorder: Array<{ id: string; position: number; day?: number }>) => {
    setIsLoading(true);
    setError(null);
    const result = await reorderItineraryItems(tripId, itemsToReorder);
    if (isSuccess(result)) {
      setItems(result.data || []);
      toast({ title: 'Itinerary reordered', description: 'Order updated.' });
      setIsLoading(false);
      return true;
    } else {
      setError(typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error));
      toast({
        title: 'Error reordering items',
        description: typeof result.error === 'string' ? result.error : (result.error as any)?.message || String(result.error),
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  }, [tripId, toast]);

  return {
    items,
    isLoading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
} 