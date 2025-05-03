import React from 'react';
import { DisplayItineraryItem } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ItineraryItemCard } from './ItineraryItemCard';
import dayjs from 'dayjs';

interface DayDropZoneProps {
  dayNumber: number;
  items: DisplayItineraryItem[];
  onDropItem: (itemId: string, targetItemId: string | null, targetDayNumber: number) => void;
  onAddClick: (dayNumber: number) => void;
  addPlaceholder?: string;
  isLocked?: boolean;
  onSelectItem?: (item: DisplayItineraryItem) => void;
  onVoteItem?: (itemId: string, voteType: 'up' | 'down') => void;
  className?: string;
  children?: React.ReactNode;
}

export const DayDropZone: React.FC<DayDropZoneProps> = ({
  dayNumber,
  items,
  onDropItem,
  onAddClick,
  addPlaceholder = 'Add an item',
  isLocked = false,
  onSelectItem,
  onVoteItem,
  className,
  children,
}) => {
  const formattedDate = dayjs()
    .add(dayNumber - 1, 'day')
    .format('ddd, MMM D');

  const handleAddClick = () => onAddClick(dayNumber);

  return (
    <div className={`bg-background border rounded-lg p-4 space-y-4 ${className || ''}`}>
      <div className="flex h-full min-h-[150px] w-full flex-col rounded-md border border-dashed border-gray-300 p-4 dark:border-gray-700">
        <h3 className="mb-2 text-lg font-semibold">Day {dayNumber}</h3>
        <div className="flex-grow space-y-2">
          {children}
          {items.map((item) => (
            <ItineraryItemCard key={item.id} item={item} dayNumber={dayNumber} />
          ))}
          {items.length === 0 && !isLocked && (
            <div className="text-center text-gray-500">Drop items here or click add</div>
          )}
        </div>
        {!isLocked && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-center"
            onClick={handleAddClick}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {addPlaceholder}
          </Button>
        )}
      </div>
    </div>
  );
};