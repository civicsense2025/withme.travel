'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, MapPin, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface City {
  id: string;
  name: string;
  city_ascii?: string;
  country: string;
  admin_name?: string;
  is_destination?: boolean;
  is_country_search?: boolean;
}

interface CitySearchResponse {
  cities: City[];
  is_country_search?: boolean;
  country_name?: string;
}

interface CitySearchInputProps {
  onSelect: (city: City) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CitySearchInput({
  onSelect,
  label = 'Search for a city',
  placeholder = 'Search cities...',
  disabled = false,
}: CitySearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isCountrySearch, setIsCountrySearch] = useState(false);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Effect for clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
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

  const searchCities = async (searchQuery: string, countryLimit = 20) => {
    if (!searchQuery || searchQuery.length < 2) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/cities/search?q=${encodeURIComponent(searchQuery)}&limit=10&countryLimit=${countryLimit}`
      );
      if (!response.ok) {
        throw new Error('Failed to search cities');
      }

      const data: CitySearchResponse = await response.json();
      setResults(data.cities || []);
      setIsCountrySearch(data.is_country_search === true);
      setCountryName(data.country_name || null);
      setHasMoreResults(
        data.is_country_search === true && (data.cities || []).length >= countryLimit
      );
      setShowResults(true);
    } catch (err) {
      console.error('Error searching cities:', err);
      setError('Failed to search cities');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreCityResults = () => {
    if (countryName) {
      searchCities(countryName, 50);
    }
  };

  const handleSelectCity = (city: City) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    onSelect(city);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className="relative space-y-2" ref={searchRef}>
      {label && <Label>{label}</Label>}

      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 1 && setShowResults(true)}
          disabled={disabled}
          className="pl-9"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute z-50 mt-1 w-full max-h-80 overflow-auto shadow-lg">
          {isCountrySearch && countryName && (
            <div className="px-3 py-2 bg-muted/50 border-b flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Cities in {countryName}</span>
            </div>
          )}

          <ul className="py-1">
            {results.map((city) => (
              <li
                key={city.id}
                onClick={() => handleSelectCity(city)}
                className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{city.name}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {city.admin_name && `${city.admin_name}, `}
                    {city.country}
                  </span>
                </div>
                {city.is_destination && (
                  <Badge
                    variant="outline"
                    className="ml-2 text-yellow-600 border-yellow-300 bg-yellow-50"
                  >
                    Featured
                  </Badge>
                )}
              </li>
            ))}
          </ul>

          {isCountrySearch && hasMoreResults && (
            <div className="px-3 py-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm flex items-center justify-center"
                onClick={loadMoreCityResults}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Load more cities
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      )}

      {showResults && query.length > 1 && results.length === 0 && !loading && (
        <Card className="absolute z-50 mt-1 w-full shadow-lg py-3 px-4 text-center text-sm text-muted-foreground">
          No cities found. Try a different search term.
        </Card>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
