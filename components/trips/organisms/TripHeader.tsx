'use client';

import { cn } from '@/lib/utils';
import { TripCoverImage } from '../atoms/TripCoverImage';
import { TripDestinationBadge } from '../atoms/TripDestinationBadge';
import { TripDates } from '../atoms/TripDates';

/**
 * Props for the TripHeader component
 */
export interface TripHeaderProps {
  /** Trip name */
  name: string;
  /** Destination */
  destination: string;
  /** Start date (ISO) */
  startDate: string;
  /** End date (ISO) */
  endDate: string;
  /** Cover image URL */
  coverImageUrl?: string | null;
  /** Optional actions (e.g., edit, share) */
  actions?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Organism: Header for trip detail pages
 */
export function TripHeader({
  name,
  destination,
  startDate,
  endDate,
  coverImageUrl,
  actions,
  className,
}: TripHeaderProps) {
  return (
    <div className={cn('w-full rounded-xl overflow-hidden bg-white dark:bg-gray-950 shadow-sm', className)}>
      <TripCoverImage src={coverImageUrl || null} alt={`Cover image for ${name}`} aspectRatio="16:9" />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{name}</h1>
          {actions}
        </div>
        <div className="flex items-center gap-2">
          <TripDestinationBadge destination={destination} />
          <TripDates startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </div>
  );
} 