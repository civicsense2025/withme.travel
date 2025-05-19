'use client';
import { API_ROUTES } from '@/utils/constants/routes';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@hooks/use-toast'
import { formatError } from '@/utils/lib-utils';
import { ITEM_STATUSES, type ItemStatus } from '@/utils/constants/status';
import type { DisplayItineraryItem, ItinerarySection } from '@/types/itinerary';

// Define TravelTimesResult type inline
interface TravelTimesResult {
  duration: number;
  distance: number;
  route?: string;
}

// Define a local DisplayItinerarySection type for UI state
interface DisplayItinerarySection extends Omit<ItinerarySection, 'items'> {
  items?: DisplayItineraryItem[];
}

export interface TripItineraryInitialData {
  tripId: string;
  initialSections: DisplayItinerarySection[]; // Use DisplayItinerarySection
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
  const [sections, setSections] = useState<DisplayItinerarySection[]>(initialSections || []);
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
      if (!a || !b) return 0;
      const dayA = a.day_number ?? Number.MAX_SAFE_INTEGER;
      const dayB = b.day_number ?? Number.MAX_SAFE_INTEGER;
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;
      return dayA === dayB ? posA - posB : dayA - dayB;
    });

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
          return prevSections;
        });
      } else {
        // Add to unscheduled items
        setUnscheduledItems((prev) => [...prev, newItem]);
      }

      // Close add item UI
      setIsAddingItemToDay(null);
    },
    [setSections, setUnscheduledItems, setIsAddingItemToDay]
  );

  /**
   * Update item status (e.g., confirmed, canceled)
   */
  const updateItemStatus = useCallback(
    async (itemId: string, status: ItemStatus) => {
      try {
        // Optimistic update
        updateItemsAfterEdit(itemId, { status });

        // API call
        const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}/${itemId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update status: ${response.statusText}`);
        }

        toast({
          title: 'Status updated',
          description: `Item marked as ${status.toLowerCase()}`,
          variant: 'default',
        });
      } catch (error) {
        console.error('Error updating item status:', error);
        toast({
          title: 'Update failed',
          description: formatError(error),
          variant: 'destructive',
        });
      }
    },
    [tripId, updateItemsAfterEdit, toast]
  );

  /**
   * Move an item to a new day
   */
  const moveItemToDay = useCallback(
    async (itemId: string, targetDayNumber: number | null, targetPosition?: number) => {
      const itemToMove = allItems.find((item) => item.id === itemId);
      if (!itemToMove) return;

      const sourceDayNumber = itemToMove.day_number;
      const newStatus = targetDayNumber === null ? 'UNSCHEDULED' : 'PLANNED';

      try {
        // Optimistic update
        // Remove from source section/unscheduled
        if (sourceDayNumber !== null && sourceDayNumber !== undefined) {
          setSections((prevSections) => {
            return prevSections.map((section) => {
              if (section.day_number === sourceDayNumber) {
                return {
                  ...section,
                  items: (section.items || []).filter((item) => item.id !== itemId),
                };
              }
              return section;
            });
          });
        } else {
          setUnscheduledItems((prev) => prev.filter((item) => item.id !== itemId));
        }

        // Add to target section/unscheduled
        const updatedItem: DisplayItineraryItem = {
          ...itemToMove,
          day_number: targetDayNumber,
          position: targetPosition !== undefined ? targetPosition : itemToMove.position,
          status: newStatus,
        };

        if (targetDayNumber !== null && targetDayNumber !== undefined) {
          setSections((prevSections) => {
            return prevSections.map((section) => {
              if (section.day_number === targetDayNumber) {
                const updatedItems = [...(section.items || []), updatedItem].sort(
                  (a, b) => (a.position ?? 0) - (b.position ?? 0)
                );
                return {
                  ...section,
                  items: updatedItems,
                };
              }
              return section;
            });
          });
        } else {
          setUnscheduledItems((prev) => [...prev, updatedItem]);
        }

        // API call
        const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            day_number: targetDayNumber,
            position: targetPosition,
            status: newStatus,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to move item: ${response.statusText}`);
        }

        // Set allItems (already happens via useEffect)
      } catch (error) {
        console.error('Error moving item:', error);
        toast({
          title: 'Move failed',
          description: formatError(error),
          variant: 'destructive',
        });
        // TODO: Revert optimistic update
      }
    },
    [allItems, setSections, setUnscheduledItems, tripId, toast]
  );

  /**
   * Delete an itinerary item
   */
  const deleteItem = useCallback(
    async (itemId: string) => {
      const itemToDelete = allItems.find((item) => item.id === itemId);
      if (!itemToDelete) return;

      const dayNumber = itemToDelete.day_number;

      try {
        // Optimistic update
        if (dayNumber !== null && dayNumber !== undefined) {
          setSections((prevSections) => {
            return prevSections.map((section) => {
              if (section.day_number === dayNumber) {
                return {
                  ...section,
                  items: (section.items || []).filter((item) => item.id !== itemId),
                };
              }
              return section;
            });
          });
        } else {
          setUnscheduledItems((prev) => prev.filter((item) => item.id !== itemId));
        }

        // API call
        const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}/${itemId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Failed to delete item: ${response.statusText}`);
        }

        toast({
          title: 'Item deleted',
          description: 'The itinerary item has been removed',
          variant: 'default',
        });
      } catch (error) {
        console.error('Error deleting item:', error);
        toast({
          title: 'Delete failed',
          description: formatError(error),
          variant: 'destructive',
        });
        // TODO: Revert optimistic update
      }
    },
    [allItems, setSections, setUnscheduledItems, tripId, toast]
  );

  /**
   * Reorder itinerary items within the same section
   */
  const reorderItems = useCallback(
    async (dayNumber: number | null, newOrder: string[]) => {
      try {
        // Prepare the new ordered items list
        if (dayNumber !== null) {
          // Reorder within a section
          const sectionToUpdate = sections.find((s) => s.day_number === dayNumber);
          if (!sectionToUpdate) return;

          const currentItems = sectionToUpdate.items || [];
          const newItems = newOrder
            .map((id) => currentItems.find((item) => item.id === id))
            .filter((item): item is DisplayItineraryItem => item !== undefined);

          // Update positions
          const updatedItems = newItems.map((item, index) => ({
            ...item,
            position: index,
          }));

          // Optimistic update
          setSections((prevSections) => {
            return prevSections.map((section) => {
              if (section.day_number === dayNumber) {
                return {
                  ...section,
                  items: updatedItems,
                };
              }
              return section;
            });
          });
        } else {
          // Reorder unscheduled items
          const newItems = newOrder
            .map((id) => unscheduledItems.find((item) => item.id === id))
            .filter((item): item is DisplayItineraryItem => item !== undefined);

          // Update positions
          const updatedItems = newItems.map((item, index) => ({
            ...item,
            position: index,
          }));

          // Optimistic update
          setUnscheduledItems(updatedItems);
        }

        // API call to persist reordering
        const response = await fetch(API_ROUTES.TRIP_ITINERARY_REORDER(tripId), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dayNumber,
            newOrder,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to reorder items: ${response.statusText}`);
        }

        // No need to refetch, optimistic update should be sufficient
      } catch (error) {
        console.error('Error reordering items:', error);
        toast({
          title: 'Reordering failed',
          description: formatError(error),
          variant: 'destructive',
        });
        // TODO: Revert optimistic update
      }
    },
    [sections, unscheduledItems, setSections, setUnscheduledItems, tripId, toast]
  );

  return {
    // State
    sections,
    unscheduledItems,
    allItems,
    travelTimes,
    editingItem,
    isAddingItemToDay,
    loadingTravelTimes,
    
    // Calculated properties
    itineraryDurationDays,
    
    // State setters
    setEditingItem,
    setIsAddingItemToDay,
    
    // Actions
    updateItemsAfterEdit,
    handleItemAdded,
    updateItemStatus,
    moveItemToDay,
    deleteItem,
    reorderItems,
  };
} 