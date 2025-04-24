import React, { useRef } from 'react';
import { ItineraryItem, ItemsByDay } from "@/types/itinerary"; // Assuming types are moved
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';

// Removed useDrop, DropTargetMonitor, ItemTypes, DragItem imports

interface DayDropZoneProps {
  dayNumber: number;
  items: ItineraryItem[];
  onDropItem: (itemId: string, targetItemId: string | null, targetDayNumber: number) => void;
  addPlaceholder?: string;
  isLocked?: boolean;
  onSelectItem?: (item: ItineraryItem) => void;
  onVoteItem?: (item: ItineraryItem) => void;
  // Handler for the Add button
  onAddClick: (dayNumber: number) => void;
  children: React.ReactNode; // Keep children prop
}

export const DayDropZone: React.FC<DayDropZoneProps> = ({
  dayNumber,
  items,
  onDropItem,
  addPlaceholder = 'Add Item',
  isLocked = false,
  onSelectItem,
  onVoteItem,
  onAddClick,
  children, // Keep children prop
}) => {
  // Removed ref and useDrop hook

  const handleAddClick = () => {
    if (!isLocked) {
      onAddClick(dayNumber);
    }
  };

  return (
    // Removed ref from div
    <div className="flex h-full min-h-[150px] w-full flex-col rounded-md border border-dashed border-gray-300 p-4 dark:border-gray-700">
      <h3 className="mb-2 text-lg font-semibold">Day {dayNumber}</h3>
      <div className="flex-grow space-y-2">
        {/* Render children directly */}
        {children}
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
  );
}; 