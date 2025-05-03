'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

interface Destination {
  id: string;
  name: string;
  city: string;
  state_province: string | null;
  country: string;
  continent: string;
  description: string | null;
  image_url: string | null;
}

interface PlaceSearchProps {
  onPlaceSelect: (place: {
    name: string;
    placeId: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  defaultValue?: string;
}

export function PlaceSearch({
  onPlaceSelect,
  placeholder = 'Search for a place...',
  className = '',
  containerClassName = '',
  defaultValue = '',
}: PlaceSearchProps) {
  const [searchQuery, setSearchQuery] = useState(defaultValue);
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search results when debounced query changes
  useEffect(() => {
    async function fetchDestinations() {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/destinations/search?query=${encodeURIComponent(debouncedSearchQuery)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch destinations');
        }

        const data = await response.json();
        setSearchResults(data.destinations || []);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    fetchDestinations();
  }, [debouncedSearchQuery]);

  const handleSelectPlace = (place: Destination) => {
    setSearchQuery(place.city);
    setSearchResults([]);
    onPlaceSelect({
      name: place.city,
      placeId: place.id,
      // Note: If your destinations table has latitude and longitude, add them here
    });
  };

  return (
    <div className={`relative ${containerClassName}`} ref={searchRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          className={`pl-9 ${className}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          {searchResults.map((place) => (
            <div
              key={place.id}
              className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
              onClick={() => handleSelectPlace(place)}
            >
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="font-medium">{place.city}</p>
                <p className="text-xs text-muted-foreground">
                  {place.state_province ? `${place.state_province}, ` : ''}
                  {place.country} • {place.continent}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}