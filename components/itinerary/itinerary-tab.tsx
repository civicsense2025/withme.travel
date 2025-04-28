'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  MeasuringStrategy,
  DropAnimation,
  defaultDropAnimationSideEffects,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { DisplayItineraryItem } from '@/types/itinerary';
import { Profile } from '@/types/profile';
import { ItemStatus, ITINERARY_CATEGORIES, TRIP_ROLES } from '@/utils/constants';
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard';
import { ItineraryFilterControls } from './ItineraryFilterControls';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ItineraryDaySection } from './ItineraryDaySection';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SortableItem } from './SortableItem';
import { useDroppable } from '@dnd-kit/core';

interface ItineraryTabProps {
  tripId: string;
  itineraryItems: DisplayItineraryItem[];
  setItineraryItems: React.Dispatch<React.SetStateAction<DisplayItineraryItem[]>>;
  userId: string;
  user?: Profile | null;
  userRole: string | null;
  durationDays: number;
  startDate: string | null;
  onDeleteItem: (id: string) => Promise<void>;
  onVote: (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => Promise<void>;
  onEditItem: (item: DisplayItineraryItem) => Promise<void>;
  onItemStatusChange: (id: string, status: ItemStatus | null) => Promise<void>;
  onAddItem: (dayNumber: number | null) => void;
  onReorder: (reorderInfo: { itemId: string; newDayNumber: number | null; newPosition: number }) => Promise<void>;
}

// Helper function to re-calculate and assign positions after an array modification
const renormalizePositions = (items: DisplayItineraryItem[], targetContainerId: string): DisplayItineraryItem[] => {
  const targetDay = parseInt(targetContainerId.split('-')[1], 10);
  if (isNaN(targetDay)) {
      console.error("Invalid targetContainerId passed to renormalizePositions", targetContainerId);
      return items; // Return original items if parsing fails
  }
  
  const itemsToNormalize = items.filter(item => item.day_number === targetDay);
  // Sort based on the order they appear in the `items` array passed in, which reflects the drag result
  const originalOrderMap = new Map(items.map((item, index) => [item.id, index]));
  itemsToNormalize.sort((a, b) => (originalOrderMap.get(a.id) ?? Infinity) - (originalOrderMap.get(b.id) ?? Infinity));

  itemsToNormalize.forEach((item, index) => { item.position = index; });

  // Return the full array with updated positions for the target day
  return items.map(item => {
    const updatedItem = itemsToNormalize.find(normItem => normItem.id === item.id);
    return updatedItem || item;
  });
};

// Helper function to renormalize all positions across all days/unscheduled
const renormalizeAllPositions = (items: DisplayItineraryItem[]): DisplayItineraryItem[] => {
    const finalItemsState: DisplayItineraryItem[] = [];
    const itemsByDay = new Map<string | number, DisplayItineraryItem[]>();

    // Group items by day/unscheduled
    items.forEach(item => {
        const key = item.day_number ?? 'unscheduled';
        if (!itemsByDay.has(key)) itemsByDay.set(key, []);
        itemsByDay.get(key)!.push(item);
    });

    // Sort within each group and assign new positions
    itemsByDay.forEach((dayItems) => {
        // Sort by original position first to maintain relative order where possible
        dayItems.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
        // Assign new sequential positions
        dayItems.forEach((item, index) => {
            item.position = index;
            finalItemsState.push(item); // Add to the final list
        });
    });

    // Final sort by day then position
    finalItemsState.sort((a, b) => {
         const dayA = a.day_number ?? Infinity; // Treat null (unscheduled) as Infinity for sorting
         const dayB = b.day_number ?? Infinity;
         if (dayA !== dayB) return dayA - dayB;
         return (a.position ?? 0) - (b.position ?? 0); // Position should be set now
     });
    //  console.log("[RenormalizeAll] New State:", finalItemsState.map(i => ({id: i.id, day: i.day_number, pos: i.position})));
     return finalItemsState;
};

const CONCISE_VIEW_THRESHOLD = 4; // Max items before showing full timeline

const ItineraryTab: React.FC<ItineraryTabProps> = ({
  tripId,
  itineraryItems,
  setItineraryItems,
  userId,
  user,
  userRole,
  durationDays,
  startDate,
  onDeleteItem,
  onVote,
  onEditItem,
  onItemStatusChange,
  onAddItem,
  onReorder,
}) => {
  const { toast } = useToast();
  const [isBrowser, setIsBrowser] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [originalItemsOnDragStart, setOriginalItemsOnDragStart] = useState<DisplayItineraryItem[]>([]);
  const [filter, setFilter] = useState<{ day: number | 'all'; category: string | 'all' }>({ day: 'all', category: 'all' });
  const canEdit = userRole === TRIP_ROLES.ADMIN || userRole === TRIP_ROLES.EDITOR;

  // Define sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the pointer to move by 10 pixels before activating
    activationConstraint: {
        distance: 10,
      },
    }),
    // Keep KeyboardSensor for accessibility
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFilterChange = useCallback((type: 'day' | 'category', value: number | string | 'all') => {
    setFilter(prev => ({ ...prev, [type]: value }));
  }, []);

  const handleDeleteItem = useCallback(async (id: string) => {
    if (!canEdit) return;
    try {
      await onDeleteItem(id);
      setItineraryItems(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Item deleted.' });
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast({ title: 'Error deleting item', variant: 'destructive' });
    }
  }, [canEdit, onDeleteItem, toast, setItineraryItems]);

  const handleVoteItem = useCallback(
    async (itemId: string, day: number | null, voteType: "up" | "down") => {
      try {
        await onVote(itemId, day, voteType);
      } catch (error) {
        console.error('Failed to vote:', error);
        toast({ title: 'Error submitting vote', variant: 'destructive' });
      }
    },
    [onVote, toast]
  );

  const handleItemStatusChange = useCallback(async (id: string, status: ItemStatus | null) => {
    if (!canEdit) return;
    try {
      await onItemStatusChange(id, status);
      setItineraryItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      toast({ title: 'Item status updated.' });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({ title: 'Error updating status', variant: 'destructive' });
    }
  }, [canEdit, onItemStatusChange, toast, setItineraryItems]);

  // Original handler only accepts number
  const handleMoveItemToDayNumber = useCallback(async (itemId: string, newDayNumber: number) => {
    console.log(`[MoveItem] Request to move ${itemId} to Day ${newDayNumber}`);
    if (newDayNumber === null) {
      console.error("[MoveItem] Cannot move item to null day.");
      toast({ title: 'Cannot move item here', variant: 'destructive'});
      return;
    }
    
    // Use setItineraryItems to capture the current state without creating a dependency
    let originalItems: DisplayItineraryItem[] = [];
    let newPosition = 0;
    
    // Step 1: Calculate new position and save original items (all in one function to avoid stale state)
    setItineraryItems(currentItems => {
      originalItems = [...currentItems];
      const itemsInTargetDay = currentItems.filter(item => 
        item.day_number === newDayNumber && item.id !== itemId
      );
      newPosition = itemsInTargetDay.length;
      console.log(`[MoveItem] Calculated new position: ${newPosition} in target day.`);
      return currentItems; // Return unchanged - this is just to read current state
    });

    // Step 2: Optimistic UI Update
    setItineraryItems(currentItems => {
        const activeItemIndex = currentItems.findIndex(item => item.id === itemId);
        if (activeItemIndex === -1) return currentItems;
        const updatedItem = { ...currentItems[activeItemIndex], day_number: newDayNumber, position: newPosition };
        const itemsWithoutActive = currentItems.filter(item => item.id !== itemId);
        let newOptimisticItems = [...itemsWithoutActive, updatedItem]; // Append simplified
        return renormalizeAllPositions(newOptimisticItems); // Renormalize everything
    });

    // API Call
    try {
        // Step 3: Get position from latest state using function update
        let finalPosition = newPosition;
        setItineraryItems(currentItems => {
          const item = currentItems.find(item => item.id === itemId);
          finalPosition = item?.position ?? newPosition;
          return currentItems; // Return unchanged - just reading state
        });
        
        console.log(`[MoveItem] Calling API: itemId=${itemId}, newDayNumber=${newDayNumber}, newPosition=${finalPosition}`);
        await onReorder({ itemId, newDayNumber, newPosition: finalPosition });
        toast({ title: 'Item moved successfully.'});
    } catch (error) {
        console.error('[MoveItem] API Error moving item:', error);
        toast({ title: 'Error moving item', description: 'Reverting changes.', variant: 'destructive' });
        setItineraryItems(() => originalItems); // Revert using the saved original items
    }
  }, [setItineraryItems, onReorder, toast]);
  // itineraryItems removed from dependency array

  // Wrapper to handle the null case (though it shouldn't be called with null anymore)
  const handleMoveItemWrapper = useCallback((itemId: string, targetDay: number | null) => {
      if (targetDay !== null) {
          handleMoveItemToDayNumber(itemId, targetDay);
      } else {
          console.warn("Attempted to move item to null day, operation skipped.");
          toast({ title: 'Cannot move item to unscheduled', variant: 'default' });
      }
  }, [handleMoveItemToDayNumber, toast]);
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log("[DND Start]", event.active); // DEBUG
    setActiveId(event.active.id);
    // Save original state *before* any potential optimistic updates
    setOriginalItemsOnDragStart([...itineraryItems]);
    document.body.style.setProperty('cursor', 'grabbing');
  }, [itineraryItems]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeContainer = active.data.current?.containerId;
    const overContainer = over.data.current?.type === 'container' ? over.id : over.data.current?.containerId;
    // DEBUG: Log frequently during drag over
    // console.log("[DND Over] Active:", active.id, "Over:", over.id, "OverContainer:", overContainer);
    // Potential: Add logic here for immediate visual feedback if needed, 
    // but handleDragEnd does the final state update.
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("[DND End] Event:", event); // DEBUG: Log the whole event

    setActiveId(null); 

    if (!over) {
      console.log("[DND End] No target (over is null), reverting."); // DEBUG
      setItineraryItems(originalItemsOnDragStart); 
      setOriginalItemsOnDragStart([]);
      return;
    }

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;
    const activeContainerId = String(active.data.current?.containerId ?? '');
    const overData = over.data.current;
    const overContainerId = String((overData?.type === 'container' ? over.id : overData?.containerId) ?? '');
    
    console.log("[DND End] Active:", { id: activeIdStr, container: activeContainerId }); // DEBUG
    console.log("[DND End] Over:", { id: overIdStr, container: overContainerId, type: overData?.type }); // DEBUG

    // If dropped outside a valid day container, revert
    if (!overContainerId || !overContainerId.startsWith('day-')) {
      console.warn('[DND End] Invalid over container, reverting.', { overContainerId }); // DEBUG
      setItineraryItems(originalItemsOnDragStart);
      setOriginalItemsOnDragStart([]);
      return;
    }

    // Now we know they are valid day strings like "day-1"
    const activeDayNumberParsed = parseInt(activeContainerId.split('-')[1], 10);
    const overDayNumberParsed = parseInt(overContainerId.split('-')[1], 10);

    // Check if parsing resulted in a valid number
    if (isNaN(activeDayNumberParsed) || isNaN(overDayNumberParsed)) {
        console.error("Failed to parse valid day number from container ID", { activeContainerId, overContainerId });
        setItineraryItems(originalItemsOnDragStart);
        setOriginalItemsOnDragStart([]);
        return;
    }
    // Assign to constants with confirmed number type
    const activeDayNumber: number = activeDayNumberParsed;
    const overDayNumber: number = overDayNumberParsed;

    // --- Case 1: Reordering within the same day --- 
    if (activeDayNumber === overDayNumber) {
      if (activeIdStr !== overIdStr) {
        let finalPosition = 0;
        setItineraryItems((items) => {
          const oldIndex = items.findIndex((item) => item.id === activeIdStr);
          const newIndex = items.findIndex((item) => item.id === overIdStr);
          if (oldIndex === -1 || newIndex === -1) return items; 

          const reorderedItems = arrayMove(items, oldIndex, newIndex);
          // Pass the string container ID directly
          const normalizedItems = renormalizePositions(reorderedItems, activeContainerId); 
          finalPosition = normalizedItems.find(i => i.id === activeIdStr)?.position ?? 0;
          return normalizedItems;
        });
        
        // API Call for same-day reorder
        try {
          // Assert type after isNaN check (which should have already caught issues)
          await onReorder({ 
              itemId: activeIdStr, 
              newDayNumber: activeDayNumber as number, // Type assertion
              newPosition: finalPosition 
          }); 
        } catch (error) {
          console.error('Failed to reorder item within day:', error);
          toast({ title: 'Error saving order', variant: 'destructive' });
          setItineraryItems(originalItemsOnDragStart); // Revert on error
        }
      }
    } 
    // --- Case 2: Moving between different days --- 
    else {
       // Calculate new position based on drop target in the *overDayNumber*
       let tempPosition = 0; 
       const itemsInNewDayPreMove = originalItemsOnDragStart.filter(item => item.day_number === overDayNumber);
       const overIndexInNewDay = itemsInNewDayPreMove.findIndex(item => item.id === overIdStr);

       if (over.id === overContainerId) { // Corrected typo: overContainer -> overContainerId
           tempPosition = itemsInNewDayPreMove.length; 
       } else if (overIndexInNewDay !== -1) { // Dropped onto an item in the target day
           tempPosition = itemsInNewDayPreMove[overIndexInNewDay].position ?? overIndexInNewDay;
       } else { // Fallback: append to end of target day
           tempPosition = itemsInNewDayPreMove.length;
       }
       
       // Optimistic Update for cross-day move
       let finalPosition = 0;
       setItineraryItems(currentItems => { // Use originalItemsOnDragStart for calculation
            const activeItemIndex = originalItemsOnDragStart.findIndex(item => item.id === activeIdStr);
            if (activeItemIndex === -1) return currentItems; 
            
            const itemToMove = { 
                ...originalItemsOnDragStart[activeItemIndex], 
                day_number: overDayNumber, // Target day number
                position: tempPosition // Use temporary position
            };

            let intermediateItems = originalItemsOnDragStart.filter(item => item.id !== activeIdStr);
            
            // Insert the item logically into the target day (used for normalization)
            const targetItems = intermediateItems.filter(i => i.day_number === overDayNumber)
                                                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            targetItems.splice(tempPosition, 0, itemToMove); 
            
            // Rebuild the list preserving order in other days
            const finalUnnormalizedItems: DisplayItineraryItem[] = [];
            const processedDays = new Set<number>();
            
            originalItemsOnDragStart.forEach(item => {
                if (item.id === activeIdStr) return; // Skip original moved item
                const key = item.day_number;
                // Check if key is a valid day number before using with Set
                if (typeof key === 'number' && key === overDayNumber) return; // Add target day items separately
                if (typeof key === 'number' && !processedDays.has(key)) { // Check if key is a number and exists
                    finalUnnormalizedItems.push(...intermediateItems.filter(i => i.day_number === key).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
                    processedDays.add(key); // Add the valid number key
                }
            });
            finalUnnormalizedItems.push(...targetItems); // Add the modified target day items

            const normalizedItems = renormalizeAllPositions(finalUnnormalizedItems);
            finalPosition = normalizedItems.find(i => i.id === activeIdStr)?.position ?? 0;
            return normalizedItems;
       });

       // API Call for cross-day move
       try {
            // Assert type after isNaN check
            await onReorder({ 
                itemId: activeIdStr, 
                newDayNumber: overDayNumber as number, // Type assertion
                newPosition: finalPosition 
            });
        } catch (error) {
            console.error('Failed to move item between days:', error);
            toast({ title: 'Error moving item', variant: 'destructive' });
            setItineraryItems(originalItemsOnDragStart); // Revert on error
        }
    }
    setOriginalItemsOnDragStart([]); // Clear original state backup
  }, [itineraryItems, setItineraryItems, onReorder, toast, originalItemsOnDragStart]);

  // Add handleDragCancel
  const handleDragCancel = useCallback(() => {
    console.log("[DND Cancel] Drag cancelled."); // DEBUG
    if (originalItemsOnDragStart.length > 0) {
      setItineraryItems(originalItemsOnDragStart); // Revert to original state
    }
    setActiveId(null);
    setOriginalItemsOnDragStart([]);
    document.body.style.removeProperty('cursor');
  }, [originalItemsOnDragStart, setItineraryItems]);

  const activeItem = activeId ? itineraryItems.find(item => item.id === activeId) : null;

  // Use useEffect to set isBrowser safely on the client
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const filteredItems = itineraryItems.filter(item =>
    (filter.day === 'all' || item.day_number === filter.day || (filter.day === 0 && item.day_number === null)) && // Adjust day filter for 0 = unscheduled
    (filter.category === 'all' || item.category === filter.category)
  );

  // Group items
  const unscheduledItems = filteredItems.filter(item => item.day_number === null).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const itemsByDay: Record<number, DisplayItineraryItem[]> = {};
  for (let day = 1; day <= durationDays; day++) {
    itemsByDay[day] = filteredItems.filter(item => item.day_number === day).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  const { setNodeRef: setUnscheduledNodeRef, isOver: isOverUnscheduled } = useDroppable({
    id: 'day-0', 
    data: { type: 'container', containerId: 'day-0' },
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <ItineraryFilterControls
        durationDays={durationDays}
        currentFilter={filter}
        onFilterChange={handleFilterChange}
        categories={Object.values(ITINERARY_CATEGORIES)}
      />

      <div className="space-y-8 mt-6">
        {/* Unscheduled Section (Rendered Vertically) */}
        {unscheduledItems.length > 0 && (
             <div ref={setUnscheduledNodeRef} className={`space-y-3 rounded-lg p-4 border ${isOverUnscheduled ? 'bg-secondary/50 border-primary/50' : 'bg-background'}`}> 
                <div className="flex justify-between items-center mb-3">
                   <h3 className="font-semibold text-lg">Unscheduled Items</h3>
                   {canEdit && (
                       <Button variant="ghost" size="sm" onClick={() => onAddItem(null)} className="h-7 px-2">
                         <Plus className="h-4 w-4 mr-1" /> Add
                       </Button>
                   )}
                 </div>
                 {unscheduledItems.map(item => {
                    // Create specific handlers for this item
                    const handleVoteForItem = (voteType: 'up' | 'down') => handleVoteItem(item.id, item.day_number ?? null, voteType);
                    const handleStatusChangeForItem = (status: ItemStatus | null) => handleItemStatusChange(item.id, status);
                    const handleDeleteItemForItem = () => handleDeleteItem(item.id);
                    const handleEditItemForItem = () => onEditItem(item);
                    
                    return (
                       <SortableItem key={item.id} id={item.id} containerId="day-0">
                         <ItineraryItemCard
                           item={item}
                         />
                       </SortableItem>
                    );
                 })}
             </div>
        )}

        {/* Daily Sections (Rendered Vertically) */}
        {Array.from({ length: durationDays }, (_, i) => i + 1).map(day => {
          const dayItems = itemsByDay[day] || [];
          const showConciseView = dayItems.length < CONCISE_VIEW_THRESHOLD;
          // Only render day section if it has items OR if filtering by this specific day
          if (dayItems.length === 0 && filter.day !== 'all' && filter.day !== day) {
             return null; 
          }

          return (
            <div key={`day-container-${day}`}>
              {showConciseView ? (
                // Concise View: Simple list of cards
                <div className="space-y-3 rounded-lg p-4 border bg-background">
                   <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-lg">Day {day}</h3>
                      {canEdit && (
                         <Button variant="ghost" size="sm" onClick={() => onAddItem(day)} className="h-7 px-2">
                            <Plus className="h-4 w-4 mr-1" /> Add
                         </Button>
                      )}
                    </div>
                   {dayItems.map(item => {
                      // Create specific handlers for this item
                      const handleVoteForItem = (voteType: 'up' | 'down') => handleVoteItem(item.id, item.day_number ?? null, voteType);
                      const handleStatusChangeForItem = (status: ItemStatus | null) => handleItemStatusChange(item.id, status);
                      const handleDeleteItemForItem = () => handleDeleteItem(item.id);
                      const handleEditItemForItem = () => onEditItem(item);
                      
                      return (
                         <SortableItem key={item.id} id={item.id} containerId={`day-${day}`}>
                           <ItineraryItemCard
                             item={item}
                           />
                         </SortableItem>
                      );
                   })}
                   {dayItems.length === 0 && (
                      <p className="text-sm text-muted-foreground italic text-center py-4">No items scheduled for Day {day}.</p>
                   )}
                 </div>
              ) : (
                // Full View: Use ItineraryDaySection
            <ItineraryDaySection
                  key={`section-${day}`} 
                  startDate={startDate}
                  dayNumber={day}
              items={dayItems}
                  onVote={handleVoteItem} 
                  onStatusChange={handleItemStatusChange}
                  onDelete={handleDeleteItem}
              canEdit={canEdit}
              onEditItem={onEditItem}
                  onAddItemToDay={() => onAddItem(day)}
                  onMoveItem={handleMoveItemWrapper} 
                  durationDays={durationDays} 
            />
              )}
            </div>
          );
        })}

        {/* Add Item Button for Unscheduled (if no unscheduled items initially) */}
        {unscheduledItems.length === 0 && canEdit && (
          <Card className="mt-4 border-dashed border-primary/50 hover:border-primary transition-colors bg-secondary/30">
            <CardContent className="p-4 text-center">
              <Button variant="ghost" onClick={() => onAddItem(null)} className="w-full h-auto py-3">
                 <Plus className="h-4 w-4 mr-2" /> add item to unscheduled
               </Button>
             </CardContent>
           </Card>
         )}
      </div>

        {isBrowser && activeItem && createPortal(
          <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.7' } } }),
        }}>
          <div className="transform-none pointer-events-none shadow-lg ring-2 ring-primary/30 rounded-lg">
              <ItineraryItemCard
                item={activeItem}
              />
            </div>
          </DragOverlay>,
          document.body
        )}
      </DndContext>
  );
};

export default ItineraryTab;