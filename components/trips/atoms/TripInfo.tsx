/**
 * Trip Info
 * 
 * Displays metadata about a trip like location, dates, and member count
 * 
 * @module trips/atoms
 */

import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface TripInfoProps {
  /** Location of the trip */
  location?: string;
  /** Formatted date range */
  dateRange?: string;
  /** Number of members/travelers */
  memberCount?: number;
  /** Whether to show the hover effect on icons */
  showHoverEffect?: boolean;
  /** Additional CSS class name */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TripInfo({
  location,
  dateRange,
  memberCount,
  showHoverEffect = true,
  className,
}: TripInfoProps) {
  const textClasses = showHoverEffect
    ? 'text-muted-foreground group-hover:text-foreground/90 transition-colors duration-200'
    : 'text-muted-foreground';

  return (
    <div className={cn('space-y-3', className)}>
      {location && (
        <div className={cn('flex items-center gap-2 text-sm', textClasses)}>
          <MapPin className="h-4 w-4 flex-shrink-0 text-travel-purple/70" />
          <span className="truncate">{location}</span>
        </div>
      )}

      {memberCount !== undefined && (
        <div className={cn('flex items-center gap-2 text-sm', textClasses)}>
          <Users className="h-4 w-4 flex-shrink-0 text-travel-purple/70" />
          <span>
            {memberCount} traveler{memberCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {dateRange && (
        <div className={cn('flex items-center gap-2 text-sm', textClasses)}>
          <Calendar className="h-4 w-4 flex-shrink-0 text-travel-purple/70" />
          <span className="truncate">{dateRange}</span>
        </div>
      )}
    </div>
  );
} 