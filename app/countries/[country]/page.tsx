import { createClient } from '@/utils/supabase/client';
import CountryPageClient from './CountryPageClient';

// Force dynamic rendering for this page since it uses data fetching
export const dynamic = 'force-dynamic';

// Define country-specific data - this is placeholder data
const COUNTRY_DATA = {
  france: {
    name: 'France',
    description:
      'A country of rich history, stunning architecture, and world-renowned cuisine. From the romantic streets of Paris to the lavender fields of Provence and the glamorous beaches of the French Riviera.',
    coverImage: '/images/destinations/paris-eiffel-tower.jpg',
    accentColor: 'travel-blue',
    highlights: [
      'World-class museums and galleries in Paris',
      'Exceptional food and wine culture throughout the country',
      'Iconic architectural landmarks from châteaux to cathedrals',
      'Stunning diverse landscapes from Alps to Mediterranean coast',
      'Charming villages and historic towns rich in heritage',
    ],
    stats: {
      population: '67 million',
      capital: 'Paris',
      languages: 'French',
      currency: 'Euro (€)',
      timezone: 'CET/CEST',
    },
  },
  japan: {
    name: 'Japan',
    description:
      'A fascinating blend of ancient traditions and cutting-edge modernity. Explore serene temples, futuristic cities, stunning natural landscapes, and a culinary scene celebrated worldwide.',
    coverImage: '/images/destinations/kyoto-bamboo-forest.jpg',
    accentColor: 'travel-red',
    highlights: [
      'Ancient temples and shrines in Kyoto',
      'Vibrant urban landscape of Tokyo',
      'Beautiful sakura (cherry blossom) season in spring',
      'World-renowned cuisine from sushi to ramen',
      'Stunning natural scenery including Mount Fuji',
    ],
    stats: {
      population: '126 million',
      capital: 'Tokyo',
      languages: 'Japanese',
      currency: 'Yen (¥)',
      timezone: 'JST',
    },
  },
  italy: {
    name: 'Italy',
    description:
      'The cradle of European civilization, home to the greatest number of UNESCO World Heritage Sites, and renowned for its cuisine, art, fashion, and beautiful coastlines.',
    coverImage: '/images/destinations/rome-colosseum.jpg',
    accentColor: 'travel-green',
    highlights: [
      'Ancient ruins and history in Rome',
      'Renaissance art and architecture in Florence',
      'Romantic canals of Venice',
      'Spectacular Amalfi Coast',
      'World-famous cuisine and wine regions',
    ],
    stats: {
      population: '60 million',
      capital: 'Rome',
      languages: 'Italian',
      currency: 'Euro (€)',
      timezone: 'CET/CEST',
    },
  },
  australia: {
    name: 'Australia',
    description:
      'A vast country of stunning natural beauty, from the Great Barrier Reef to the Outback. Experience unique wildlife, vibrant cities, and relaxed coastal culture.',
    coverImage: '/images/destinations/sydney-opera-house.jpg',
    accentColor: 'travel-yellow',
    highlights: [
      'Iconic Sydney Opera House and Harbour Bridge',
      'The Great Barrier Reef marine experience',
      'Aboriginal cultural heritage',
      'Unique wildlife found nowhere else on Earth',
      'Beautiful beaches and coastal lifestyle',
    ],
    stats: {
      population: '25 million',
      capital: 'Canberra',
      languages: 'English',
      currency: 'Australian Dollar (A$)',
      timezone: 'Various (AEST/ACST/AWST)',
    },
  },
  'united-states': {
    name: 'United States',
    description:
      'A vast and diverse country offering everything from bustling megacities to breathtaking national parks, with cultural influences from around the world.',
    coverImage: '/images/destinations/los-angeles-united-states.jpg',
    accentColor: 'travel-purple',
    highlights: [
      'Diverse and vibrant cities like New York and San Francisco',
      'Stunning national parks including Yellowstone and Grand Canyon',
      'Cultural institutions and museums in Washington DC',
      'Entertainment capital of Los Angeles and Hollywood',
      'Diverse food scene reflecting multicultural influences',
    ],
    stats: {
      population: '331 million',
      capital: 'Washington, D.C.',
      languages: 'English (primarily)',
      currency: 'US Dollar ($)',
      timezone: 'Multiple time zones',
    },
  },
  thailand: {
    name: 'Thailand',
    description:
      'Known as the "Land of Smiles," Thailand offers a perfect mix of vibrant city life, ancient temples, and paradise-like beaches with warm tropical climate.',
    coverImage: '/images/destinations/bangkok-grand-palace.jpg',
    accentColor: 'travel-mint',
    highlights: [
      'Ornate temples and palaces in Bangkok',
      'Pristine beaches and islands in the south',
      'Rich cultural heritage and traditions',
      'World-famous street food and cuisine',
      'Friendly locals and warm hospitality',
    ],
    stats: {
      population: '69 million',
      capital: 'Bangkok',
      languages: 'Thai',
      currency: 'Thai Baht (฿)',
      timezone: 'ICT',
    },
  },
};

// Type definition for destination
interface Destination {
  id: string;
  name: string | null;
  city: string;
  country: string;
  continent: string;
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

  // Safely access country data
  const countryData = COUNTRY_DATA[countrySlug as keyof typeof COUNTRY_DATA] || {
    name: countrySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    description: 'Explore the wonders of this beautiful country.',
    coverImage: '/images/destinations/default.jpg',
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
    const supabase = createClient();
    
    // Fetch destinations
    const { data: destData, error: destError } = await supabase
      .from('destinations')
      .select('*')
      .eq('country', countryData.name)
      .limit(12);

    if (destError) {
      console.error('Error fetching destinations:', destError);
      fetchError = 'Failed to load destinations.';
    } else {
      initialDestinations = destData || [];
    }

    // Fetch itineraries
    const { data: itinData, error: itinError } = await supabase
      .from('itineraries') 
      .select('*')
      .eq('is_public', true)
      .limit(6);

    if (itinError) {
      console.error('Error fetching itineraries:', itinError);
      fetchError = fetchError ? `${fetchError} Failed to load itineraries.` : 'Failed to load itineraries.';
    } else {
      initialItineraries = itinData || [];
    }

  } catch (error) {
    console.error('Server-side fetch error:', error);
    fetchError = 'An error occurred while loading country data.';
  }

  // Render the Client Component with fetched data as props
  return (
    <CountryPageClient 
      countryData={countryData}
      initialDestinations={initialDestinations}
      initialItineraries={initialItineraries}
      countrySlug={countrySlug}
      initialError={fetchError}
    />
  );
}
