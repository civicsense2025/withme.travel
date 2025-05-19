'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Loader2, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/hooks/use-toast';
import { useSearch } from '@/contexts/search-context';
import { LikeButton } from '@/components/like-button';

interface Destination {
  id: string;
  name: string;
  city: string;
  state_province?: string;
  country: string;
  continent: string;
  description: string;
  image_url: string;
  cuisine_rating: number;
  nightlife_rating: number;
  cultural_attractions: number;
  outdoor_activities: number;
  beach_quality: number;
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  image_url?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const { addToSearchHistory } = useSearch();
  const { toast } = useToast();
  const searchPerformed = useRef(false);

  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Add to search history only once when the component mounts or query changes
  useEffect(() => {
    if (query && !searchPerformed.current) {
      addToSearchHistory(query, 'destination');
      searchPerformed.current = true;
    }
  }, [query, addToSearchHistory]);

  // Separate effect for performing the search
  useEffect(() => {
    if (!query) return;

    async function performSearch() {
      setIsLoading(true);
      try {
        // Search destinations
        const destinationsResponse = await fetch(
          `/api/destinations/search?query=${encodeURIComponent(query)}`
        );
        const destinationsData = await destinationsResponse.json();
        setDestinations(destinationsData.destinations || []);

        // TODO: Add trip search when API is available
        // For now, we'll use mock data
        setTrips([]);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: 'Search failed',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    performSearch();
  }, [query, toast]);

  // Reset the searchPerformed ref when query changes
  useEffect(() => {
    return () => {
      searchPerformed.current = false;
    };
  }, [query]);

  const totalResults = destinations.length + trips.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-5xl leading-loose font-bold mb-2">Search Results</h1>
      <p className="text-muted-foreground mb-6">
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Searching...
          </span>
        ) : (
          `Found ${totalResults} results for "${query}"`
        )}
      </p>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
          <TabsTrigger value="destinations">Destinations ({destinations.length})</TabsTrigger>
          <TabsTrigger value="trips">Trips ({trips.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {destinations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Destinations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {destinations.slice(0, 3).map((destination) => (
                  <DestinationCard key={destination.id} destination={destination} />
                ))}
              </div>
              {destinations.length > 3 && (
                <div className="mt-4 text-center">
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('destinations');
                    }}
                    className="text-primary hover:underline"
                  >
                    View all {destinations.length} destinations
                  </Link>
                </div>
              )}
            </div>
          )}

          {trips.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Trips</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.slice(0, 3).map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
              {trips.length > 3 && (
                <div className="mt-4 text-center">
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('trips');
                    }}
                    className="text-primary hover:underline"
                  >
                    View all {trips.length} trips
                  </Link>
                </div>
              )}
            </div>
          )}

          {totalResults === 0 && !isLoading && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">No results found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your search terms</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="destinations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
          {destinations.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">No destinations found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your search terms</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trips" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
          {trips.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold">No trips found</h2>
              <p className="text-muted-foreground mt-2">Try adjusting your search terms</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DestinationCard({ destination }: { destination: Destination }) {
  // Function to get tags for this destination
  const getTags = () => {
    const tags = [];
    if (destination.cuisine_rating >= 4) tags.push('food');
    if (destination.nightlife_rating >= 4) tags.push('nightlife');
    if (destination.cultural_attractions >= 4) tags.push('history');
    if (destination.outdoor_activities >= 4) tags.push('outdoors');
    if (destination.beach_quality >= 4) tags.push('beach');
    return tags.slice(0, 3); // Limit to 3 tags
  };

  const tags = getTags();

  // Get country code for flag emoji
  const getCountryFlag = (countryName: string) => {
    // This is a simplified version - in production you'd want a more robust mapping
    const countryFlags: Record<string, string> = {
      Japan: '🇯🇵',
      Italy: '🇮🇹',
      France: '🇫🇷',
      Spain: '🇪🇸',
      'United States': '🇺🇸',
      Thailand: '🇹🇭',
      Mexico: '🇲🇽',
      Brazil: '🇧🇷',
      UK: '🇬🇧',
      Greece: '🇬🇷',
    };

    return countryFlags[countryName] || '🏳️';
  };

  return (
    <Link href={`/destinations/${destination.city.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full border">
        <div className="relative h-48 w-full bg-travel-purple/10">
          <div className="absolute top-3 right-3 z-10">
            <LikeButton
              itemId={destination.id}
              itemType="destination"
              size="sm"
              className="shadow-sm"
            />
          </div>
          <Image
            src={
              destination.image_url ||
              `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(destination.name || destination.city)}`
            }
            alt={destination.name || destination.city}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">{getCountryFlag(destination.country)}</span>
            <h3 className="text-xl font-bold">{destination.city.toLowerCase()}</h3>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-sm px-4 py-1.5 rounded-full ${
                  tag === 'food'
                    ? 'bg-travel-mint/80 text-travel-mint-foreground'
                    : tag === 'nightlife'
                      ? 'bg-travel-peach/80 text-travel-peach-foreground'
                      : tag === 'history'
                        ? 'bg-travel-blue/80 text-travel-blue-foreground'
                        : tag === 'outdoors'
                          ? 'bg-travel-purple/80 text-travel-purple-foreground'
                          : 'bg-travel-yellow/80 text-travel-yellow-foreground'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {destination.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {destination.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="relative h-40 w-full">
          <Image
            src={
              trip.image_url ||
              `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(trip.destination) || '/placeholder.svg'}`
            }
            alt={trip.title}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{trip.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(trip.start_date).toLocaleDateString()} -{' '}
              {new Date(trip.end_date).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
