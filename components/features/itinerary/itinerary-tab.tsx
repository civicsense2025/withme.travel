'use client';
import { ITINERARY_CATEGORIES, ITEM_STATUSES, type ItemStatus } from '@/utils/constants/status';
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
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { DisplayItineraryItem } from '@/types/itinerary';
import { Profile } from '@/types/profile';
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ItineraryDaySection } from './ItineraryDaySection';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Plus, PlusCircle, GripVertical, MapPin, HomeIcon, Car, BedDouble } from 'lucide-react';
import { SortableItem } from './SortableItem';
import { CSS, type Transform } from '@dnd-kit/utilities';
import { UnscheduledItemsSection } from './UnscheduledItemsSection';
import { TripDetailsSection } from './TripDetailsSection';
import { cn } from '@/lib/utils';

import React, { useState, useCallback, useEffect, useMemo, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Dynamically import both heavy components
const MapboxGeocoderComponent = lazy(() => import('@/components/features/maps/mapbox-geocoder'));
// Lazy load the QuickAddItemDialog component to reduce initial bundle size
const QuickAddItemDialog = lazy(() =>
  import('./QuickAddItemDialog').then((mod) => ({
    default: mod.QuickAddItemDialog,
  }))
);

// Loading fallback component for lazy-loaded components
const LoadingFallback = () => (
  <div className="p-6 animate-pulse flex flex-col justify-center items-center bg-muted rounded-lg h-[300px]">
    <div className="w-12 h-12 rounded-full bg-gray-300 mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);

// Define trip roles
const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  CONTRIBUTOR: 'contributor',
} as const;

// Define GeocoderResult interface
interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  id?: string; // Mapbox ID
  properties?: { address?: string };
  context?: any;
  [key: string]: any;
}

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
  onReorder: (reorderInfo: {
    itemId: string;
    newDayNumber: number | null;
    newPosition: number;
  }) => Promise<void>;
  onSectionReorder: (orderedDayNumbers: (number | null)[]) => Promise<void>;
  refetchItinerary?: () => Promise<void>;
}

// Helper function to re-calculate and assign positions after an array modification
const renormalizePositions = (
  items: DisplayItineraryItem[],
  targetContainerId: string
): DisplayItineraryItem[] => {
  // Determine if we're normalizing the unscheduled section or a specific day
  let targetDayNumber: number | null = null;

  if (targetContainerId === 'unscheduled') {
    targetDayNumber = null;
  } else if (targetContainerId.startsWith('day-')) {
    const dayStr = targetContainerId.replace('day-', '');
    targetDayNumber = parseInt(dayStr, 10);
    if (isNaN(targetDayNumber)) {
      console.error('Invalid targetContainerId passed to renormalizePositions', targetContainerId);
      return items; // Return original items if parsing fails
    }
  } else {
    console.error('Invalid targetContainerId format:', targetContainerId);
    return items;
  }

  // Find all items that belong to the target container
  const itemsToNormalize = items.filter((item) => item.day_number === targetDayNumber);

  // Sort based on their current positions first to maintain order
  itemsToNormalize.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  // Assign new sequential positions
  itemsToNormalize.forEach((item, index) => {
    item.position = index;
  });

  // Return the full array with updated positions for the target container items
  return items.map((item) => {
    if (item.day_number === targetDayNumber) {
      // Find the normalized version of this item
      const updatedItem = itemsToNormalize.find((normItem) => normItem.id === item.id);
      return updatedItem || item;
    }
    return item;
  });
};

// Helper function to renormalize all positions across all days/unscheduled
const renormalizeAllPositions = (items: DisplayItineraryItem[]): DisplayItineraryItem[] => {
  const finalItemsState: DisplayItineraryItem[] = [];
  const itemsByDay = new Map<string | number, DisplayItineraryItem[]>();

  // Group items by day/unscheduled
  items.forEach((item) => {
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

// --- Sortable Section Wrapper ---
interface SortableSectionProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SortableSection: React.FC<SortableSectionProps> = ({ id, children, disabled }) => {
  // Force disable dragging for the unscheduled section
  const isUnscheduled = id === 'unscheduled';
  const isDisabled = disabled || isUnscheduled;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isDisabled,
    data: {
      type: 'section',
      id,
    },
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    position: 'relative' as const, // Type assertion to avoid Position type issue
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={cn(
          'section-handle relative mb-2',
          !isDisabled && 'cursor-grab active:cursor-grabbing'
        )}
        {...(isDisabled ? {} : listeners)}
      >
        {children}
      </div>
    </div>
  );
};

// Create a custom global style component to control drag/drop appearance and transitions
const GlobalStyles = () => {
  return (
    <style jsx global>{`
      /* Styles for active dragging state */
      body.dragging-active {
        cursor: grabbing !important;
      }

      /* Improve sortable item styling */
      .sortable-item {
        transition:
          transform 250ms ease,
          opacity 200ms ease;
        transform-origin: center center;
        position: relative;
        z-index: 1;
      }

      /* Add hover effect for draggable items */
      [data-draggable='true']:hover {
        cursor: grab;
      }

      /* Improve drag animation smoothness */
      .smooth-transition {
        transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
      }

      /* Add animated connecting lines between day sections */
      @keyframes dash {
        to {
          stroke-dashoffset: 0;
        }
      }

      /* Subtle pulse animation for connector lines */
      @keyframes pulse-subtle {
        0% {
          opacity: 0.3;
        }
        50% {
          opacity: 0.6;
        }
        100% {
          opacity: 0.3;
        }
      }

      .animate-pulse-subtle {
        animation: pulse-subtle 2s infinite ease-in-out;
      }

      /* Add a subtle highlight to active day section */
      .day-section-active {
        box-shadow:
          0 0 0 2px var(--primary-500, #7c3aed),
          0 0 20px rgba(124, 58, 237, 0.1);
      }

      /* Smoother transitions for drag overlay */
      [data-react-beautiful-dnd-drag-handle] {
        transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
      }
    `}</style>
  );
};

export const ItineraryTab: React.FC<ItineraryTabProps> = ({
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
  onSectionReorder,
  refetchItinerary,
}) => {
  const { toast } = useToast();
  const [isBrowser, setIsBrowser] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'item' | 'section' | null>(null);
  const [activeItem, setActiveItem] = useState<DisplayItineraryItem | null>(null);
  const [originalItemsOnDragStart, setOriginalItemsOnDragStart] = useState<DisplayItineraryItem[]>(
    []
  );
  const canEdit = userRole === TRIP_ROLES.ADMIN || userRole === TRIP_ROLES.EDITOR;

  // Add state for quick add dialog
  const [isQuickAddDialogOpen, setIsQuickAddDialogOpen] = useState(false);
  const [quickAddDefaultCategory, setQuickAddDefaultCategory] = useState<string | null>(null);
  const [quickAddDialogConfig, setQuickAddDialogConfig] = useState({
    title: 'Add Unscheduled Item',
    description: 'Add another item to your unscheduled items list.',
  });

  // Update the state variables
  const [quickAddDay, setQuickAddDay] = useState<number | null>(null);

  // Set isBrowser to true on mount (for client-side portal rendering)
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Configure the sensors with proper constraints
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 5 pixels before activating
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to update items array
  const updateItemDayNumberAndPosition = useCallback(
    (itemId: string, dayNumber: number | null, position: number | null) => {
      setItineraryItems((prev) => {
        return prev.map((item) => {
          if (item.id === itemId) {
            const itemToUpdate = { ...item };
            if (dayNumber !== undefined) itemToUpdate.day_number = dayNumber;
            if (position !== null) itemToUpdate.position = position;
            return itemToUpdate;
          }
          return item;
        });
      });
    },
    [setItineraryItems]
  );

  // Modify the handleDragStart function to improve visual feedback
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeData = active.data.current as any;

      // Store original items state to restore on errors
      setOriginalItemsOnDragStart([...itineraryItems]);
      setActiveId(active.id as string);

      if (activeData?.type === 'item') {
        setActiveType('item');
        // Directly use find with a condition instead of storing the full array
        setActiveItem(itineraryItems.find((item) => item.id === active.id) || null);
      } else if (activeData?.type === 'section') {
        setActiveType('section');
      }

      // Make sure item is visually active by adding a class to body
      document.body.classList.add('dragging-active');
    },
    [itineraryItems]
  );

  // Handle drag end - finalize positions and save to backend
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      // Always remove dragging class at the start of the function
      document.body.classList.remove('dragging-active');

      const { active, over } = event;

      // If nothing is over a target, or no active item, reset state and return
      if (!active || !over) {
        setActiveId(null);
        setActiveType(null);
        setActiveItem(null);
        return;
      }

      const activeData = active.data.current as any;
      const overData = over?.data.current as any;

      if (!activeData) {
        setActiveId(null);
        setActiveType(null);
        setActiveItem(null);
        return;
      }

      try {
        // CASE 1: Item being dragged
        if (activeData.type === 'item') {
          const activeId = active.id as string;
          const activeItemData = itineraryItems.find((i) => i.id === activeId);
          if (!activeItemData) {
            setActiveId(null);
            setActiveType(null);
            setActiveItem(null);
            return;
          }

          // Determine target container
          let targetDayNumber: number | null = null;
          let targetPosition: number = 0;

          // If over another item, get its container and position
          if (overData?.type === 'item') {
            const overId = over.id as string;
            const overItem = itineraryItems.find((i) => i.id === overId);
            if (overItem) {
              targetDayNumber = overItem.day_number;

              // Use the coordinates from the events directly
              if (
                active.data.current?.sortable?.index !== undefined &&
                over.data.current?.sortable?.index !== undefined
              ) {
                const activeIndex = active.data.current.sortable.index;
                const overIndex = over.data.current.sortable.index;

                // If dropping after the target item
                if (activeIndex > overIndex) {
                  targetPosition = overItem.position || 0;
                } else {
                  // If dropping before the target item
                  targetPosition = (overItem.position || 0) + 1;
                }
              } else {
                // Simple fallback - just use the target item's position for consistent behavior
                targetPosition = overItem.position || 0;
              }
            }
          } else if (
            overData?.type === 'section' ||
            overData?.type === 'unscheduled-section' ||
            overData?.type === 'day-section' ||
            overData?.type === 'container'
          ) {
            // If over a container directly
            if (over.id === 'unscheduled') {
              targetDayNumber = null;
            } else if (typeof over.id === 'string' && over.id.startsWith('day-')) {
              const dayStr = over.id.replace('day-', '');
              targetDayNumber = parseInt(dayStr, 10);
              if (isNaN(targetDayNumber)) targetDayNumber = null;
            }

            // Find maximum position in this container to append at the end
            const itemsInTarget = itineraryItems.filter((i) => i.day_number === targetDayNumber);
            const maxPosition = itemsInTarget.reduce(
              (max, item) => Math.max(max, item.position || 0),
              -1
            );
            targetPosition = maxPosition + 1; // Put at the end
          }

          // Only update if target container or position is different
          const isSameDay = targetDayNumber === activeItemData.day_number;
          const isSamePosition = targetPosition === activeItemData.position;

          if (!over || (!overData && !isSameDay && !isSamePosition)) {
            // Defensive: if no valid drop target, just reset
            setActiveId(null);
            setActiveType(null);
            setActiveItem(null);
            return;
          }

          // If dropped in the same slot, do nothing
          if (isSameDay && isSamePosition) {
            setActiveId(null);
            setActiveType(null);
            setActiveItem(null);
            return;
          }

          // Find the target container ID for renormalizing positions
          const targetContainerId =
            targetDayNumber === null ? 'unscheduled' : `day-${targetDayNumber}`;

          // First, update the day_number of the dragged item
          const newItems = itineraryItems.map((item) => {
            if (item.id === activeId) {
              return { ...item, day_number: targetDayNumber };
            }
            return item;
          });

          // Then, adjust all positions of items in the target container
          const itemsInTargetContainer = newItems.filter(
            (item) => item.day_number === targetDayNumber
          );

          // When dropping at a specific position, we need to shift items accordingly
          let adjustedItems = [...newItems];

          // Make space for the item at targetPosition by incrementing position of all items at or after targetPosition
          if (!isSameDay || (isSameDay && targetPosition !== activeItemData.position)) {
            adjustedItems = adjustedItems.map((item) => {
              if (item.id === activeId) {
                // The dragged item gets the target position
                return { ...item, day_number: targetDayNumber, position: targetPosition };
              } else if (item.day_number === targetDayNumber) {
                const itemPos = item.position || 0;
                const activeItemPos = activeItemData.position ?? 0;

                if (isSameDay) {
                  // Special handling for same-day reordering
                  if (targetPosition > activeItemPos) {
                    // Moving down: Decrement positions for items between old and new position
                    if (itemPos > activeItemPos && itemPos <= targetPosition) {
                      return { ...item, position: itemPos - 1 };
                    }
                  } else if (targetPosition < activeItemPos) {
                    // Moving up: Increment positions for items between new and old position
                    if (itemPos >= targetPosition && itemPos < activeItemPos) {
                      return { ...item, position: itemPos + 1 };
                    }
                  }
                } else {
                  // For items moving to a new day
                  // Increment positions for items at or after the target position
                  if (itemPos >= targetPosition) {
                    return { ...item, position: itemPos + 1 };
                  }
                }
              } else if (item.day_number === activeItemData.day_number && item.id !== activeId) {
                // For items in the original day (if different from target day)
                // Decrement positions for items after the original position of the moved item
                const itemPos = item.position || 0;
                const activeItemPos = activeItemData.position ?? 0;

                if (itemPos > activeItemPos) {
                  return { ...item, position: itemPos - 1 };
                }
              }
              return item;
            });
          }

          // Use renormalizePositions to clean up any gaps in positioning
          const finalItems = renormalizePositions(adjustedItems, targetContainerId);
          setItineraryItems(finalItems);

          // Send update to backend
          await onReorder({
            itemId: activeId,
            newDayNumber: targetDayNumber,
            newPosition: targetPosition,
          });

          // Show appropriate toast message
          if (!isSameDay) {
            toast({
              title: 'Item moved',
              description:
                targetDayNumber === null
                  ? 'Item moved to unscheduled items'
                  : `Item moved to Day ${targetDayNumber}`,
              duration: 2000,
            });
          } else {
            toast({
              title: 'Order updated',
              description: 'Item position saved',
              duration: 2000,
            });
          }
        }
        // CASE 2: Section being dragged
        else if (activeData.type === 'section' && overData?.type === 'section') {
          // Get day numbers for each section
          const getDay = (id: string): number | null => {
            if (id === 'unscheduled') return null;
            if (id.startsWith('day-')) {
              const dayNum = parseInt(id.replace('day-', ''), 10);
              return isNaN(dayNum) ? null : dayNum;
            }
            return null;
          };

          const activeDay = getDay(active.id as string);
          const overDay = getDay(over.id as string);

          // Only reorder if both are valid sections and different
          if (activeDay !== overDay && activeDay !== null && overDay !== null) {
            // Create new order of sections
            const allDays = Array.from({ length: durationDays }, (_, i) => i + 1);

            // Create a new array with the active day moved to the position of the over day
            const newSectionOrder = allDays.filter((day) => day !== activeDay);
            const overIndex = newSectionOrder.findIndex((day) => day === overDay);

            if (overIndex !== -1) {
              newSectionOrder.splice(overIndex, 0, activeDay);
            } else {
              newSectionOrder.push(activeDay);
            }

            // Add null for unscheduled at the beginning
            // Cast the array to (number | null)[] to allow null values
            const newSectionOrderWithNull = [null, ...newSectionOrder] as (number | null)[];

            // Tell backend about the section reordering
            await onSectionReorder(newSectionOrderWithNull);

            // Show toast for day reordering
            toast({
              title: 'Days reordered',
              description: 'New day order saved',
              duration: 2000,
            });
          }
        }
      } catch (err) {
        console.error('Error during drag end:', err);
        toast({
          title: 'Failed to update item',
          description: 'There was an error updating the itinerary. Please try again.',
          variant: 'destructive',
        });
        // Restore original items state on error
        setItineraryItems(originalItemsOnDragStart);
      } finally {
        // Always clean up states and remove cursor class
        setActiveId(null);
        setActiveType(null);
        setActiveItem(null);
        document.body.classList.remove('dragging-active');
      }
    },
    [
      itineraryItems,
      onReorder,
      onSectionReorder,
      originalItemsOnDragStart,
      setItineraryItems,
      toast,
      durationDays,
    ]
  );

  // Add this cleanup function
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveType(null);
    setActiveItem(null);
    // Make sure cursor is reset
    document.body.classList.remove('dragging-active');
  }, []);

  // Helper to parse day number from container ID
  const parseDayNumber = (containerId: string): number | null => {
    if (containerId === 'unscheduled') return null;
    if (containerId.startsWith('day-')) {
      const dayNumberStr = containerId.replace('day-', '');
      const dayNumber = parseInt(dayNumberStr, 10);
      return isNaN(dayNumber) ? null : dayNumber;
    }
    return null; // Default to unscheduled if can't parse
  };

  // Handle drag over - check for valid drop target and update UI
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!active || !over) return;

      const activeData = active.data.current as any;
      const overData = over.data.current as any;

      if (!activeData || !overData) return;

      // Item over container
      if (
        activeData.type === 'item' &&
        (overData.type === 'section' ||
          overData.type === 'unscheduled-section' ||
          overData.type === 'day-section' ||
          overData.type === 'container')
      ) {
        const itemId = active.id as string;

        // Find item directly with a single lookup
        const item = itineraryItems.find((i) => i.id === itemId);
        if (!item) return;

        // Get the container info from over
        let overContainerId;
        if (over.id === 'unscheduled') {
          overContainerId = 'unscheduled';
        } else if (typeof over.id === 'string' && over.id.startsWith('day-')) {
          overContainerId = over.id;
        } else {
          return; // Invalid target
        }

        const newDay = parseDayNumber(overContainerId);
        if (item.day_number === newDay) return; // No change needed

        // Use a more efficient state update to avoid recreating the entire array
        setItineraryItems((items) =>
          items.map((i) => (i.id === itemId ? { ...i, day_number: newDay } : i))
        );
      }
    },
    [itineraryItems]
  );

  // Handle opening the quick add dialog for different categories
  const handleAddUnscheduledItem = () => {
    setQuickAddDefaultCategory(null);
    setQuickAddDialogConfig({
      title: 'Add Unscheduled Item',
      description: 'Add another item to your unscheduled items list.',
    });
    setIsQuickAddDialogOpen(true);
  };

  const handleAddAccommodation = () => {
    setQuickAddDefaultCategory(ITINERARY_CATEGORIES.ACCOMMODATIONS);
    setQuickAddDialogConfig({
      title: 'Add Accommodation',
      description: "Add where you'll be staying during your trip.",
    });
    setIsQuickAddDialogOpen(true);
  };

  const handleAddTransportation = () => {
    setQuickAddDefaultCategory(ITINERARY_CATEGORIES.TRANSPORTATION);
    setQuickAddDialogConfig({
      title: 'Add Transportation',
      description: "Add how you'll be getting around during your trip.",
    });
    setIsQuickAddDialogOpen(true);
  };

  // Callback for when an item is added
  const handleItemAdded = () => {
    // Refresh the itinerary
    toast({
      title: 'Item Added',
      description: 'Your itinerary has been updated.',
    });
  };

  // Group all items by day/unscheduled for the sections
  const itemsBySection = useMemo(() => {
    // Create a function to sort items by position more efficiently
    const sortByPosition = (a: DisplayItineraryItem, b: DisplayItineraryItem) =>
      (a.position ?? 0) - (b.position ?? 0);

    // Create a Map to store all the grouped items
    const grouped = new Map<string | number | null, DisplayItineraryItem[]>();

    // First, determine all unique day numbers (including null for unscheduled)
    const dayNumbers = new Set<number | null>(itineraryItems.map((item) => item.day_number));

    // Make sure "unscheduled" (null) is always included
    dayNumbers.add(null);

    // For each day number, filter and sort the items once
    dayNumbers.forEach((dayNumber) => {
      const itemsForDay = itineraryItems
        .filter((item) => item.day_number === dayNumber)
        .sort(sortByPosition);

      // Store in the Map with the appropriate key
      grouped.set(dayNumber === null ? 'unscheduled' : dayNumber, itemsForDay);
    });

    // Make sure every day from 1 to durationDays exists in the Map
    for (let day = 1; day <= durationDays; day++) {
      if (!grouped.has(day)) {
        grouped.set(day, []);
      }
    }

    return grouped;
  }, [itineraryItems, durationDays]);

  // Create an array of all container IDs in the desired order
  const sectionIds = useMemo(() => {
    const allIds = ['unscheduled'];
    for (let day = 1; day <= durationDays; day++) {
      allIds.push(`day-${day}`);
    }
    return allIds;
  }, [durationDays]);

  // Create drop animation config
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  // Get accommodation and transportation items for the enhanced trip details section
  const accommodationItems = useMemo(
    () => itineraryItems.filter((item) => item.category === ITINERARY_CATEGORIES.ACCOMMODATIONS),
    [itineraryItems]
  );

  const transportationItems = useMemo(
    () => itineraryItems.filter((item) => item.category === ITINERARY_CATEGORIES.TRANSPORTATION),
    [itineraryItems]
  );

  // Update the existing onAddItem callback
  const handleAddItemToDay = (dayNumber: number) => {
    setQuickAddDay(dayNumber);
    setQuickAddDialogConfig({
      title: `Add Item to Day ${dayNumber}`,
      description: `Add a new item for day ${dayNumber} of your trip.`,
    });
    setIsQuickAddDialogOpen(true);
  };

  return (
    <div className="itinerary-container">
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
        <GlobalStyles />
        <div className="space-y-6">
          {/* Quick actions for adding accommodations and transportation */}
          {canEdit && (
            <motion.div
              className="flex flex-wrap gap-3 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={handleAddAccommodation}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <BedDouble className="h-4 w-4" />
                <span>Add Accommodation</span>
              </Button>
              <Button
                onClick={handleAddTransportation}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Car className="h-4 w-4" />
                <span>Add Transportation</span>
              </Button>
            </motion.div>
          )}

          {/* Unscheduled Items Section with Drop Zone - Always disabled for dragging */}
          <div id="unscheduled" className="scroll-mt-16">
            <SortableSection id="unscheduled" disabled={true}>
              <UnscheduledItemsSection
                items={itemsBySection.get('unscheduled') || []}
                canEdit={canEdit}
                onAddItem={handleAddUnscheduledItem}
                onEditItem={onEditItem}
                tripId={tripId}
                containerId={'unscheduled'}
                refetchItinerary={refetchItinerary}
              />
            </SortableSection>
          </div>

          {/* Day Sections */}
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            {Array.from({ length: durationDays }, (_, i) => {
              const dayNumber = i + 1;
              const sectionId = `day-${dayNumber}`;
              const itemsForSection = itemsBySection.get(dayNumber) || [];

              return (
                <div key={sectionId} id={sectionId} className="scroll-mt-16">
                  <SortableSection id={sectionId} disabled={!canEdit}>
                    <SortableItem
                      key={dayNumber}
                      id={String(dayNumber)}
                      containerId={sectionId}
                      disabled={!canEdit}
                    >
                      <ItineraryDaySection
                        startDate={startDate}
                        dayNumber={dayNumber as number}
                        items={itemsForSection}
                        onVote={onVote}
                        onStatusChange={onItemStatusChange}
                        onDelete={onDeleteItem}
                        canEdit={canEdit}
                        onEditItem={onEditItem}
                        onAddItemToDay={() => handleAddItemToDay(dayNumber)}
                        onMoveItem={(itemId, targetDay) => {
                          return; // Handle move item logic if needed
                        }}
                        durationDays={durationDays}
                        containerId={sectionId}
                        tripId={tripId}
                        onItemAdded={refetchItinerary}
                      />
                    </SortableItem>
                  </SortableSection>
                </div>
              );
            })}
          </SortableContext>
        </div>

        {/* Drag Overlay - shows the item being dragged */}
        <DragOverlay adjustScale={true} dropAnimation={dropAnimation}>
          {activeType === 'item' && activeId && activeItem ? (
            <div className="opacity-90 w-full transform-gpu scale-[0.98] pointer-events-none shadow-xl rounded-lg ring-2 ring-primary/50 border border-primary/20 bg-background">
              <ItineraryItemCard item={activeItem} isOverlay={true} editable={false} />
            </div>
          ) : null}
          {activeType === 'section' && activeId ? (
            <div className="opacity-95 w-full transform-gpu scale-[0.98] pointer-events-none bg-background p-4 rounded-lg border-2 border-primary/30 shadow-lg">
              <div className="flex items-center gap-2 p-2">
                <div className="w-1.5 h-12 bg-primary/70 rounded-full animate-pulse"></div>
                <div className="h-12 flex items-center justify-center">
                  <p className="font-medium">Moving Day {activeId}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Quick Add Dialog */}
      {isQuickAddDialogOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <QuickAddItemDialog
            isOpen={isQuickAddDialogOpen}
            onClose={() => setIsQuickAddDialogOpen(false)}
            title={quickAddDialogConfig.title}
            description={quickAddDialogConfig.description}
            tripId={tripId}
            defaultCategory={quickAddDefaultCategory}
            dayNumber={quickAddDay}
            onItemAdded={handleItemAdded}
          />
        </Suspense>
      )}
    </div>
  );
};
