/**
 * PlaceList Component
 * 
 * Displays a list of places with filtering and search options.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import PlaceCard from '../molecules/PlaceCard';
import { cn } from '@/lib/utils';
import { usePlaces } from '@/hooks/use-places-v2';
import type { Place } from '@/types/places';

// ============================================================================
// TYPES
// ============================================================================

/**
 * PlaceList component props
 */
export interface PlaceListProps {
  /** Initial places to display */
  initialPlaces?: Place[];
  /** Initial search query */
  initialQuery?: string;
  /** Whether to allow searching */
  enableSearch?: boolean;
  /** Whether to allow filtering by category */
  enableCategoryFilter?: boolean;
  /** Handler for when a place is selected */
  onPlaceSelect?: (place: Place) => void;
  /** Optional CSS class name */
  className?: string;
  /** Optional placeholder text for search input */
  searchPlaceholder?: string;
  /** Whether to show places in a grid (true) or list (false) layout */
  gridLayout?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Common place categories for filtering */
const COMMON_CATEGORIES = [
  { label: 'All Places', value: '' },
  { label: 'Restaurants', value: 'restaurant' },
  { label: 'Hotels', value: 'hotel' },
  { label: 'Cafés', value: 'cafe' },
  { label: 'Attractions', value: 'attraction' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Transportation', value: 'transport' }
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a list of places with filtering and search options
 */
export function PlaceList({
  initialPlaces = [],
  initialQuery = '',
  enableSearch = true,
  enableCategoryFilter = true,
  onPlaceSelect,
  className,
  searchPlaceholder = 'Search places...',
  gridLayout = true
}: PlaceListProps) {
  // Use the places hook for data fetching and state management
  const {
    places,
    loading,
    error,
    query,
    setQuery,
    fetchPlaces
  } = usePlaces(initialQuery);

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [localPlaces, setLocalPlaces] = useState<Place[]>(initialPlaces);
  const [searchValue, setSearchValue] = useState(initialQuery);

  // Apply category filter to places
  const filteredPlaces = selectedCategory
    ? localPlaces.filter(place => 
        place.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    : localPlaces;

  // Handle search submission
  const handleSearch = () => {
    if (searchValue) {
      fetchPlaces(searchValue, selectedCategory ? { category: selectedCategory } : undefined);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle key press for search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle category filter changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  // Update local places when places from hook changes
  useEffect(() => {
    if (places.length > 0) {
      setLocalPlaces(places);
    }
  }, [places]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and filter controls */}
      {(enableSearch || enableCategoryFilter) && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          {enableSearch && (
            <div className="relative flex-1">
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          )}
          
          {enableCategoryFilter && (
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className={cn("w-full sm:w-[180px]", !enableSearch && "flex-1")}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>Error loading places: {error.message}</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && filteredPlaces.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No places found. Try adjusting your search or filters.</p>
        </div>
      )}
      
      {/* Places list */}
      {!loading && !error && filteredPlaces.length > 0 && (
        <div className={cn(
          gridLayout
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex flex-col gap-3"
        )}>
          {filteredPlaces.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              onClick={onPlaceSelect}
              compact={gridLayout}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaceList; 