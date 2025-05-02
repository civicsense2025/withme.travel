'use client';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import React, { useState, useCallback, useEffect, useMemo, Suspense, lazy } from 'react';
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
} from '@dnd-kit/sortable';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItemStatus } from '@/types/common';
import { Profile } from '@/types/profile';
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ItineraryDaySection } from './ItineraryDaySection';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Plus, PlusCircle, GripVertical, MapPin, HomeIcon, Car } from 'lucide-react';
import { SortableItem } from './SortableItem';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuickAddItemDialog } from './QuickAddItemDialog';
import { UnscheduledItemsSection } from './UnscheduledItemsSection';
import { TripDetailsSection } from './TripDetailsSection';

// Dynamically import the MapboxGeocoderComponent to prevent it from being loaded unnecessarily
const MapboxGeocoderComponent = lazy(() => import('@/components/maps/mapbox-geocoder'));

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
}

// Helper function to re-calculate and assign positions after an array modification
const renormalizePositions = (
  items: DisplayItineraryItem[],
  targetContainerId: string
): DisplayItineraryItem[] => {
  const targetDay = parseInt(targetContainerId.split('-')[1], 10);
  if (isNaN(targetDay)) {
    console.error('Invalid targetContainerId passed to renormalizePositions', targetContainerId);
    return items; // Return original items if parsing fails
  }

  const itemsToNormalize = items.filter((item) => item.day_number === targetDay);
  // Sort based on the order they appear in the `items` array passed in, which reflects the drag result
  const originalOrderMap = new Map(items.map((item, index) => [item.id, index]));
  itemsToNormalize.sort(
    (a, b) => (originalOrderMap.get(a.id) ?? Infinity) - (originalOrderMap.get(b.id) ?? Infinity)
  );

  itemsToNormalize.forEach((item, index) => {
    item.position = index;
  });

  // Return the full array with updated positions for the target day
  return items.map((item) => {
    const updatedItem = itemsToNormalize.find((normItem) => normItem.id === item.id);
    return updatedItem || item;
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
  id: string; // e.g., "day-1", "day-unscheduled"
  children: React.ReactNode;
  disabled?: boolean;
}

const SortableSection: React.FC<SortableSectionProps> = ({ id, children, disabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'section' },
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined, // Ensure dragged section is on top
    position: 'relative', // Cast to Position type or use assertion
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Add a drag handle, only visible/active when not disabled */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-6 inset-y-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-70 hover:opacity-100 cursor-grab transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      {children}
    </div>
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
}) => {
  const { toast } = useToast();
  const [isBrowser, setIsBrowser] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null); // Store type of active element
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

  // Set isBrowser to true on mount (for client-side portal rendering)
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Configure the sensors
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
        delay: 250,
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

  // Handle drag start - capture the item and save original state
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeData = active.data.current;

      if (!activeData) return;

      const type = activeData.type;
      setActiveType(type); // Store the type

      if (type === 'item') {
        const itemId = active.id as string;
        const item = itineraryItems.find((i) => i.id === itemId);
        if (item) {
          setActiveId(itemId);
          // Save original items for potential cancel
          setOriginalItemsOnDragStart([...itineraryItems]);
        }
      }

      if (type === 'section') {
        setActiveId(active.id);
        // Save original items for potential cancel
        setOriginalItemsOnDragStart([...itineraryItems]);
      }
    },
    [itineraryItems]
  );

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
        (overData.type === 'day-section' || overData.type === 'unscheduled-section')
      ) {
        const itemId = active.id as string;
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

        // Move the item to the new container (but don't update position yet)
        setItineraryItems((items) => {
          const updatedItems = items.map((i) => {
            if (i.id === itemId) {
              return { ...i, day_number: newDay };
            }
            return i;
          });
          return updatedItems;
        });
      }
    },
    [itineraryItems, setItineraryItems]
  );

  // Handle drag end - finalize positions and save to backend
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !over) {
        setActiveId(null);
        return;
      }

      const activeData = active.data.current as any;
      const overData = over.data.current as any;

      if (!activeData || !overData) {
        setActiveId(null);
        return;
      }

      try {
        // CASE 1: Item being dragged
        if (activeData.type === 'item') {
          const activeId = active.id as string;
          const activeItem = itineraryItems.find((i) => i.id === activeId);
          if (!activeItem) {
            setActiveId(null);
            return;
          }

          // Determine target container
          let targetDayNumber: number | null = null;
          let targetPosition: number = 0;

          // If over another item, get its container and position
          if (overData.type === 'item') {
            const overId = over.id as string;
            const overItem = itineraryItems.find((i) => i.id === overId);
            if (overItem) {
              targetDayNumber = overItem.day_number;
              targetPosition = overItem.position || 0;
            }
          } else if (overData.type === 'day-section' || overData.type === 'unscheduled-section') {
            // If over a container directly
            if (over.id === 'unscheduled') {
              targetDayNumber = null;
            } else if (typeof over.id === 'string' && over.id.startsWith('day-')) {
              const dayStr = over.id.replace('day-', '');
              targetDayNumber = parseInt(dayStr, 10);
              if (isNaN(targetDayNumber)) targetDayNumber = null;
            }

            // Find position by counting items in this container
            const itemsInTarget = itineraryItems.filter((i) => i.day_number === targetDayNumber);
            targetPosition = itemsInTarget.length; // Put at the end
          }

          if (
            targetDayNumber !== undefined &&
            (activeItem.day_number !== targetDayNumber || activeItem.position !== targetPosition)
          ) {
            // Apply the update locally first
            setItineraryItems((items) => {
              const updatedItems = items.map((item) => {
                if (item.id === activeId) {
                  return { ...item, day_number: targetDayNumber, position: targetPosition };
                }
                return item;
              });
              // Re-normalize positions
              return renormalizeAllPositions(updatedItems);
            });

            // Then save to the server
            await onReorder({
              itemId: activeId,
              newDayNumber: targetDayNumber,
              newPosition: targetPosition,
            });
          }
        }

        // CASE 2: Section being reordered
        if (activeData.type === 'section' && overData.type === 'section') {
          const activeSectionId = active.id as string;
          const overSectionId = over.id as string;

          if (activeSectionId !== overSectionId) {
            // Extract day numbers from section IDs
            const getDay = (id: string): number | null => {
              if (id === 'unscheduled') return null;
              const dayStr = id.replace('day-', '');
              const day = parseInt(dayStr, 10);
              return isNaN(day) ? null : day;
            };

            const activeDay = getDay(activeSectionId as string);
            const overDay = getDay(overSectionId as string);

            // Calculate new section order
            const allSectionIds = Array.from(
              new Set(
                itineraryItems.map((item) =>
                  item.day_number === null ? 'unscheduled' : `day-${item.day_number}`
                )
              )
            );

            const oldIndex = allSectionIds.indexOf(activeSectionId as string);
            const newIndex = allSectionIds.indexOf(overSectionId as string);

            if (oldIndex !== -1 && newIndex !== -1) {
              const newOrder = arrayMove(allSectionIds, oldIndex, newIndex);
              const orderedDays = newOrder.map((id) => getDay(id));
              await onSectionReorder(orderedDays);
            }
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
        setActiveId(null);
        setActiveType(null);
      }
    },
    [
      itineraryItems,
      onReorder,
      onSectionReorder,
      originalItemsOnDragStart,
      setItineraryItems,
      toast,
    ]
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
    const grouped = new Map<string | number | null, DisplayItineraryItem[]>();
    // Start with unscheduled items
    const unscheduledItems = itineraryItems
      .filter((item) => item.day_number === null)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    grouped.set('unscheduled', unscheduledItems);

    // Then add each day
    for (let day = 1; day <= durationDays; day++) {
      const dayItems = itineraryItems
        .filter((item) => item.day_number === day)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      grouped.set(day, dayItems);
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

  // Only get the active item when needed (for overlay)
  const activeItem = useMemo(() => {
    if (activeId && activeType === 'item') {
      return itineraryItems.find((item) => item.id === activeId);
    }
    return null;
  }, [activeId, activeType, itineraryItems]);

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

  return (
    <div className="itinerary-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
      >
        <div className="space-y-6">
          {/* Enhanced Trip Details Section with Accommodations and Transportation */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Trip Details</h3>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddAccommodation}
                        className="flex items-center gap-1"
                      >
                        <HomeIcon className="h-4 w-4" />
                        <span>Add Accommodation</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddTransportation}
                        className="flex items-center gap-1"
                      >
                        <Car className="h-4 w-4" />
                        <span>Add Transportation</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Accommodations Section */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <HomeIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Accommodations</span>
                  </h4>
                  <div className="space-y-2">
                    {accommodationItems.length > 0 ? (
                      accommodationItems.map((item) => (
                        <ItineraryItemCard
                          key={item.id}
                          item={item}
                          onVote={(id: string, voteType: 'up' | 'down') => {}}
                          onStatusChange={onItemStatusChange}
                          onDelete={() => onDeleteItem(item.id)}
                          canEdit={canEdit}
                          onEdit={() => onEditItem(item)}
                          showDayBadge={false}
                          showDetailedView={false}
                          className="border border-border/50"
                        />
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic px-4 py-2 bg-muted/20 rounded-md">
                        Add accommodations to help everyone know where you'll be staying
                      </div>
                    )}
                  </div>
                </div>

                {/* Transportation Section */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-1">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>Transportation</span>
                  </h4>
                  <div className="space-y-2">
                    {transportationItems.length > 0 ? (
                      transportationItems.map((item) => (
                        <ItineraryItemCard
                          key={item.id}
                          item={item}
                          onVote={(id: string, voteType: 'up' | 'down') => {}}
                          onStatusChange={onItemStatusChange}
                          onDelete={() => onDeleteItem(item.id)}
                          canEdit={canEdit}
                          onEdit={() => onEditItem(item)}
                          showDayBadge={false}
                          showDetailedView={false}
                          className="border border-border/50"
                        />
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic px-4 py-2 bg-muted/20 rounded-md">
                        Add transportation details like flights, rentals, or transit tickets
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unscheduled Items Section with Drop Zone */}
          <SortableSection id="unscheduled" disabled={!canEdit}>
            <div className="relative">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Unscheduled Items</h3>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddUnscheduledItem}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Item</span>
                        </Button>
                      )}
                    </div>

                    <div
                      className="space-y-2 min-h-[100px] relative rounded-md"
                      data-type="unscheduled-section"
                    >
                      {(itemsBySection.get('unscheduled') || []).length > 0 ? (
                        (itemsBySection.get('unscheduled') || []).map((item) => (
                          <ItineraryItemCard
                            key={item.id}
                            item={item}
                            onVote={(id: string, voteType: 'up' | 'down') =>
                              onVote(id, null, voteType)
                            }
                            onStatusChange={onItemStatusChange}
                            onDelete={onDeleteItem}
                            canEdit={canEdit}
                            onEdit={() => onEditItem(item)}
                            dragHandleData={{ id: item.id, type: 'item' }}
                          />
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground italic px-4 py-8 flex items-center justify-center bg-muted/20 rounded-md border-2 border-dashed border-muted">
                          Add items here or drag scheduled items to move them to unscheduled
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SortableSection>

          {/* Day Sections */}
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            {Array.from({ length: durationDays }, (_, i) => {
              const dayNumber = i + 1;
              const sectionId = `day-${dayNumber}`;
              const itemsForSection = itemsBySection.get(dayNumber) || [];

              return (
                <SortableSection key={sectionId} id={sectionId} disabled={!canEdit}>
                  <ItineraryDaySection
                    startDate={startDate}
                    dayNumber={dayNumber as number}
                    items={itemsForSection}
                    onVote={onVote}
                    onStatusChange={onItemStatusChange}
                    onDelete={onDeleteItem}
                    canEdit={canEdit}
                    onEditItem={onEditItem}
                    onAddItemToDay={() => onAddItem(dayNumber)}
                    onMoveItem={(itemId, targetDay) => {
                      // Handle move item logic if needed
                      console.log('Move item requested:', itemId, targetDay);
                    }}
                    durationDays={durationDays}
                    containerId={sectionId}
                  />
                </SortableSection>
              );
            })}
          </SortableContext>
        </div>

        {/* Drag Overlay - shows the item being dragged */}
        {isBrowser &&
          activeItem &&
          createPortal(
            <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
              <ItineraryItemCard item={activeItem} isOverlay={true} />
            </DragOverlay>,
            document.body
          )}
      </DndContext>

      {/* Quick Add Item Dialog */}
      <QuickAddItemDialog
        tripId={tripId}
        isOpen={isQuickAddDialogOpen}
        onOpenChange={setIsQuickAddDialogOpen}
        onItemAdded={handleItemAdded}
        defaultCategory={quickAddDefaultCategory}
        dialogTitle={quickAddDialogConfig.title}
        dialogDescription={quickAddDialogConfig.description}
      />
    </div>
  );
};
