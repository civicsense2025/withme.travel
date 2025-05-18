'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDateRange } from '@/utils/lib-utils';
import type { Trip } from '@/lib/client/trips';
import { TripCardHeader } from '@/app/trips/components/molecules/TripCardHeader';

// Define TripMember type locally
export type TripWithCities = Trip & { cities?: any[] };
export type TripMember = { trip: TripWithCities };

export default function TripsClientPage({
  initialTrips = [],
  userId = '',
  isGuest = false,
}: {
  initialTrips: TripMember[];
  userId?: string;
  isGuest?: boolean;
}) {
  const [trips] = useState<TripMember[]>(initialTrips);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all');

  // Filtered trips based on search query and filter type
  const filteredTrips = useMemo(() => {
    // Apply search filter
    let filtered = trips;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tripMember) =>
          tripMember.trip.name.toLowerCase().includes(query) ||
          tripMember.trip.destination_name?.toLowerCase().includes(query) ||
          // Also search through city names
          tripMember.trip.cities?.some((city: any) => city.name?.toLowerCase().includes(query))
      );
    }

    // Apply date filter
    if (filterType !== 'all') {
      const now = new Date();

      // For upcoming trips, show trips where end_date is today or in the future
      if (filterType === 'upcoming') {
        filtered = filtered.filter((tripMember) => {
          // If no end_date, consider it upcoming
          if (!tripMember.trip.end_date) return true;

          const endDate = new Date(tripMember.trip.end_date);
          return endDate >= now;
        });
      }

      // For past trips, show trips where end_date is in the past
      if (filterType === 'past') {
        filtered = filtered.filter((tripMember) => {
          // No end_date means it's not past
          if (!tripMember.trip.end_date) return false;

          const endDate = new Date(tripMember.trip.end_date);
          return endDate < now;
        });
      }
    }

    return filtered;
  }, [trips, searchQuery, filterType]);

  // Group trips by month/year
  const groupedTrips = useMemo(() => {
    // If filterType is 'past', sort by end_date descending (most recent first)
    // If filterType is 'upcoming', sort by start_date ascending (soonest first)
    // Default (all): sort by created_at descending
    const sortedTrips = [...filteredTrips].sort((a, b) => {
      if (filterType === 'past') {
        const aDate = a.trip.end_date ? new Date(a.trip.end_date) : new Date(0);
        const bDate = b.trip.end_date ? new Date(b.trip.end_date) : new Date(0);
        return bDate.getTime() - aDate.getTime(); // descending
      } else if (filterType === 'upcoming') {
        const aDate = a.trip.start_date ? new Date(a.trip.start_date) : new Date(9999, 11, 31);
        const bDate = b.trip.start_date ? new Date(b.trip.start_date) : new Date(9999, 11, 31);
        return aDate.getTime() - bDate.getTime(); // ascending
      } else {
        // Default sort by created_at descending
        return new Date(b.trip.created_at).getTime() - new Date(a.trip.created_at).getTime();
      }
    });

    // Group trips by month/year
    const grouped: Record<string, TripMember[]> = {};
    sortedTrips.forEach((tripMember) => {
      // Use the appropriate date for grouping based on filter
      let date: Date;
      if (filterType === 'past' && tripMember.trip.end_date) {
        date = new Date(tripMember.trip.end_date);
      } else if (filterType === 'upcoming' && tripMember.trip.start_date) {
        date = new Date(tripMember.trip.start_date);
      } else {
        date = new Date(tripMember.trip.created_at);
      }

      const key = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(tripMember);
    });

    return grouped;
  }, [filteredTrips, filterType]);

  // Travel stats in a single line
  const travelStats = useMemo(() => {
    const visitedTrips = trips.filter(
      (t) => t.trip.end_date && new Date(t.trip.end_date) < new Date()
    ).length;
    const upcomingTrips = trips.filter(
      (t) =>
        (t.trip.end_date && new Date(t.trip.end_date) >= new Date()) ||
        // If no end date but has start date in future, count as upcoming
        (!t.trip.end_date && t.trip.start_date && new Date(t.trip.start_date) >= new Date())
    ).length;

    // Use cities for counting unique destinations, fallback to destination_name for legacy data
    const uniqueDestinations = new Set([
      ...trips.flatMap((t) => t.trip.cities?.map((city: any) => city.name).filter(Boolean) || []),
      ...trips.map((t) => t.trip.destination_name).filter(Boolean),
    ]).size;

    return { visited: visitedTrips, upcoming: upcomingTrips, destinations: uniqueDestinations };
  }, [trips]);

  // Empty state when no trips exist
  if (trips.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center p-8 bg-card rounded-xl border shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">No Trips Yet</h2>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Start planning your next adventure. Create a trip to manage itineraries, invite friends,
          and more.
        </p>
        <Link href="/trips/create">
          <Button size="sm" className="rounded-full px-4">
            Plan Your First Trip
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Travel stats as a single line */}
      {trips.length > 0 && (
        <div className="text-sm text-muted-foreground px-2 py-2 text-center">
          {travelStats.visited > 0 && <span>{travelStats.visited} visited</span>}
          {travelStats.visited > 0 && travelStats.upcoming > 0 && <span> • </span>}
          {travelStats.upcoming > 0 && <span>{travelStats.upcoming} upcoming</span>}
          {(travelStats.visited > 0 || travelStats.upcoming > 0) &&
            travelStats.destinations > 0 && <span> • </span>}
          {travelStats.destinations > 0 && (
            <span>{travelStats.destinations} unique destinations</span>
          )}
        </div>
      )}

      {/* Filter and search controls */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs Interface */}
      <Tabs
        defaultValue="all"
        value={filterType}
        onValueChange={(value) => setFilterType(value as 'all' | 'upcoming' | 'past')}
        className="w-full"
      >
        <div className="flex justify-center mb-4">
          <TabsList className="grid grid-cols-3 rounded-full p-1 w-auto min-w-[300px]">
            <TabsTrigger value="all" className="rounded-full">
              All
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-full">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-full">
              Past
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <TripsList groupedTrips={groupedTrips} />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-0">
          <TripsList groupedTrips={groupedTrips} />
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <TripsList groupedTrips={groupedTrips} />
        </TabsContent>
      </Tabs>

      {/* Show empty state if no trips match the filters */}
      {Object.keys(groupedTrips).length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-card/50">
          <h3 className="text-xl font-medium mb-2">No matching trips found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to see more results.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

// Minimal Trip Card Component
function MinimalTripCard({ tripMember }: { tripMember: TripMember }) {
  const trip = tripMember.trip;
  const hasDateInfo = trip.start_date || trip.end_date;
  const dateRange = hasDateInfo ? formatDateRange(trip.start_date || '', trip.end_date || '') : '';

  // Get primary city name or fall back to destination_name
  const locationName = trip.cities?.length ? trip.cities[0].name : trip.destination_name;

  return (
    <Link href={`/trips/${trip.id}`} className="no-underline block">
      <Card className="h-full hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardContent className="p-4">
          {/* Privacy badge */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {trip.is_public ? 'Public' : 'Private'}
            </span>
          </div>
          <TripCardHeader
            name={trip.name}
            destination={locationName}
            coverImageUrl={trip.cover_image_url}
            status={trip.status ? String(trip.status) : undefined}
            // Add more props as needed
          />
          {/* Travelers and date info */}
          <div className="space-y-1 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>0 travelers</span>
              {hasDateInfo && (
                <>
                  <span className="mx-1">•</span>
                  <Calendar className="h-3.5 w-3.5" />
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

// Trip List Component
function TripsList({ groupedTrips }: { groupedTrips: Record<string, TripMember[]> }) {
  return (
    <div className="space-y-8">
      {Object.entries(groupedTrips).map(([dateGroup, tripsInGroup]) => (
        <div key={dateGroup}>
          <div className="flex items-center mb-4">
            <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{dateGroup}</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {tripsInGroup.map((tripMember) => (
              <MinimalTripCard key={tripMember.trip.id} tripMember={tripMember} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
