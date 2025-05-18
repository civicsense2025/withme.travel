import { cn } from '@/lib/utils';
import { ItineraryItemStatus, ItineraryItemAction } from '../atoms';
import { DisplayItineraryItem } from '@/types/itinerary';

/**
 * ItineraryItemCard
 * 
 * Card component for displaying an itinerary item with actions
 * 
 * @module itinerary/molecules
 */

export interface ItineraryItemCardProps {
  /** The itinerary item to display */
  item: DisplayItineraryItem;
  /** Callback when edit button is clicked */
  onEdit: () => void;
  /** Callback when delete button is clicked */
  onDelete: () => void;
  /** Optional className for styling customization */
  className?: string;
}

export function ItineraryItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  className = '' 
}: ItineraryItemCardProps) {
  return (
    <div className={cn("mb-2 p-4 border rounded-md hover:shadow-sm transition-shadow", className)}>
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{item.title}</div>
          <ItineraryItemStatus status={item.category} />
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>
        <ItineraryItemAction onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
} 