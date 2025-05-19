/**
 * PlaceList Component
 * 
 * Displays a list of places with optional filtering and empty states
 */

'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlaceCard } from '@/components/features/places/atoms/place-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PlaceListProps } from '@/components/features/places/types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Displays a grid of place cards with search functionality
 */
export function PlaceList({ 
  places = [], 
  isLoading = false, 
  onSelectPlace,
  error,
  className = ''
}: PlaceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return places;
    
    const query = searchQuery.toLowerCase();
    return places.filter(place => 
      place.name.toLowerCase().includes(query) || 
      place.category?.toLowerCase().includes(query) ||
      place.address?.toLowerCase().includes(query)
    );
  }, [places, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Input placeholder="Search places..." disabled />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="rounded-md overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline">Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (places.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <h3 className="text-xl font-medium mb-2">No places added yet</h3>
        <p className="text-muted-foreground mb-4">Start adding places to your trip</p>
      </div>
    );
  }

  // Empty search results
  if (filteredPlaces.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Input 
          placeholder="Search places..." 
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No places match your search</p>
        </div>
      </div>
    );
  }

  // Normal state with places
  return (
    <div className={cn("space-y-4", className)}>
      <Input 
        placeholder="Search places..." 
        value={searchQuery}
        onChange={handleSearch}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlaces.map(place => (
          <PlaceCard 
            key={place.id} 
            place={place} 
            onClick={onSelectPlace}
          />
        ))}
      </div>
    </div>
  );
} 