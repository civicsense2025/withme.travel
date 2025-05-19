/**
 * TrendingDestinations Component
 * 
 * Shows a grid of trending destinations.
 * 
 * @module destinations/templates
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { DestinationCard } from '@/components/features/destinations/molecules/DestinationCard';
import { useDestinations } from '@/lib/hooks';
import type { Destination, DestinationFilter } from '@/lib/features/destinations/types';
import { adaptDestinationForDisplay } from '@/lib/features/destinations/types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TrendingDestinations() {
  // Define the filter with explicit number type
  const filters: DestinationFilter = {
    limit: 8 // This is a number literal, not a string
  };
  
  const { destinations, isLoading, error } = useDestinations(filters);
  const [shuffledDestinations, setShuffledDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    if (destinations.length > 0) {
      setShuffledDestinations(shuffleArray(destinations));
    }
  }, [destinations]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading destinations</AlertTitle>
        <AlertDescription>
          <p>There was a problem loading destinations.</p>
          <details className="mt-2 text-xs">
            <summary>Error details</summary>
            <p className="mt-2 whitespace-pre-wrap">{error}</p>
          </details>
        </AlertDescription>
      </Alert>
    );
  }

  if (shuffledDestinations.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No destinations found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
      {shuffledDestinations.map((destination) => (
        <div key={destination.id} className="p-1">
          <DestinationCard destination={adaptDestinationForDisplay(destination)} />
        </div>
      ))}
    </div>
  );
} 