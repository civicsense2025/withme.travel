'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface City {
  id: string;
  name: string;
  country: string;
  state_province?: string | null;
  continent?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  population?: number | null;
  image_url?: string | null;
  description?: string | null;
  city_ascii?: string | null;
  iso2?: string | null;
  iso3?: string | null;
  admin_name?: string | null;
  capital?: string | null;
  simple_maps_id?: number | null;
  [key: string]: any;
}

interface CityChipsAutocompleteInputProps {
  selectedCities: City[];
  onChange: (cities: City[]) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
}

// Helper: country code to emoji
const countryCodeToEmoji = (countryCode?: string | null): string => {
  if (!countryCode) return '🌍';
  try {
    const codePoints = [...countryCode.toUpperCase()].map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '🌍';
  }
};

export function CityChipsAutocompleteInput({
  selectedCities = [],
  onChange,
  disabled = false,
  label = 'Cities to Visit',
  placeholder = 'Search for a city...',
  emptyMessage = 'Add cities to your trip by searching or selecting from popular destinations',
}: CityChipsAutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    const timer = setTimeout(() => {
      searchCities(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchCities = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/cities/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      if (!response.ok) throw new Error('Failed to search cities');
      const data = await response.json();
      // Filter out already selected cities
      const filteredResults = (data.cities || []).filter(
        (city: City) => !selectedCities.some((selected) => selected.id === city.id)
      );
      setResults(filteredResults);
      setShowResults(true);
      setFocusedResultIndex(-1);
    } catch (err) {
      setError('Failed to search cities');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (city: City) => {
    if (!selectedCities.some((c) => c.id === city.id)) {
      onChange([...selectedCities, city]);
    }
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const handleRemoveCity = (event: React.MouseEvent, cityId: string) => {
    event.stopPropagation();
    onChange(selectedCities.filter((c) => c.id !== cityId));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (showResults && results.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedResultIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedResultIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (event.key === 'Enter' && focusedResultIndex >= 0) {
        event.preventDefault();
        handleSelectCity(results[focusedResultIndex]);
      } else if (event.key === 'Escape') {
        setShowResults(false);
        setFocusedResultIndex(-1);
      }
    } else if (event.key === 'Backspace' && query === '' && selectedCities.length > 0) {
      onChange(selectedCities.slice(0, -1));
    }
  };

  // Get emoji for a city
  const getCityEmoji = (city: City): string => {
    if (city.iso2) return countryCodeToEmoji(city.iso2);
    return '🌍';
  };

  return (
    <div className="space-y-2" ref={searchRef}>
      {label && <Label className="block">{label}</Label>}
      <div className="border rounded-md p-2 bg-background min-h-[80px] focus-within:ring-1 focus-within:ring-ring">
        <div className="flex flex-wrap gap-2 items-center">
          {selectedCities.map((city) => (
            <Badge
              key={city.id}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 h-auto text-sm"
            >
              <span className="mr-1">{getCityEmoji(city)}</span>
              {city.name}
              {city.country ? (
                <span className="ml-1 text-muted-foreground">{city.country}</span>
              ) : null}
              {!disabled && (
                <button
                  type="button"
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                  onClick={(e) => handleRemoveCity(e, city.id)}
                  aria-label={`Remove ${city.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          <div className="flex-1 min-w-[120px]">
            <Input
              ref={inputRef}
              type="text"
              placeholder={selectedCities.length === 0 ? placeholder : 'Add another city...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowResults(true)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="border-0 p-0 h-8 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
            />
          </div>
        </div>
        {selectedCities.length === 0 && query === '' && (
          <div className="text-sm text-muted-foreground py-1">{emptyMessage}</div>
        )}
      </div>
      {showResults && (
        <div className="relative">
          {loading && (
            <div className="absolute right-3 top-3 z-10">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {results.length > 0 ? (
            <Card className="absolute z-50 mt-1 w-full max-h-60 overflow-auto shadow-lg">
              <ul ref={resultsRef} className="py-1">
                {results.map((city, index) => (
                  <li
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className={`px-3 py-2 hover:bg-muted cursor-pointer flex items-center justify-between ${
                      index === focusedResultIndex ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{getCityEmoji(city)}</span>
                      <span className="font-medium">{city.name}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        {city.admin_name && `${city.admin_name}, `}
                        {city.country}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            query.length >= 2 &&
            !loading && (
              <Card className="absolute z-50 mt-1 w-full shadow-lg py-3 px-4 text-center text-sm text-muted-foreground">
                No cities found. Try a different search term.
              </Card>
            )
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
