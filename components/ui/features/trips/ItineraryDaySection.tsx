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
import { SimplifiedItemForm } from '@/components/trips/SimplifiedItemForm';
import { AnimatePresence, motion } from 'framer-motion';

import React, { useState, memo, useMemo } from 'react';

// Color palette for day indicators that works well in both light and dark modes
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
  tripId: string;
  onItemAdded?: () => void;
}

// Using memo with a custom equality function to prevent unnecessary re-renders
export const ItineraryDaySection = memo(
  ({
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
    tripId,
    onItemAdded,
  }: ItineraryDaySectionProps) => {
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

    // Use memoization for the date formatting to avoid recomputing on every render
    const formattedDate = useMemo(() => {
      if (!startDate) return null;

      try {
        const tripStartDate = parseISO(startDate);
        const currentDayDate = addDays(tripStartDate, dayNumber - 1);
        return format(currentDayDate, 'EEE, MMM d');
      } catch (error) {
        console.error('Error parsing or formatting date:', error);
        return null;
      }
    }, [startDate, dayNumber]);

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
          'space-y-4 pt-6 pb-8 px-2 relative mb-10 transition-all duration-300',
          isOver && 'bg-muted/50 ring-2 ring-primary rounded-md p-2'
        )}
      >
        {/* Enhanced connector line with animated style */}
        {dayNumber < durationDays && (
          <div className="absolute left-6 top-full w-px h-10 z-0">
            <div className="w-full h-full border-l-2 border-dashed border-muted-foreground/30 animate-pulse-subtle"></div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full shadow-sm',
                getDayColor(dayNumber)
              )}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-bold text-sm" aria-label={`Day ${dayNumber}`}>
                {dayNumber}
              </span>
            </motion.div>

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
              <motion.h2
                className={`text-2xl font-bold tracking-tight capitalize ${canEdit ? 'cursor-pointer standard-border-b border-dashed hover:border-primary/70 transition-colors' : ''}`}
                onClick={() => {
                  if (canEdit) {
                    setIsEditingTitle(true);
                  }
                }}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {sectionTitle}
              </motion.h2>
            )}
          </div>

          {formattedDate && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Badge
                variant="outline"
                className={cn('font-medium text-sm py-1.5 px-3', getDayColor(dayNumber))}
              >
                {formattedDate}
              </Badge>
            </motion.div>
          )}
        </div>

        <div className="space-y-5 pl-10">
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
            id={containerId}
          >
            {items.length === 0 ? (
              <motion.div
                className="min-h-[100px] standard-border-dashed rounded-md flex items-center justify-center text-muted-foreground bg-muted/5 hover:bg-muted/10 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                No items scheduled for this day yet
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
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
                        onStatusChange={(status: ItemStatus | null) =>
                          onStatusChange(item.id, status)
                        }
                        editable={canEdit}
                      />
                    </SortableItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </SortableContext>

          {canEdit && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <SimplifiedItemForm tripId={tripId} dayNumber={dayNumber} onItemAdded={onItemAdded} />
            </motion.div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to only re-render when needed
    // Return true if props are equal (no re-render needed)
    // Return false if props are different (re-render needed)
    return (
      prevProps.dayNumber === nextProps.dayNumber &&
      prevProps.startDate === nextProps.startDate &&
      prevProps.canEdit === nextProps.canEdit &&
      prevProps.durationDays === nextProps.durationDays &&
      prevProps.containerId === nextProps.containerId &&
      prevProps.items.length === nextProps.items.length &&
      // Deep comparison of items array isn't needed for every property
      // We can check if the item IDs and their positions are the same
      prevProps.items.every(
        (item, index) =>
          nextProps.items[index] &&
          item.id === nextProps.items[index].id &&
          item.position === nextProps.items[index].position &&
          item.status === nextProps.items[index].status
      )
    );
  }
);

// Add display name for debugging purposes
ItineraryDaySection.displayName = 'ItineraryDaySection';
