'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, Map, Users, CalendarDays, BarChart3 } from 'lucide-react';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';
import { PageHeader } from '@/components/page-header';
import { DestinationCard } from '@/components/destination-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Force dynamic rendering for this page since it uses data fetching
export const dynamic = 'force-dynamic';

// Define the structure matching DestinationCardProps["destination"]
interface Destination {
  id: string;
  city: string;
  country: string;
  continent: string;
  description: string | null;
  byline?: string | null;
  highlights?: string[] | null;
  image_url?: string | null;
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
}

// Define continent-specific data
const CONTINENT_DATA = {
  africa: {
    name: 'Africa',
    description:
      'Africa is a vast and diverse continent known for its stunning landscapes, rich wildlife, vibrant cultures, and ancient history. From the pyramids of Egypt to the savannas of Kenya, Africa offers incredible experiences for every type of traveler.',
    coverImage: '/images/continents/africa.jpg',
    accentColor: 'travel-yellow',
    highlights: [
      'Safari experiences in world-famous national parks',
      'Ancient Egyptian pyramids and historical monuments',
      'Beautiful beaches along the coasts',
      'Diverse cultural experiences across 54 countries',
      'Hiking opportunities on iconic mountains like Kilimanjaro',
    ],
    stats: {
      countries: 54,
      languages: '1,500+',
      area: '30.37 million km²',
      population: '1.4 billion',
    },
  },
  asia: {
    name: 'Asia',
    description:
      "Asia is the world's largest and most diverse continent, offering everything from ancient temples to futuristic cities, spectacular mountain ranges to tropical beaches. With its rich history, vibrant cultures, and technological innovation, Asia provides countless opportunities for exploration.",
    coverImage: '/images/continents/asia.jpg',
    accentColor: 'travel-red',
    highlights: [
      'Ancient wonders like the Great Wall of China',
      'Spiritual centers and temples across the continent',
      'Culinary adventures with diverse food traditions',
      'Beautiful island experiences in Southeast Asia',
      'Shopping and urban exploration in modern megacities',
    ],
    stats: {
      countries: 48,
      languages: '2,300+',
      area: '44.58 million km²',
      population: '4.7 billion',
    },
  },
  europe: {
    name: 'Europe',
    description:
      "Europe offers a rich tapestry of history, culture, and natural beauty packed into a relatively small geographic area. From ancient ruins to Renaissance art, alpine mountains to Mediterranean beaches, Europe's diverse destinations are easily accessible and full of charm.",
    coverImage: '/images/continents/europe.jpg',
    accentColor: 'travel-blue',
    highlights: [
      'Historic city centers with centuries of architecture',
      'World-class museums and art galleries',
      'Diverse culinary traditions and wine regions',
      'Alpine mountain experiences',
      'Mediterranean coastal destinations',
    ],
    stats: {
      countries: 44,
      languages: '200+',
      area: '10.18 million km²',
      population: '748 million',
    },
  },
  'north-america': {
    name: 'North America',
    description:
      'North America spans from the frozen Arctic to the tropical regions near the Equator, offering incredible diversity in landscapes, cultures, and experiences. From bustling cities to pristine wilderness, the continent has something for every traveler.',
    coverImage: '/images/continents/north-america.jpg',
    accentColor: 'travel-purple',
    highlights: [
      'Iconic national parks like Yellowstone and Banff',
      'Vibrant cultural hubs like New York and Mexico City',
      'Diverse landscapes from deserts to mountains',
      'Indigenous cultural heritage sites',
      'Beach destinations in the Caribbean and along both coasts',
    ],
    stats: {
      countries: 23,
      languages: '300+',
      area: '24.71 million km²',
      population: '592 million',
    },
  },
  'south-america': {
    name: 'South America',
    description:
      "South America is a continent of superlatives, home to the world's largest rainforest, longest mountain range, highest waterfall, and driest desert. With its vibrant cultures, ancient civilizations, and extraordinary biodiversity, South America offers unforgettable adventures.",
    coverImage: '/images/continents/south-america.jpg',
    accentColor: 'travel-green',
    highlights: [
      'The Amazon Rainforest and its incredible biodiversity',
      'Historic Inca sites like Machu Picchu',
      'Vibrant cities with rich cultural scenes',
      'Adventure opportunities in the Andes mountains',
      'Breathtaking natural wonders like Iguazu Falls',
    ],
    stats: {
      countries: 12,
      languages: '450+',
      area: '17.84 million km²',
      population: '434 million',
    },
  },
  oceania: {
    name: 'Oceania',
    description:
      'Oceania encompasses Australia, New Zealand, and the islands of the Pacific Ocean, offering stunning natural beauty, unique wildlife, and diverse indigenous cultures. From the outback to coral reefs, volcanic islands to glaciers, Oceania is a paradise for nature lovers.',
    coverImage: '/images/continents/oceania.jpg',
    accentColor: 'travel-mint',
    highlights: [
      'The Great Barrier Reef and marine adventures',
      'Unique wildlife and natural landscapes in Australia',
      'Maori culture and stunning landscapes in New Zealand',
      'Remote island paradises across the Pacific',
      'Ancient indigenous cultural experiences',
    ],
    stats: {
      countries: 14,
      languages: '1,200+',
      area: '8.53 million km²',
      population: '44 million',
    },
  }
  };

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  }
  };

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
  };

export default function ContinentPage() {
  const params = useParams();
  const continentSlug = typeof params?.continent === 'string' ? params.continent : '';
  // Use the defined Destination type for state
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Safely access continent data
  const continentData = CONTINENT_DATA[continentSlug as keyof typeof CONTINENT_DATA] || {
    name: continentSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    description: 'Explore the wonders of this beautiful continent.',
    coverImage: '/images/continents/default.jpg',
    accentColor: 'travel-blue',
    highlights: [],
    stats: { countries: 0, languages: '0', area: '0', population: '0' }
  };

  useEffect(() => {
    async function fetchDestinations() {
      try {
        setIsLoading(true);
        const supabase = createClient();

        // Select all fields needed for the Destination type
        const { data, error } = await supabase
          .from('destinations')
          .select('*') // Ensure '*' fetches all required fields
          .eq('continent', continentData.name)
          .order('popularity', { ascending: false });

        if (error) throw error;

        // Cast fetched data to Destination[] before setting state
        setDestinations((data as Destination[]) || []);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDestinations();
  }, [continentSlug, continentData.name]);

  // These should now be correctly typed as Destination[]
  const topDestinations = destinations.slice(0, 9);
  const otherDestinations = destinations.slice(9);

  return (
    <div className="relative">
      {/* Hero section with continent cover image */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <Image
          src={continentData.coverImage}
          alt={`${continentData.name} continent`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="container text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`text-5xl leading-loose md:text-6xl md:leading-loose font-bold mb-4 text-${continentData.accentColor}`}
            >
              {continentData.name}
            </motion.h1>
            <motion.p
              className="text-xl max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {continentData.description}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-12">
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="trips">Popular Trips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Stats section */}
              <motion.div
                className="col-span-1 bg-muted/30 p-6 rounded-xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-xl font-semibold mb-6 lowercase">Continental Facts</h2>
                <div className="space-y-4">
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Globe className={`h-5 w-5 text-${continentData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Countries</p>
                      <p className="font-medium">{continentData.stats.countries}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Map className={`h-5 w-5 text-${continentData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Area</p>
                      <p className="font-medium">{continentData.stats.area}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Users className={`h-5 w-5 text-${continentData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Population</p>
                      <p className="font-medium">{continentData.stats.population}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <CalendarDays className={`h-5 w-5 text-${continentData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Languages</p>
                      <p className="font-medium">{continentData.stats.languages}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Highlights section */}
              <motion.div
                className="col-span-2 bg-muted/30 p-6 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-6 lowercase">Highlights</h2>
                <ul className="space-y-3">
                  {continentData.highlights.map((highlight, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                    >
                      <span
                        className={`inline-block h-2 w-2 mt-2 rounded-full bg-${continentData.accentColor}`}
                      />
                      <span>{highlight}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Best time to visit section */}
              <motion.div
                className="col-span-1 md:col-span-3 bg-muted/30 p-6 rounded-xl mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-6 lowercase">Travel Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <BarChart3 className={`h-6 w-6 text-${continentData.accentColor} mb-2`} />
                    <h3 className="text-lg font-medium mb-2">Popular Activities</h3>
                    <p className="text-muted-foreground">
                      Activities vary widely across {continentData.name}, from cultural experiences
                      to outdoor adventures. Popular choices include visiting historical sites,
                      experiencing local cuisines, and exploring natural wonders.
                    </p>
                  </div>
                  <div>
                    <CalendarDays className={`h-6 w-6 text-${continentData.accentColor} mb-2`} />
                    <h3 className="text-lg font-medium mb-2">Best Time to Visit</h3>
                    <p className="text-muted-foreground">
                      The ideal time to visit {continentData.name} depends on the specific region
                      and your planned activities. Research the climate patterns of your destination
                      for the best experience.
                    </p>
                  </div>
                  <div>
                    <Globe className={`h-6 w-6 text-${continentData.accentColor} mb-2`} />
                    <h3 className="text-lg font-medium mb-2">Cultural Etiquette</h3>
                    <p className="text-muted-foreground">
                      {continentData.name} has diverse cultures with different customs and
                      traditions. Respect local practices, dress appropriately at religious sites,
                      and learn a few basic phrases in local languages.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Featured destinations preview */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Top Destinations in {continentData.name}</h2>
                <Button
                  variant="link"
                  onClick={() => setActiveTab('destinations')}
                  className="lowercase"
                >
                  View all <span className="ml-1">→</span>
                </Button>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : topDestinations.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {topDestinations.slice(0, 3).map((destination) => (
                    <motion.div key={destination.id} variants={itemVariants}>
                      <DestinationCard destination={destination} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-10 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">
                    No destinations available for this continent yet.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="destinations">
            <div className="space-y-8">
              <PageHeader
                heading={`Destinations in ${continentData.name}`}
                description={`Explore the diverse destinations across ${continentData.name}`}
              />

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : destinations.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold">Top Destinations</h2>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {topDestinations.map((destination) => (
                      <motion.div key={destination.id} variants={itemVariants}>
                        <DestinationCard destination={destination} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {otherDestinations.length > 0 && (
                    <>
                      <h2 className="text-2xl font-bold mt-12">Other Places to Explore</h2>
                      <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {otherDestinations.map((destination) => (
                          <motion.div key={destination.id} variants={itemVariants}>
                            <DestinationCard destination={destination} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-muted/30 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">No destinations available</h3>
                  <p className="text-muted-foreground">
                    We're working on adding destinations for {continentData.name}.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trips">
            <div className="space-y-8">
              <PageHeader
                heading={`Popular Trips in ${continentData.name}`}
                description={`Discover trending itineraries and travel experiences in ${continentData.name}`}
              />

              <div className="text-center py-20 bg-muted/30 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  We're currently curating the best trips for {continentData.name}.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/trips/create">Create your own trip</Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
