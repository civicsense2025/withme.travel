/**
 * Feature-specific logistics hook for trips
 * 
 * This hook manages trip logistics items including accommodations, 
 * transportation, and forms using the centralized client API.
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  listLogisticsItems,
  addAccommodation,
  addTransportation,
  addForm,
  deleteLogisticsItem,
  updateLogisticsItem,
  type FormData,
  type LogisticsItem,
  type AccommodationData,
  type TransportationData,
} from '@/lib/client';
import type { Result } from '@/lib/client/result';
import { isSuccess, createFailure } from '@/lib/client/result';

/**
 * Hook return type for useLogistics
 */
export interface UseLogisticsResult {
  /** List of all logistics items for the trip */
  items: LogisticsItem[];
  /** Generic logistics items for simpler UI */
  logistics: Array<{ id: string; title: string; details: string | null }>;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh logistics items */
  refresh: () => Promise<void>;
  /** Alternative name for refresh */
  refreshLogistics: () => Promise<void>;
  /** Add an accommodation to the trip */
  addAccommodationItem: (data: AccommodationData) => Promise<Result<LogisticsItem>>;
  /** Add transportation to the trip */
  addTransportationItem: (data: TransportationData) => Promise<Result<LogisticsItem>>;
  /** Add a form to the trip */
  addFormItem: (data: FormData) => Promise<Result<LogisticsItem>>;
  /** Delete a logistics item */
  deleteItem: (itemId: string) => Promise<Result<void>>;
  /** Alternative name for deleteItem */
  deleteLogisticsItem: (itemId: string) => Promise<Result<void>>;
  /** Update a logistics item */
  updateItem: (
    itemId: string,
    data: Partial<AccommodationData | TransportationData | FormData> & { type: string }
  ) => Promise<Result<LogisticsItem>>;
  /** Add a generic logistics item */
  addLogisticsItem: (data: { title: string; details: string | null }) => Promise<Result<LogisticsItem>>;
  /** Update a generic logistics item */
  updateLogisticsItem: (itemId: string, data: { title: string; details: string | null }) => Promise<Result<LogisticsItem>>;
}

/**
 * useLogistics - React hook for managing trip logistics
 */
export function useLogistics(
  /** Trip ID to manage logistics for */
  tripId: string,
  /** Whether to fetch logistics on mount */
  fetchOnMount = true
): UseLogisticsResult {
  const { toast } = useToast();
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch logistics items
  const refresh = useCallback(async () => {
    if (!tripId) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await listLogisticsItems(tripId);
    
    if (isSuccess(result)) {
      setItems(result.data);
    } else {
      setError(result.error);
      toast({
        title: "Error",
        description: `Failed to load logistics items: ${result.error}`,
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  }, [tripId, toast]);

  // Add accommodation
  const addAccommodationItem = useCallback(
    async (data: AccommodationData): Promise<Result<LogisticsItem>> => {
      setIsLoading(true);
      
      const result = await addAccommodation(tripId, data);
      
      if (isSuccess(result)) {
        setItems((prev) => [...prev, result.data]);
        toast({
          title: "Success",
          description: 'Accommodation added successfully',
        });
        await refresh();
      } else {
        setError(result.error);
        toast({
          title: "Error",
          description: `Failed to add accommodation: ${result.error}`,
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
      return result;
    },
    [tripId, refresh, toast]
  );

  // Add transportation
  const addTransportationItem = useCallback(
    async (data: TransportationData): Promise<Result<LogisticsItem>> => {
      setIsLoading(true);
      
      const result = await addTransportation(tripId, data);
      
      if (isSuccess(result)) {
        setItems((prev) => [...prev, result.data]);
        toast({
          title: "Success",
          description: 'Transportation added successfully',
        });
        await refresh();
      } else {
        setError(result.error);
        toast({
          title: "Error",
          description: `Failed to add transportation: ${result.error}`,
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
      return result;
    },
    [tripId, refresh, toast]
  );

  // Add form
  const addFormItem = useCallback(
    async (data: FormData): Promise<Result<LogisticsItem>> => {
      setIsLoading(true);
      
      const result = await addForm(tripId, data);
      
      if (isSuccess(result)) {
        setItems((prev) => [...prev, result.data]);
        toast({
          title: "Success",
          description: 'Form added successfully',
        });
        await refresh();
      } else {
        setError(result.error);
        toast({
          title: "Error",
          description: `Failed to add form: ${result.error}`,
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
      return result;
    },
    [tripId, refresh, toast]
  );

  // Add generic logistics item (for simpler UI)
  const addLogisticsItem = useCallback(
    async (data: { title: string; details: string | null }): Promise<Result<LogisticsItem>> => {
      setIsLoading(true);
      
      // Use the form API for generic logistics items
      const formData: FormData = {
        title: data.title,
        description: data.details || '',
        templateId: null,
      };
      
      const result = await addForm(tripId, formData);
      
      if (isSuccess(result)) {
        setItems((prev) => [...prev, result.data]);
        await refresh();
      } else {
        setError(result.error);
      }
      
      setIsLoading(false);
      return result;
    },
    [tripId, refresh]
  );

  // Delete item
  const deleteItem = useCallback(
    async (itemId: string): Promise<Result<void>> => {
      setIsLoading(true);
      
      const result = await deleteLogisticsItem(tripId, itemId);
      
      if (isSuccess(result)) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        toast({
          title: "Success",
          description: 'Item deleted successfully',
        });
      } else {
        setError(result.error);
        toast({
          title: "Error",
          description: `Failed to delete item: ${result.error}`,
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Update item
  const updateItem = useCallback(
    async (
      itemId: string,
      data: Partial<AccommodationData | TransportationData | FormData> & { type: string }
    ): Promise<Result<LogisticsItem>> => {
      setIsLoading(true);
      
      const result = await updateLogisticsItem(tripId, itemId, data);
      
      if (isSuccess(result)) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? result.data : item))
        );
        toast({
          title: "Success",
          description: 'Item updated successfully',
        });
      } else {
        setError(result.error);
        toast({
          title: "Error",
          description: `Failed to update item: ${result.error}`,
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Update generic logistics item (for simpler UI)
  const updateGenericItem = useCallback(
    async (itemId: string, data: { title: string; details: string | null }): Promise<Result<LogisticsItem>> => {
      setIsLoading(true);
      
      const item = items.find(i => i.id === itemId);
      if (!item) {
        setIsLoading(false);
        return createFailure('Item not found');
      }
      
      const updateData = {
        ...item,
        title: data.title,
        description: data.details || '',
        type: 'form',
      };
      
      const result = await updateLogisticsItem(tripId, itemId, updateData);
      
      if (isSuccess(result)) {
        setItems(prev => prev.map(i => i.id === itemId ? result.data : i));
        await refresh();
      } else {
        setError(result.error);
      }
      
      setIsLoading(false);
      return result;
    },
    [tripId, items, refresh]
  );

  // Compute simplified logistics items for generic UI
  const logistics = useMemo(() => {
    return items.map(item => ({
      id: item.id,
      title: item.title,
      details: item.description || null
    }));
  }, [items]);

  // Initial load
  useEffect(() => {
    if (fetchOnMount && tripId) {
      refresh();
    }
  }, [fetchOnMount, tripId, refresh]);

  return {
    items,
    logistics,
    isLoading,
    error,
    refresh,
    refreshLogistics: refresh, // Alias for compatibility
    addAccommodationItem,
    addTransportationItem,
    addFormItem,
    deleteItem,
    deleteLogisticsItem: deleteItem, // Alias for compatibility
    updateItem,
    addLogisticsItem,
    updateLogisticsItem: updateGenericItem,
  };
} 