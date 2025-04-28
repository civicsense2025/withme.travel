import React from 'react';
import { PlusCircle } from 'lucide-react';
import { DroppableContainer } from './DroppableContainer';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

import { Button } from '@/components/ui/button';
import { ItineraryItemCard, ItineraryItemCardProps } from './ItineraryItemCard';
// We might need a generic DropZone component if unscheduled items can be dropped
// import { DropZone } from './DropZone'; 
import { type TravelTimesResult } from '@/lib/mapbox'; // Adjust path as needed
import { Skeleton } from '@/components/ui/skeleton';
import { DisplayItineraryItem } from '@/types/itinerary';

// Define props passed from ItineraryTab
// Similar to ItineraryDaySectionProps but takes an array of items instead of a section
interface UnscheduledItemsSectionProps extends Omit<ItineraryItemCardProps, 'item' | 'onDelete' | 'onStatusChange' | 'user' | 'creatorProfile' | 'className' | 'date' | 'image' | 'status' | 'onStartEdit'> {
  items: DisplayItineraryItem[];
  canEdit: boolean;
  tripId: string;
  onAddItem: () => void; // Callback for adding an unscheduled item
  travelTimes: Record<string, TravelTimesResult> | null;
  loadingTravelTimes: boolean;
  onDeleteItem: (itemId: string | number) => void;
  onStartEdit: (itemId: string | number, currentNotes: string | null) => void; // Correct signature from ItineraryTab
  // Add any other props needed by a potential drop zone
}

export function UnscheduledItemsSection({
  items,
  canEdit,
  tripId,
  onAddItem,
  travelTimes,
  loadingTravelTimes,
  onVote,
  onEditItem,
  onDeleteItem,
  editingItemId,
  inlineEditValue,
  onStartEdit,
  handleInlineEditChange,
  onCancelEdit,
  onSaveEdit,
}: UnscheduledItemsSectionProps) {

  // Prepare props to pass down to each ItineraryItemCard
  const cardPropsBase = {
    canEdit,
    tripId,
    onVote,
    onEditItem, 
    onDeleteItem, 
    editingItemId,
    inlineEditValue,
    onStartEdit: (item: DisplayItineraryItem) => onStartEdit ? onStartEdit(item.id, item.notes ?? null) : undefined,
    handleInlineEditChange,
    onCancelEdit,
    onSaveEdit: () => onSaveEdit ? onSaveEdit() : undefined, 
    onDelete: (id: string) => onDeleteItem(id), 
    onStatusChange: (id: string, status: any) => { console.warn("onStatusChange not implemented here") },
  };

  return (
    <div className="space-y-3 pt-4">
      {/* Section Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Unscheduled Items</h3>
        {canEdit && (
          <Button variant="ghost" size="sm" onClick={onAddItem} className="text-muted-foreground hover:text-foreground">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        )}
      </div>

      <DroppableContainer id="unscheduled" items={items}>
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
      {items && items.length > 0 ? (
        <div className="space-y-3">
              {items.map(item => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  disabled={!canEdit}
                  containerId="unscheduled"
                >
              <ItineraryItemCard 
                item={item}
                {...cardPropsBase}
                    canEdit={canEdit}
                    onDeleteItem={onDeleteItem}
                    onEditItem={onEditItem}
                    isUnscheduled={true}
              />
                </SortableItem>
              ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic pl-2 min-h-[50px] flex items-center justify-center border border-dashed rounded-md">
          No unscheduled items. Drag items here or use the 'Add Item' button.
        </div>
      )}
        </SortableContext>
      </DroppableContainer>
    </div>
  );
} 