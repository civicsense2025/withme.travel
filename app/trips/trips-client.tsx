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
import type { Trip as BaseTrip } from '@/lib/hooks/use-trips';
import { TripCardHeader } from '@/app/trips/components/molecules/TripCardHeader';
import { useTrips } from '@/lib/hooks/use-trips';
import { EmptyTrips } from '@/components/features/trips/molecules/EmptyTrips';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// TYPES
// ============================================================================

type FilterType = 'all' | 'upcoming' | 'past';

// Extend the Trip type to include cover_image_url
interface Trip extends BaseTrip {
  cover_image_url?: string | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TripsClientPage({ userId = '', isGuest = false }: { userId?: string; isGuest?: boolean }) {
  // Use the standardized hook for trips management
  const { 
    trips, 
    isLoading, 
    error, 
    loadTrips,
    addTrip,
    editTrip,
    removeTrip,
    duplicateTrip,
    archiveTrip,
    togglePublic
  } = useTrips({ includeShared: true });
  
  // Local filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Filtered trips based on search query and filter type
  const filteredTrips = useMemo(() => {
    if (!trips || trips.length === 0) return [];
    
    let filtered = [...trips];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (trip) =>
          trip.name.toLowerCase().includes(query) ||
          trip.destination_name?.toLowerCase().includes(query)
      );
    }
    
    // Apply date filter
    if (filterType !== 'all') {
      const now = new Date();
      if (filterType === 'upcoming') {
        filtered = filtered.filter((trip) => {
          if (!trip.end_date) return true; // No end date means it's not in the past
          const endDate = new Date(trip.end_date);
          return endDate >= now;
        });
      }
      if (filterType === 'past') {
        filtered = filtered.filter((trip) => {
          if (!trip.end_date) return false; // No end date means it can't be in the past
          const endDate = new Date(trip.end_date);
          return endDate < now;
        });
      }
    }
    
    return filtered;
  }, [trips, searchQuery, filterType]);

  // Group trips by month/year
  const groupedTrips = useMemo(() => {
    const sortedTrips = [...filteredTrips].sort((a, b) => {
      if (filterType === 'past') {
        // Sort past trips by end date (most recent first)
        const aDate = a.end_date ? new Date(a.end_date) : new Date(0);
        const bDate = b.end_date ? new Date(b.end_date) : new Date(0);
        return bDate.getTime() - aDate.getTime();
      } else if (filterType === 'upcoming') {
        // Sort upcoming trips by start date (soonest first)
        const aDate = a.start_date ? new Date(a.start_date) : new Date(9999, 11, 31);
        const bDate = b.start_date ? new Date(b.start_date) : new Date(9999, 11, 31);
        return aDate.getTime() - bDate.getTime();
      } else {
        // Sort all trips by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    const grouped: Record<string, typeof trips> = {};
    
    sortedTrips.forEach((trip) => {
      let date: Date;
      
      // Determine which date to use for grouping based on filter
      if (filterType === 'past' && trip.end_date) {
        date = new Date(trip.end_date);
      } else if (filterType === 'upcoming' && trip.start_date) {
        date = new Date(trip.start_date);
      } else {
        date = new Date(trip.created_at);
      }
      
      const key = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      
      grouped[key].push(trip);
    });
    
    return grouped;
  }, [filteredTrips, filterType]);

  // Calculate travel stats for the header
  const travelStats = useMemo(() => {
    if (!trips || trips.length === 0) return { visited: 0, upcoming: 0, destinations: 0 };
    
    const now = new Date();
    const visitedTrips = trips.filter((t) => t.end_date && new Date(t.end_date) < now).length;
    
    const upcomingTrips = trips.filter(
      (t) =>
        (t.end_date && new Date(t.end_date) >= now) ||
        (!t.end_date && t.start_date && new Date(t.start_date) >= now)
    ).length;
    
    const uniqueDestinations = new Set(
      trips.map((t) => t.destination_name).filter(Boolean)
    ).size;
    
    return { visited: visitedTrips, upcoming: upcomingTrips, destinations: uniqueDestinations };
  }, [trips]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
  };

  // ============================================================================
  // RENDER CONDITIONAL UI STATES
  // ============================================================================

  // Loading state
  if (isLoading && (!trips || trips.length === 0)) {
    return <TripsLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center rounded-lg border bg-destructive/10 text-destructive">
        <h3 className="text-xl font-medium mb-2">Error loading trips</h3>
        <p className="mb-4 max-w-md mx-auto">{error.message || 'Something went wrong while loading your trips.'}</p>
        <Button 
          variant="outline" 
          onClick={() => loadTrips()}
          className="border-destructive text-destructive hover:bg-destructive/10"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!trips || trips.length === 0) {
    return <EmptyTrips />;
  }

  // ============================================================================
  // MAIN UI
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Travel stats header */}
      <div className="text-sm text-muted-foreground px-2 py-2 text-center">
        {travelStats.visited > 0 && <span>{travelStats.visited} visited</span>}
        {travelStats.visited > 0 && travelStats.upcoming > 0 && <span> • </span>}
        {travelStats.upcoming > 0 && <span>{travelStats.upcoming} upcoming</span>}
        {(travelStats.visited > 0 || travelStats.upcoming > 0) &&
          travelStats.destinations > 0 && <span> • </span>}
        {travelStats.destinations > 0 && (
          <span>{travelStats.destinations} unique destination{travelStats.destinations !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Search input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trips..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter tabs */}
      <Tabs
        defaultValue="all"
        value={filterType}
        onValueChange={(value) => setFilterType(value as FilterType)}
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

        {/* Single shared tabs content - trips list renders based on active filter */}
        <TabsContent value={filterType} className="mt-0">
          <TripsList groupedTrips={groupedTrips} />
        </TabsContent>
      </Tabs>

      {/* No trips match filters state */}
      {filteredTrips.length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-card/50">
          <h3 className="text-xl font-medium mb-2">No matching trips found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to see more results.
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUPPORTING COMPONENTS
// ============================================================================

// Loading skeleton component
function TripsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats skeleton */}
      <div className="flex justify-center gap-4 py-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      
      {/* Search skeleton */}
      <Skeleton className="h-10 w-full" />
      
      {/* Tabs skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-[300px] rounded-full" />
      </div>
      
      {/* Trip group skeletons */}
      <div className="space-y-8">
        {[1, 2].map((group) => (
          <div key={group} className="space-y-4">
            <Skeleton className="h-8 w-36" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((card) => (
                <Skeleton key={card} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Trip card component
function TripCard({ trip }: { trip: Trip }) {
  const hasDateInfo = trip.start_date || trip.end_date;
  const dateRange = hasDateInfo && trip.start_date && trip.end_date 
    ? formatDateRange(trip.start_date, trip.end_date) 
    : '';
  const locationName = trip.destination_name || '';
  
  return (
    <Link href={`/trips/${trip.id}`} className="block no-underline" legacyBehavior>
      <Card className="h-full hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <CardContent className="p-4">
          <TripCardHeader
            name={trip.name}
            destination={locationName}
            coverImageUrl={trip.cover_image_url || undefined}
            status={trip.status ? String(trip.status) : undefined}
          />
          
          {/* Metadata row */}
          <div className="space-y-1 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span>0 travelers</span>
              {hasDateInfo && (
                <>
                  <span className="mx-1 flex-shrink-0">•</span>
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

// Trip list component
function TripsList({ groupedTrips }: { groupedTrips: Record<string, Trip[]> }) {
  if (Object.keys(groupedTrips).length === 0) {
    return null; // Empty state is handled by parent
  }
  
  return (
    <div className="space-y-8">
      {Object.entries(groupedTrips).map(([dateGroup, tripsInGroup]) => (
        <div key={dateGroup}>
          <div className="flex items-center mb-4">
            <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{dateGroup}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tripsInGroup.map((trip: Trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
