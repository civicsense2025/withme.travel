/**
 * Destination Related Itineraries
 * 
 * Displays a grid of related itineraries for a destination
 * 
 * @module destinations/molecules
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface RelatedTrip {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  destinationId: string | null;
  destinationName: string | null;
  coverImageUrl: string | null;
  description: string | null;
  publicSlug: string;
  membersCount: number;
  createdAt: string;
}

export interface DestinationRelatedItinerariesProps {
  /** Destination ID to find related trips */
  destinationId: string;
  /** Maximum number of trips to display */
  limit?: number;
  /** Title to display above the trips */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Helper function to format a date range consistently
function formatDateRange(startDate?: string | Date | null, endDate?: string | Date | null): string {
  if (!startDate && !endDate) return 'Dates not set';

  const startStr = startDate ? formatDate(startDate) : null;
  const endStr = endDate ? formatDate(endDate) : null;

  if (startStr && !endStr) return `From ${startStr}`;
  if (!startStr && endStr) return `Until ${endStr}`;
  if (startStr && endStr) return `${startStr} - ${endStr}`;

  return 'Invalid date range';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationRelatedItineraries({
  destinationId,
  limit = 4,
  title = "Related Itineraries",
  className,
}: DestinationRelatedItinerariesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<RelatedTrip[]>([]);

  useEffect(() => {
    const fetchRelatedTrips = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/destinations/${destinationId}/related-trips?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch related trips');
        }

        const data = await response.json();
        setTrips(data.trips || []);
      } catch (err) {
        console.error('Error fetching related trips:', err);
        setError('Could not load related trips');
      } finally {
        setIsLoading(false);
      }
    };

    if (destinationId) {
      fetchRelatedTrips();
    }
  }, [destinationId, limit]);

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-xl font-bold lowercase mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row rounded-xl overflow-hidden border border-border/30 bg-card h-full shadow-sm"
            >
              <div className="relative h-36 md:h-auto md:w-1/3 bg-muted animate-pulse"></div>
              <div className="p-4 md:w-2/3 space-y-2">
                <div className="h-5 bg-muted animate-pulse rounded-md w-2/3"></div>
                <div className="h-4 bg-muted animate-pulse rounded-md w-full"></div>
                <div className="h-4 bg-muted animate-pulse rounded-md w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If error or no trips found, return null to hide the widget completely
  if (error || trips.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold lowercase">{title}</h2>
        {trips.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trips" className="flex items-center gap-1 text-sm">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trips.map((trip) => (
          <Link
            key={trip.id}
            href={`/trips/public/${trip.publicSlug}`}
            className="group block"
           >
            <Card className="overflow-hidden border border-border/30 dark:border-border/10 bg-card shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col md:flex-row">
              {/* Image section */}
              <div className="relative h-36 md:h-auto md:w-1/3 overflow-hidden bg-muted">
                {trip.coverImageUrl ? (
                  <Image
                    src={trip.coverImageUrl}
                    alt={trip.name || 'Trip cover image'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <MapPin className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* Content section */}
              <div className="p-4 flex flex-col flex-grow md:w-2/3">
                <h3 className="text-base font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {trip.name || 'Untitled Trip'}
                </h3>

                {trip.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {trip.description}
                  </p>
                )}

                <div className="mt-auto grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {trip.destinationName && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{trip.destinationName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 flex-shrink-0" />
                    <span>
                      {trip.membersCount} traveler{trip.membersCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {trip.startDate && trip.endDate && (
                    <div className="flex items-center gap-1 col-span-2">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 