'use client';
import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyTrips } from '@/components/empty-trips';
import EnhancedTripCard from '@/components/trips/EnhancedTripCard';
import { ClassErrorBoundary } from '@/components/error-boundary';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { TripRole } from '@/types/trip';
import { TripsFeedbackButton } from './TripsFeedbackButton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatDateRange } from '@/utils/lib-utils';

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
  const { toast } = useToast();
  const [processError, setProcessError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Process and sort trips with improved error handling
  const trips = useMemo(() => {
    try {
      console.log('[TripsClientPage] Processing trips data:', initialTrips);
      
      if (!Array.isArray(initialTrips)) {
        console.error('[TripsClientPage] initialTrips is not an array:', initialTrips);
        setProcessError('Trip data is not in the expected format');
        return [];
      }

    // Filter out missing trips
    const valid = initialTrips.filter(
        (r): r is typeof r & { trip: NonNullable<(typeof r)['trip']> } => {
          if (!r || typeof r !== 'object') {
            console.warn('[TripsClientPage] Invalid trip member row:', r);
            return false;
          }
          
          if (!r.trip || typeof r.trip !== 'object') {
            console.warn('[TripsClientPage] Trip is null or not an object:', r);
            return false;
          }
          
          return true;
        }
      );

      if (valid.length === 0 && initialTrips.length > 0) {
        console.warn('[TripsClientPage] No valid trips found in data');
        setProcessError('No valid trips found in data');
      }

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
    } catch (error) {
      console.error('[TripsClientPage] Error processing trips:', error);
      setProcessError('Failed to process trip data');
      return [];
    }
  }, [initialTrips, userId]);

  // Show toast for any processing errors
  useEffect(() => {
    if (processError) {
      toast({
        title: 'Trip Display Error',
        description: processError,
        variant: 'destructive',
      });
    }
  }, [processError, toast]);

  const upcomingTrips = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return trips.filter(trip => 
      !trip.start_date || new Date(trip.start_date).getTime() >= today
    );
  }, [trips]);

  const pastTrips = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return trips.filter(trip => 
      trip.start_date && new Date(trip.start_date).getTime() < today
    );
  }, [trips]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Your Trips</h1>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            {trips.length === 0 
              ? "You don't have any trips yet. Create your first adventure!"
              : `You have ${trips.length} ${trips.length === 1 ? 'trip' : 'trips'}`}
          </p>
          <div className="flex items-center gap-3">
            <TripsFeedbackButton />
            <Link href="/trips/create">
              <Button className="rounded-md" size="sm">
                <Plus className="h-4 w-4 mr-2" /> New Trip
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <ClassErrorBoundary
        fallback={
          <div className="my-8 text-center p-8 border border-border rounded-xl">
            <p className="text-destructive mb-4">There was a problem loading your trips</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              Try Again
            </Button>
          </div>
        }
      >
        <div key={refreshKey}>
          {trips.length === 0 ? (
            <EmptyTrips />
          ) : (
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'upcoming' | 'past')} className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="upcoming">Upcoming Trips</TabsTrigger>
                <TabsTrigger value="past">Past Trips</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming">
                {upcomingTrips.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">No upcoming trips. Time to plan your next adventure!</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingTrips.map((trip) => {
                      // Defensive date checks
                      const today = new Date();
                      const start = trip.start_date ? new Date(trip.start_date) : null;
                      const end = trip.end_date ? new Date(trip.end_date) : null;
                      const isHappeningNow = !!(start && end && today >= start && today <= end);
                      return (
                        <div key={trip.id} className="relative">
                          {isHappeningNow && (
                            <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-accent-purple text-white font-semibold text-xs shadow-lg animate-pulse">
                              Happening Now
                              {start && end && (
                                <span className="ml-2 font-normal text-white/80">{formatDateRange(trip.start_date!, trip.end_date!)}</span>
                              )}
                            </div>
                          )}
                          <EnhancedTripCard 
                            trip={{
                              ...trip,
                              memberCount: 1 // Default to 1 (the user)
                            }} 
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="past">
                {pastTrips.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">No past trips yet. Memories are waiting to be made!</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastTrips.map((trip) => (
                      <EnhancedTripCard 
                        key={trip.id} 
                        trip={{
                          ...trip,
                          memberCount: 1 // Default to 1 (the user)
                        }} 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </ClassErrorBoundary>
    </div>
  );
}
