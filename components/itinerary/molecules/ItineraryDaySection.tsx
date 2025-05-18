import { ItineraryDayHeader } from '../atoms';
import { ItineraryItemCard } from './ItineraryItemCard';
import { DisplayItineraryItem } from '@/types/itinerary';
import { cn } from '@/lib/utils';

/**
 * ItineraryDaySection
 * 
 * Section component that displays a day's worth of itinerary items
 * 
 * @module itinerary/molecules
 */

export interface ItineraryDaySectionProps {
  /** The title for the section */
  title: string;
  /** The items to display in this section */
  items: DisplayItineraryItem[];
  /** Callback when an item is edited */
  onEdit: (item: DisplayItineraryItem) => void;
  /** Callback when an item is deleted */
  onDelete: (id: string) => void;
  /** Optional className for styling customization */
  className?: string;
}

export function ItineraryDaySection({ 
  title, 
  items, 
  onEdit, 
  onDelete,
  className = '' 
}: ItineraryDaySectionProps) {
  return (
    <div className={cn("mb-8", className)}>
      <ItineraryDayHeader title={title} />
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No items scheduled</p>
      ) : (
        items.map(item => (
          <ItineraryItemCard 
            key={item.id} 
            item={item} 
            onEdit={() => onEdit(item)} 
            onDelete={() => onDelete(item.id)} 
          />
        ))
      )}
    </div>
  );
} 