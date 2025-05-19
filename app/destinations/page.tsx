/**
 * Destinations Page
 *
 * Page displaying all destinations with filtering options
 */

import React from 'react';
import { DestinationGrid } from '@/components/features/destinations/organisms/DestinationGrid';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Centralized API and utility imports
import { useDestinations } from '@/lib/hooks/use-destinations';
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
export default function DestinationsPage() {
  // NOTE: Fixing hook usage to match the correct return type and options for useDestinations.
  // - Remove 'data' and 'reload' destructuring (not present on UseDestinationsReturn)
  // - Pass no options, as 'limit' is not a valid option
  // - Use 'destinations', 'isLoading', and 'error' as returned by the hook

  const { destinations, isLoading, error } = useDestinations();

  return (
    <main className="container py-8 md:py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Explore Destinations</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover amazing places around the world and start planning your next adventure with
          friends.
        </p>
      </header>

      {isLoading && (
        <div className="py-12 text-center text-muted-foreground">Loading destinations…</div>
      )}
      {error && <DestinationsErrorFallback error={error} />}
      {!isLoading && !error && destinations && destinations.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">No destinations found.</div>
      )}
      {!isLoading && !error && destinations && destinations.length > 0 && (
        <DestinationGrid
          destinations={destinations.map((dest: Destination) => ({
            id: dest.id,
            city: dest.name || '',
            country: dest.country || '',
            image_url: dest.image_url || '/images/default-destination.jpg',
            // 'emoji' property does not exist on type 'Destination', so we omit it to fix the type error
          }))}
          showSearch={false}
          showFilters={false}
          showSorting={false}
          columns={{ sm: 1, md: 2, lg: 3 }}
          className="mb-8"
        />
      )}
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
