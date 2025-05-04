'use client';

import { useState, useMemo } from 'react';
import { Destination, LAYOUT } from './constants';
import { ContinentTabs } from './components/ContinentTabs';
import { CountrySection } from './components/CountrySection';
import { DestinationCard } from '@/components/destination-card';
import { Button } from '@/components/ui/button';

interface DestinationsClientProps {
  destinations: Destination[];
}

// Helper to group destinations by continent and country
function groupByContinentAndCountry(destinations: Destination[]) {
  const map: Record<string, Record<string, { emoji: string | null; destinations: Destination[] }>> = {};
  for (const dest of destinations) {
    const continent = (dest as any).continent || 'Other';
    const country = dest.country || 'Other';
    const emoji = (dest as any).emoji || null;
    if (!map[continent]) map[continent] = {};
    if (!map[continent][country]) map[continent][country] = { emoji, destinations: [] };
    map[continent][country].destinations.push(dest);
  }
  return map;
}

export default function DestinationsClient({ destinations }: DestinationsClientProps) {
  // Group destinations by continent and country
  const grouped = useMemo(() => groupByContinentAndCountry(destinations), [destinations]);
  const continents = useMemo(() => Object.keys(grouped), [grouped]);
  const [selectedContinent, setSelectedContinent] = useState('All');
  
  // State for pagination in the All view
  const [visibleCount, setVisibleCount] = useState(20); // Initial number of cards to show
  const LOAD_INCREMENT = 12; // Number of additional cards to load each time
  
  // If no destinations, show nothing
  if (!continents.length) {
    return <div className={LAYOUT.CONTAINER_CLASS}><p>No destinations found.</p></div>;
  }

  // Handle load more click
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + LOAD_INCREMENT);
  };

  // Get the destinations to display for the "All" tab
  const allDestinationsToShow = destinations.slice(0, visibleCount);
  const hasMoreToLoad = destinations.length > visibleCount;

  return (
    <div className={LAYOUT.CONTAINER_CLASS}>
      <ContinentTabs
        continents={continents}
        selectedContinent={selectedContinent}
        onSelect={setSelectedContinent}
      />
      <div>
        {selectedContinent === 'All' ? (
          <>
            <div className={LAYOUT.GRID_CLASS}>
              {allDestinationsToShow.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={{
                    id: destination.id,
                    city: destination.city || '',
                    country: destination.country || '',
                    continent: '',
                    description: destination.description || '',
                    byline: null,
                    highlights: null,
                    image_url: destination.image_url || '',
                    emoji: null,
                    image_metadata: undefined,
                    cuisine_rating: 0,
                    nightlife_rating: 0,
                    cultural_attractions: 0,
                    outdoor_activities: 0,
                    beach_quality: 0,
                    best_season: '',
                    avg_cost_per_day: undefined,
                    safety_rating: undefined,
                  }}
                />
              ))}
            </div>
            {hasMoreToLoad && (
              <div className="mt-8 flex justify-center">
                <Button onClick={handleLoadMore} variant="outline" size="lg">
                  Load More Destinations
                </Button>
              </div>
            )}
          </>
        ) : (
          Object.entries(grouped[selectedContinent] || {}).map(([country, { emoji, destinations }]) => (
            <CountrySection
              key={country}
              country={country}
              emoji={emoji}
              destinations={destinations}
            />
          ))
        )}
      </div>
    </div>
  );
}

