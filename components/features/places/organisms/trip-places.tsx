/**
 * TripPlaces Component
 * 
 * Container component that fetches and displays places for a trip
 */

'use client';

import { useState } from 'react';
import { usePlaces } from '@/lib/features/places/hooks';
import { PlaceList } from './place-list';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { AddPlaceDialog } from './add-place-dialog';
import type { Place } from '@/components/features/places/types';

// ============================================================================
// TYPES
// ============================================================================

export interface TripPlacesProps {
  /** ID of the trip to display places for */
  tripId: string;
  /** Whether to enable adding new places */
  canEdit?: boolean;
  /** Function called when a place is selected */
  onSelectPlace?: (placeId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Container component that fetches and displays places for a trip
 */
export function TripPlaces({ 
  tripId,
  canEdit = false,
  onSelectPlace,
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
      {canEdit && (
        <div className="flex justify-end mb-4">
          <Button onClick={handleOpenAddPlace} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Place
          </Button>
        </div>
      )}

      <PlaceList
        places={places}
        isLoading={isLoading}
        error={error || ''}
        onSelectPlace={onSelectPlace}
      />

      {error && (
        <div className="flex justify-center mt-4">
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {canEdit && (
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