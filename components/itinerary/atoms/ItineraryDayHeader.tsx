import { cn } from '@/lib/utils';

/**
 * ItineraryDayHeader
 * 
 * Displays a day header for itinerary sections
 * 
 * @module itinerary/atoms
 */

export interface ItineraryDayHeaderProps {
  /** The title text to display */
  title: string;
  /** Optional className for styling customization */
  className?: string;
}

export function ItineraryDayHeader({ title, className = '' }: ItineraryDayHeaderProps) {
  return (
    <h2 className={cn("text-lg font-semibold mb-2", className)}>
      {title}
    </h2>
  );
} 