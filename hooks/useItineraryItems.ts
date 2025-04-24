import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { API_ROUTES } from '@/utils/constants';

// Interfaces (consider moving to a shared types file if used elsewhere)
interface ItineraryItem {
  id: string;
  trip_id: string;
  title: string;
  description?: string | null;
  status?: 'suggested' | 'confirmed' | 'rejected';
  votes?: {
    up: number;
    down: number;
    userVote?: 'up' | 'down' | null;
    upVoters?: any[];
    downVoters?: any[];
  };
  is_custom?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  day_number: number | null;
  position: number | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  place_id?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  estimated_cost?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
}

interface ItemsByDay {
  [day: number]: ItineraryItem[];
}

export function useItineraryItems(tripId: string) {
  const { toast } = useToast();
  const router = useRouter(); // Keep router if needed for actions like refresh

  const [itemsByDay, setItemsByDay] = useState<ItemsByDay>({});
  const [durationDays, setDurationDays] = useState<number>(1);
  const [isLoadingItineraryItems, setIsLoadingItineraryItems] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // State for inline editing ID
  const [inlineEditValue, setInlineEditValue] = useState<string>(""); // State for inline editing value


  const fetchItineraryItems = useCallback(async () => {
    setIsLoadingItineraryItems(true);
    try {
      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId));
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch itinerary items");
      }
      const data = await response.json();
      setDurationDays(data.durationDays || 1);
      setItemsByDay(data.itemsByDay || {});
    } catch (error: any) {
      console.error("Error fetching itinerary items:", error);
      toast({ title: "Error Loading Itinerary", description: error.message, variant: "destructive" });
      setItemsByDay({}); // Reset on error
      setDurationDays(1);
    } finally {
      setIsLoadingItineraryItems(false);
    }
  }, [tripId, toast]);

  // Initial fetch
  useEffect(() => {
    if (tripId) {
      fetchItineraryItems();
    }
  }, [tripId, fetchItineraryItems]);

  const moveItem = useCallback(async (itemId: string, targetItemId: string | null, targetDayNumber: number) => {
    // Find item and its current position
    let sourceDay: number | null = null;
    let sourceIndex = -1;
    Object.entries(itemsByDay).forEach(([day, items]: [string, ItineraryItem[]]) => {
      const index = items.findIndex((i: ItineraryItem) => i.id === itemId);
      if (index !== -1) {
        sourceDay = Number(day);
        sourceIndex = index;
      }
    });

    if (sourceDay === null || sourceIndex === -1) {
      console.error("Source item not found for move");
      return;
    }

    const itemToMove = itemsByDay[sourceDay][sourceIndex];

    // --- Optimistic Update ---
    const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay)); // Deep copy for revert
    setItemsByDay((prev: ItemsByDay) => {
      const newItemsByDay = JSON.parse(JSON.stringify(prev));

      // Remove from source
      newItemsByDay[sourceDay!] = newItemsByDay[sourceDay!].filter((i: ItineraryItem) => i.id !== itemId);
      // Optional: Clean up empty source day array (except day 0)
      // if (newItemsByDay[sourceDay!]?.length === 0 && sourceDay !== 0) {
      //   delete newItemsByDay[sourceDay!];
      // }

      // Add to target day/position
      if (!newItemsByDay[targetDayNumber]) {
        newItemsByDay[targetDayNumber] = [];
      }

      let targetIndex = newItemsByDay[targetDayNumber].length; // Default to end
      if (targetItemId) {
        const idx = newItemsByDay[targetDayNumber].findIndex((i: ItineraryItem) => i.id === targetItemId);
        if (idx !== -1) {
          targetIndex = idx; // Insert before target item
        }
      }

      newItemsByDay[targetDayNumber].splice(targetIndex, 0, { ...itemToMove, day_number: targetDayNumber });

       // --- Reassign positions within the target day ---
       newItemsByDay[targetDayNumber] = newItemsByDay[targetDayNumber].map((item: ItineraryItem, index: number) => ({
         ...item,
         position: index
       }));
       // --- Reassign positions within the source day (if it still exists) ---
       if(newItemsByDay[sourceDay!]) {
           newItemsByDay[sourceDay!] = newItemsByDay[sourceDay!].map((item: ItineraryItem, index: number) => ({
               ...item,
               position: index
           }));
       }


      return newItemsByDay;
    });
    // --- End Optimistic Update ---


    // --- API Call ---
    // Prepare data for the API: only send the changes (item ID, new day, new position)
    // Find the final position of the moved item in the *optimistically updated* state
    let finalPosition = -1;
    const updatedTargetDayItems = itemsByDay[targetDayNumber]; // Use state *after* optimistic update for position
    if(updatedTargetDayItems){
        finalPosition = updatedTargetDayItems.findIndex(i => i.id === itemId);
    }


    if(finalPosition === -1) {
        console.error("Moved item not found in target day after optimistic update");
        setItemsByDay(originalItemsByDay); // Revert
        toast({ title: "Reorder Error", description: "Could not finalize item position.", variant: "destructive" });
        return;
    }


    const itemsPayload = [
        { id: itemId, day_number: targetDayNumber, position: finalPosition }
    ];


     try {
        const reorderUrl = API_ROUTES.TRIP_ITINERARY_REORDER(tripId);
        const reorderResponse = await fetch(reorderUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsPayload }), // Send only the moved item info
        });
        if (!reorderResponse.ok) {
            const errorData = await reorderResponse.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to save new order");
        }
        // No need to refetch if optimistic update is correct
        // toast({ title: "Order Saved", variant: "default" });
      } catch (error: any) {
        console.error("Error reordering items:", error);
        toast({ title: "Reorder Error", description: error.message, variant: "destructive" });
        setItemsByDay(originalItemsByDay); // Revert on error
      }
     // --- End API Call ---

  }, [itemsByDay, tripId, toast]); // Removed fetchItineraryItems dependency

  const voteItem = useCallback(async (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => {
    const dayKey = dayNumber ?? 0;
    const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay)); // For revert

    // Optimistic update
    setItemsByDay(prev => {
        const currentDayItems = prev[dayKey];
        if (!currentDayItems) return prev; // Day doesn't exist

        const itemIndex = currentDayItems.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return prev; // Item not found

        const itemToUpdate = currentDayItems[itemIndex];
        const currentVote = itemToUpdate.votes?.userVote;
        let newUp = itemToUpdate.votes?.up ?? 0;
        let newDown = itemToUpdate.votes?.down ?? 0;
        let newUserVote: 'up' | 'down' | null = voteType;

        if (currentVote === voteType) { // Undoing vote
            newUserVote = null;
            if (voteType === 'up') newUp--; else newDown--;
        } else { // Changing vote or first vote
            if (currentVote === 'up') newUp--; // Remove previous upvote if changing
            if (currentVote === 'down') newDown--; // Remove previous downvote if changing
            if (voteType === 'up') newUp++; else newDown++; // Add new vote
        }

        const updatedItem = {
             ...itemToUpdate,
             votes: {
                ...(itemToUpdate.votes || {}), // Keep existing upVoters/downVoters if needed
                up: Math.max(0, newUp), // Ensure non-negative
                down: Math.max(0, newDown), // Ensure non-negative
                userVote: newUserVote
            }
        };

        const newDayItems = [...currentDayItems];
        newDayItems[itemIndex] = updatedItem;

        return { ...prev, [dayKey]: newDayItems };
    });

   try {
     const voteResponse = await fetch(API_ROUTES.ITINERARY_ITEM_VOTE(tripId, itemId), {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ vote_type: voteType }),
     });
     if (!voteResponse.ok) {
         const errorData = await voteResponse.json().catch(() => ({}));
         throw new Error(errorData.error || "Failed to record vote");
     }
     // Optionally process response if it returns updated vote counts/voter lists
     // const updatedVoteData = await voteResponse.json();
     // You might update the state again here with server data for consistency if needed
   } catch (error: any) {
     console.error("Error voting:", error);
     toast({ title: "Error Voting", description: error.message, variant: "destructive" });
     setItemsByDay(originalItemsByDay); // Revert optimistic update on error
   }
 }, [itemsByDay, tripId, toast]);

 const saveItemEdit = useCallback(async (itemId: string, updateData: Partial<ItineraryItem>) => {
    const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay));
    let dayKeyToUpdate: number | null = null;

    // Optimistic Update
    setItemsByDay(prev => {
        const newState = JSON.parse(JSON.stringify(prev));
        for (const dayKey of Object.keys(newState)) {
            const dayNum = Number(dayKey);
            const index = newState[dayNum]?.findIndex((item: ItineraryItem) => item.id === itemId);
            if (index !== -1 && index !== undefined) {
                dayKeyToUpdate = dayNum;
                newState[dayNum][index] = { ...newState[dayNum][index], ...updateData };
                break;
            }
        }
        return newState;
    });

    setEditingItemId(null); // Exit edit mode

    if(dayKeyToUpdate === null) {
        console.error("Item not found for saving edit");
        // Revert might not be needed if state wasn't actually changed
        setItemsByDay(originalItemsByDay);
        return;
    }


    try {
      const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save changes");
      }
      // Update with response data if necessary
      const savedItem = await response.json();
      setItemsByDay(prev => {
           const dayKey = savedItem.item.day_number ?? 0;
           const currentDayItems = prev[dayKey] || [];
           const itemExists = currentDayItems.some(i => i.id === itemId);
           return {
               ...prev,
               [dayKey]: itemExists
                 ? currentDayItems.map(i => i.id === itemId ? savedItem.item : i)
                 : [...currentDayItems, savedItem.item] // Add if somehow missing after update
           }
       });

      toast({ title: "Changes Saved" });

    } catch (error: any) {
      console.error("Error saving item:", error);
      toast({ title: "Error Saving", description: error.message, variant: "destructive" });
      setItemsByDay(originalItemsByDay); // Revert on error
    }
  }, [itemsByDay, tripId, toast]);

  const deleteItem = useCallback(async (itemId: string) => {
    const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay));
    let dayKeyToDeleteFrom: number | null = null;

     // Optimistic update: Remove the item
     setItemsByDay(prev => {
       const newState = JSON.parse(JSON.stringify(prev));
       for (const dayKey of Object.keys(newState)) {
           const dayNum = Number(dayKey);
           const initialLength = newState[dayNum]?.length;
           newState[dayNum] = newState[dayNum]?.filter((item: ItineraryItem) => item.id !== itemId);
           if (newState[dayNum]?.length < initialLength) {
                dayKeyToDeleteFrom = dayNum;
               // Reassign positions within the affected day
               newState[dayNum] = newState[dayNum].map((item: ItineraryItem, index: number) => ({
                   ...item,
                   position: index
               }));
               break; // Assume item ID is unique across days
           }
       }
       return newState;
     });

    if(dayKeyToDeleteFrom === null) {
        console.error("Item to delete not found");
        // No need to revert if nothing changed
        return;
    }

    try {
      const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
        method: 'DELETE',
      });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete item");
      }
      toast({ title: "Item Deleted" });
      // No need to refetch if optimistic update succeeded
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({ title: "Error Deleting", description: error.message, variant: "destructive" });
      setItemsByDay(originalItemsByDay); // Revert optimistic update
    }
  }, [itemsByDay, tripId, toast]);

   const addItem = useCallback(async (itemData: Omit<ItineraryItem, 'id' | 'trip_id' | 'created_at' | 'position'>) => {
     // Determine the target day and calculate the next position optimistically
     const targetDayKey = itemData.day_number ?? 0;
     const currentDayItems = itemsByDay[targetDayKey] || [];
     const optimisticPosition = currentDayItems.length;

     // Optimistically create a temporary ID (optional, but can help UI updates)
     const tempId = `temp-${Date.now()}`;
     const optimisticItem: ItineraryItem = {
       ...itemData,
       id: tempId,
       trip_id: tripId,
       position: optimisticPosition,
       // Add other default fields if needed by UI immediately
     };

     setItemsByDay(prev => ({
       ...prev,
       [targetDayKey]: [...(prev[targetDayKey] || []), optimisticItem]
     }));

     try {
       const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ ...itemData, position: optimisticPosition }), // Send calculated position
       });

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.error || "Failed to add item");
       }

       const { item: newItem } = await response.json();

       // Replace temporary item with the real one from the server
       setItemsByDay(prev => {
           const dayKey = newItem.day_number ?? 0;
           return {
               ...prev,
               [dayKey]: (prev[dayKey] || []).map(i => i.id === tempId ? newItem : i)
           }
       });


       toast({ title: "Item Added", description: `${newItem.title} added.` });
       return newItem; // Return the created item

     } catch (error: any) {
       console.error("Error adding item:", error);
       toast({ title: "Error Adding Item", description: error.message, variant: "destructive" });
       // Revert optimistic add
       setItemsByDay(prev => {
           const dayKey = optimisticItem.day_number ?? 0;
           return {
               ...prev,
               [dayKey]: (prev[dayKey] || []).filter(i => i.id !== tempId)
           }
       });
       return null; // Indicate failure
     }
   }, [itemsByDay, tripId, toast]);


  // --- Inline Editing Handlers ---
  // These manage the temporary state for the inline input
  const handleStartInlineEdit = useCallback((item: ItineraryItem) => {
      setEditingItemId(item.id);
      setInlineEditValue(item.title);
  }, []);

  const handleInlineEditChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInlineEditValue(e.target.value);
  }, []);

  const handleCancelInlineEdit = useCallback(() => {
      setEditingItemId(null);
      setInlineEditValue("");
  }, []);

  const handleSaveInlineEdit = useCallback(() => {
      if (editingItemId) {
          const originalItem = Object.values(itemsByDay).flat().find(i => i.id === editingItemId);
          // Only save if value changed
          if (originalItem && inlineEditValue !== originalItem.title) {
               saveItemEdit(editingItemId, { title: inlineEditValue });
          } else {
               // If no change, just cancel
               handleCancelInlineEdit();
          }
      }
  }, [editingItemId, inlineEditValue, itemsByDay, saveItemEdit, handleCancelInlineEdit]);
  // --- End Inline Editing Handlers ---


  return {
    itemsByDay,
    durationDays,
    isLoadingItineraryItems,
    fetchItineraryItems, // Expose fetch function if manual refresh is needed
    addItem,
    deleteItem,
    moveItem,
    voteItem,
    saveItemEdit,
    editingItemId,         // Expose state for inline editing
    inlineEditValue,       // Expose state for inline editing
    handleStartInlineEdit, // Expose handler
    handleInlineEditChange,// Expose handler
    handleCancelInlineEdit,// Expose handler
    handleSaveInlineEdit,  // Expose handler

  };
} 