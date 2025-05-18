/**
 * TrendingDestinations Component
 * 
 * A carousel of trending destinations using the DestinationCard molecule.
 * 
 * @module destinations/templates
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { API_ROUTES } from '@/utils/constants/routes';
import { DestinationCard } from '@/components/destinations/molecules/DestinationCard';

// ============================================================================
// COMPONENT TYPES
// ============================================================================

interface Destination {
  id: string;
  city: string;
  country: string;
  continent: string;
  description: string | null;
  image_url: string | null;
  emoji?: string | null;
  image_metadata?: {
    alt_text?: string;
    attribution?: string;
  };
  cuisine_rating: number;
  nightlife_rating: number;
  cultural_attractions: number;
  outdoor_activities: number;
  beach_quality: number;
  best_season?: string;
  avg_cost_per_day?: number;
  safety_rating?: number;
  travelers_count: number;
  avg_days: number;
}

interface DestinationsResponse {
  destinations: Destination[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isDestinationsResponse(data: unknown): data is DestinationsResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as any).destinations)
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Add a helper function to safely generate destination URLs
const generateDestinationUrl = (destination: Destination): string => {
  if (!destination.city) {
    return '/destinations/unknown';
  }
  return `/destinations/${destination.city.toLowerCase().replace(/\s+/g, '-')}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TrendingDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDestinations() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ROUTES.DESTINATIONS);
        if (!res.ok) throw new Error('Failed to fetch destinations');
        const data = await res.json();
        if (!isDestinationsResponse(data)) {
          throw new Error('Invalid destinations data');
        }
        if (isMounted) {
          setDestinations(shuffleArray(data.destinations));
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading destinations');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDestinations();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading destinations</AlertTitle>
        <AlertDescription>
          <p>There was a problem loading destinations.</p>
          <details className="mt-2 text-xs">
            <summary>Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
          </details>
        </AlertDescription>
      </Alert>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No destinations found.</p>
      </div>
    );
  }

  // Always use carousel layout
  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {destinations.slice(0, 12).map((destination) => (
          <CarouselItem 
            key={destination.id} 
            className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
          >
            <DestinationCard destination={destination} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-end gap-2 mt-6">
        <CarouselPrevious className="relative static mr-2" />
        <CarouselNext className="relative static" />
      </div>
    </Carousel>
  );
} 