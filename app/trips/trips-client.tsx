'use client';
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyTrips } from '@/components/empty-trips';
import { TripCard } from '@/components/trip-card';
import { ClassErrorBoundary } from '@/components/error-boundary';
import Image from 'next/image';

import Link from 'next/link';
import type { TripRole } from '@/types/trip';

// Type for a trip member row from the database
interface TripMemberRow {
  role: string | null;
  joined_at: string | null;
  trip: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    status: string | null;
    destination_id: string | null;
    destination_name: string | null;
    cover_image_url: string | null;
    created_by: string | null;
    is_public: boolean;
    privacy_setting: string | null;
    description: string | null;
  } | null;
}

interface TripWithMemberInfo {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  status?: string;
  destination_id?: string;
  destination_name?: string;
  cover_image_url?: string;
  created_by: string;
  is_public: boolean;
  privacy_setting?: string;
  description?: string;
  role: TripRole | null;
  memberSince?: string;
}

export default function TripsClientPage({
  initialTrips,
  userId,
}: {
  initialTrips: any[];
  userId: string;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Process and sort trips
  const trips = useMemo(() => {
    // Filter out missing trips
    const valid = initialTrips.filter(
      (r): r is typeof r & { trip: NonNullable<(typeof r)['trip']> } =>
        r.trip !== null && typeof r.trip === 'object'
    );

    // Map to a more convenient format
    const mappedTrips = valid.map(({ role, joined_at, trip }) => ({
      id: trip.id,
      name: trip.name,
      start_date: trip.start_date ?? undefined,
      end_date: trip.end_date ?? undefined,
      created_at: trip.created_at,
      status: trip.status ?? undefined,
      destination_id: trip.destination_id ?? undefined,
      destination_name: trip.destination_name ?? undefined,
      cover_image_url: trip.cover_image_url ?? undefined,
      created_by: trip.created_by ?? userId,
      is_public: trip.is_public,
      privacy_setting: trip.privacy_setting ?? undefined,
      description: trip.description ?? undefined,
      role: role as TripRole | null,
      memberSince: joined_at ?? undefined,
    }));

    // Type the array
    const typedTrips = mappedTrips as TripWithMemberInfo[];

    // Sort: upcoming first, then past
    const today = new Date().setHours(0, 0, 0, 0);
    return typedTrips.sort((a, b) => {
      const aDate = a.start_date ? new Date(a.start_date).getTime() : Infinity;
      const bDate = b.start_date ? new Date(b.start_date).getTime() : Infinity;
      const aUpcoming = aDate >= today;
      const bUpcoming = bDate >= today;

      // Sort by upcoming/past first
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;

      // Both same side: nearest first if upcoming, most recent first if past
      return aUpcoming ? aDate - bDate : bDate - aDate;
    });
  }, [initialTrips, userId]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">My Trips</h1>
      <div className="text-center mb-8">
        <Link href="/trips/create">
          <Button size="lg" className="rounded-full">
            <Plus className="h-5 w-5 mr-2" /> Create New Trip
          </Button>
        </Link>
      </div>
      <ClassErrorBoundary
        fallback={
          <div className="my-8 text-center">
            <p className="text-destructive">Failed to load trips.</p>
            <Button className="mt-4" onClick={() => setRefreshKey((k) => k + 1)}>
              Refresh
            </Button>
          </div>
        }
      >
        <div key={refreshKey} className="grid grid-cols-1 gap-6">
          {trips.length === 0 ? (
            <EmptyTrips />
          ) : (
            trips.map((trip, index) => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
              />
            ))
          )}
        </div>
      </ClassErrorBoundary>
    </div>
  );
}
