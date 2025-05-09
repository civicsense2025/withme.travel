'use client';

import { PAGE_ROUTES } from '@/utils/constants/routes';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Users } from 'lucide-react';
import { formatDateRange } from '@/utils/lib-utils';
import { TripWithMemberInfo } from '@/utils/types';
import Image from 'next/image';

interface TripCardProps {
  trip: TripWithMemberInfo;
}

export function TripCard({ trip }: TripCardProps) {
  // Compute display values
  const displayTitle = trip.name || 'Untitled Trip';
  const location = trip.location || trip.destination_name || '';
  const membersCount = typeof trip.members === 'number' ? trip.members : 0;
  const imageUrl = trip.cover_image || trip.cover_image_url || '/images/default-trip-image.jpg';

  return (
    <Link href={PAGE_ROUTES.TRIP_DETAILS(trip.id)} className="block group">
      <motion.div
        whileHover={{ y: -3 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="rounded-xl overflow-hidden border border-border bg-card transition-all duration-300 group-hover:shadow-md">
          <div className="flex flex-col md:flex-row md:h-56">
            {/* Image container - takes up left side on desktop, top on mobile */}
            <div className="relative h-48 md:h-auto md:w-2/5 overflow-hidden">
              <Image
                src={imageUrl}
                alt={displayTitle}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
            </div>

            {/* Content container */}
            <div className="p-6 flex flex-col flex-grow relative md:w-3/5">
              <h3 className="text-xl font-semibold mb-2 tracking-tight line-clamp-1">{displayTitle}</h3>

              {trip.description && (
                <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">{trip.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 mt-auto">
                {location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-primary/70" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 flex-shrink-0 text-primary/70" />
                  <span>
                    {membersCount} traveler{membersCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {trip.start_date && trip.end_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-primary/70" />
                    <span className="truncate">
                      {formatDateRange(trip.start_date, trip.end_date)}
                    </span>
                  </div>
                )}
              </div>

              <div className="absolute bottom-6 right-6">
                <span className="text-sm text-primary font-medium flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  View trip
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
