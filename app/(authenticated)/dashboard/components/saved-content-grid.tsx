'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, CalendarDays, Star, ArrowRight } from 'lucide-react';

interface SavedContent {
  destinations: any[];
  itineraries: any[];
}

interface SavedContentGridProps {
  savedContent: SavedContent;
}

export function SavedContentGrid({ savedContent }: SavedContentGridProps) {
  const { destinations, itineraries } = savedContent;
  console.log('Rendering saved content:', { destinations, itineraries });

  const hasDestinations = destinations && destinations.length > 0;
  const hasItineraries = itineraries && itineraries.length > 0;
  const hasContent = hasDestinations || hasItineraries;

  if (!hasContent) {
    return (
      <div className="text-center p-6 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No saved content yet.</p>
        <p className="mt-2">
          <Link href="/destinations" className="underline hover:text-primary">
            Explore destinations
          </Link>{' '}
          or{' '}
          <Link href="/itineraries" className="underline hover:text-primary">
            browse itineraries
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue={hasDestinations ? 'destinations' : 'itineraries'} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-2">
          <TabsTrigger value="destinations" disabled={!hasDestinations}>
            Destinations
          </TabsTrigger>
          <TabsTrigger value="itineraries" disabled={!hasItineraries}>
            Itineraries
          </TabsTrigger>
        </TabsList>

        {/* Destinations tab */}
        <TabsContent value="destinations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {destinations.map((dest) => (
              <Card
                key={dest.id}
                className="overflow-hidden hover:shadow-md transition-shadow h-[180px]"
              >
                <Link
                  href={`/destinations/${dest.destinations?.slug || dest.item_id}`}
                  className="block h-full"
                  legacyBehavior>
                  <div className="relative h-full">
                    {/* Background image */}
                    <div className="absolute inset-0">
                      {dest.destinations?.image_url ? (
                        <img
                          src={dest.destinations.image_url}
                          alt={dest.destinations.city}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log(`Image failed to load: ${dest.destinations.image_url}`);
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.src = '/images/placeholder-destination.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>
                    </div>

                    {/* Content overlay */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <div className="flex items-center text-white mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">Saved destination</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {dest.destinations?.city || 'Unknown City'}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {dest.destinations?.country || 'Unknown Country'}
                      </p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          {destinations.length > 4 && (
            <div className="text-center">
              <Link
                href="/saved"
                className="text-sm text-muted-foreground hover:underline inline-flex items-center"
                legacyBehavior>
                View all saved destinations
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          )}
        </TabsContent>

        {/* Itineraries tab */}
        <TabsContent value="itineraries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itineraries.map((itin) => (
              <Card
                key={itin.id}
                className="overflow-hidden hover:shadow-md transition-shadow h-[180px]"
              >
                <Link
                  href={`/itineraries/${itin.slug || itin.id}`}
                  className="block h-full"
                  legacyBehavior>
                  <div className="relative h-full">
                    {/* Background image */}
                    <div className="absolute inset-0">
                      {itin.cover_image_url || itin.image_url ? (
                        <img
                          src={itin.cover_image_url || itin.image_url}
                          alt={itin.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log(
                              `Image failed to load: ${itin.cover_image_url || itin.image_url}`
                            );
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.src = '/images/placeholder-itinerary.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <CalendarDays className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>
                    </div>

                    {/* Content overlay */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <div className="flex items-center text-white mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm">Saved itinerary</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {itin.title || 'Unknown Itinerary'}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {itin.destination_name ||
                          (itin.destinations &&
                            `${itin.destinations.name}, ${itin.destinations.country}`) ||
                          'Unknown Destination'}
                      </p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          {itineraries.length > 4 && (
            <div className="text-center">
              <Link
                href="/saved"
                className="text-sm text-muted-foreground hover:underline inline-flex items-center"
                legacyBehavior>
                View all saved itineraries
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
