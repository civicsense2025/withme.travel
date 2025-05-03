'use client';

import { API_ROUTES } from '@/utils/constants/routes';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
// Update API route constant if you have one, otherwise use string directly
//

// --- Define Mapbox Feature Structure (subset needed) ---
// This should align with the structure returned by your /api/mapbox/search route
interface MapboxFeature {
  id: string;
  place_name: string; // Full address/name string
  center: [number, number]; // [longitude, latitude]
  context?: Array<{
    id: string;
    short_code?: string; // e.g., 'us', 'us-wa'
    text: string; // e.g., 'Seattle', 'Washington', 'United States'
  }>;
  // Add other fields if needed for display or processing
}

// --- Define Output Structure for onLocationSelect ---
// This is the structured data we want to pass *out* of this component
export interface MapboxPlace {
  id: string;
  name: string; // The primary name (e.g., "Capitol Hill")
  address: string; // The full place_name string
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string; // e.g., 'US'
  latitude?: number;
  longitude?: number;
}

interface LocationSearchProps {
  onLocationSelect: (location: MapboxPlace | null) => void; // Updated type
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  initialValue?: string;
  onClear?: () => void;
}

export function LocationSearch({
  onLocationSelect,
  placeholder = 'Search place or address...', // Updated placeholder
  className = '',
  containerClassName = '',
  initialValue = '',
  onClear,
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue || '');
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Initialize with initial value when the prop changes
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch logic using the new Mapbox proxy route
  useEffect(() => {
    async function fetchMapboxPlaces() {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      // Check if the query looks like it came from a previous selection
      // If the current query is exactly the `place_name` of a previously selected item,
      // don't re-search. This prevents flashing results when clicking away and back.
      // This requires storing the last selected place_name if desired.
      // For simplicity, we'll skip this check for now.

      try {
        setSearchError(null);
        setIsSearching(true);
        // Call the new backend proxy route
        const response = await fetch(
          `/api/mapbox/search?query=${encodeURIComponent(debouncedSearchQuery)}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch locations: ${response.status}`);
        }

        const data = await response.json();
        // Expecting { features: MapboxFeature[] }
        setSearchResults(data.features || []);
      } catch (error: any) {
        // Explicitly type error as any or unknown
        console.error('Error fetching Mapbox places:', error);
        setSearchResults([]);
        setSearchError('Unable to search locations. Please try again later.');
      } finally {
        setIsSearching(false);
      }
    }
    fetchMapboxPlaces();
  }, [debouncedSearchQuery]);

  // --- Handle Location Selection ---
  const handleSelectLocation = (feature: MapboxFeature) => {
    // Set the input display value to the full place name
    setSearchQuery(feature.place_name);
    setSearchResults([]); // Hide results dropdown

    // --- Parse the Mapbox Feature into our desired MapboxPlace structure ---
    let city: string | undefined;
    let state: string | undefined;
    let country: string | undefined;
    let countryCode: string | undefined;
    let primaryName = feature.place_name; // Default name to full place_name

    // Try to extract a more specific name (e.g., POI name, address number)
    // This logic might need refinement based on Mapbox response structure variations
    const firstCommaIndex = feature.place_name.indexOf(',');
    if (firstCommaIndex > 0) {
      primaryName = feature.place_name.substring(0, firstCommaIndex).trim();
    }

    // Extract context info (often has city, state, country)
    feature.context?.forEach((ctx) => {
      const type = ctx.id.split('.')[0]; // e.g., 'place', 'region', 'country'
      if (type === 'place') {
        city = ctx.text;
      } else if (type === 'region') {
        state = ctx.text;
      } else if (type === 'country') {
        country = ctx.text;
        countryCode = ctx.short_code?.toUpperCase();
      }
    });

    // Construct the MapboxPlace object to pass out
    const selectedPlace: MapboxPlace = {
      id: feature.id,
      name: primaryName, // Use the parsed or default primary name
      address: feature.place_name, // The full string
      city: city,
      state: state,
      country: country,
      countryCode: countryCode,
      latitude: feature.center[1], // Latitude is the second element
      longitude: feature.center[0], // Longitude is the first element
    };
    // --- End Parsing ---

    onLocationSelect(selectedPlace); // Pass structured data out
  };
  // --- End Handle Location Selection ---

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    if (onClear) {
      onClear();
    }
    onLocationSelect(null); // Notify parent that selection is cleared
  };

  return (
    <div className={`relative ${containerClassName}`} ref={searchRef}>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className={`pl-10 pr-10 py-2 ${className}`} // Ensure space for clear button
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off" // Prevent browser autocomplete interfering
        />
        {/* Clear Button - always show if text exists and onClear is provided */}
        {searchQuery && onClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground z-10" // z-index to be above loader
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {/* Loading Spinner - show only when searching and input isn't empty */}
        {isSearching && searchQuery && (
          <div
            className="absolute right-10 top-1/2 -translate-y-1/2" // Adjust position if clear button exists
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {searchError && <div className="mt-1 text-sm text-destructive">{searchError}</div>}

      {/* Update rendering logic for Mapbox features */}
      {searchResults.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((feature) => (
            <div
              key={feature.id}
              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
              onClick={() => handleSelectLocation(feature)}
            >
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                {/* Display the full place name from Mapbox */}
                <p className="font-medium text-sm">{feature.place_name}</p>
                {/* Optionally display context like city/country if needed */}
                {/* <p className="text-xs text-muted-foreground">Context: {feature.context?.map(c => c.text).join(', ')}</p> */}
              </div>
            </div>
          ))}
          {/* Add Mapbox attribution if required by terms */}
          <div className="text-xs text-muted-foreground text-right px-3 py-1 border-t">
            Results from Mapbox
          </div>
        </div>
      )}
    </div>
  );
}
