'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { LoadingState, Destination, STATES, LAYOUT, isDestination, FetchError } from './constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { forwardRef } from 'react';

// Import components from the barrel export
import { DestinationCard, SearchBar } from './components';
import { TABLES } from '@/utils/constants/database';

// Forward ref wrapper for focus management on the first card
const WrappedDestinationCard = forwardRef<HTMLDivElement, { destination: Destination }>(
  ({ destination }, ref) => <div ref={ref}><DestinationCard destination={destination} /></div>
);

WrappedDestinationCard.displayName = 'WrappedDestinationCard';

/**
 * Client component for the destinations page
 * 
 * Manages state for loading destinations and handles:
 * - Data fetching from Supabase
 * - Loading states
 * - Error handling
 * - Search filtering
 * - Focus management
 */
export default function DestinationsClient() {
  // State for destinations and loading/error states
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [state, setState] = useState<LoadingState>(STATES.IDLE);
  const [error, setError] = useState<FetchError | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create a stable ref for the supabase client
  const supabaseRef = useRef(getBrowserClient());
  
  // Filter destinations based on search query (memoized)
  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return destinations;
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return destinations.filter(destination => 
      (destination.name?.toLowerCase().includes(normalizedQuery)) || 
      (destination.city?.toLowerCase().includes(normalizedQuery)) || 
      (destination.country?.toLowerCase().includes(normalizedQuery)) ||
      (destination.description?.toLowerCase().includes(normalizedQuery))
    );
  }, [destinations, searchQuery]);

  // Reference to the first card for focus management
  const firstCardRef = useRef<HTMLDivElement>(null);

  /**
   * Fetches destination data from Supabase
   * Uses a stable callback to prevent unnecessary rerenders
   */
  const fetchDestinations = useCallback(async () => {
    if (state === STATES.LOADING) return;
    
    setState(STATES.LOADING);
    setError(null);
    
    try {
      // Use constant for table name
      const { data, error } = await supabaseRef.current
        .from(TABLES.DESTINATIONS)
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching destinations:', error);
        setState(STATES.ERROR);
        setError({
          type: 'api',
          message: 'Failed to load destinations. Please try again later.',
          details: error
        });
        return;
      }
      
      // Validate each destination with type guard
      const validDestinations = Array.isArray(data) 
        ? data.filter(isDestination)
        : [];
        
      setDestinations(validDestinations);
      setState(STATES.SUCCESS);
      
    } catch (catchError) {
      console.error('Error in destinations fetch:', catchError);
      setState(STATES.ERROR);
      setError({
        type: 'network',
        message: 'Network error. Please check your connection and try again.',
        details: catchError
      });
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Error or empty state handling
  if (state === STATES.ERROR && error) {
    return (
      <div className={LAYOUT.CONTAINER_CLASS}>
        <div className="max-w-md mx-auto text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Unable to Load Destinations</h2>
          <p className="text-muted-foreground mb-6">{error.message}</p>
          <Button onClick={fetchDestinations}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (state === STATES.LOADING && destinations.length === 0) {
    return (
      <div className={LAYOUT.CONTAINER_CLASS}>
        <div className="mb-6">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search destinations by name, city, or country..."
          />
        </div>
        
        <div className={LAYOUT.GRID_CLASS}>
          {/* Generate skeleton cards for loading state */}
          {Array.from({ length: LAYOUT.SKELETON_COUNT }).map((_, index) => (
            <div 
              key={`skeleton-${index}`}
              className={`${LAYOUT.CARD_CLASSES} ${LAYOUT.ITEM_HEIGHT} animate-pulse bg-muted/50`}
            >
              <div className="h-full w-full flex items-end p-4">
                <div className="w-2/3">
                  <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Success state with destinations
  return (
    <div className={LAYOUT.CONTAINER_CLASS}>
      <div className="mb-6">
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search destinations by name, city, or country..."
        />
      </div>
      
      {/* No results state */}
      {filteredDestinations.length === 0 && searchQuery.trim() !== '' && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No destinations found</h2>
          <p className="text-muted-foreground mb-4">
            No destinations match your search for "{searchQuery}".
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      )}
      
      {/* Destinations grid */}
      {filteredDestinations.length > 0 && (
        <div className={LAYOUT.GRID_CLASS}>
          {filteredDestinations.map((destination, index) => (
            index === 0 ? (
              <WrappedDestinationCard 
                key={destination.id} 
                destination={destination}
                ref={firstCardRef}
              />
            ) : (
              <DestinationCard key={destination.id} destination={destination} />
            )
          ))}
        </div>
      )}
    </div>
  );
}

