'use client';

import { PAGE_ROUTES } from '@/utils/constants/routes';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Users } from 'lucide-react';
import { formatDateRange } from '@/utils/lib-utils';
import { TripWithMemberInfo } from '@/utils/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TripCardProps {
  trip: TripWithMemberInfo;
  className?: string;
}

export function TripCard({ trip, className }: TripCardProps) {
  // Compute display values
  const displayTitle = trip.name || 'Untitled Trip';
  const location = trip.location || trip.destination_name || '';
  const membersCount = typeof trip.members === 'number' ? trip.members : 0;
  const imageUrl = trip.cover_image || trip.cover_image_url || '/images/default-trip-image.jpg';

  // Format date for better display
  const dateRange =
    trip.start_date && trip.end_date ? formatDateRange(trip.start_date, trip.end_date) : '';

  return (
    <Link
      href={PAGE_ROUTES.TRIP_DETAILS(trip.id)}
      className={cn('block group', className)}
      aria-label={`View ${displayTitle} trip details`}
    >
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
            {/* Image container with overlay gradient */}
            <div className="relative h-52 overflow-hidden">
              <Image
                src={imageUrl}
                alt={displayTitle}
                fill
                className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

              {/* Status badge - optional */}
              {trip.is_public !== undefined && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge
                    variant={trip.is_public ? 'travel-blue' : 'secondary'}
                    className={cn(
                      'text-xs backdrop-blur-md',
                      trip.is_public ? 'bg-travel-blue/30' : 'bg-black/30 text-white'
                    )}
                    radius="full"
                  >
                    {trip.is_public ? 'Public' : 'Private'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Content container */}
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold mb-2 tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {displayTitle}
              </h3>

              <div className="space-y-3 mb-auto">
                {location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors duration-200">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-travel-purple/70" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors duration-200">
                  <Users className="h-4 w-4 flex-shrink-0 text-travel-purple/70" />
                  <span>
                    {membersCount} traveler{membersCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {dateRange && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors duration-200">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-travel-purple/70" />
                    <span className="truncate">{dateRange}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <span className="text-sm text-primary font-medium flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-all duration-300">
                  View trip details
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
