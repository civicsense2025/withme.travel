'use client';

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users } from 'lucide-react';
import { formatDateRange } from '@/utils/lib-utils';
import type { TripRole } from '@/types/trip';

interface Trip {
  id: string;
  name: string;
  destination_name?: string;
  cover_image_url?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  memberCount?: number;
  role?: TripRole | null;
}

interface EnhancedTripCardProps {
  trip: Trip;
  disableNavigation?: boolean;
}

/**
 * Enhanced Trip Card component that displays a trip as an image card
 * with hover effects and basic trip info
 */
const EnhancedTripCard = memo(({ trip, disableNavigation }: EnhancedTripCardProps) => {
  const router = useRouter();

  const handleNavigate = useCallback((): void => {
    router.push(`/trips/${trip.id}`);
  }, [router, trip.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        router.push(`/trips/${trip.id}`);
      }
    },
    [router, trip.id]
  );

  // Generate accessible label for the trip
  const ariaLabel = `View trip: ${trip.name}${trip.destination_name ? ` to ${trip.destination_name}` : ''}`;

  // Default image if none provided
  const imageUrl = trip.cover_image_url || '/images/default-trip-image.jpg';

  return (
    <div
      role={disableNavigation ? 'presentation' : 'link'}
      tabIndex={disableNavigation ? -1 : 0}
      className="relative h-64 rounded-xl overflow-hidden shadow-sm
        hover:shadow-md transition-all duration-300
        cursor-pointer hover:opacity-95 hover:ring-2 hover:ring-primary/50
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        active:scale-[0.98]"
      {...(!disableNavigation && {
        onClick: handleNavigate,
        onKeyDown: handleKeyDown,
        'aria-label': ariaLabel,
      })}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: 'cover',
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/10">
        {/* Content Container */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
          {/* Top Content - Trip Name */}
          <div>
            <h3 className="font-semibold text-xl">{trip.name}</h3>
            {trip.destination_name && (
              <p className="text-sm text-white/80 mt-1">{trip.destination_name}</p>
            )}
          </div>

          {/* Bottom Content - Trip Details */}
          <div className="space-y-2">
            {trip.description && (
              <p className="text-sm line-clamp-2 text-white/80">{trip.description}</p>
            )}

            <div className="flex flex-col gap-1.5 text-sm">
              {trip.start_date && trip.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                </div>
              )}

              {typeof trip.memberCount === 'number' && (
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    {trip.memberCount} {trip.memberCount === 1 ? 'traveler' : 'travelers'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Important for React DevTools
EnhancedTripCard.displayName = 'EnhancedTripCard';

export default EnhancedTripCard;
