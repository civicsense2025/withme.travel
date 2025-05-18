import { formatCategoryName } from '@/utils/formatters';

/**
 * ItineraryItemStatus
 * 
 * Displays the category/status of an itinerary item
 * 
 * @module itinerary/atoms
 */

export interface ItineraryItemStatusProps {
  /** The status or category to display (can be null) */
  status: string | null;
  /** Optional className for styling customization */
  className?: string;
}

export function ItineraryItemStatus({ status, className = '' }: ItineraryItemStatusProps) {
  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      {formatCategoryName(status)}
    </span>
  );
} 