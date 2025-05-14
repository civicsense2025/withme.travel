'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';

// Define our types
interface Trip {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  status: string | null;
  destination_id: string | null;
  destination_name: string | null;
  cover_image_url: string | null;
  created_by: string;
  is_public: boolean | null;
  privacy_setting: string | null;
  description: string | null;
}

interface TripMember {
  role: string;
  joined_at: string | null;
  trip: Trip;
}

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
          tripMember.trip.destination_name?.toLowerCase().includes(query)
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

  // Empty state when no trips exist
  if (trips.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center p-8 bg-card rounded-xl border shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">No Trips Yet</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          Start planning your next adventure. Create a trip to manage itineraries, invite friends,
          and more.
        </p>
        <Link href="/trips/create">
          <Button size="lg" className="rounded-full px-8">
            Plan Your First Trip
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Filter and search controls */}
      <div className="flex flex-wrap gap-4 items-center mb-8 mt-8 justify-center">
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs
          defaultValue="all"
          value={filterType}
          onValueChange={(value) => setFilterType(value as 'all' | 'upcoming' | 'past')}
          className="w-full max-w-md"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
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
      {/* Grouped trips list */}
      <div className="space-y-12">
        {Object.entries(groupedTrips).map(([dateGroup, tripsInGroup]) => (
          <div key={dateGroup}>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <h2 className="text-xl font-medium">{dateGroup}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripsInGroup.map((tripMember) => (
                <div key={tripMember.trip.id} className="relative group">
                  <Link href={`/trips/${tripMember.trip.id}`} className="block h-full">
                    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:shadow-none dark:hover:border-primary/30 hover:translate-y-[-2px]">
                      <div className="aspect-video relative bg-muted overflow-hidden">
                        {tripMember.trip.cover_image_url ? (
                          <img
                            src={tripMember.trip.cover_image_url}
                            alt={tripMember.trip.name}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="text-xl font-medium mb-2 line-clamp-1">
                          {tripMember.trip.name}
                        </h3>
                        <p className="text-muted-foreground mb-3 text-sm line-clamp-1">
                          {tripMember.trip.destination_name || 'No destination set'}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {tripMember.trip.start_date
                              ? new Date(tripMember.trip.start_date).toLocaleDateString()
                              : 'No dates set'}
                            {tripMember.trip.end_date
                              ? ` - ${new Date(tripMember.trip.end_date).toLocaleDateString()}`
                              : ''}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
