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
  const location = trip.location || '';
  const membersCount = Array.isArray(trip.members) ? trip.members.length : 0;
  const imageUrl = trip.cover_image || '/images/default-trip-image.jpg';

  return (
    <Link href={PAGE_ROUTES.TRIP_DETAILS(trip.id)} className="block group">
      <motion.div
        whileHover={{ y: -3 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:h-48">
          {/* Image container - takes up left side on desktop, top on mobile */}
          <div className="relative h-40 md:h-auto md:w-1/3 overflow-hidden">
            <Image
              src={imageUrl}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r"></div>
          </div>

          {/* Content container */}
          <div className="p-5 flex flex-col flex-grow relative md:w-2/3">
            <h3 className="text-xl font-semibold mb-2 line-clamp-1">{displayTitle}</h3>

            {trip.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{trip.description}</p>
            )}

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-auto">
              {location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>
                  {membersCount} traveler{membersCount !== 1 ? 's' : ''}
                </span>
              </div>

              {trip.start_date && trip.end_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </span>
                </div>
              )}
            </div>

            <div className="absolute bottom-5 right-5">
              <span className="text-sm text-primary font-medium group-hover:underline flex items-center gap-1">
                view trip
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}