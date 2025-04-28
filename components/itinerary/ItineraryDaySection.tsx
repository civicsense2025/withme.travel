import React from 'react';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { ItemStatus } from '@/utils/constants';
import { addDays, format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface ItineraryDaySectionProps {
  startDate: string | null;
  dayNumber: number;
  items: DisplayItineraryItem[];
  onVote: (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => void;
  onStatusChange: (id: string, status: ItemStatus | null) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  onEditItem: (item: DisplayItineraryItem) => void;
  onAddItemToDay: () => void;
  onMoveItem: (itemId: string, targetDay: number | null) => void;
  durationDays: number;
}

export const ItineraryDaySection: React.FC<ItineraryDaySectionProps> = ({
  startDate,
  dayNumber,
  items,
  onVote,
  onStatusChange,
  onDelete,
  canEdit,
  onEditItem,
  onAddItemToDay,
  onMoveItem,
  durationDays,
}) => {
  let formattedDate: string | null = null;
  if (startDate) {
    try {
      const tripStartDate = parseISO(startDate);
      const currentDayDate = addDays(tripStartDate, dayNumber - 1);
      formattedDate = format(currentDayDate, 'EEE, MMM d');
    } catch (error) {
      console.error("Error parsing or formatting date:", error);
    }
  }

  const dayTitle = dayNumber === 1 ? 'day one' :
                   dayNumber === 2 ? 'day two' :
                   dayNumber === 3 ? 'day three' :
                   `day ${dayNumber}`;

  const containerId = `day-${dayNumber}`;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-semibold tracking-tight capitalize">
          {dayTitle}
      </h2>
        {formattedDate && (
          <Badge variant="outline" className="font-normal text-sm py-0.5">
            {formattedDate}
          </Badge>
        )}
      </div>
      <div className="space-y-4">
        <SortableContext 
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
          id={containerId}
        >
            {items.map((item) => (
              <SortableItem 
                key={item.id} 
                id={item.id}
                disabled={!canEdit}
              containerId={containerId}
              >
                <ItineraryItemCard
                  item={item}
                  onDeleteItem={onDelete}
                  onVote={onVote}
                  onEditItem={onEditItem}
                onMoveItem={onMoveItem}
                durationDays={durationDays}
                  canEdit={canEdit}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                isUnscheduled={false}
                variant='full'
                />
              </SortableItem>
            ))}
        </SortableContext>

        {canEdit && (
          <Button 
            variant="outline"
            className="w-full border-dashed border-2 hover:border-solid hover:bg-muted/50 py-6 flex items-center justify-center text-muted-foreground"
            onClick={onAddItemToDay}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Item to {dayTitle}
          </Button>
        )}
      </div>
    </div>
  );
};