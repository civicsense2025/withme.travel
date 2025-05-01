'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/components/ui/input';
import { Place } from '@/types/places'; // Assuming Place type exists
import { useToast } from '@/components/ui/use-toast'; // Assuming you use Shadcn toasts

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: Place | null, googlePlaceDetails?: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export function PlaceAutocomplete({
  onPlaceSelect,
  placeholder = 'Search for a location',
  initialValue = '',
  className,
}: PlaceAutocompleteProps) {
  const placesLibrary = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const [autoComplete, setAutoComplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const { toast } = useToast(); // Get toast function

  // Handler for when a place is selected from the dropdown
  const handlePlaceChanged = useCallback(
    (acInstance: google.maps.places.Autocomplete) => {
      const googlePlace = acInstance.getPlace();

      if (googlePlace?.geometry?.location) {
        console.log('Google Place Selected:', googlePlace);

        // Update the input field visually
        setInputValue(googlePlace.formatted_address || googlePlace.name || '');

        // Construct a basic Place object (adapt based on your Place type)
        // TODO: Properly map googlePlace to your Place type
        const placeDetails: Partial<Place> = {
          // Use Partial<Place> for now
          id: googlePlace.place_id || '', // Use place_id as our internal ID? Or generate one?
          name: googlePlace.name || 'Unknown Place',
          address: googlePlace.formatted_address || '',
          latitude: googlePlace.geometry.location.lat(),
          longitude: googlePlace.geometry.location.lng(),
          // Map other relevant fields if needed (types, etc.)
          google_place_id: googlePlace.place_id, // Store original ID if needed
          tags: googlePlace.types || [],
        };

        // Cast to Place for the callback, assuming the parent handles partial data
        onPlaceSelect(placeDetails as Place, googlePlace);
      } else {
        console.warn('Selected place details incomplete or invalid:', googlePlace);
        onPlaceSelect(null, googlePlace); // Pass null if invalid
      }
    },
    [onPlaceSelect]
  );

  // Initialize the Autocomplete service
  useEffect(() => {
    if (!placesLibrary || !inputRef.current) {
      return;
    }

    // Prevent re-initialization if autoComplete instance already exists
    if (autoComplete) {
      return;
    }

    try {
      const options = {
        fields: [
          'address_components',
          'geometry',
          'icon',
          'name',
          'formatted_address',
          'place_id',
          'types',
        ],
      };
      const newAutoComplete = new placesLibrary.Autocomplete(inputRef.current, options);
      setAutoComplete(newAutoComplete); // Store the instance

      // Add the listener
      const listener = newAutoComplete.addListener('place_changed', () => {
        handlePlaceChanged(newAutoComplete);
      });

      // Cleanup listener on component unmount OR when dependencies change
      return () => {
        if (newAutoComplete) {
          // Use the specific listener variable for removal
          google.maps.event.removeListener(listener);
          // Additionally clear all listeners for the instance, just in case
          google.maps.event.clearInstanceListeners(newAutoComplete);
        }
      };
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
    // Dependencies: Run only when library is loaded or the handler changes
  }, [placesLibrary, handlePlaceChanged, autoComplete]);

  // Handle manual input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    // Optionally clear selection if user types manually after selecting?
    // onPlaceSelect(null);
  };

  // Sync input value with initialValue prop changes
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        type="text"
        // Add any necessary styling or classes
      />
      {/* Add any necessary loading spinner or error handling */}
    </div>
  );
}
