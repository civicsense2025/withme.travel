import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { addDays, format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { useDroppable } from '@dnd-kit/core';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { type ItemStatus } from '@/utils/constants/status';

import React, { useState } from 'react';

// Color palette from city-bubbles.tsx
const dayColors = [
  'bg-travel-blue text-blue-950 dark:text-blue-50',
  'bg-travel-pink text-pink-950 dark:text-pink-50',
  'bg-travel-yellow text-amber-950 dark:text-amber-50',
  'bg-travel-purple text-purple-950 dark:text-purple-50',
];

// Function to get a color based on day number
const getDayColor = (dayNumber: number): string => {
  // Use modulo to cycle through colors
  return dayColors[dayNumber % dayColors.length];
};

interface ItineraryDaySectionProps {
  startDate: string | null;
  dayNumber: number;
  items: DisplayItineraryItem[];
  onVote: (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => void;
  onStatusChange: (id: string, status: ItemStatus | null) => Promise<void>;
  onDelete: (id: string) => void;
  canEdit: boolean;
  onEditItem: (item: DisplayItineraryItem) => void;
  onAddItemToDay: () => void;
  onMoveItem: (itemId: string, targetDay: number | null) => void;
  durationDays: number;
  containerId: string;
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
  containerId,
}) => {
  const { toast } = useToast();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [sectionTitle, setSectionTitle] = useState(
    dayNumber === 1
      ? 'day one'
      : dayNumber === 2
        ? 'day two'
        : dayNumber === 3
          ? 'day three'
          : `day ${dayNumber}`
  );

  const handleTitleSave = async () => {
    if (sectionTitle.trim() === '') {
      // Reset to default if empty
      setSectionTitle(
        dayNumber === 1
          ? 'day one'
          : dayNumber === 2
            ? 'day two'
            : dayNumber === 3
              ? 'day three'
              : `day ${dayNumber}`
      );
    }

    // Here you would typically save the title to the database
    // For this implementation we'll just update the local state and show a toast
    setIsEditingTitle(false);
    toast({
      title: 'Section title updated',
      description: `Day ${dayNumber} section title has been updated.`,
    });
  };

  let formattedDate: string | null = null;
  if (startDate) {
    try {
      const tripStartDate = parseISO(startDate);
      const currentDayDate = addDays(tripStartDate, dayNumber - 1);
      formattedDate = format(currentDayDate, 'EEE, MMM d');
    } catch (error) {
      console.error('Error parsing or formatting date:', error);
    }
  }

  // Setup droppable area for items with the correct container ID
  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
    data: {
      type: 'day-section',
      dayNumber: dayNumber,
      id: containerId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'space-y-4 pt-4 relative',
        isOver && 'bg-muted/50 ring-2 ring-primary rounded-md p-2'
      )}
    >
      {/* Section header with title on left and date on right */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="text-2xl font-semibold h-10 py-0 px-2 w-48 focus-visible:ring-offset-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                  }
                }}
                onBlur={handleTitleSave}
              />
              <Button variant="ghost" size="icon" onClick={handleTitleSave} className="h-8 w-8">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h2
              className={`text-2xl font-bold tracking-tight capitalize ${canEdit ? 'cursor-pointer border-b border-dashed border-muted-foreground/50 hover:border-primary/70' : ''}`}
              onClick={() => {
                if (canEdit) {
                  setIsEditingTitle(true);
                }
              }}
            >
              {sectionTitle}
            </h2>
          )}
        </div>

        {/* Date badge aligned to the right */}
        {formattedDate && (
          <Badge
            variant="secondary"
            className={cn('font-medium text-sm py-1 px-2.5 border-0', getDayColor(dayNumber))}
          >
            {formattedDate}
          </Badge>
        )}
      </div>

      {/* Items with additional left padding for nesting */}
      <div className="space-y-4 pl-4">
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
          id={containerId}
        >
          {items.length === 0 ? (
            <div className="min-h-[80px] border border-dashed rounded-md flex items-center justify-center text-muted-foreground">
              No items scheduled for this day yet
            </div>
          ) : (
            items.map((item) => (
              <SortableItem 
                key={item.id} 
                id={item.id} 
                disabled={!canEdit} 
                containerId={containerId}
              >
                <ItineraryItemCard 
                  item={item} 
                  onDelete={() => onDelete(item.id)}
                  onEdit={() => onEditItem(item)}
                  onVote={(type: 'up' | 'down') => onVote(item.id, item.day_number, type)}
                  onStatusChange={(status: ItemStatus | null) => onStatusChange(item.id, status)}
                  editable={canEdit}
                />
              </SortableItem>
            ))
          )}
        </SortableContext>

        {canEdit && (
          <Button
            variant="outline"
            className="w-full border-dashed border-2 hover:border-solid hover:bg-muted/50 py-6 flex items-center justify-center text-muted-foreground"
            onClick={() => onAddItemToDay()}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Item to {sectionTitle}
          </Button>
        )}
      </div>
    </div>
  );
};
