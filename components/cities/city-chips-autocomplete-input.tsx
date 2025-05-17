'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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

// Convert country code to emoji flag
const countryCodeToEmoji = (countryCode: string): string => {
  // For special cases
  if (!countryCode) return '🌍';
  
  try {
    // Convert country code to regional indicator symbols
    // Each letter is represented by a regional indicator symbol (offset 127397 from the letter's char code)
    const codePoints = [...countryCode.toUpperCase()]
      .map(char => char.charCodeAt(0) + 127397);
    
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    return '🌍'; // Fallback
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
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [focusedResultIndex, setFocusedResultIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

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
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchCities(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const searchCities = async (searchQuery: string) => {
    if (searchQuery.length < 2) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Searching cities for:', searchQuery);
      const response = await fetch(`/api/cities/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to search cities');
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      // Filter out already selected cities
      const filteredResults = (data.cities || []).filter(
        (city: City) => !selectedCities.some((selected) => selected.id === city.id)
      );
      
      console.log('Filtered results:', filteredResults);
      setResults(filteredResults);
      setShowResults(true);
      setFocusedResultIndex(-1);
      
      // Make sure to update dropdown position after setting results
      setTimeout(updateDropdownPosition, 0);
    } catch (err) {
      console.error('Error searching cities:', err);
      setError('Failed to search cities');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCity = (city: City) => {
    console.log('Selecting city:', city);
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

  // Update the dropdown positioning logic
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current && searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      console.log('Updating dropdown position based on rect:', rect);
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (showResults) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition, true);
      return () => {
        window.removeEventListener('resize', updateDropdownPosition);
        window.removeEventListener('scroll', updateDropdownPosition, true);
      };
    }
  }, [showResults, updateDropdownPosition]);

  // Create a portal for the dropdown to prevent z-index issues
  const renderDropdown = () => {
    if (!showResults || !dropdownPosition) return null;
    
    console.log('Rendering dropdown with position:', dropdownPosition);
    console.log('Results count:', results.length);

    return ReactDOM.createPortal(
      <motion.div
        className="fixed z-[999] shadow-xl border border-border/50 rounded-lg bg-background overflow-hidden"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          maxHeight: '300px',
          overflowY: 'auto'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {loading && (
          <div className="absolute right-3 top-3 z-10">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
        {results.length > 0 ? (
          <Card className="bg-background border-none shadow-none">
            <ul ref={resultsRef} className="py-1">
              {results.map((city, index) => (
                <motion.li
                  key={city.id}
                  onClick={() => handleSelectCity(city)}
                  className={`px-2 py-1 hover:bg-muted cursor-pointer flex items-center justify-between text-sm ${
                    index === focusedResultIndex ? 'bg-muted/80' : ''
                  }`}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="flex items-center">
                    <div className="mr-2 text-base flex items-center justify-center w-7 h-7 rounded-full bg-muted">
                      {getCityEmoji(city)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{city.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {city.admin_name && `${city.admin_name}, `}
                        {city.country}
                      </span>
                    </div>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground opacity-60" />
                </motion.li>
              ))}
            </ul>
          </Card>
        ) : (
          query.length >= 2 &&
          !loading && (
            <div className="px-3 py-2 text-muted-foreground text-sm">No cities found</div>
          )
        )}
      </motion.div>,
      document.body
    );
  };

  return (
    <div className="space-y-2 relative" ref={searchRef}>
      {label && <Label className="block font-medium text-sm">{label}</Label>}
      <div className="border rounded-lg p-2 bg-background shadow-sm min-h-[80px] focus-within:ring-1 focus-within:ring-primary/30 transition-all duration-200">
        <div className="flex flex-wrap gap-2 items-center">
          <AnimatePresence>
            {selectedCities.map((city) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="bg-primary/10 text-primary rounded-full pl-2 pr-1 py-1 flex items-center gap-1 text-sm"
              >
                <span className="mr-1">{getCityEmoji(city)}</span>
                <span>
                  {city.name}
                  {city.country && `, ${city.country}`}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveCity(e, city.id)}
                    className="rounded-full w-5 h-5 flex items-center justify-center bg-primary/20 hover:bg-primary/30 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show input if not disabled */}
          {!disabled && (
            <div className="relative flex-1 min-w-[120px]">
              <input
                type="text"
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  const newQuery = e.target.value;
                  setQuery(newQuery);
                  // If clearing the input, hide results
                  if (!newQuery) {
                    setShowResults(false);
                  }
                  // If input has 2+ chars and results exist, show them
                  else if (newQuery.length >= 2) {
                    // Results will be updated by the debounced effect
                    setShowResults(true);
                    updateDropdownPosition();
                  }
                }}
                onFocus={() => {
                  if (query.length >= 2) {
                    setShowResults(true);
                    updateDropdownPosition();
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={selectedCities.length === 0 ? placeholder : emptyMessage}
                className="w-full py-1 px-0 bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/80 text-sm"
              />
            </div>
          )}
        </div>
        
        {/* Render empty state */}
        {selectedCities.length === 0 && disabled && (
          <div className="text-muted-foreground text-sm py-1">{emptyMessage}</div>
        )}
      </div>
      
      {/* Render dropdown with portal */}
      <AnimatePresence>{renderDropdown()}</AnimatePresence>
    </div>
  );
}
