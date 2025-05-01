'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/constants';
import { DestinationCard } from '@/components/destination-card';

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

// Fetcher function for SWR
const fetcher = async (url: string): Promise<DestinationsResponse> => {
  try {
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url, {
      signal: controller.signal,
      // Add cache control headers to help with caching
      headers: {
        'Cache-Control': 'max-age=3600', // Cache for 1 hour
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`Failed to fetch data: ${res.status} ${errorData}`);
    }
    return res.json();
  } catch (error) {
    console.error('Fetcher error:', error);
    // Return a fallback empty response instead of throwing
    return { destinations: [] };
  }
};

// Fisher-Yates (Knuth) Shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;
  const newArray = [...array]; // Create a copy to avoid modifying the original

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex],
      newArray[currentIndex],
    ];
  }

  return newArray;
}

export function TrendingDestinations() {
  const router = useRouter();
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [shuffledDestinations, setShuffledDestinations] = useState<Destination[]>([]);

  // Using SWR for data fetching with stale-while-revalidate strategy
  const { data, error, isValidating } = useSWR<DestinationsResponse>(
    API_ENDPOINTS.TRENDING_DESTINATIONS + '&limit=8',
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate when window gets focus
      revalidateIfStale: true, // Revalidate if data is stale
      dedupingInterval: 60000, // Dedupe requests within 1 minute
      errorRetryCount: 3, // Retry 3 times on failure
      onError: (err) => {
        console.error('SWR Error:', err);
        setErrorDetails(err.message || 'Unknown error');
      },
    }
  );

  const destinations = data?.destinations || [];
  const isLoading = !data && !error;

  // Shuffle destinations once data is loaded and limit to 8
  useEffect(() => {
    const localDestinations = data?.destinations || [];
    if (localDestinations.length > 0 && shuffledDestinations.length === 0) {
      // Take only up to 8 destinations
      const limitedDestinations = shuffleArray(localDestinations).slice(0, 8);
      setShuffledDestinations(limitedDestinations);
    }
    // Only run when destinations data changes (and shuffledDestinations is empty initially)
  }, [data, shuffledDestinations.length]);

  if (isLoading) {
    return (
      <div className="flex space-x-4 overflow-hidden w-full">
        {[...Array(3)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="aspect-[3/4] rounded-xl overflow-hidden bg-muted animate-pulse w-[calc(50%-8px)] md:w-[calc(33.333%-12px)] flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  // Show error details for debugging
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading destinations</AlertTitle>
        <AlertDescription>
          <p>There was a problem loading destinations.</p>
          {errorDetails && (
            <details className="mt-2 text-xs">
              <summary>Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{errorDetails}</pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // If no destinations after loading, show empty state
  if (shuffledDestinations.length === 0 && !isLoading && !error) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No trending destinations found.</p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000, // 5 seconds delay
          stopOnInteraction: true, // Stop autoplay on user interaction
          stopOnMouseEnter: true, // Stop autoplay when hovering over the carousel
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {shuffledDestinations.map((destination: Destination, index: number) => (
          <CarouselItem
            key={destination.id || `dest-${index}`}
            className="pl-2 md:pl-4 basis-[50%] md:basis-[33.333%]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.15,
                ease: 'easeOut',
              }}
              className="h-full"
            >
              <DestinationCard
                destination={destination}
                href={`/destinations/${destination.city.toLowerCase().replace(/\s+/g, '-')}`}
                hideAttributionMobile
              />
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />

      {isValidating && !isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="h-1 w-10 bg-travel-purple/50 rounded-full animate-pulse"></div>
        </div>
      )}
    </Carousel>
  );
}
