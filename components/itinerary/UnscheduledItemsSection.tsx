import React from 'react';
import { PlusCircle } from 'lucide-react';
import { DroppableContainer } from './DroppableContainer';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Button } from '@/components/ui/button';
import { ItineraryItemCard } from './ItineraryItemCard';
import { type TravelTimesResult } from '@/lib/mapbox';
import { DisplayItineraryItem } from '@/types/itinerary';

interface UnscheduledItemsSectionProps {
  items: DisplayItineraryItem[];
  canEdit: boolean;
  tripId: string;
  onAddItem: () => void;
  travelTimes?: Record<string, TravelTimesResult> | null;
  loadingTravelTimes?: boolean;
  onDeleteItem: (itemId: string) => void;
  onEditItem?: (item: DisplayItineraryItem) => void;
  onStartEdit?: (item: DisplayItineraryItem) => void;
  editingItemId?: string | null;
  inlineEditValue?: string;
  handleInlineEditChange?: (value: string) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onVote?: (itemId: string, type: 'up' | 'down') => void;
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
  return (
    <div className="space-y-3 pt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Unscheduled Items</h3>
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddItem}
            className="text-muted-foreground hover:text-foreground"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        )}
      </div>

      <DroppableContainer id="unscheduled" items={items}>
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items && items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  disabled={!canEdit}
                  containerId="unscheduled"
                >
                  <ItineraryItemCard
                    item={item}
                    dayNumber={undefined}
                    onClick={() => canEdit && onStartEdit?.(item)}
                    className={canEdit ? 'cursor-pointer' : ''}
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
