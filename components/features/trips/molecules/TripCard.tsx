'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateRange } from '@/utils/lib-utils';
import { Calendar, Users } from 'lucide-react';

interface Trip {
  id: string;
  name: string;
  destination_name?: string;
  cover_image_url?: string;
  start_date?: string;
  end_date?: string;
  members?: number;
  is_public?: boolean;
}

export function TripCard({ trip }: { trip: Trip }) {
  const hasDateInfo = trip.start_date || trip.end_date;
  const dateRange = hasDateInfo && trip.start_date && trip.end_date 
    ? formatDateRange(trip.start_date, trip.end_date) 
    : '';
  
  return (
    <Link href={`/trips/${trip.id}`} className="block no-underline">
      <Card className="h-full hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {trip.cover_image_url && (
              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={trip.cover_image_url}
                  alt={trip.name}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate text-base leading-tight">{trip.name}</div>
              {trip.destination_name && (
                <div className="text-xs text-muted-foreground truncate">{trip.destination_name}</div>
              )}
            </div>
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {trip.members && (
                <>
                  <Users className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{trip.members} traveler{trip.members !== 1 ? 's' : ''}</span>
                </>
              )}
              {hasDateInfo && (
                <>
                  {trip.members && <span className="mx-1 flex-shrink-0">•</span>}
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{dateRange}</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
