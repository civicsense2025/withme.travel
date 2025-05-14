/*
 * This file needs to be renamed for compatibility with the [name] route
 * Temporarily disabled to fix routing conflicts
 */

import { createServerComponentClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Force dynamic rendering for this page since it uses data fetching
export const dynamic = 'force-dynamic';

// Define the country data type
interface CountryData {
  name: string;
  description: string;
  coverImage: string;
  accentColor: string;
  highlights: string[];
  stats: {
    population: string;
    capital: string;
    languages: string;
    currency: string;
    timezone: string;
  };
}

// Type definition for destination
interface Destination {
  id: string;
  name: string | null;
  city: string | null;
  country: string | null;
  continent: string | null;
  description: string | null;
  image_url: string | null;
  byline?: string | null;
  highlights?: string[] | null;
  emoji?: string | null;
  image_metadata?: {
    alt_text?: string;
    attribution?: string;
    attributionHtml?: string;
    photographer_name?: string;
    photographer_url?: string;
    source?: string;
    source_id?: string;
    url?: string;
  };
  cuisine_rating: number;
  nightlife_rating: number;
  cultural_attractions: number;
  outdoor_activities: number;
  beach_quality: number;
  best_season?: string;
  avg_cost_per_day?: number;
  safety_rating?: number;
  [key: string]: any; // For other properties
}

// Helper function to transform database objects to Destination objects
function mapToDestination(d: any): Destination {
  // Transform image_metadata if it's a string (JSON)
  const imageMetadata = d.image_metadata
    ? typeof d.image_metadata === 'string'
      ? JSON.parse(d.image_metadata)
      : d.image_metadata
    : undefined;

  // Ensure all required fields have appropriate values
  return {
    id: d.id || '',
    name: d.name || '',
    city: d.city || '',
    country: d.country || '',
    continent: d.continent || '',
    description: d.description || '',
    image_url: d.image_url || '',
    byline: d.byline || null,
    highlights: Array.isArray(d.highlights) ? d.highlights : d.highlights ? [d.highlights] : null,
    emoji: d.emoji || null,
    image_metadata: imageMetadata,
    cuisine_rating: d.cuisine_rating || 0,
    nightlife_rating: d.nightlife_rating || 0,
    cultural_attractions: d.cultural_attractions || 0,
    outdoor_activities: d.outdoor_activities || 0,
    beach_quality: d.beach_quality || 0,
    best_season: d.best_season || undefined,
    avg_cost_per_day: d.avg_cost_per_day || undefined,
    safety_rating: d.safety_rating || undefined,
  };
}

// Type definition for itinerary
interface Itinerary {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  [key: string]: any;
}

// Server Component responsible for data fetching
export default async function CountryPage({ params }: { params: { country: string } }) {
  // Params are no longer Promises in latest Next.js versions
  const { country } = params;
  const countrySlug = country.toLowerCase();

  // Create country name from slug
  const countryName = countrySlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Initialize country data
  let countryData: CountryData = {
    name: countryName,
    description: `Explore the wonders of ${countryName}.`,
    coverImage: `/destinations/${countrySlug}.jpg`,
    accentColor: 'travel-blue',
    highlights: [],
    stats: {
      population: 'Unknown',
      capital: 'Unknown',
      languages: 'Unknown',
      currency: 'Unknown',
      timezone: 'Unknown',
    },
  };

  // Fetch data on the server
  let initialDestinations: Destination[] = [];
  let initialItineraries: Itinerary[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createServerComponentClient();

    // Fetch destinations for this country
    const { data: destData, error: destError } = await supabase
      .from('destinations')
      .select('*')
      .ilike('country', countryName)
      .limit(12);

    if (destError) {
      console.error('Error fetching destinations:', destError);
      fetchError = 'Failed to load destinations.';
    } else {
      initialDestinations = (destData || []).map((d) => mapToDestination(d));

      // If we have destinations, use the first one to populate country data
      if (initialDestinations.length > 0) {
        const dest = initialDestinations[0];

        // Get a representative image for the country
        const representativeImage =
          initialDestinations.find((d) => d.image_url)?.image_url || countryData.coverImage;

        // Generate country description from destinations
        const cityNames = initialDestinations
          .slice(0, 3)
          .map((d) => d.city)
          .filter(Boolean)
          .join(', ');

        const description = cityNames
          ? `Explore the beauty of ${countryName}, featuring destinations like ${cityNames} and more.`
          : countryData.description;

        // Build highlights from top destinations
        const highlights: string[] = initialDestinations
          .slice(0, 5)
          .map((d) => `Visit ${d.city}${d.description ? ` - ${d.description.split('.')[0]}` : ''}`)
          .filter(Boolean);

        // Update country data
        countryData = {
          ...countryData,
          description,
          coverImage: representativeImage,
          highlights: highlights,
          // Apply accent color based on continent if available
          accentColor:
            dest.continent === 'Europe'
              ? 'travel-blue'
              : dest.continent === 'Asia'
                ? 'travel-red'
                : dest.continent === 'North America'
                  ? 'travel-purple'
                  : dest.continent === 'South America'
                    ? 'travel-green'
                    : dest.continent === 'Africa'
                      ? 'travel-yellow'
                      : dest.continent === 'Oceania'
                        ? 'travel-mint'
                        : 'travel-blue',
        };
      }
    }

    // Fetch itineraries
    const { data: itinData, error: itinError } = await supabase
      .from('itineraries' as any) // Use type assertion for itineraries table
      .select('*')
      .eq('is_public', true)
      .limit(6);

    if (itinError) {
      console.error('Error fetching itineraries:', itinError);
      fetchError = fetchError
        ? `${fetchError} Failed to load itineraries.`
        : 'Failed to load itineraries.';
    } else {
      initialItineraries = (itinData as unknown as Itinerary[]) || []; // Use double type assertion
    }
  } catch (error) {
    console.error(`Error fetching country ${countryName}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return (
      <div>
        <h1>Error</h1>
        <p>Failed to load country data: {errorMessage}</p>
      </div>
    );
  }

  // Render the Client Component with fetched data as props
  // return (
  //   <CountryPageClient
  //     countryData={countryData}
  //     initialDestinations={initialDestinations}
  //     initialItineraries={initialItineraries}
  //     countrySlug={countrySlug}
  //     initialError={fetchError}
  //   />
  // );
  return (
    <div className="p-8 text-center text-muted-foreground">
      This country page is currently disabled.
    </div>
  );
}
