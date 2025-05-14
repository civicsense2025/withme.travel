import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createServerComponentClient } from '@/utils/supabase/server';
import { PRIVACY_SETTINGS } from '@/utils/constants/status';
import type { Database } from '@/utils/constants/database.types';

export const metadata: Metadata = {
  title: 'Dynamic Thumbnails | WithMe.travel',
  description: 'Generate beautiful dynamic thumbnails for social sharing and SEO',
};

// Define types for Trip and Destination data
type Trip = Database['public']['Tables']['trips']['Row'];
type Destination = Database['public']['Tables']['destinations']['Row'];

interface DestinationData {
  id?: string;
  name?: string;
  city: string;
  country: string;
  imageUrl?: string;
  description?: string;
  byline?: string;
  slug: string;
}

function isTripRow(t: any): t is Trip {
  return t && typeof t === 'object' && typeof t.id === 'string' && 'name' in t;
}

function isDestinationRow(d: any): d is Destination {
  return d && typeof d === 'object' && typeof d.id === 'string' && 'city' in d && 'country' in d;
}

async function getPublicTrips(limit = 3): Promise<Trip[]> {
  try {
    const supabase = await createServerComponentClient();
    const { data: trips, error } = await supabase
      .from('trips')
      .select(
        `
        id, 
        name, 
        description,
        destination_id,
        destination_name,
        start_date,
        end_date,
        cover_image_url
      `
      )
      .eq('privacy_setting', PRIVACY_SETTINGS.PUBLIC)
      .not('cover_image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Error fetching public trips:', error);
      return [];
    }
    if (!Array.isArray(trips)) return [];
    if (
      trips.length > 0 &&
      typeof trips[0] === 'object' &&
      trips[0] !== null &&
      'error' in trips[0] &&
      (trips[0] as any).error === true
    )
      return [];
    return (trips as unknown as Trip[]).filter(isTripRow);
  } catch (error) {
    console.error('Error fetching public trips:', error);
    return [];
  }
}

async function getPopularDestinations(limit = 3): Promise<Destination[]> {
  try {
    const supabase = await createServerComponentClient();
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select(
        `
        id,
        city,
        country,
        image_url,
        description,
        byline
      `
      )
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
    if (!Array.isArray(destinations)) return [];
    // Fill all required fields from the schema with nulls if missing
    return destinations.filter(isDestinationRow).map((d) => ({
      ...d,
      accessibility: null,
      address: null,
      avg_cost_per_day: null,
      avg_days: null,
      beach_quality: null,
      best_season: null,
      city: d.city ?? '',
      city_id: null,
      continent: null,
      country: d.country ?? '',
      created_at: '',
      cuisine_rating: null,
      cultural_attractions: null,
      currency: null,
      description: d.description ?? '',
      digital_nomad_friendly: null,
      eco_friendly_options: null,
      emoji: null,
      family_friendly: null,
      highlights: null,
      id: d.id,
      image_metadata: null,
      image_url: d.image_url ?? '',
      instagram_worthy_spots: null,
      is_featured: null,
      latitude: null,
      lgbtq_friendliness: null,
      likes_count: null,
      local_language: null,
      longitude: null,
      mapbox_id: null,
      name: null,
      nightlife_rating: null,
      off_peak_appeal: null,
      outdoor_activities: null,
      perfect_for: null,
      popularity: null,
      public_transportation: null,
      safety_rating: null,
      shopping_rating: null,
      slug: null,
      state_province: null,
      time_zone: null,
      updated_at: null,
      viator_destination_id: null,
      visa_required: null,
      walkability: null,
      wifi_connectivity: null,
      byline: d.byline ?? '',
    }));
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }
}

export default async function ThumbnailsDemoPage() {
  const publicTrips = await getPublicTrips();
  const popularDestinations = await getPopularDestinations();

  // Fallback trip IDs if no public trips are available
  const tripIds =
    publicTrips.length > 0
      ? publicTrips.map((trip) => trip.id)
      : ['sample-trip-1', 'sample-trip-2', 'sample-trip-3'];

  // Prepare destination data from real destinations or fallbacks
  const destinationData: DestinationData[] =
    popularDestinations.length > 0
      ? popularDestinations.map((dest) => {
          // Safely handle null/undefined values with defaults
          const city = dest.city || 'Unknown City';
          const country = dest.country || 'Unknown Country';

          return {
            id: dest.id,
            name: `${city}, ${country}`,
            city,
            country,
            imageUrl: dest.image_url || undefined,
            description: dest.description || undefined,
            byline: dest.byline || 'Travel with friends, make memories together',
            slug: `${city.toLowerCase().replace(/\s+/g, '-')}-${country.toLowerCase().replace(/\s+/g, '-')}`,
          };
        })
      : [
          {
            city: 'Paris',
            country: 'France',
            byline: 'The City of Lights awaits your adventure',
            slug: 'paris-france',
          },
          {
            city: 'Tokyo',
            country: 'Japan',
            byline: 'Experience the blend of tradition and modernity',
            slug: 'tokyo-japan',
          },
          {
            city: 'New York',
            country: 'USA',
            byline: 'The concrete jungle with endless possibilities',
            slug: 'new-york-usa',
          },
        ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="pb-8">
        <h1 className="text-3xl font-bold mb-4">Dynamic Thumbnails</h1>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
          <p className="text-blue-700">
            <strong>Note:</strong> If thumbnails appear to be using the old design, you may need to
            hard refresh (Ctrl+F5 or Cmd+Shift+R) or clear your browser cache to see the updated
            designs with padding.
          </p>
        </div>

        <div className="prose max-w-none">
          <p>
            Generate dynamic Open Graph images for social sharing. These images are automatically
            included in metadata for Twitter, Facebook, and other platforms that support Open Graph
            cards.
          </p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="max-w-5xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="basic">Basic Thumbnails</TabsTrigger>
          <TabsTrigger value="trips">Trip Thumbnails</TabsTrigger>
          <TabsTrigger value="destinations">Destination Thumbnails</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Dynamic Thumbnails</CardTitle>
              <CardDescription>
                Generate custom thumbnails with your own text and styling
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Default Style</h3>
                <div className="relative rounded-md overflow-hidden aspect-video shadow-md">
                  <Image
                    src={`/api/thumbnail?title=${encodeURIComponent('Your Custom Title')}&subtitle=${encodeURIComponent('Add your custom subtitle here')}&usePadding=true&t=${Date.now()}`}
                    alt="Basic thumbnail example"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <code className="bg-muted p-1 rounded">
                    /api/thumbnail?title=Your+Custom+Title&subtitle=Add+your+custom+subtitle+here&usePadding=true
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Custom Colors</h3>
                <div className="relative rounded-md overflow-hidden aspect-video shadow-md">
                  <Image
                    src={`/api/thumbnail?title=${encodeURIComponent('Purple Theme')}&subtitle=${encodeURIComponent('With custom background colors')}&bgColor=${encodeURIComponent('#8A2BE2')}&textColor=${encodeURIComponent('#ffffff')}&usePadding=true&t=${Date.now()}`}
                    alt="Custom color thumbnail example"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <code className="bg-muted p-1 rounded">
                    /api/thumbnail?title=Purple+Theme&bgColor=%238A2BE2&textColor=%23ffffff&usePadding=true
                  </code>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link
                  href="/api/thumbnail?title=Try%20It%20Yourself&subtitle=Create%20your%20own%20dynamic%20thumbnails"
                  target="_blank"
                >
                  Try It Yourself
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="trips" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Trip Thumbnails</CardTitle>
              <CardDescription>
                Auto-generated thumbnails for trip pages with destination imagery and key details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {publicTrips.length > 0 ? (
                publicTrips.map((trip, index) => (
                  <div key={trip.id} className="space-y-3">
                    <h3 className="text-lg font-medium">{trip.name}</h3>
                    <div className="relative rounded-md overflow-hidden aspect-video shadow-md">
                      <Image
                        src={`/api/thumbnail/trip?tripId=${trip.id}&t=${Date.now()}`}
                        alt={`Trip thumbnail for ${trip.name}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <p>Destination: {trip.destination_name || 'Various locations'}</p>
                        {trip.start_date && (
                          <p>
                            Dates: {new Date(trip.start_date).toLocaleDateString()}
                            {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                      <code className="bg-muted p-1 text-xs rounded">
                        /api/thumbnail/trip?tripId={trip.id}
                      </code>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-muted p-4 rounded-md text-center">
                  <p>No public trips available. Please publish some trips to see live examples.</p>
                  <div className="mt-4 flex justify-center space-x-4">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="relative rounded-md overflow-hidden aspect-video shadow-md w-full max-w-xs"
                      >
                        <div className="absolute inset-0 bg-white">
                          <div className="absolute inset-[15%] bg-gradient-to-r from-blue-500 to-blue-700 rounded-md">
                            <div className="absolute top-4 left-4 text-white font-bold">
                              withme.travel
                            </div>
                            <div className="absolute bottom-12 left-4 text-white font-bold text-lg">
                              Sample Trip {index}
                            </div>
                            <div className="absolute bottom-6 left-4 text-white text-sm">
                              Destination, Country
                            </div>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-blue-600 rounded-md px-3 py-1.5 font-medium text-sm">
                              View Trip
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                Trip thumbnails feature our logo in the top left, with trip name, destination,
                dates, and tags displayed in an elegant layout at the bottom.
              </p>
              <Button asChild className="w-full">
                <Link href="/trips">Explore Trips</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Destination Thumbnails</CardTitle>
              <CardDescription>
                Beautiful destination images with city/country information and highlighted
                attractions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {destinationData.map((destination, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-medium">
                    {destination.name || `${destination.city}, ${destination.country}`}
                  </h3>
                  <div className="relative rounded-md overflow-hidden aspect-video shadow-md">
                    <Image
                      src={`/api/thumbnail/destination?${destination.id ? `destinationId=${destination.id}` : `city=${destination.city}&country=${destination.country}`}${destination.imageUrl ? `&image_url=${encodeURIComponent(destination.imageUrl)}` : ''}${destination.byline ? `&byline=${encodeURIComponent(destination.byline || '')}` : ''}&t=${Date.now()}`}
                      alt={`Destination thumbnail for ${destination.name || destination.slug}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <code className="bg-muted p-1 rounded">
                      {destination.id
                        ? `/api/thumbnail/destination?destinationId=${destination.id}`
                        : `/api/thumbnail/destination?city=${destination.city}&country=${destination.country}&byline=${encodeURIComponent(destination.byline || '')}`}
                    </code>
                    {destination.description && (
                      <p className="mt-2 line-clamp-2">{destination.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/destinations">Explore Destinations</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Using Thumbnails for Social Sharing</h2>
        <div className="prose prose-sm mb-8">
          <p className="text-red-600 font-medium">
            Important: When sharing on social media, always use the direct API URLs shown in the
            code samples below, NOT the Next.js Image URLs that include _next/image in the path. The
            Next.js image URLs will not work for OG/social sharing.
          </p>
          <p>For example, use:</p>
          <code className="block p-2 bg-gray-100 rounded">
            https://withme.travel/api/thumbnail/destination?destinationId=example-id
          </code>
          <p>Not:</p>
          <code className="block p-2 bg-gray-100 rounded line-through text-gray-500">
            https://withme.travel/_next/image?url=%2Fapi%2Fthumbnail%2Fdestination%3FdestinationId%3Dexample-id&w=3840&q=75
          </code>
        </div>

        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="prose prose-sm">
          <p>
            Our dynamic thumbnail system generates Open Graph images on-the-fly using Next.js API
            routes. These images are automatically included in the metadata for social sharing on
            platforms like Twitter, Facebook, and LinkedIn.
          </p>
          <p>The system supports:</p>
          <ul>
            <li>Basic text-based thumbnails with customizable colors and gradients</li>
            <li>Trip thumbnails with destination imagery, trip name, location, dates, and tags</li>
            <li>
              Destination thumbnails featuring city information, country flags, and highlights
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
