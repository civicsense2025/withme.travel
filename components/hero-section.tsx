'use client';

import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { LocationSearch } from '@/components/location-search';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/use-auth';
import type { AuthContextType } from '@/components/auth-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, MapPin } from 'lucide-react';
import Image from 'next/image';
import useOpenGraphImage from '@/lib/hooks/use-og-image';

// Lazy load the CityBubbles component to improve initial load time
const CityBubbles = lazy(() =>
  import('./city-bubbles').then((mod) => ({ default: mod.CityBubbles }))
);

// Also import the provider
const CityBubblesProvider = lazy(() =>
  import('./city-bubbles').then((mod) => ({ default: mod.CityBubblesProvider }))
);

export function HeroSection() {
  const router = useRouter();
  const { user } = useAuth() as AuthContextType;
  const [destination, setDestination] = useState('');

  // Define planning types for animation
  const planningTypes = useMemo(
    () => [
      'group travel planning',
      'friend trip coordination',
      'family vacation organizing',
      'travel spreadsheets',
      'messaging app chaos',
    ],
    []
  );

  const [currentPlanningTypeIndex, setCurrentPlanningTypeIndex] = useState(0);
  const [previewDestination, setPreviewDestination] = useState('');

  // Generate a preview OG image to showcase the thumbnail functionality
  const ogImage = useOpenGraphImage({
    type: 'generic',
    title: 'Plan your next adventure',
    subtitle: previewDestination || 'WithMe Travel'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlanningTypeIndex((current) => (current + 1) % planningTypes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [planningTypes]);

  // Rotate through some popular destinations for the preview
  useEffect(() => {
    const destinations = ['Barcelona, Spain', 'Tokyo, Japan', 'New York, USA', 'Paris, France', 'Bali, Indonesia'];
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
  };
  
  // Handle direct city selection from the CityBubbles component
  const handleSetDestination = (cityName: string) => {
    setDestination(cityName);
    
    // Focus the location search input
    const locationInput = document.querySelector('.location-search-input input');
    if (locationInput instanceof HTMLInputElement) {
      locationInput.focus();
    }
  };

  const handleCreateTrip = async () => {
    if (!destination) return;
    
    try {
      // Call the API to create a guest trip with the destination from the search box
      const response = await fetch('/api/trips/create-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create trip');
      }
      
      const data = await response.json();
      
      if (data?.tripId) {
        // Redirect directly to the new trip
        router.push(`/trips/${data.tripId}`);
      } else {
        // Fallback to the old behavior if needed
        const citySlug = destination
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        
        router.push(`/trips/create?destination=${encodeURIComponent(destination)}`);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      
      // Fallback to the old behavior
      const citySlug = destination
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      
      router.push(`/trips/create?destination=${encodeURIComponent(destination)}`);
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

  return (
    <section
      aria-label="Main welcome section"
      className="relative pt-6 md:pt-12 lg:pt-16 pb-32 md:pb-40 lg:pb-48 px-6 md:px-10 flex flex-col items-center justify-center w-full"
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
            ease: "easeInOut"
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
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
            <span className="leading-tight">Say Goodbye to the Chaos of</span>
            <div className="h-[1.2em] overflow-hidden relative mt-2">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentPlanningTypeIndex}
                  className="text-travel-blue absolute inset-0 flex items-center justify-center leading-tight"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.32, 0.72, 0, 1], // Custom easing for Apple-like smooth motion
                  }}
                >
                  {planningTypes[currentPlanningTypeIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>

          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Plan your next adventure together, make decisions easily, and create unforgettable
            memories.
          </motion.p>
        </motion.div>

        {/* Create Trip Form - Concise version similar to the create trip form */}
        <motion.div 
          className="w-full mb-20 hero-search-form relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white dark:bg-black/40 border border-border rounded-3xl p-6 shadow-xl max-w-3xl mx-auto">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center space-x-3 text-xl font-medium">
                <MapPin className="h-6 w-6 text-travel-purple" />
                <span>I'd like to go somewhere new...</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative location-search-input">
                  <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    placeholder="Where to? Try 'Barcelona' or 'Tokyo'"
                    className="rounded-xl py-3 px-4 text-base h-12"
                    containerClassName="w-full"
                    initialValue={destination}
                    aria-label="Search for a destination"
                    searchIconPosition="right"
                    searchIcon="search"
                  />
                </div>
                <Button
                  className="px-8 rounded-xl h-12 text-base font-medium flex-shrink-0"
                  onClick={handleCreateTrip}
                  disabled={!destination}
                >
                  Plan a Trip
                </Button>
              </div>
            </div>
          </div>
          {/* Hand-drawn SVG arrow from the box to the city bubbles */}
          <svg
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-full mt-[-10px]"
            width="180" height="80" viewBox="0 0 180 80" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ pointerEvents: 'none' }}
          >
            <path
              d="M90 10 C90 40, 90 60, 170 70"
              stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 8"/>
            <path
              d="M170 70 l-10 -7 m10 7 l-7 10"
              stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </svg>
        </motion.div>

        {/* Popular destinations section - lazy loaded with improved styling */}
        <motion.div 
          className="w-full overflow-visible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <h2 className="text-2xl font-medium mb-10 text-center">Or Try One of These Places...</h2>
          <div className="backdrop-blur-sm rounded-3xl p-5 md:p-6 shadow-sm mx-auto max-w-5xl">
            <Suspense fallback={<div className="h-40 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse"></div>}>
              <CityBubblesProvider setDestination={handleSetDestination}>
                <CityBubbles />
              </CityBubblesProvider>
            </Suspense>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
