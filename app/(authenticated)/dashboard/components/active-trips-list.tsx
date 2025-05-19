'use client';

import Link from 'next/link';
import { Calendar, MapPin, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActiveTrip {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  destination_name?: string;
  cover_image_url?: string;
  slug?: string;
  role?: string;
  recentUpdates?: any[];
  updateCount?: number;
}

interface ActiveTripsListProps {
  trips: ActiveTrip[];
}

export function ActiveTripsList({ trips }: ActiveTripsListProps) {
  if (!trips || trips.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No active trips found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <Link href={`/trips/${trip.id}`} key={trip.id} legacyBehavior>
          <div className="flex items-start p-4 rounded-lg hover:bg-muted/50 transition-colors border">
            <div className="w-16 h-16 rounded-md overflow-hidden relative flex-shrink-0 bg-muted">
              {trip.cover_image_url ? (
                <img
                  src={trip.cover_image_url}
                  alt={trip.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>

            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-base">{trip.name}</h3>
                {trip.role && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                    {trip.role}
                  </span>
                )}
              </div>

              <div className="mt-1 space-y-1">
                {trip.destination_name && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{trip.destination_name}</span>
                  </div>
                )}

                {trip.start_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {new Date(trip.start_date).toLocaleDateString()}
                      {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                    </span>
                  </div>
                )}

                {trip.updateCount && trip.updateCount > 0 && (
                  <div className="flex items-center text-sm text-primary mt-2">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {trip.updateCount} recent {trip.updateCount === 1 ? 'update' : 'updates'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
