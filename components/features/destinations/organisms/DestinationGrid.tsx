/**
 * Destination Grid
 * 
 * Displays a grid of destination cards with filtering and sorting options
 * 
 * @module destinations/organisms
 */
'use client';
import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { DestinationCard } from '../molecules/DestinationCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export type SortField = 'name' | 'country' | 'rating' | 'cost';
export type SortDirection = 'asc' | 'desc';
export type FilterValue = string | null;
export type Destination = {
  id: string;
  name?: string;
  city: string | null;
  country: string | null;
  continent?: string;
  description?: string | null;
  byline?: string | null;
  highlights?: string[] | string | null;
  image_url?: string | null;
  emoji?: string | null;
  image_metadata?: {
    alt_text?: string;
    attribution?: string;
    attributionHtml?: string;
    photographer_name?: string;
    photographer_url?: string;
    source?: string;
    source_id?: string;
    url?: string;
  };
  cuisine_rating?: number;
  nightlife_rating?: number;
  cultural_attractions?: number;
  outdoor_activities?: number;
  beach_quality?: number;
  avg_cost_per_day?: number;
  safety_rating?: number;
  best_season?: string;
};

export interface DestinationGridProps {
  /** List of destination data objects */
  destinations: Destination[];
  /** Optional callback for destination card click */
  onDestinationClick?: (destination: Destination) => void;
  /** Default sort field */
  defaultSortField?: SortField;
  /** Default sort direction */
  defaultSortDirection?: SortDirection;
  /** Show search field */
  showSearch?: boolean;
  /** Show filtering options */
  showFilters?: boolean;
  /** Show sorting options */
  showSorting?: boolean;
  /** Initial search term */
  initialSearchTerm?: string;
  /** Grid columns for different screen sizes */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DestinationGrid({
  destinations,
  onDestinationClick,
  defaultSortField = 'name',
  defaultSortDirection = 'asc',
  showSearch = true,
  showFilters = true,
  showSorting = true,
  initialSearchTerm = '',
  columns = { sm: 1, md: 2, lg: 3 },
  className,
}: DestinationGridProps) {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [continentFilter, setContinentFilter] = useState<FilterValue>(null);
  const [sortField, setSortField] = useState<SortField>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  // Extract unique continents for filter
  const continents = useMemo(() => {
    const uniqueContinents = new Set<string>();
    destinations.forEach(dest => {
      if (dest.continent) {
        uniqueContinents.add(dest.continent);
      }
    });
    return Array.from(uniqueContinents).sort();
  }, [destinations]);

  // Filter and sort destinations
  const filteredAndSortedDestinations = useMemo(() => {
    // First filter by search term and continent
    let filtered = destinations.filter(dest => {
      const name = dest.name || dest.city || '';
      const country = dest.country || '';
      const matchesSearch = 
        searchTerm === '' || 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesContinent = 
        !continentFilter || 
        dest.continent === continentFilter;
      
      return matchesSearch && matchesContinent;
    });

    // Then sort
    return filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortField);
      const bValue = getSortValue(b, sortField);
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      // Fallback
      return 0;
    });
  }, [destinations, searchTerm, continentFilter, sortField, sortDirection]);

  // Helper function to get the value to sort by
  function getSortValue(destination: Destination, field: SortField): string | number {
    switch (field) {
      case 'name':
        return destination.name || destination.city || '';
      case 'country':
        return destination.country || '';
      case 'rating':
        // Average of all ratings, or zero if no ratings
        const ratings = [
          destination.cuisine_rating,
          destination.nightlife_rating,
          destination.cultural_attractions,
          destination.outdoor_activities,
          destination.beach_quality,
          destination.safety_rating,
        ].filter(r => r !== undefined) as number[];
        
        return ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;
      case 'cost':
        return destination.avg_cost_per_day || 0;
      default:
        return '';
    }
  }

  // Determine grid columns class
  const columnsClass = cn(
    'grid gap-6',
    `grid-cols-${columns.sm || 1}`,
    `md:grid-cols-${columns.md || 2}`,
    `lg:grid-cols-${columns.lg || 3}`
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls: Search, Filter, Sort */}
      {(showSearch || showFilters || showSorting) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          {/* Search */}
          {showSearch && (
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search destinations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Continent Filter */}
            {showFilters && continents.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-1">
                    <Filter className="h-4 w-4" />
                    {continentFilter || 'All Continents'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Continent</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={continentFilter || 'all'}
                    onValueChange={(value) => setContinentFilter(value === 'all' ? null : value)}
                  >
                    <DropdownMenuRadioItem value="all">All Continents</DropdownMenuRadioItem>
                    {continents.map(continent => (
                      <DropdownMenuRadioItem key={continent} value={continent}>
                        {continent}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Sort control */}
            {showSorting && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    Sort
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={sortField}
                    onValueChange={(value) => setSortField(value as SortField)}
                  >
                    <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="country">Country</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="rating">Rating</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="cost">Cost</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Direction</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={sortDirection}
                    onValueChange={(value) => setSortDirection(value as SortDirection)}
                  >
                    <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedDestinations.length} of {destinations.length} destinations
      </div>
      
      {/* Destinations Grid */}
      {filteredAndSortedDestinations.length > 0 ? (
        <div className={columnsClass}>
          {filteredAndSortedDestinations.map(destination => (
            <DestinationCard
              key={destination.id}
              destination={{
                id: destination.id,
                name: destination.name,
                city: destination.city || null,
                country: destination.country || null,
                continent: destination.continent,
                description: destination.description,
                byline: destination.byline,
                highlights: destination.highlights,
                image_url: destination.image_url,
                emoji: destination.emoji,
                image_metadata: destination.image_metadata
              }}
              onClick={() => onDestinationClick?.(destination)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-muted/10">
          <h3 className="text-lg font-medium">No destinations found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
} 