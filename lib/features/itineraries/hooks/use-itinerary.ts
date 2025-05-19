/**
 * Use Itinerary Hook
 * 
 * React hook for managing itinerary data for a specific trip
 * 
 * @module lib/features/itineraries/hooks/use-itinerary
 */

import { useState, useEffect, useCallback } from 'react';
import { ItineraryItem } from '../types';
import * as itineraryClient from '../client';
import { useAuth } from '@/lib/hooks/use-auth';

// ============================================================================
// TYPES
// ============================================================================

export interface UseItineraryOptions {
  /** Whether to fetch data on mount */
  initialFetch?: boolean;
  /** Callback when data changes */
  onDataChange?: (items: ItineraryItem[]) => void;
}

export interface UseItineraryResult {
  /** All itinerary items */
  items: ItineraryItem[];
  /** Whether data is being loaded */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Refetch data */
  refetch: () => Promise<void>;
  /** Create a new item */
  createItem: (item: Omit<ItineraryItem, 'id' | 'created_at' | 'trip_id'>) => Promise<ItineraryItem>;
  /** Update an existing item */
  updateItem: (itemId: string, updates: Partial<Omit<ItineraryItem, 'id' | 'created_at' | 'trip_id'>>) => Promise<ItineraryItem>;
  /** Delete an item */
  deleteItem: (itemId: string) => Promise<void>;
  /** Reorder items */
  reorderItems: (items: { id: string; order: number; day?: number }[]) => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing itinerary data for a trip
 */
export function useItinerary(
  tripId: string,
  options: UseItineraryOptions = {}
): UseItineraryResult {
  const { initialFetch = true, onDataChange } = options;
  const { user } = useAuth();
  
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(initialFetch);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Fetch itinerary items
   */
  const fetchItems = useCallback(async () => {
    if (!tripId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await itineraryClient.fetchItineraryItems(tripId);
      setItems(data);
      if (onDataChange) onDataChange(data);
    } catch (err) {
      console.error('Error fetching itinerary items:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [tripId, onDataChange]);
  
  /**
   * Create a new item
   */
  const createItem = useCallback(async (
    item: Omit<ItineraryItem, 'id' | 'created_at' | 'trip_id'>
  ): Promise<ItineraryItem> => {
    try {
      const newItem = await itineraryClient.createItineraryItem(tripId, item);
      
      // Update local state
      setItems(prevItems => [...prevItems, newItem]);
      if (onDataChange) onDataChange([...items, newItem]);
      
      return newItem;
    } catch (err) {
      console.error('Error creating itinerary item:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }, [tripId, items, onDataChange]);
  
  /**
   * Update an existing item
   */
  const updateItem = useCallback(async (
    itemId: string, 
    updates: Partial<Omit<ItineraryItem, 'id' | 'created_at' | 'trip_id'>>
  ): Promise<ItineraryItem> => {
    try {
      const updatedItem = await itineraryClient.updateItineraryItem(tripId, itemId, updates);
      
      // Update local state
      setItems(prevItems => 
        prevItems.map(item => item.id === itemId ? updatedItem : item)
      );
      
      if (onDataChange) {
        onDataChange(items.map(item => item.id === itemId ? updatedItem : item));
      }
      
      return updatedItem;
    } catch (err) {
      console.error('Error updating itinerary item:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }, [tripId, items, onDataChange]);
  
  /**
   * Delete an item
   */
  const deleteItem = useCallback(async (itemId: string): Promise<void> => {
    try {
      await itineraryClient.deleteItineraryItem(tripId, itemId);
      
      // Update local state
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      
      if (onDataChange) {
        onDataChange(updatedItems);
      }
    } catch (err) {
      console.error('Error deleting itinerary item:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }, [tripId, items, onDataChange]);
  
  /**
   * Reorder items
   */
  const reorderItems = useCallback(async (
    itemUpdates: { id: string; order: number; day?: number }[]
  ): Promise<void> => {
    try {
      await itineraryClient.reorderItineraryItems(tripId, itemUpdates);
      
      // Update local state optimistically
      const updatedItems = [...items];
      
      // Apply updates to local items
      itemUpdates.forEach(update => {
        const itemIndex = updatedItems.findIndex(item => item.id === update.id);
        if (itemIndex >= 0) {
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            order: update.order,
            ...(update.day !== undefined ? { day: update.day } : {})
          };
        }
      });
      
      // Sort items by day and order
      updatedItems.sort((a, b) => {
        const dayA = a.day ?? 0;
        const dayB = b.day ?? 0;
        
        if (dayA !== dayB) return dayA - dayB;
        return (a.order ?? 0) - (b.order ?? 0);
      });
      
      setItems(updatedItems);
      
      if (onDataChange) {
        onDataChange(updatedItems);
      }
    } catch (err) {
      console.error('Error reordering itinerary items:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }, [tripId, items, onDataChange]);
  
  // Initial fetch
  useEffect(() => {
    if (initialFetch && tripId) {
      fetchItems();
    }
  }, [initialFetch, fetchItems, tripId]);
  
  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    createItem,
    updateItem,
    deleteItem,
    reorderItems
  };
} 