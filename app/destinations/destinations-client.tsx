'use client';

import { useState, useMemo, useEffect } from 'react';
import { Destination, LAYOUT } from './constants';
import { ContinentTabs } from './components/ContinentTabs';
import { CountrySection } from './components/CountrySection';
import { DestinationCard } from '@/components/ui/features/destinations/molecules/DestinationCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';

interface DestinationsClientProps {
  destinations: Destination[];
}

// A simple fallback component to display when an error occurs
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8 text-center">
      <div className="p-6 bg-destructive/10 rounded-lg">
        <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">We had trouble displaying the destinations.</p>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </div>
    </div>
  );
}

// Helper to group destinations by continent and country
function groupByContinentAndCountry(destinations: Destination[]) {
  console.log(`[groupByContinentAndCountry] Processing ${destinations.length} destinations`);

  // Debug the first destination to see its structure
  if (destinations.length > 0) {
    console.log(
      `[groupByContinentAndCountry] First destination: ${JSON.stringify(destinations[0])}`
    );
  }

  const map: Record<
    string,
    Record<string, { emoji: string | null; destinations: Destination[] }>
  > = {};
  for (const dest of destinations) {
    // Ensure we always have a continent to group by
    const continent = dest.continent || 'Other';
    const country = dest.country || 'Other';
    const emoji = dest.emoji || null;

    // Debug continent and country
    // console.log(`[groupByContinentAndCountry] Destination: ${dest.name}, Continent: ${continent}, Country: ${country}`);

    if (!map[continent]) map[continent] = {};
    if (!map[continent][country]) map[continent][country] = { emoji, destinations: [] };
    map[continent][country].destinations.push(dest);
  }

  // Debug continents and countries found
  const continents = Object.keys(map);
  console.log(
    `[groupByContinentAndCountry] Found ${continents.length} continents: ${continents.join(', ')}`
  );

  return map;
}

// Wrap the component with ErrorBoundary
export default function DestinationsClientWrapper({ destinations }: DestinationsClientProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DestinationsClient destinations={destinations} />
    </ErrorBoundary>
  );
}

function DestinationsClient({ destinations }: DestinationsClientProps) {
  // Log the received destinations for debugging
  useEffect(() => {
    console.log(`[DestinationsClient] Received ${destinations.length} destinations`);

    // Log the first 3 destinations for debugging
    if (destinations.length > 0) {
      console.log(`[DestinationsClient] First 3 destinations:`);
      for (let i = 0; i < Math.min(3, destinations.length); i++) {
        console.log(
          `  - ${i + 1}: ${JSON.stringify({
            id: destinations[i].id,
            name: destinations[i].name,
            city: destinations[i].city,
            country: destinations[i].country,
            continent: destinations[i].continent,
          })}`
        );
      }
    }
  }, [destinations]);

  // Group destinations by continent and country
  const grouped = useMemo(() => groupByContinentAndCountry(destinations), [destinations]);
  const continents = useMemo(() => Object.keys(grouped), [grouped]);
  const [selectedContinent, setSelectedContinent] = useState('All');

  // State for pagination in the All view - start with a higher number for testing
  const [visibleCount, setVisibleCount] = useState(12); // Start with fewer items on mobile
  const LOAD_INCREMENT = 8; // Smaller increment for better mobile loading

  // If no destinations, show nothing
  if (!continents.length) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8">
        <p>No destinations found.</p>
      </div>
    );
  }

  // Handle load more click
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_INCREMENT);
  };

  // Get the destinations to display for the "All" tab
  const allDestinationsToShow = destinations.slice(0, visibleCount);
  const hasMoreToLoad = destinations.length > visibleCount;

  console.log(
    `[DestinationsClient] Displaying ${allDestinationsToShow.length} out of ${destinations.length} destinations`
  );

  // Animation variants for staggered grid items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6">
      <ContinentTabs
        continents={continents}
        selectedContinent={selectedContinent}
        onSelect={setSelectedContinent}
      />

      <div className="mt-6">
        {selectedContinent === 'All' ? (
          <>
            <motion.div
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {allDestinationsToShow.map((destination, index) => {
                // Debug each destination
                if (index < 5) {
                  console.log(
                    `[DestinationsClient] Destination ${index}: id=${destination.id}, name=${destination.name}, continent=${destination.continent}`
                  );
                }

                return (
                  <motion.div key={destination.id} variants={item}>
                    <DestinationCard
                      destination={{
                        id: destination.id,
                        city: destination.city || '',
                        country: destination.country || '',
                        continent: destination.continent || '',
                        description: null,
                        byline: destination.byline || null,
                        highlights: destination.highlights || null,
                        image_url: destination.image_url || '',
                        emoji: destination.emoji || null,
                        image_metadata: destination.image_metadata || undefined,
                        cuisine_rating: destination.cuisine_rating || 0,
                        nightlife_rating: destination.nightlife_rating || 0,
                        cultural_attractions: destination.cultural_attractions || 0,
                        outdoor_activities: destination.outdoor_activities || 0,
                        beach_quality: destination.beach_quality || 0,
                        best_season: destination.best_season || '',
                        avg_cost_per_day: destination.avg_cost_per_day || undefined,
                        safety_rating: destination.safety_rating || undefined,
                        name: destination.name || destination.city || '',
                      }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            {hasMoreToLoad && (
              <div className="mt-8 md:mt-12 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="rounded-full px-4 md:px-8 py-2 text-sm md:text-base"
                >
                  Explore More Destinations
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {Object.entries(grouped[selectedContinent] || {}).map(
              ([country, { emoji, destinations }]) => (
                <CountrySection
                  key={country}
                  country={country}
                  emoji={emoji}
                  destinations={destinations}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
