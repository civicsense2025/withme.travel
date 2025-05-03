import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { API_ROUTES } from '@/utils/constants/routes';
import { ItineraryItem } from '@/utils/types'; // Use the updated central type

// Define ItemsByDay locally within the hook
export interface ItemsByDay {
  [day: number]: ItineraryItem[];
}

// Define the expected return type for the hook's functions where applicable
// Explicitly state that addItem returns a Promise resolving to the added item or null
type UseItineraryItemsReturn = {
  itemsByDay: ItemsByDay;
  durationDays: number;
  isLoadingItineraryItems: boolean;
  fetchItineraryItems: () => Promise<void>;
  moveItem: (itemId: string, targetItemId: string | null, targetDayNumber: number) => Promise<void>;
  addItem: (
    newItemData: Omit<
      ItineraryItem,
      'id' | 'trip_id' | 'created_at' | 'position' | 'votes' | 'user_vote'
    > & { day_number: number | null }
  ) => Promise<ItineraryItem | null>; // Explicit return type
  updateItem: (
    itemId: string,
    updatedData: Partial<
      Omit<ItineraryItem, 'id' | 'trip_id' | 'created_at' | 'votes' | 'user_vote'>
    >
  ) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  voteItem: (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => Promise<void>;
  editingItemId: string | null;
  inlineEditValue: string;
  handleInlineEditChange: (value: string) => void;
  startEditing: (item: ItineraryItem) => void;
  cancelEditing: () => void;
  saveInlineEdit: () => Promise<void>;
};

// Apply the return type to the hook function
export function useItineraryItems(tripId: string): UseItineraryItemsReturn {
  const { toast } = useToast();
  const router = useRouter();

  // State types automatically use imported types now
  const [itemsByDay, setItemsByDay] = useState<ItemsByDay>({});
  const [durationDays, setDurationDays] = useState<number>(1);
  const [isLoadingItineraryItems, setIsLoadingItineraryItems] = useState(true);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState<string>('');

  const fetchItineraryItems = useCallback(async () => {
    setIsLoadingItineraryItems(true);
    try {
      const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId));
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch itinerary items');
      }
      // Assuming API response matches ItemsByDay structure from types/itinerary
      const data = await response.json();
      setDurationDays(data.durationDays || 1);
      setItemsByDay(data.itemsByDay || {});
    } catch (error: any) {
      console.error('Error fetching itinerary items:', error);
      toast({
        title: 'Error Loading Itinerary',
        description: error.message,
        variant: 'destructive',
      });
      setItemsByDay({});
      setDurationDays(1);
    } finally {
      setIsLoadingItineraryItems(false);
    }
  }, [tripId, toast]);

  useEffect(() => {
    if (tripId) {
      fetchItineraryItems();
    }
  }, [tripId, fetchItineraryItems]);

  const moveItem = useCallback(
    async (itemId: string, targetItemId: string | null, targetDayNumber: number) => {
      let sourceDay: number | null = null;
      let sourceIndex = -1;
      Object.entries(itemsByDay).forEach(([day, items]: [string, ItineraryItem[]]) => {
        const index = items.findIndex((i) => i.id === itemId);
        if (index !== -1) {
          sourceDay = Number(day);
          sourceIndex = index;
        }
      });

      if (sourceDay === null || sourceIndex === -1) {
        console.error('Source item not found for move');
        return;
      }

      const itemToMove = itemsByDay[sourceDay][sourceIndex];
      const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay));

      setItemsByDay((prev) => {
        const newItemsByDay: ItemsByDay = JSON.parse(JSON.stringify(prev));

        if (newItemsByDay[sourceDay!] && newItemsByDay[sourceDay!].length > 0) {
          newItemsByDay[sourceDay!] = newItemsByDay[sourceDay!].filter(
            (i: ItineraryItem) => i.id !== itemId
          );
        }

        if (!newItemsByDay[targetDayNumber]) {
          newItemsByDay[targetDayNumber] = [];
        }

        let targetIndex = newItemsByDay[targetDayNumber].length;
        if (targetItemId) {
          const idx = newItemsByDay[targetDayNumber].findIndex(
            (i: ItineraryItem) => i.id === targetItemId
          );
          if (idx !== -1) {
            targetIndex = idx;
          }
        }

        // Insert item with updated day_number
        newItemsByDay[targetDayNumber].splice(targetIndex, 0, {
          ...itemToMove,
          day_number: targetDayNumber,
        });

        // Reassign positions within the target day
        newItemsByDay[targetDayNumber] = newItemsByDay[targetDayNumber].map(
          (item: ItineraryItem, index: number) => ({
            ...item,
            position: index,
          })
        );
        // Reassign positions within the source day (if it still exists)
        if (newItemsByDay[sourceDay!] && newItemsByDay[sourceDay!].length > 0) {
          newItemsByDay[sourceDay!] = newItemsByDay[sourceDay!].map(
            (item: ItineraryItem, index: number) => ({
              ...item,
              position: index,
            })
          );
        }

        return newItemsByDay;
      });

      // Find final position AFTER state update (requires awaiting or finding in the new state directly)
      let finalPosition = -1;
      setItemsByDay((currentState) => {
        const updatedTargetDayItems = currentState[targetDayNumber] || [];
        finalPosition = updatedTargetDayItems.findIndex((i: ItineraryItem) => i.id === itemId);
        return currentState; // No change needed here, just reading
      });

      if (finalPosition === -1) {
        console.error('Moved item not found in target day after optimistic update');
        setItemsByDay(originalItemsByDay); // Revert
        toast({
          title: 'Reorder Error',
          description: 'Could not finalize item position.',
          variant: 'destructive',
        });
        return;
      }

      const itemsPayload = [{ id: itemId, day_number: targetDayNumber, position: finalPosition }];

      try {
        const reorderUrl = API_ROUTES.TRIP_ITINERARY_REORDER(tripId);
        const reorderResponse = await fetch(reorderUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsPayload }),
        });
        if (!reorderResponse.ok) {
          const errorData = await reorderResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to save new order');
        }
        // Success - optimistic update stands
      } catch (error: any) {
        console.error('Error reordering items:', error);
        toast({ title: 'Reorder Error', description: error.message, variant: 'destructive' });
        setItemsByDay(originalItemsByDay); // Revert on error
      }
    },
    [itemsByDay, tripId, toast]
  );

  const voteItem = useCallback(
    async (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => {
      const dayKey = dayNumber ?? 0; // Use 0 for unscheduled items
      const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay)); // For revert

      let calculatedNewVoteCount: number | undefined;
      let calculatedNewUserVote: 'up' | 'down' | null = null;

      // Optimistic update
      setItemsByDay((prev) => {
        const newItemsByDay: ItemsByDay = JSON.parse(JSON.stringify(prev));
        const currentDayItems = newItemsByDay[dayKey];
        if (!currentDayItems) return prev;

        const itemIndex = currentDayItems.findIndex((item: ItineraryItem) => item.id === itemId);
        if (itemIndex === -1) return prev;

        const item = currentDayItems[itemIndex];
        // Access the correct vote counts from the votes object
        const currentUpVotes = item.votes?.up ?? 0;
        const currentDownVotes = item.votes?.down ?? 0;
        const currentUserVote = item.votes?.userVote ?? null;

        let newUpVotes = currentUpVotes;
        let newDownVotes = currentDownVotes;
        let newUserVote: 'up' | 'down' | null = currentUserVote;

        // Logic to handle toggling/changing votes
        if (currentUserVote === voteType) {
          // Toggling off
          if (voteType === 'up') newUpVotes--;
          else newDownVotes--;
          newUserVote = null;
        } else {
          // Changing vote or voting first time
          if (currentUserVote === 'up') newUpVotes--; // Remove previous upvote
          if (currentUserVote === 'down') newDownVotes--; // Remove previous downvote

          if (voteType === 'up')
            newUpVotes++; // Add new upvote
          else newDownVotes++; // Add new downvote
          newUserVote = voteType;
        }

        // Ensure counts don't go below zero (optional, but good practice)
        newUpVotes = Math.max(0, newUpVotes);
        newDownVotes = Math.max(0, newDownVotes);

        // Apply the optimistic update with the full votes structure
        newItemsByDay[dayKey][itemIndex] = {
          ...item,
          votes: {
            ...item.votes, // Keep existing voter lists if they exist
            up: newUpVotes,
            down: newDownVotes,
            userVote: newUserVote,
            // IMPORTANT: This optimistic update doesn't update upVoters/downVoters arrays.
            // The API response should ideally return the updated lists if needed immediately,
            // otherwise, a full refresh might be required to see accurate voter lists.
            upVoters: item.votes?.upVoters || [],
            downVoters: item.votes?.downVoters || [],
          },
          user_vote: newUserVote, // Update the top-level user_vote as well if used directly
        };

        return newItemsByDay;
      });

      // API Call (if vote calculation was successful)
      if (calculatedNewVoteCount !== undefined) {
        try {
          const response = await fetch(API_ROUTES.TRIP_VOTE(tripId), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, voteType }), // API expects itemId and voteType
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to submit vote');
          }
          // Success: Optimistic update is confirmed implicitly by API success
          // Optional: toast({ title: "Vote Cast", variant: "default" });
        } catch (error: any) {
          console.error('Error submitting vote:', error);
          toast({ title: 'Voting Error', description: error.message, variant: 'destructive' });
          setItemsByDay(originalItemsByDay); // Revert optimistic update on error
        }
      } else {
        console.error('Vote calculation failed, skipping API call.');
        setItemsByDay(originalItemsByDay); // Revert if calculation failed
      }
    },
    [itemsByDay, tripId, toast]
  );

  const addItem = useCallback(
    async (
      newItemData: Omit<
        ItineraryItem,
        'id' | 'trip_id' | 'created_at' | 'position' | 'votes' | 'user_vote'
      > & { day_number: number | null }
    ): Promise<ItineraryItem | null> => {
      // Initialize votes structure correctly for a new item
      const initialVotes = {
        up: 0,
        down: 0,
        upVoters: [],
        downVoters: [],
        userVote: null,
      };
      const completeNewItemData: Omit<ItineraryItem, 'id' | 'trip_id' | 'created_at' | 'position'> =
        {
          ...newItemData,
          votes: initialVotes,
          user_vote: null,
        };

      const tempId = `temp-${Date.now()}`;
      const dayKey = newItemData.day_number ?? 0;
      const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay));

      setItemsByDay((prev) => {
        const newItemsByDay: ItemsByDay = JSON.parse(JSON.stringify(prev));
        if (!newItemsByDay[dayKey]) {
          newItemsByDay[dayKey] = [];
        }
        const position = newItemsByDay[dayKey].length;
        const itemToAdd: ItineraryItem = {
          ...(completeNewItemData as Omit<ItineraryItem, 'id' | 'trip_id' | 'created_at'>),
          id: tempId,
          trip_id: tripId,
          created_at: new Date().toISOString(),
          position: position,
        };
        newItemsByDay[dayKey].push(itemToAdd);
        return newItemsByDay;
      });

      try {
        const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completeNewItemData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to add item');
        }

        const addedItem: ItineraryItem = await response.json(); // Ensure addedItem is typed as ItineraryItem

        // Replace temp item with real item
        setItemsByDay((prev) => {
          const newItemsByDay: ItemsByDay = JSON.parse(JSON.stringify(prev));
          const dayItems = newItemsByDay[dayKey];
          if (!dayItems) return prev;
          const tempIndex = dayItems.findIndex((item: ItineraryItem) => item.id === tempId);
          if (tempIndex !== -1) {
            // Validate and assign the received item
            const validatedAddedItem: ItineraryItem = {
              ...addedItem,
              // Ensure votes structure exists and initialize if missing from API response
              votes: addedItem.votes ?? initialVotes,
              user_vote: addedItem.user_vote ?? null,
              day_number: addedItem.day_number ?? dayKey,
              position: addedItem.position ?? tempIndex,
            };
            newItemsByDay[dayKey][tempIndex] = validatedAddedItem;
          }
          return newItemsByDay;
        });

        return addedItem; // Return the successfully added item
      } catch (error: any) {
        console.error('Error adding item:', error);
        toast({ title: 'Error Adding Item', description: error.message, variant: 'destructive' });
        setItemsByDay(originalItemsByDay);
        return null; // Return null on error
      }
    },
    [itemsByDay, tripId, toast]
  );

  const updateItem = useCallback(
    async (
      itemId: string,
      updatedData: Partial<
        Omit<ItineraryItem, 'id' | 'trip_id' | 'created_at' | 'votes' | 'user_vote'>
      >
    ) => {
      let dayKey: number | null = null;
      let itemIndex = -1;
      const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay)); // For revert

      // Find the item and its day
      Object.entries(itemsByDay).forEach(([day, items]: [string, ItineraryItem[]]) => {
        const index = items.findIndex((i) => i.id === itemId);
        if (index !== -1) {
          dayKey = Number(day);
          itemIndex = index;
        }
      });

      if (dayKey === null || itemIndex === -1) {
        console.error('Item not found for update:', itemId);
        toast({ title: 'Update Error', description: 'Item not found.', variant: 'destructive' });
        return;
      }

      // Optimistic update
      setItemsByDay((prev) => {
        const newItemsByDay: ItemsByDay = JSON.parse(JSON.stringify(prev));
        // Important: Merge updatedData with existing item data
        // Do NOT update 'votes' or 'user_vote' here, only fields in updatedData
        newItemsByDay[dayKey!][itemIndex] = {
          ...newItemsByDay[dayKey!][itemIndex], // Keep existing data
          ...updatedData, // Apply updates
        };
        return newItemsByDay;
      });

      // API Call
      try {
        const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
          method: 'PUT', // Or PATCH if your API supports partial updates
          headers: { 'Content-Type': 'application/json' },
          // Send only the fields that were changed (updatedData)
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update item');
        }
        // Success - optimistic update stands
        // toast({ title: "Item Updated", variant: "default" });
      } catch (error: any) {
        console.error('Error updating item:', error);
        toast({ title: 'Update Error', description: error.message, variant: 'destructive' });
        setItemsByDay(originalItemsByDay); // Revert optimistic update
      }
    },
    [itemsByDay, tripId, toast]
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      let dayKey: number | null = null;
      const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay)); // For revert

      // Find the item's day
      Object.entries(itemsByDay).forEach(([day, items]: [string, ItineraryItem[]]) => {
        if (items.some((i) => i.id === itemId)) {
          dayKey = Number(day);
        }
      });

      if (dayKey === null) {
        console.error('Item not found for delete:', itemId);
        toast({ title: 'Delete Error', description: 'Item not found.', variant: 'destructive' });
        return;
      }

      // Optimistic update
      setItemsByDay((prev) => {
        const newItemsByDay: ItemsByDay = JSON.parse(JSON.stringify(prev));
        newItemsByDay[dayKey!] = newItemsByDay[dayKey!].filter(
          (item: ItineraryItem) => item.id !== itemId
        );
        // Optional: Re-index positions if needed
        if (newItemsByDay[dayKey!]) {
          newItemsByDay[dayKey!] = newItemsByDay[dayKey!].map(
            (item: ItineraryItem, index: number) => ({
              ...item,
              position: index,
            })
          );
        }
        // Optional: delete dayKey if array is empty? Maybe not, keep structure consistent.
        return newItemsByDay;
      });

      // API Call
      try {
        const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // Handle 404 gracefully (item already deleted)
          if (response.status === 404) {
            console.warn(`Item ${itemId} already deleted or not found on server.`);
            // Keep optimistic update as it reflects the desired state
            return;
          }
          throw new Error(errorData.error || 'Failed to delete item');
        }
        // Success - optimistic update stands
        // toast({ title: "Item Deleted", variant: "default" });
      } catch (error: any) {
        console.error('Error deleting item:', error);
        toast({ title: 'Delete Error', description: error.message, variant: 'destructive' });
        setItemsByDay(originalItemsByDay); // Revert optimistic update
      }
    },
    [itemsByDay, tripId, toast]
  );

  // Inline Editing Handlers
  const startEditing = (item: ItineraryItem) => {
    return setEditingItemId(item.id);
    // Allow item.title to be null, provide default empty string for input
    setInlineEditValue(item.title ?? '');
  };

  const cancelEditing = () => {
    return setEditingItemId(null);
    setInlineEditValue('');
  };

  const handleInlineEditChange = (value: string) => {
    return setInlineEditValue(value);
  };

  const saveInlineEdit = async () => {
    if (!editingItemId || !inlineEditValue.trim()) {
      cancelEditing();
      return;
    }

    let dayKey: number | null = null;
    let itemIndex = -1;
    let originalTitle: string | null = null; // Store original title for potential revert

    // Find the item and its day, and store original title *before* optimistic update
    Object.entries(itemsByDay).forEach(([day, items]: [string, ItineraryItem[]]) => {
      const index = items.findIndex((i) => i.id === editingItemId);
      if (index !== -1) {
        dayKey = Number(day);
        itemIndex = index;
        originalTitle = items[index].title; // Get original title
      }
    });

    if (dayKey === null || itemIndex === -1) {
      console.error('Item not found for inline edit save:', editingItemId);
      cancelEditing();
      return;
    }

    const originalItemsByDay = JSON.parse(JSON.stringify(itemsByDay)); // Snapshot for full revert
    const updatePayload = { title: inlineEditValue.trim() };

    // Optimistic Update (Title Only)
    setItemsByDay((prev) => {
      const newItemsByDay: ItemsByDay = JSON.parse(JSON.stringify(prev));
      newItemsByDay[dayKey!][itemIndex] = {
        ...newItemsByDay[dayKey!][itemIndex],
        ...updatePayload,
      };
      return newItemsByDay;
    });
    setEditingItemId(null); // Exit editing mode optimistically

    try {
      // Reuse updateItem logic but specifically for title
      const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, editingItemId), {
        method: 'PUT', // Or PATCH
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload), // Only send title
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save title');
      }
      // Success
      // toast({ title: "Title Updated", variant: "default" });
    } catch (error: any) {
      console.error('Error saving inline edit:', error);
      toast({ title: 'Save Error', description: error.message, variant: 'destructive' });
      // Revert optimistic update using the full snapshot
      setItemsByDay(originalItemsByDay);
      // Keep item ID but clear the value on error? Or revert editing state entirely?
      cancelEditing(); // Revert editing state entirely on error
    }
  };

  return {
    itemsByDay,
    durationDays,
    isLoadingItineraryItems,
    fetchItineraryItems, // Expose fetch if manual refresh is needed
    moveItem,
    addItem,
    updateItem,
    deleteItem,
    voteItem,
    editingItemId,
    inlineEditValue,
    handleInlineEditChange,
    startEditing,
    cancelEditing,
    saveInlineEdit,
  };
}
