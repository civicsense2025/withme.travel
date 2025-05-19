/**
 * Destinations Page
 *
 * Page displaying all destinations with filtering options
 */

import React from 'react';
import { DestinationGrid } from '@/components/features/destinations/organisms/DestinationGrid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { listDestinations } from '@/lib/api/destinations';

// Centralized API and utility imports
import { useDestinations } from '@/lib/hooks/use-destinations';
import DestinationsClient from './destinations-client';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
const DEFAULT_LIMIT = 20;

/**
 * Error fallback component for the destinations page
 */
function DestinationsErrorFallback({ error }: { error: Error }) {
  return (
    <Alert variant="destructive" className="my-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error loading destinations</AlertTitle>
      <AlertDescription>
        {error.message || 'Something went wrong. Please try again later.'}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Destinations page showing all available destinations with filtering
 */
export default async function DestinationsPage() {
  const result = await listDestinations();
  const destinations = result.success ? result.data : [];

  return (
    <main className="container py-8 md:py-12">
      <DestinationsClient destinations={result.success ? result.data.destinations : []} />
    </main>
  );
}

/**
 * Metadata for the destinations page
 */
export const metadata = {
  title: 'Explore Destinations | withme.travel',
  description: 'Discover and explore amazing destinations around the world with withme.travel',
};
