/**
 * Trip Card
 * 
 * A card component displaying a trip with image and details
 * 
 * @module trips/molecules
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PAGE_ROUTES } from '@/utils/constants/routes';
import { formatDateRange } from '@/utils/lib-utils';
import { cn } from '@/lib/utils';

// Import our atoms
import { TripImage, TripInfo, TripCardFooter } from '../atoms';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface TripCardProps {
  /** Trip data to display */
  trip: {
    id: string;
    name?: string;
    location?: string;
    destination_name?: string;
    start_date?: string;
    end_date?: string;
    is_public?: boolean;
    cover_image?: string;
    cover_image_url?: string;
    members?: number;
  };
  /** Additional CSS class names */
  className?: string;
  /** Click handler - if provided, will use this instead of default navigation */
  onClick?: (trip: TripCardProps['trip']) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TripCard({ trip, className, onClick }: TripCardProps) {
  // Compute display values
  const displayTitle = trip.name || 'Untitled Trip';
  const location = trip.location || trip.destination_name || '';
  const membersCount = typeof trip.members === 'number' ? trip.members : 0;
  const imageUrl = trip.cover_image || trip.cover_image_url || '/images/default-trip-image.jpg';

  // Format date for better display
  const dateRange =
    trip.start_date && trip.end_date ? formatDateRange(trip.start_date, trip.end_date) : '';

  // Handle click
  const handleClick = onClick ? () => onClick(trip) : undefined;

  // Card content component for reuse
  const CardContent = () => (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        duration: 0.3,
      }}
    >
      <div className="rounded-2xl overflow-hidden border border-border bg-card/95 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl dark:shadow-none dark:bg-card/95 h-full">
        <div className="flex flex-col h-full">
          {/* Trip image component */}
          <TripImage
            imageUrl={imageUrl}
            tripName={displayTitle}
            isPublic={trip.is_public}
          />

          {/* Content container */}
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold mb-2 tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {displayTitle}
            </h3>

            {/* Trip information */}
            <div className="mb-auto">
              <TripInfo
                location={location}
                memberCount={membersCount}
                dateRange={dateRange}
              />
            </div>

            {/* Footer with call to action */}
            <TripCardFooter />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Wrapper - either Link or div depending on whether onClick is provided
  if (handleClick) {
    return (
      <div 
        className={cn('block group cursor-pointer', className)}
        onClick={handleClick}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
        tabIndex={0}
        role="button"
        aria-label={`View ${displayTitle} trip details`}
      >
        <CardContent />
      </div>
    );
  }

  return (
    <Link
      href={PAGE_ROUTES.TRIP_DETAILS(trip.id)}
      className={cn('block group', className)}
      aria-label={`View ${displayTitle} trip details`}
    >
      <CardContent />
    </Link>
  );
} 