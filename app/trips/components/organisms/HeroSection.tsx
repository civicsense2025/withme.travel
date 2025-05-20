'use client';

import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { LocationSearch } from '@/components/features/places/molecules/LocationSearch';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useOpenGraphImage } from '@/lib/hooks/use-og-image';
import { PopularDestinationsGrid } from '@/components/features/destinations/organisms/PopularDestinationsGrid';
import { Destination, usePopularDestinations } from '@/lib/hooks/use-popular-destinations';

export function HeroSection() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);

  // Define planning types for animation
  const planningTypes = useMemo(
    () => [
      'endless planning threads',
      'chaotic group decisions',
      'lost travel suggestions',
      'scattered trip details',
      'forgotten must-sees',
      'conflicting itineraries',
      'missed recommendations',
      'buried travel ideas',
    ],
    []
  );

  const [currentPlanningTypeIndex, setCurrentPlanningTypeIndex] = useState(0);
  const [previewDestination, setPreviewDestination] = useState('');

  // Generate a preview OG image to showcase the thumbnail functionality
  const ogImage = useOpenGraphImage(previewDestination);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlanningTypeIndex((current) => (current + 1) % planningTypes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [planningTypes]);

  // Rotate through some popular destinations for the preview
  useEffect(() => {
    const destinations = [
      'Barcelona, Spain',
      'Tokyo, Japan',
      'New York, USA',
      'Paris, France',
      'Bali, Indonesia',
    ];
    const destinationInterval = setInterval(() => {
      const nextIndex = Math.floor(Math.random() * destinations.length);
      setPreviewDestination(destinations[nextIndex]);
    }, 5000);

    return () => clearInterval(destinationInterval);
  }, []);

  // Handle location selection from the search component
  const handleLocationSelect = (place: any) => {
    if (place && place.city) {
      setDestination(place.city);
    } else if (place && place.name) {
      setDestination(place.name);
    }

    // Auto-create trip after selecting a location
    if ((place && place.city) || (place && place.name)) {
      // Use setTimeout to allow state update to complete first
      setTimeout(() => {
        handleCreateTrip();
      }, 100);
    }
  };

  // Handle direct city selection from the CityBubbles component
  const handleSetDestination = (cityName: string) => {
    setDestination(cityName);

    // Create a trip immediately after setting the destination
    setTimeout(() => {
      handleCreateTrip();
    }, 100);
  };

  const handleCreateTrip = async () => {
    if (!destination || isCreatingTrip) return;

    try {
      // Show loading state
      setIsCreatingTrip(true);
      console.log('[HeroSection] Creating trip for destination:', destination); // Debug log

      // Call the API to create a guest trip with the destination
      const response = await fetch('/api/trips/create-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          customName: `New trip to ${destination}`,
        }),
      });

      // Safely parse response JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('[HeroSection] Failed to parse response JSON:', jsonError);
        throw new Error('Failed to parse server response');
      }

      // Check if we received a tripId even with an error response
      if (!response.ok) {
        console.warn(
          '[HeroSection] Server returned error status but checking for valid data:',
          responseData
        );

        // If we still got a tripId despite the error, we can use it
        if (responseData && responseData.tripId) {
          console.log(
            '[HeroSection] Found valid tripId despite error, proceeding:',
            responseData.tripId
          );
          router.push(`/trips/${responseData.tripId}`);
          return;
        }

        // No valid tripId, throw the error
        console.error('[HeroSection] Failed to create trip:', responseData);
        throw new Error(responseData.error || 'Failed to create trip');
      }

      console.log('[HeroSection] Trip created successfully:', responseData); // Debug log

      if (responseData?.tripId) {
        // Redirect directly to the new trip
        router.push(`/trips/${responseData.tripId}`);
      } else {
        console.error('[HeroSection] No tripId returned from API:', responseData);
        setIsCreatingTrip(false);
        throw new Error('No trip ID returned from API');
      }
    } catch (error) {
      console.error('[HeroSection] Error creating trip:', error);

      // Re-enable the button after error
      setIsCreatingTrip(false);

      // Could show a toast error message here
    }
  };

  // Schema.org structured data for SEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'WithMe.Travel',
    description:
      'A collaborative platform for planning and organizing group trips. Say goodbye to the chaos of group travel planning.',
    url: 'https://withme.travel',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://withme.travel/destinations/{destination}',
      'query-input': 'required name=destination',
    },
  };

  const { destinations: popularDestinations = [], isLoading, error } = usePopularDestinations();

  const destinations = Array.isArray(popularDestinations) ? popularDestinations : [];

  return (
    <section
      aria-label="Main welcome section"
      className="relative pt-6 md:pt-12 lg:pt-16 pb-16 md:pb-20 lg:pb-24 px-6 md:px-10 flex flex-col items-center justify-center w-full"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/90 via-background/50 to-background/90" />

      {/* Animated background elements - Subtle and elegant */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute top-[20%] left-[15%] w-72 h-72 rounded-full bg-travel-blue/5"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-travel-pink/5"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8 break-words text-balance text-center w-full">
            {/* First line: wraps naturally on mobile */}
            <span className="flex flex-row flex-wrap items-center justify-center gap-2 leading-tight w-full text-center">
              <span>👋 Wave goodbye to</span>
            </span>
            {/* Animated text: always on its own line, large and bold */}
            <span className="block w-full text-center font-bold text-travel-blue text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 min-h-[2.5rem]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentPlanningTypeIndex}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  {planningTypes[currentPlanningTypeIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your crew has great ideas. Now there's finally a place to organize them all.
          </motion.p>
        </motion.div>

        {/* Create Trip Form - Concise version similar to the create trip form */}
        <motion.div
          className="w-full mb-20 hero-search-form relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white dark:bg-black/40 rounded-3xl p-6 shadow-xl max-w-3xl mx-auto animate-pulse-border relative before:absolute before:inset-0 before:rounded-3xl before:shadow-[0_0_15px_2px_rgba(168,138,250,0.3)] dark:before:shadow-[0_0_15px_3px_rgba(186,165,255,0.4)] before:animate-pulse">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center space-x-3 text-xl font-medium">
                <MapPin className="h-6 w-6 text-travel-purple" />
                <span>I'd like to go somewhere new...</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative location-search-input">
                  <LocationSearch
                    onLocationSelect={(place) => {
                      if (place) {
                        handleLocationSelect(place);
                      } else {
                        setDestination('');
                      }
                    }}
                    onClear={() => setDestination('')}
                    placeholder="Type any destination to start planning"
                    className="rounded-xl py-3 px-4 text-base h-12"
                    containerClassName="w-full"
                    initialValue={destination}
                    aria-label="Search for a destination to create a trip"
                    searchIconPosition="right"
                    searchIcon="search"
                  />
                </div>
                <Button
                  className="px-8 rounded-xl h-12 text-base font-medium flex-shrink-0"
                  onClick={handleCreateTrip}
                  disabled={!destination || isCreatingTrip}
                  variant={isCreatingTrip ? 'outline' : 'default'}
                >
                  {isCreatingTrip ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Trip'
                  )}
                </Button>
              </div>
            </div>
          </div>
          {/* Hand-drawn SVG arrow from the box to the city bubbles - update to curve downward */}
          <svg
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full mt-[-10px]"
            width="180"
            height="80"
            viewBox="0 0 180 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ pointerEvents: 'none' }}
          >
            <path
              d="M90 10 C90 40, 130 60, 90 70"
              stroke="#a78bfa"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="6 8"
            />
            <path
              d="M90 70 l-10 -7 m10 7 l-5 10"
              stroke="#a78bfa"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Popular destinations section - lazy loaded with improved styling */}
        <motion.div
          className="w-full overflow-visible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <h2 className="text-2xl font-medium my-12 text-center">
            Need inspiration? Check these spots
          </h2>
          <div className="backdrop-blur-sm rounded-3xl p-5 md:p-6 shadow-sm mx-auto max-w-5xl">
            <Suspense
              fallback={
                <div className="h-40 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse"></div>
              }
            >
              <PopularDestinationsGrid
                destinations={destinations.map((dest: any) => ({
                  ...dest,
                  name: dest.name || 'Unnamed Destination',
                  byline: dest.byline || undefined,
                  image_url: dest.image_url || undefined,
                  highlights: Array.isArray(dest.highlights) 
                    ? dest.highlights 
                    : dest.highlights 
                      ? [dest.highlights] 
                      : undefined,
                  description: dest.description || undefined,
                }))}
              />
              {isLoading && (
                <div className="text-center py-4 text-muted-foreground">
                  Loading destinations…
                </div>
              )}  
              {error && (
                <div className="text-center py-4 text-red-500">
                  {error.message}
                </div>
              )}
            </Suspense>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
