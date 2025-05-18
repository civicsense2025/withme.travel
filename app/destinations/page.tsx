/**
 * Destinations Page
 *
 * Page displaying all destinations with filtering options
 */

import React from 'react';
import { Metadata } from 'next';
import { DestinationGrid } from '@/components/destinations/organisms/DestinationGrid';
import { listDestinations } from '@/lib/api/destinations';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explore Destinations | withme.travel',
  description: 'Discover and explore amazing destinations around the world with withme.travel',
};

// Default number of destinations to show initially
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
  // Fetch destinations from the API
  const destinationsResult = await listDestinations({ limit: DEFAULT_LIMIT });
  
  // Check if the API returned an error
  if (!destinationsResult.success) {
    return (
      <div className="container py-8 md:py-12">
        <DestinationsErrorFallback error={new Error(destinationsResult.error)} />
      </div>
    );
  }
  
  const destinations = destinationsResult.data;

  return (
    <main className="container py-8 md:py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Explore Destinations
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover amazing places around the world and start planning your next adventure with friends.
        </p>
      </header>

      <ErrorBoundary FallbackComponent={DestinationsErrorFallback}>
      <DestinationGrid
        destinations={destinations}
        showSearch={true}
        showFilters={true}
        showSorting={true}
        columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
          className="mb-8"
      />
      </ErrorBoundary>
    </main>
  );
}
