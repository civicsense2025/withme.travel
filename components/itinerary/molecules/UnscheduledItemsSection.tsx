import { ItineraryDaySection } from './ItineraryDaySection';
import { DisplayItineraryItem } from '@/types/itinerary';

/**
 * UnscheduledItemsSection
 * 
 * Specialized section for displaying unscheduled itinerary items
 * 
 * @module itinerary/molecules
 */

export interface UnscheduledItemsSectionProps {
  /** The unscheduled items to display */
  items: DisplayItineraryItem[];
  /** Callback when an item is edited */
  onEdit: (item: DisplayItineraryItem) => void;
  /** Callback when an item is deleted */
  onDelete: (id: string) => void;
  /** Optional className for styling customization */
  className?: string;
}

export function UnscheduledItemsSection({ 
  items, 
  onEdit, 
  onDelete,
  className = ''
}: UnscheduledItemsSectionProps) {
  return (
    <ItineraryDaySection 
      title="Unscheduled Items" 
      items={items} 
      onEdit={onEdit} 
      onDelete={onDelete} 
      className={className}
    />
  );
} 