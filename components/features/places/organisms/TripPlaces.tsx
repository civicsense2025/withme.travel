/**
 * TripPlaces Organism
 *
 * Displays all places associated with a trip.
 * @module components/features/places/organisms/TripPlaces
 */

'use client';

import React from 'react';
import { useState } from 'react';
import { usePlaces } from '@/lib/features/places/hooks';
import { PlaceList } from './PlaceList';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { AddPlaceDialog } from '@/components/features/places/organisms/AddPlaceDialog';
import type { Place } from '@/components/features/places/types';

/**
 * TripPlaces component props
 */
export interface TripPlacesProps {
  /** Trip ID */
  tripId: string;
  /** List of places */
  places: { name: string; imageUrl?: string; description?: string }[];
  /** Additional className for styling */
  className?: string;
}

/**
 * TripPlaces organism for trip places (placeholder)
 */
export function TripPlaces({ tripId, places, className }: TripPlacesProps) {
  // TODO: Implement trip places UI
  return (
    <section className={className}>
      <h3>Places for Trip {tripId}</h3>
      <PlaceList places={places} />
    </section>
  );
}

export default TripPlaces;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Container component that fetches and displays places for a trip
 */
export function TripPlacesContainer({ 
  tripId,
  className = '' 
}: TripPlacesProps) {
  const { places, isLoading, error, refreshPlaces } = usePlaces({ tripId });
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);

  const handleRetry = () => {
    refreshPlaces();
  };

  const handleOpenAddPlace = () => {
    setIsAddPlaceOpen(true);
  };

  const handleCloseAddPlace = () => {
    setIsAddPlaceOpen(false);
  };

  const handlePlaceAdded = (newPlace: Place) => {
    refreshPlaces();
  };

  return (
    <div className={className}>
      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenAddPlace} size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Place
        </Button>
      </div>

      <PlaceList
        places={places}
      />

      {error && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {isAddPlaceOpen && (
        <AddPlaceDialog
          tripId={tripId}
          isOpen={isAddPlaceOpen}
          onClose={handleCloseAddPlace}
          onPlaceAdded={handlePlaceAdded}
        />
      )}
    </div>
  );
} 