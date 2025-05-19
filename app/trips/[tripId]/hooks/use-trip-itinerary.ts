'use client';
import { API_ROUTES } from '@/utils/constants/routes';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/lib/hooks/use-toast'
import { formatError } from '@/utils/lib-utils';
import { ITEM_STATUSES, type ItemStatus } from '@/utils/constants/status';
import type { DisplayItineraryItem, ItinerarySection } from '@/types/itinerary';

// Define TravelTimesResult type inline
interface TravelTimesResult {
  duration: number;
  distance: number;
  route?: string;
}

export interface TripItineraryInitialData {
  tripId: string;
  initialSections: ItinerarySection[]; // Using proper type from @/types/itinerary
  initialUnscheduledItems: DisplayItineraryItem[];
  canEdit: boolean;
  userRole: string | null;
  userId: string;
}

/**
 * Hook to manage trip itinerary data and actions
 * Handles state and operations for itinerary items, sections, and related functionality
 */
export function useTripItinerary({
  tripId,
  initialSections,
  initialUnscheduledItems,
  canEdit,
  userRole,
  userId,
}: TripItineraryInitialData) {
  const { toast } = useToast();

  // Itinerary state
  const [sections, setSections] = useState<ItinerarySection[]>(initialSections || []);
  const [unscheduledItems, setUnscheduledItems] = useState<DisplayItineraryItem[]>(
    initialUnscheduledItems || []
  );
  const [allItems, setAllItems] = useState<DisplayItineraryItem[]>([]);
  const [travelTimes, setTravelTimes] = useState<Record<string, TravelTimesResult> | null>(null);

  // UI state
  const [isAddingItemToDay, setIsAddingItemToDay] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<DisplayItineraryItem | null>(null);
  const [loadingTravelTimes, setLoadingTravelTimes] = useState(false);

  // Initialize the combined items list when sections or unscheduled items change
  useEffect(() => {
    const combinedItems = [
      ...(sections?.flatMap((s) => s.items ?? []) || []),
      ...(unscheduledItems || []),
    ];

    // Sort items by day (nulls/undefined last) and then position
    combinedItems.sort((a, b) => {
      // Both items should be defined at this point, but TypeScript doesn't know that
      if (!a || !b) return 0;

      const dayA = a.day_number ?? Number.MAX_SAFE_INTEGER;
      const dayB = b.day_number ?? Number.MAX_SAFE_INTEGER;
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;

      // First sort by day_number, then by position
      return dayA === dayB ? posA - posB : dayA - dayB;
    });

    // Filter out any null/undefined values before setting state
    setAllItems(
      combinedItems.filter(
        (item): item is DisplayItineraryItem => item !== null && item !== undefined
      )
    );
  }, [sections, unscheduledItems]);

  // Calculate derived itinerary duration
  const itineraryDurationDays = useMemo(() => {
    // Calculate the duration based on the highest day number in the itinerary
    const days = allItems
      .filter((item) => item.day_number !== null && item.day_number !== undefined)
      .map((item) => item.day_number);

    return days.length > 0 ? Math.max(...(days as number[])) : 0;
  }, [allItems]);

  /**
   * Fetch travel times for itinerary items
   */
  useEffect(() => {
    const fetchTravelTimes = async () => {
      if (!tripId || allItems.length < 2) {
        setTravelTimes({});
        return;
      }

      setLoadingTravelTimes(true);

      try {
        const controller = new AbortController();
        const signal = controller.signal;

        const response = await fetch(API_ROUTES.TRIP_TRAVEL_TIMES(tripId), {
          signal,
        });

        if (!response.ok) throw new Error('Failed to fetch travel times');

        const data: Record<string, TravelTimesResult> = await response.json();
        setTravelTimes(data);
      } catch (error: any) {
        // Don't show error for aborted requests
        if (error.name !== 'AbortError') {
          console.error('Error fetching travel times:', error);
          setTravelTimes(null);
          toast({
            title: 'Could not load travel times',
            description: formatError(error),
            variant: 'default',
          });
        }
      } finally {
        setLoadingTravelTimes(false);
      }
    };

    fetchTravelTimes();

    return () => {
      // This will be used for the AbortController when we add it
    };
  }, [tripId, allItems.length, toast]);

  /**
   * Update sections and unscheduled items after an item is added or edited
   */
  const updateItemsAfterEdit = useCallback(
    (itemId: string, updates: Partial<DisplayItineraryItem>) => {
      // Update in allItems first
      setAllItems((prevItems) =>
        prevItems.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
      );

      // Then update in sections or unscheduled items based on section
      const itemToUpdate = allItems.find((item) => item.id === itemId);

      if (!itemToUpdate) {
        console.error(`Item with ID ${itemId} not found for update`);
        return;
      }

      // If the item has a day number, it's in a section
      if (itemToUpdate.day_number !== null && itemToUpdate.day_number !== undefined) {
        setSections((prevSections) => {
          return prevSections.map((section) => {
            if (section.day_number === itemToUpdate.day_number) {
              return {
                ...section,
                items: (section.items || []).map((item) => {
                  if (item.id === itemId) {
                    return { ...item, ...updates };
                  }
                  return item;
                }),
              };
            }
            return section;
          });
        });
      } else {
        // Otherwise it's in unscheduled items
        setUnscheduledItems((prevItems) =>
          prevItems.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
        );
      }
    },
    [allItems, setSections, setUnscheduledItems, setAllItems]
  );

  /**
   * Add a newly created item to the correct section or unscheduled list
   */
  const handleItemAdded = useCallback(
    (newItem: DisplayItineraryItem) => {
      if (newItem.day_number !== null && newItem.day_number !== undefined) {
        setSections((prevSections) => {
          const targetSectionIndex = prevSections.findIndex(
            (s) => s.day_number === newItem.day_number
          );
          if (targetSectionIndex !== -1) {
            const newSections = [...prevSections];
            newSections[targetSectionIndex] = {
              ...newSections[targetSectionIndex],
              items: [...(newSections[targetSectionIndex].items ?? []), newItem].sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0)
              ),
            };
            return newSections;
          }
          return prevSections; // Section not found, maybe log an error?
        });
      } else {
        setUnscheduledItems((prev) =>
          [...prev, newItem].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        );
      }
    },
    [setSections, setUnscheduledItems]
  );

  /**
   * Handler for adding a new item
   */
  const handleAddItem = useCallback((dayNumber: number | null) => {
    setEditingItem(null);
    setIsAddingItemToDay(dayNumber);
    // Note: This doesn't open the sheet directly, we'll do that in the UI layer
  }, []);

  /**
   * Handler for editing an item
   */
  const handleEditItem = useCallback((item: DisplayItineraryItem) => {
    setEditingItem(item);
    // Note: This doesn't open the sheet directly, we'll do that in the UI layer
    return Promise.resolve();
  }, []);

  /**
   * Handler for saving an edited item
   */
  const handleSaveEditedItem = useCallback(
    async (updatedItemData: Partial<DisplayItineraryItem>) => {
      if (!editingItem) return;

      const originalItems = [...allItems];

      // Optimistic update
      setAllItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...updatedItemData,
                day_number: updatedItemData.day_number ?? item.day_number,
              }
            : item
        )
      );

      try {
        const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, editingItem.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItemData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update item');
        }

        toast({ title: 'Item updated' });

        // Update sections and unscheduled items based on the updated item
        updateItemsAfterEdit(editingItem.id, updatedItemData);
      } catch (error) {
        console.error('Error updating item:', error);
        setAllItems(originalItems); // Revert
        toast({
          title: 'Error Updating Item',
          description: formatError(error),
          variant: 'destructive',
        });
      }
    },
    [tripId, editingItem, allItems, toast, updateItemsAfterEdit]
  );

  /**
   * Handler for reordering items
   */
  const handleReorder = useCallback(
    async (reorderInfo: {
      itemId: string;
      newDayNumber: number | null;
      newPosition: number;
    }): Promise<void> => {
      const { itemId, newDayNumber, newPosition } = reorderInfo;

      try {
        const response = await fetch(API_ROUTES.TRIP_ITINERARY_REORDER(tripId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, newDayNumber, newPosition }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reorder items');
        }

        // Update the UI optimistically - actual update will come from real-time
      } catch (error) {
        console.error('Reorder failed:', error);
        toast({
          title: 'Reorder Failed',
          description: formatError(error),
          variant: 'destructive',
        });
        throw error;
      }
    },
    [tripId, toast]
  );

  /**
   * Handler for saving a new item
   */
  const handleSaveNewItem = useCallback(
    async (newItemData: Partial<DisplayItineraryItem>): Promise<DisplayItineraryItem> => {
      try {
        const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItemData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create item');
        }

        const createdItem = await response.json();
        toast({ title: 'Item Added' });

        // Add the new item to the appropriate section or unscheduled items
        handleItemAdded(createdItem);

        return createdItem;
      } catch (error) {
        console.error('Failed to create item:', error);
        toast({
          title: 'Error Creating Item',
          description: formatError(error),
          variant: 'destructive',
        });
        throw error;
      }
    },
    [tripId, toast, handleItemAdded]
  );

  /**
   * Handler for updating item status
   */
  const handleStatusChange = useCallback(
    async (itemId: string, status: ItemStatus | null): Promise<void> => {
      try {
        const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId) + `/items/${itemId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        toast({ title: 'Status updated' });

        // Update the item status in allItems
        setAllItems((prevItems) =>
          prevItems.map((item) => (item.id === itemId ? { ...item, status } : item))
        );

        // Also update in sections or unscheduled items
        updateItemsAfterEdit(itemId, { status });
      } catch (error) {
        console.error('Failed to update status:', error);
        toast({
          title: 'Error updating status',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [tripId, toast, updateItemsAfterEdit, setAllItems]
  );

  /**
   * Handler for deleting an item
   */
  const handleDeleteItem = useCallback(
    async (itemId: string): Promise<void> => {
      if (!canEdit) return;

      // Store the current state in case we need to revert
      const originalItems = [...allItems];
      const originalSections = [...sections];
      const originalUnscheduled = [...unscheduledItems];

      // Optimistically remove the item from the UI
      setAllItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

      // Also remove from sections or unscheduled items
      const itemToDelete = allItems.find((item) => item.id === itemId);

      if (!itemToDelete) {
        console.warn(`Item with ID ${itemId} not found for deletion`);
        return;
      }

      // Safe check for day_number
      const dayNumber = itemToDelete.day_number;

      if (dayNumber === null || dayNumber === undefined) {
        setUnscheduledItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setSections((prevSections) => {
          return prevSections.map((section) => {
            if (section.day_number === dayNumber) {
              return {
                ...section,
                items: section.items ? section.items.filter((item) => item.id !== itemId) : [],
              };
            }
            return section;
          });
        });
      }

      try {
        const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
          method: 'DELETE',
        });

        if (!response.ok) {
          // If API fails, throw an error to trigger the catch block
          throw new Error('Failed to delete item on server');
        }

        toast({ title: 'Item deleted' });
      } catch (error) {
        console.error('Failed to delete item:', error);
        toast({
          title: 'Error deleting item',
          description: 'Could not delete item. Reverting changes.',
          variant: 'destructive',
        });
        // Revert the state if the API call failed
        setAllItems(originalItems);
        setSections(originalSections);
        setUnscheduledItems(originalUnscheduled);
        throw error;
      }
    },
    [
      tripId,
      canEdit,
      allItems,
      sections,
      unscheduledItems,
      toast,
      setAllItems,
      setSections,
      setUnscheduledItems,
    ]
  );

  /**
   * Handler for voting on an item
   */
  const handleVote = useCallback(
    async (itemId: string, voteType: 'up' | 'down'): Promise<void> => {
      try {
        const response = await fetch(API_ROUTES.ITINERARY_ITEM_VOTE(tripId, itemId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voteType }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit vote');
        }

        toast({ title: 'Vote recorded' });
      } catch (error) {
        console.error('Vote failed:', error);
        toast({
          title: 'Error',
          description: formatError(error),
          variant: 'destructive',
        });
        throw error;
      }
    },
    [tripId, toast]
  );

  return {
    // State
    sections,
    unscheduledItems,
    allItems,
    travelTimes,
    loadingTravelTimes,
    isAddingItemToDay,
    editingItem,
    itineraryDurationDays,

    // Actions
    handleAddItem,
    handleEditItem,
    handleSaveEditedItem,
    handleSaveNewItem,
    handleReorder,
    handleStatusChange,
    handleDeleteItem,
    handleItemAdded,
    handleVote,
  };
}
