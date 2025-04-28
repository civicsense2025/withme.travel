'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { formatError } from "@/lib/utils";
import { API_ROUTES, ItemStatus } from "@/utils/constants";
import type { DisplayItineraryItem } from '@/types/itinerary';
import type { TravelTimesResult } from '@/lib/mapbox';

export interface TripItineraryInitialData {
  tripId: string;
  initialSections: any[]; // Replace with actual types from your app
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
  userId
}: TripItineraryInitialData) {
  const { toast } = useToast();
  
  // Itinerary state
  const [sections, setSections] = useState(initialSections || []);
  const [unscheduledItems, setUnscheduledItems] = useState<DisplayItineraryItem[]>(initialUnscheduledItems || []);
  const [allItems, setAllItems] = useState<DisplayItineraryItem[]>([]);
  const [travelTimes, setTravelTimes] = useState<Record<string, TravelTimesResult> | null>(null);
  
  // UI state
  const [isAddingItemToDay, setIsAddingItemToDay] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<DisplayItineraryItem | null>(null);
  const [loadingTravelTimes, setLoadingTravelTimes] = useState(false);

  // Initialize the combined items list when sections or unscheduled items change
  useEffect(() => {
    const combinedItems = [
      ...(sections?.flatMap(s => s.items) || []),
      ...(unscheduledItems || []),
    ];
    
    // Sort items by day (nulls/undefined last) and then position
    combinedItems.sort((a, b) => {
      const dayA = a.day_number ?? Number.MAX_SAFE_INTEGER;
      const dayB = b.day_number ?? Number.MAX_SAFE_INTEGER;
      const posA = a.position ?? 0;
      const posB = b.position ?? 0;

      if (dayA !== dayB) {
        return dayA - dayB; // Sort by day number first
      } else {
        return posA - posB; // If days are the same, sort by position
      }
    });
    
    setAllItems(combinedItems);
  }, [sections, unscheduledItems]);

  // Calculate derived itinerary duration
  const itineraryDurationDays = useMemo(() => {
    // Calculate the duration based on the highest day number in the itinerary
    const days = allItems
      .filter(item => item.day_number !== null && item.day_number !== undefined)
      .map(item => item.day_number);
    
    return days.length > 0 ? Math.max(...days as number[]) : 0;
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
          signal
        });
        
        if (!response.ok) throw new Error('Failed to fetch travel times');
        
        const data: Record<string, TravelTimesResult> = await response.json();
        setTravelTimes(data);
      } catch (error: any) {
        // Don't show error for aborted requests
        if (error.name !== 'AbortError') {
          console.error("Error fetching travel times:", error);
          setTravelTimes(null);
          toast({
            title: "Could not load travel times",
            description: formatError(error),
            variant: "default"
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
  const handleSaveEditedItem = useCallback(async (updatedItemData: Partial<DisplayItineraryItem>) => {
    if (!editingItem) return;

    const originalItems = [...allItems];
    
    // Optimistic update
    setAllItems(currentItems =>
      currentItems.map(item =>
        item.id === editingItem.id
          ? { ...item, ...updatedItemData, day_number: updatedItemData.day_number ?? item.day_number }
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

      toast({ title: "Item updated" });
      
      // Update sections and unscheduled items based on the updated item
      updateItemsAfterEdit(editingItem.id, updatedItemData);
    } catch (error) {
      console.error("Error updating item:", error);
      setAllItems(originalItems); // Revert
      toast({
        title: "Error Updating Item",
        description: formatError(error as Error, "Failed to update item"),
        variant: "destructive"
      });
    }
  }, [tripId, editingItem, allItems, toast]);

  /**
   * Handler for reordering items
   */
  const handleReorder = useCallback(async (reorderInfo: {
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
      console.error("Reorder failed:", error);
      toast({
        title: "Reorder Failed",
        description: formatError(error as Error),
        variant: "destructive"
      });
      throw error;
    }
  }, [tripId, toast]);

  /**
   * Handler for saving a new item
   */
  const handleSaveNewItem = useCallback(async (newItemData: Partial<DisplayItineraryItem>): Promise<DisplayItineraryItem> => {
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
      toast({ title: "Item Added" });
      
      // Add the new item to the appropriate section or unscheduled items
      handleItemAdded(createdItem);
      
      return createdItem;
    } catch (error) {
      console.error("Failed to create item:", error);
      toast({
        title: "Error Creating Item",
        description: formatError(error as Error),
        variant: "destructive"
      });
      throw error;
    }
  }, [tripId, toast]);

  /**
   * Handler for adding a newly created item to the UI
   */
  const handleItemAdded = useCallback((item: DisplayItineraryItem) => {
    setAllItems(prevItems => [...prevItems, item]);
    
    // Add to the appropriate section or unscheduled items
    if (item.day_number === null) {
      setUnscheduledItems(prev => [...prev, item]);
    } else {
      setSections(prevSections => {
        // Find the section with the matching day_number
        const sectionIndex = prevSections.findIndex(s => s.day_number === item.day_number);
        
        if (sectionIndex >= 0) {
          // Add to existing section
          const updatedSections = [...prevSections];
          updatedSections[sectionIndex] = {
            ...updatedSections[sectionIndex],
            items: [...updatedSections[sectionIndex].items, item]
          };
          return updatedSections;
        } else {
          // If no section exists with this day_number, create a new one
          return [
            ...prevSections,
            {
              id: `new-section-${Date.now()}`,
              trip_id: tripId,
              day_number: item.day_number,
              date: null,
              title: `Day ${item.day_number}`,
              position: prevSections.length,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              items: [item]
            }
          ];
        }
      });
    }
  }, [tripId]);

  /**
   * Handler for updating item status
   */
  const handleStatusChange = useCallback(async (itemId: string, status: ItemStatus | null): Promise<void> => {
    try {
      const response = await fetch(API_ROUTES.TRIP_DETAILS(tripId) + `/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast({ title: "Status updated" });
      
      // Update the item status in allItems
      setAllItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, status } : item
        )
      );
      
      // Also update in sections or unscheduled items
      updateItemsAfterEdit(itemId, { status });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error updating status",
        variant: "destructive"
      });
      throw error;
    }
  }, [tripId, toast]);

  /**
   * Handler for deleting an item
   */
  const handleDeleteItem = useCallback(async (itemId: string): Promise<void> => {
    if (!canEdit) return;

    // Store the current state in case we need to revert
    const originalItems = [...allItems];
    const originalSections = [...sections];
    const originalUnscheduled = [...unscheduledItems];

    // Optimistically remove the item from the UI
    setAllItems(prevItems => prevItems.filter(item => item.id !== itemId));
    
    // Also remove from sections or unscheduled items
    const itemToDelete = allItems.find(item => item.id === itemId);
    if (itemToDelete?.day_number === null) {
      setUnscheduledItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setSections(prevSections => {
        return prevSections.map(section => {
          if (section.day_number === itemToDelete?.day_number) {
            return {
              ...section,
              items: section.items.filter((item: DisplayItineraryItem) => item.id !== itemId)
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

      toast({ title: "Item deleted" });
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast({
        title: "Error deleting item",
        description: "Could not delete item. Reverting changes.",
        variant: "destructive"
      });
      // Revert the state if the API call failed
      setAllItems(originalItems);
      setSections(originalSections);
      setUnscheduledItems(originalUnscheduled);
      throw error;
    }
  }, [tripId, canEdit, allItems, sections, unscheduledItems, toast]);

  /**
   * Helper to update items after an edit
   * This keeps the sections and unscheduled items in sync with allItems
   */
  const updateItemsAfterEdit = useCallback((
    itemId: string,
    updatedData: Partial<DisplayItineraryItem>
  ) => {
    const item = allItems.find((i: DisplayItineraryItem) => i.id === itemId);
    if (!item) return;
    
    const updatedItem = { ...item, ...updatedData };
    const originalDayNumber = item.day_number;
    const newDayNumber = updatedData.day_number !== undefined ? updatedData.day_number : originalDayNumber;
    
    // If day number changed, we need to move the item
    if (newDayNumber !== originalDayNumber) {
      // Remove from original location
      if (originalDayNumber === null) {
        setUnscheduledItems(prev => prev.filter((i: DisplayItineraryItem) => i.id !== itemId));
      } else {
        setSections(prevSections => {
          return prevSections.map(section => {
            if (section.day_number === originalDayNumber) {
              return {
                ...section,
                items: section.items.filter((item: DisplayItineraryItem) => item.id !== itemId)
              };
            }
            return section;
          });
        });
      }
      
      // Add to new location
      if (newDayNumber === null) {
        setUnscheduledItems(prev => [...prev, updatedItem]);
      } else {
        setSections(prevSections => {
          // Find section with the new day number
          const sectionIndex = prevSections.findIndex(s => s.day_number === newDayNumber);
          
          if (sectionIndex >= 0) {
            // Add to existing section
            const updatedSections = [...prevSections];
            updatedSections[sectionIndex] = {
              ...updatedSections[sectionIndex],
              items: [...updatedSections[sectionIndex].items, updatedItem]
            };
            return updatedSections;
          } else {
            // If no section exists with this day_number, create a new one
            return [
              ...prevSections,
              {
                id: `new-section-${Date.now()}`,
                trip_id: tripId,
                day_number: newDayNumber,
                date: null,
                title: `Day ${newDayNumber}`,
                position: prevSections.length,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                items: [updatedItem]
              }
            ];
          }
        });
      }
    } else {
      // Just update the item in place
      if (newDayNumber === null) {
        setUnscheduledItems(prev =>
          prev.map((i: DisplayItineraryItem) => i.id === itemId ? updatedItem : i)
        );
      } else {
        setSections(prevSections => {
          return prevSections.map(section => {
            if (section.day_number === newDayNumber) {
              return {
                ...section,
                items: section.items.map((i: DisplayItineraryItem) => i.id === itemId ? updatedItem : i)
              };
            }
            return section;
          });
        });
      }
    }
  }, [allItems, tripId]);

  /**
   * Handler for voting on an item
   */
  const handleVote = useCallback(async (itemId: string, dayNumber: number | null, voteType: 'up' | 'down'): Promise<void> => {
    if (!userId) {
      toast({ title: "Please login to vote", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(API_ROUTES.ITINERARY_ITEM_VOTE(tripId, String(itemId)), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, dayNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit vote');
      }
      
      // Update will come via real-time or the next fetch
    } catch (error: any) {
      console.error("Vote failed:", error);
      toast({
        title: "Vote Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [tripId, userId, toast]);

  return {
    // State
    sections,
    unscheduledItems,
    allItems,
    travelTimes,
    editingItem,
    isAddingItemToDay,
    loadingTravelTimes,
    itineraryDurationDays,
    
    // Setters
    setSections,
    setUnscheduledItems,
    setAllItems,
    setEditingItem,
    setIsAddingItemToDay,
    
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