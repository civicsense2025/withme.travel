'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Map, Users, Building2, Plane } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { DestinationCard } from '@/components/destination-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

// Animation variants for motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// Type definition for destination and itinerary (types are duplicated from the server-side file)
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

interface Itinerary {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  [key: string]: any;
}

// Type for the country data
type CountryData = {
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
};

// Props for the client component
interface CountryPageClientProps {
  countryData: CountryData;
  initialDestinations: Destination[];
  initialItineraries: Itinerary[];
  countrySlug: string;
  initialError?: string | null;
}

// Client component that receives data from the server component
export default function CountryPageClient({
  countryData,
  initialDestinations,
  initialItineraries,
  countrySlug,
  initialError,
}: CountryPageClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [itineraries, setItineraries] = useState<Itinerary[]>(initialItineraries);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  useEffect(() => {
    console.log('CountryPageClient mounted with initial data for:', countrySlug);
  }, [countrySlug]);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/countries">Countries</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{countryData.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Header Section */}
      <PageHeader
        heading={countryData.name}
        description={countryData.description}
        className="pb-8"
      />
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-1/2 mx-auto mb-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="destinations">Destinations ({destinations.length})</TabsTrigger>
            <TabsTrigger value="itineraries">Itineraries ({itineraries.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-10"
            >
              {/* Highlights */}
              <motion.div
                variants={itemVariants}
                className="bg-card p-6 rounded-lg shadow-sm border"
              >
                <h3 className={`text-xl font-semibold mb-4 text-${countryData.accentColor}`}>
                  Highlights
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {countryData.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </motion.div>

              {/* Key Stats */}
              <motion.div
                variants={itemVariants}
                className="bg-card p-6 rounded-lg shadow-sm border"
              >
                <h3 className={`text-xl font-semibold mb-4 text-${countryData.accentColor}`}>
                  Key Stats
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Population: {countryData.stats.population}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Capital: {countryData.stats.capital}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Languages: {countryData.stats.languages}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>💰</span>
                    <span>Currency: {countryData.stats.currency}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    <span>Timezone: {countryData.stats.timezone}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Destinations Tab */}
          <TabsContent value="destinations">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : destinations.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {destinations.map((dest) => (
                  <motion.div
                    variants={itemVariants}
                    key={dest.id}
                    className="bg-card p-4 rounded-lg shadow-sm border"
                  >
                    <DestinationCard destination={{ ...dest, name: dest.name ?? undefined }} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-muted-foreground">
                No destinations found for this country yet.
              </p>
            )}
          </TabsContent>

          {/* Itineraries Tab */}
          <TabsContent value="itineraries">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[250px] w-full rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : itineraries.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {itineraries.map((it) => (
                  <motion.div
                    variants={itemVariants}
                    key={it.id}
                    className="bg-card p-4 rounded-lg shadow-sm border"
                  >
                    <Link href={`/itineraries/${it.id}`} className="block h-full">
                      <div className="mb-2 flex justify-between items-start">
                        <h3 className="text-lg font-semibold">{it.title}</h3>
                        {it.location && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {it.location}
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground text-sm mb-3">
                        {it.description || 'No description available.'}
                      </p>

                      <Button size="sm" variant="outline">
                        View Itinerary
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-muted-foreground">
                No public itineraries found for this country yet.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
