'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, Map, Users, Building2, Plane } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

import { PageHeader } from '@/components/page-header';
import { DestinationCard } from '@/components/destination-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Force dynamic rendering for this page since it uses data fetching
export const dynamic = 'force-dynamic';

// Define country-specific data - this is placeholder data
const COUNTRY_DATA = {
  'france': {
    name: 'France',
    description: 'A country of rich history, stunning architecture, and world-renowned cuisine. From the romantic streets of Paris to the lavender fields of Provence and the glamorous beaches of the French Riviera.',
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
  'japan': {
    name: 'Japan',
    description: 'A fascinating blend of ancient traditions and cutting-edge modernity. Explore serene temples, futuristic cities, stunning natural landscapes, and a culinary scene celebrated worldwide.',
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
  'italy': {
    name: 'Italy',
    description: 'The cradle of European civilization, home to the greatest number of UNESCO World Heritage Sites, and renowned for its cuisine, art, fashion, and beautiful coastlines.',
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
  'australia': {
    name: 'Australia',
    description: 'A vast country of stunning natural beauty, from the Great Barrier Reef to the Outback. Experience unique wildlife, vibrant cities, and relaxed coastal culture.',
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
    description: 'A vast and diverse country offering everything from bustling megacities to breathtaking national parks, with cultural influences from around the world.',
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
  'thailand': {
    name: 'Thailand',
    description: 'Known as the "Land of Smiles," Thailand offers a perfect mix of vibrant city life, ancient temples, and paradise-like beaches with warm tropical climate.',
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

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const [activeTab, setActiveTab] = useState('overview');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get slug from the country param
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
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const supabase = createClient();

        // Fetch destinations for this country
        const { data: destData, error: destError } = await supabase
          .from('destinations')
          .select('*')
          .eq('country', countryData.name)
          .order('popularity', { ascending: false });

        if (destError) throw destError;
        setDestinations(destData || []);

        // Fetch sample itineraries (this would be replaced with real data)
        // In a real implementation, you would query related itineraries for this country
        const { data: itinData, error: itinError } = await supabase
          .from('itineraries')
          .select('*')
          .limit(6);

        if (itinError) throw itinError;
        setItineraries(itinData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [countrySlug, countryData.name]);

  // Split destinations into featured and other
  const featuredDestinations = destinations.slice(0, 6);
  const otherDestinations = destinations.slice(6);

  return (
    <div className="relative">
      {/* Hero section with country cover image */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <Image
          src={countryData.coverImage}
          alt={`${countryData.name} country`}
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
              className={`text-5xl leading-loose md:text-6xl md:leading-loose font-bold mb-4 ${countryData.accentColor ? `text-${countryData.accentColor}` : 'text-primary'}`}
            >
              {countryData.name}
            </motion.h1>
            <motion.p
              className="text-xl max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {countryData.description}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="container pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/continents">Continents</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/countries">Countries</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{countryData.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main content */}
      <div className="container py-12">
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="destinations">Cities</TabsTrigger>
            <TabsTrigger value="itineraries">Itineraries</TabsTrigger>
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
                <h2 className="text-xl font-semibold mb-6">Country Facts</h2>
                <div className="space-y-4">
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Users className={`h-5 w-5 text-${countryData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Population</p>
                      <p className="font-medium">{countryData.stats.population}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Building2 className={`h-5 w-5 text-${countryData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Capital</p>
                      <p className="font-medium">{countryData.stats.capital}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Globe className={`h-5 w-5 text-${countryData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Languages</p>
                      <p className="font-medium">{countryData.stats.languages}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Map className={`h-5 w-5 text-${countryData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="font-medium">{countryData.stats.currency}</p>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center gap-3">
                    <Plane className={`h-5 w-5 text-${countryData.accentColor}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Time Zone</p>
                      <p className="font-medium">{countryData.stats.timezone}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Highlights section */}
              <motion.div
                className="col-span-2 bg-muted/30 p-6 rounded-xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-xl font-semibold mb-6">Highlights</h2>
                <ul className="space-y-3">
                  {countryData.highlights.map((highlight, index) => (
                    <motion.li
                      key={index}
                      variants={itemVariants}
                      className="flex items-start gap-3"
                    >
                      <span className={countryData.accentColor ? `text-${countryData.accentColor}` : 'text-primary'} style={{ fontSize: '1.125rem' }}>•</span>
                      <span>{highlight}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Featured cities preview */}
              <motion.div
                className="col-span-3 mt-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Featured Cities</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('destinations')}
                    className={countryData.accentColor ? `text-${countryData.accentColor}` : 'text-primary'}
                  >
                    View all cities
                  </Button>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                  </div>
                ) : featuredDestinations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredDestinations.slice(0, 3).map((destination) => (
                      <motion.div key={destination.id} variants={itemVariants}>
                        <DestinationCard destination={destination} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-xl">
                    <p className="text-lg mb-4">No cities found for {countryData.name}</p>
                    <p className="text-muted-foreground mb-6">
                      Try exploring other countries or check back later.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="destinations">
            <div className="space-y-8">
              <PageHeader
                heading={`Cities in ${countryData.name}`}
                description={`Explore cities and destinations across ${countryData.name}`}
              />

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : destinations.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold">Popular Cities</h2>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {featuredDestinations.map((destination) => (
                      <motion.div key={destination.id} variants={itemVariants}>
                        <DestinationCard destination={destination} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {otherDestinations.length > 0 && (
                    <>
                      <h2 className="text-2xl font-bold mt-12">More Cities</h2>
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
                <div className="text-center p-12 bg-muted rounded-xl">
                  <h3 className="text-2xl font-semibold mb-2">No cities found</h3>
                  <p className="text-muted-foreground mb-6">
                    We don't have any cities listed in {countryData.name} yet.
                  </p>
                  <Button onClick={() => setActiveTab('overview')}>Back to Overview</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="itineraries">
            <div className="space-y-8">
              <PageHeader
                heading={`Itineraries in ${countryData.name}`}
                description={`Discover popular travel itineraries and experiences in ${countryData.name}`}
              />

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : itineraries.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {itineraries.map((itinerary) => (
                    <motion.div
                      key={itinerary.id}
                      variants={itemVariants}
                      className="rounded-xl overflow-hidden bg-card border shadow-sm"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={itinerary.image_url || '/images/destinations/default.jpg'}
                          alt={itinerary.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-semibold mb-2">{itinerary.title}</h3>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {itinerary.description || 'A wonderful travel itinerary'}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {itinerary.location || countryData.name}
                          </span>
                          <Button size="sm" variant="outline">
                            View Itinerary
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center p-12 bg-muted rounded-xl">
                  <h3 className="text-2xl font-semibold mb-2">No itineraries found</h3>
                  <p className="text-muted-foreground mb-6">
                    We don't have any itineraries for {countryData.name} yet.
                  </p>
                  <Button onClick={() => setActiveTab('overview')}>Back to Overview</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 