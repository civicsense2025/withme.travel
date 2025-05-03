'use client';

import { ItineraryCategory } from '@/utils/constants/status';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, MapPin, Users, ArrowLeft, Share2 } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripHeader } from '@/components/trip-header';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PublicItineraryMap from '@/components/maps/public-itinerary-map';
import { PlaylistEmbed } from '@/components/trips/PlaylistEmbed';
import { type TravelInfo } from '@/lib/mapbox';
import { useAuth } from '@/lib/hooks/use-auth';
import { ItineraryItemCard } from '@/components/itinerary/ItineraryItemCard';
import { type DisplayItineraryItem } from '@/types/itinerary';
// Define or import the PublicTripData type (consistent with API route)
type PublicTripData = {
  trip: {
    id: string;
    name: string | null;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    cover_image_url: string | null;
    destination_name: string | null;
    description: string | null;
    privacy_setting: string | null;
    playlist_url?: string | null;
    members: Array<{
      id: string;
      name: string | null;
      avatarUrl: string | null;
      role: string;
    }>;
  };
  itinerary: Array<{
    id: number | string;
    day: number | null;
    start_time: string | null;
    end_time: string | null;
    title: string | null;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    type: string | null;
    category: string | null;
    cost: number | null;
    currency: string | null;
  }>;
  travelTimes: Record<string, TravelInfo>;
};

// Helper function to group itinerary items by day
function groupItineraryByDay(itineraryItems: PublicTripData['itinerary']) {
  if (!itineraryItems) return {};
  return itineraryItems.reduce(
    (acc, item) => {
      const day = item.day || 0; // Group items without a day under 'Day 0' or similar
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      // Sort items within the day by start_time if available
      acc[day].sort((a, b) => {
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        return a.start_time ? -1 : 1; // Items without time first
      });
      return acc;
    },
    {} as Record<number, PublicTripData['itinerary']>
  );
}

// Helper to format time (optional)
function formatTime(timeString: string | null) {
  if (!timeString) return '';
  try {
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hour, 10), parseInt(minute, 10));
    // Adjust options for desired time format (e.g., h:mm a)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (e) {
    return timeString; // Return original if parsing fails
  }
}

export default function PublicTripPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [publicTripData, setPublicTripData] = useState<PublicTripData | null>(null);
  const [travelTimes, setTravelTimes] = useState<Record<string, TravelInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prepare locations for the map component
  const mapLocations = useMemo(() => {
    const itinerary = publicTripData?.itinerary || [];
    return itinerary
      .filter((item) => item.latitude != null && item.longitude != null)
      .map((item, index) => ({
        id: index,
        latitude: item.latitude!,
        longitude: item.longitude!,
        name: item.title || item.location,
        day: item.day,
      }));
  }, [publicTripData?.itinerary]);

  // Get Mapbox token from environment variables - Access unconditionally
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Fetch public trip data
  useEffect(() => {
    async function fetchTrip() {
      try {
        setIsLoading(true);
        setError(null);
        setPublicTripData(null); // Reset data on new fetch
        setTravelTimes({}); // Reset travel times

        // Use window.location.origin to get the base URL
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/trips/public/${slug}`);

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Failed to parse error response' }));
          if (response.status === 404) {
            throw new Error(errorData.error || 'Trip not found or access denied');
          }
          throw new Error(errorData.error || `Failed to fetch trip: ${response.status}`);
        }

        // Expecting the full PublicTripData structure including travelTimes
        const data: PublicTripData = await response.json();
        setPublicTripData(data); // Set the main trip/itinerary data
        setTravelTimes(data.travelTimes || {}); // Set travel times, default to empty object
      } catch (err: any) {
        console.error('Error fetching trip:', err);
        const errorMessage = err.message || 'Failed to load trip details';
        setError(errorMessage);
        toast({
          title: 'Error loading trip',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrip();
  }, [slug, toast]);

  const handleShare = () => {
    // Access trip details via publicTripData.trip
    const tripTitle = publicTripData?.trip?.name || 'Check out this trip!';
    if (navigator.share) {
      navigator
        .share({
          title: tripTitle,
          text: `Check out this trip: ${tripTitle}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error('Error sharing:', err);
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Trip link copied to clipboard',
      });
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
        <div className="h-64 w-full rounded-lg bg-muted animate-pulse"></div>
        <div className="mt-6 h-8 w-1/3 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  if (error || !publicTripData) {
    return (
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Error Loading Trip</AlertTitle>
          <AlertDescription>
            {error || "This trip doesn't exist, is private, or could not be loaded."}
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <p className="mb-4 text-muted-foreground">Want to plan your own trip?</p>
          <Link href="/trips/create">
            <Button>Create a Trip</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Destructure for easier access
  const { trip, itinerary } = publicTripData;
  const groupedItinerary = groupItineraryByDay(itinerary);
  const sortedDays = Object.keys(groupedItinerary)
    .map(Number)
    .sort((a, b) => a - b);
  const playlistUrl = trip?.playlist_url;

  // mapLocations is already defined above
  // mapboxToken is already defined above

  return (
    <div className="container py-6 max-w-3xl mx-auto">
      <div className="bg-background rounded-lg shadow-md p-6 md:p-8 mb-24">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          </Link>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" className="gap-1" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Link href="/trips/create">
              <Button>Plan Your Own Trip</Button>
            </Link>
          </div>
        </div>

        {trip.cover_image_url && (
          <div className="relative h-48 md:h-64 w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src={trip.cover_image_url}
              alt={`${trip.name ?? 'Trip'} cover image`}
              fill
              style={{ objectFit: 'cover' }}
              className="object-center"
              priority
            />
          </div>
        )}

        <TripHeader
          tripId={trip.id}
          tripName={trip.name || 'Trip Details'}
          destinationName={trip.destination_name || 'Unknown Destination'}
          startDate={trip.start_date}
          endDate={trip.end_date}
          coverImageUrl={trip.cover_image_url || null}
          members={undefined}
          tags={undefined}
          canEdit={false}
          onEdit={() => {}}
          onMembers={() => {}}
          onChangeCover={() => {}}
        />

        <div className="flex flex-wrap gap-4 mt-6 mb-8">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {trip.start_date && trip.end_date
                ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                : 'Dates not set'}
            </span>
          </div>
          {trip.destination_name && (
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{trip.destination_name}</span>
            </div>
          )}
          {trip.members && trip.members.length > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {trip.members.length} {trip.members.length === 1 ? 'member' : 'members'}
              </span>
            </div>
          )}
        </div>

        {/* Display Trip Description if available */}
        {trip.description && (
          <p className="text-sm text-muted-foreground mt-1 mb-6 break-words">{trip.description}</p>
        )}

        {/* Playlist Embed Section */}
        {playlistUrl && (
          <section className="my-8">
            <h2 className="text-2xl font-semibold mb-4 lowercase">Playlist</h2>
            <PlaylistEmbed url={playlistUrl} width="100%" height={200} />
          </section>
        )}

        {/* ---- START: Removed Tabs Wrapper ---- */}

        {/* ---- Itinerary Section ---- */}
        <h2 className="text-2xl font-semibold mt-8 mb-4 lowercase">Itinerary</h2>
        <div className="space-y-8">
          {' '}
          {/* Increased space between days */}
          {sortedDays.length > 0 ? (
            sortedDays.map((day) => (
              <div key={`day-${day}`}>
                <h3 className="text-xl font-semibold mb-4 lowercase">
                  Day {day === 0 ? 'Unscheduled' : `Day ${day}`}
                </h3>
                {/* Container for the timeline elements */}
                <div className="relative space-y-6 pl-6 border-l-2 border-dashed border-muted/50">
                  {groupedItinerary[day].map((item, index) => {
                    const travelInfo = travelTimes[item.id.toString()];
                    const isLastItemOfDay = index === groupedItinerary[day].length - 1;

                    // Convert PublicTripData itinerary item to DisplayItineraryItem if needed
                    // Assuming the structures are compatible enough for the card's needs
                    const displayItem: DisplayItineraryItem = {
                      id: String(item.id),
                      trip_id: trip.id,
                      title: item.title,
                      address: item.location,
                      latitude: item.latitude,
                      longitude: item.longitude,
                      day_number: item.day,
                      date: null,
                      start_time: item.start_time,
                      end_time: item.end_time,
                      notes: item.notes,
                      category: item.category as ItineraryCategory | null,
                      estimated_cost: item.cost,
                      currency: item.currency,
                      status: null,
                      created_by: null,
                      place_id: null,
                      is_custom: false,
                      position: index,
                      user_vote: null,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      type: item.type,
                      item_type: null,
                      section_id: null,
                      location: item.location,
                      description: item.notes,
                      duration_minutes: null,
                      cover_image_url: null,
                      creatorProfile: null,
                      votes: {
                        up: 0,
                        down: 0,
                        upVoters: [],
                        downVoters: [],
                        userVote: null,
                      },
                    };

                    return (
                      <div key={item.id} className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[calc(0.75rem+1px)] top-1 h-3 w-3 rounded-full bg-primary ring-2 ring-background"></div>

                        {/* Use ItineraryItemCard */}
                        <div className="ml-4">
                          <ItineraryItemCard item={displayItem} /> {/* Pass the mapped item */}
                        </div>

                        {/* Travel Time */}
                        {!isLastItemOfDay && travelInfo && (
                          <div className="relative mt-4 mb-2 pl-4">
                            <div className="absolute -left-[calc(0.75rem+1px)] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-muted-foreground"></div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">
                                {travelInfo.mode === 'walking' ? '🚶' : '🚗'}
                              </span>
                              <span>{travelInfo.formattedDuration}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* ... End of line div ... */}
                  <div className="absolute left-0 bottom-0 top-0 w-0.5 -z-10"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No itinerary items available for this trip.</p>
            </div>
          )}
        </div>

        {/* ---- Map Section ---- */}
        <h2 className="text-2xl font-semibold mt-8 mb-4 lowercase">Map</h2>
        <div>
          {' '}
          {/* Added a wrapper div for potential map styling */}
          {mapboxToken && mapLocations.length > 0 ? (
            <PublicItineraryMap locations={mapLocations} mapboxToken={mapboxToken} />
          ) : (
            <div className="mt-6 p-4 bg-muted rounded-lg text-center text-muted-foreground">
              {mapboxToken
                ? 'No locations with coordinates to display on map.'
                : 'Map cannot be displayed. Configuration missing.'}
            </div>
          )}
        </div>

        {/* ---- END: Removed Tabs Wrapper ---- */}
      </div>

      {/* ---- Join this adventure Modal (Fixed Position) ---- */}
      {!user && (
        <Card className="fixed bottom-4 right-4 z-50 w-full max-w-[18rem] sm:max-w-[20rem] shadow-xl bg-background/95 backdrop-blur-sm border border-border/20 rounded-lg overflow-hidden">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg font-semibold lowercase flex items-center gap-2">
              ready for adventure? <span className="text-xl">🚀</span>
            </CardTitle>
            {/* <CardDescription className="text-xs sm:text-sm lowercase">create your own account to plan trips</CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-3 p-3 sm:p-4 pt-0 sm:pt-0">
            <p className="text-xs sm:text-sm text-muted-foreground lowercase">
              grab a free account to plan trips with your crew!
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/signup?redirect=/trips/create">
                <Button
                  size="sm"
                  className="w-full bg-travel-purple hover:bg-purple-400 text-purple-900 text-xs sm:text-sm lowercase"
                >
                  ✨ sign up free
                </Button>
              </Link>
              <Link href={`/login?redirect=/dashboard`}>
                <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm lowercase">
                  log in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
