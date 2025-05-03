'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Define the structure for the selected place details we care about
export interface SimplePlaceResult {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string;
}

interface GooglePlacesAutocompleteProps {
  label?: string;
  apiKey: string;
  onPlaceSelect: (place: SimplePlaceResult | null) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

// Helper function to load the Google Maps script
const loadGoogleMapsScript = (apiKey: string, callback: () => void) => {
  const existingScript = document.getElementById('googleMapsScript');
  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
    script.id = 'googleMapsScript';
    script.async = true;
    script.defer = true;
    // Make the callback function global
    (window as any).initAutocomplete = callback;
    document.body.appendChild(script);
  } else if (
    (window as any).google &&
    (window as any).google.maps &&
    (window as any).google.maps.places
  ) {
    // If script exists and library loaded, just call callback
    callback();
  } else {
    // If script exists but library not loaded, wait for it
    (window as any).initAutocomplete = callback;
  }
};

export function GooglePlacesAutocomplete({
  label = 'Location',
  apiKey,
  onPlaceSelect,
  initialValue = '',
  placeholder = 'Search for a place...',
  className,
  required = false,
}: GooglePlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteListener = useRef<google.maps.MapsEventListener | null>(null);

  const initAutocompleteService = useCallback(() => {
    const google = (window as any).google;
    if (!google || !google.maps || !google.maps.places || !inputRef.current) {
      console.error('Google Maps Places library not loaded or input ref not available.');
      return;
    }
    setIsScriptLoaded(true); // Mark script as loaded when initialization is attempted

    const service = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'], // Adjust types as needed
      fields: ['place_id', 'name', 'formatted_address', 'geometry.location'],
    });
    setAutocomplete(service);

    // Clean up previous listener if exists
    if (autocompleteListener.current) {
      google.maps.event.removeListener(autocompleteListener.current);
    }

    // Add listener for place selection
    autocompleteListener.current = service.addListener('place_changed', () => {
      const place = service.getPlace();

      if (place.geometry && place.place_id && place.name && place.formatted_address) {
        const result: SimplePlaceResult = {
          name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location?.lat() ?? null,
          longitude: place.geometry.location?.lng() ?? null,
          googlePlaceId: place.place_id,
  };
        setInputValue(place.formatted_address); // Update input with formatted address
        onPlaceSelect(result);
      } else {
        console.warn('Selected place is missing required details:', place);
        // Optionally clear selection or show error
        // onPlaceSelect(null); // Signal that selection was incomplete
      }
    });
  }, [onPlaceSelect]);

  useEffect(() => {
    loadGoogleMapsScript(apiKey, initAutocompleteService);
    // Cleanup function to remove the listener when the component unmounts
    return () => {
      if (autocompleteListener.current && (window as any).google) {
        google.maps.event.removeListener(autocompleteListener.current);
      }
      // Optional: Clean up the global callback if needed, carefully
      // if ((window as any).initAutocomplete === initAutocompleteService) {
      //     delete (window as any).initAutocomplete;
      // }
    };
  }, [apiKey, initAutocompleteService]);

  // Effect to update input value if initialValue changes externally
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.value = ''; // Clear input ref value too
    }
    onPlaceSelect(null); // Signal that selection is cleared
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor="google-places-input">
          {label}
          {required ? ' *' : ''}
        </Label>
      )}
      <div className="relative">
        <Input
          id="google-places-input"
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // Allow typing
          disabled={!isScriptLoaded}
          className="pr-8" // Add padding for clear button
        />
        {!isScriptLoaded && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {isScriptLoaded && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Clear location"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}