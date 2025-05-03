'use client';

import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { LocationSearch } from '@/components/location-search';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import type { AuthContextType } from '@/components/auth-provider';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load the CityBubbles component to improve initial load time
const CityBubbles = lazy(() =>
  import('./city-bubbles').then((mod) => ({ default: mod.CityBubbles }))
);

export function HeroSection() {
  const router = useRouter();
  const { user } = useAuth() as AuthContextType;

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlanningTypeIndex((current) => (current + 1) % planningTypes.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [planningTypes]);

  const handleLocationSelect = (destination: any) => {
    if (destination && destination.city) {
      // Create a slug from the city name - replacing spaces with hyphens and removing special characters
      const citySlug = destination.city
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      router.push(`/destinations/${citySlug}`);
    }
  };

  const handleExploreClick = () => {
    if (user) {
      router.push('/trips');
    } else {
      router.push('/destinations');
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
      className="relative py-16 md:py-24 px-3 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 to-background/40" />

      {/* Animated background elements - Using fewer elements to reduce DOM complexity */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-travel-blue/10 animate-pulse-soft"></div>
        <div className="absolute top-[30%] right-[10%] w-40 h-40 rounded-full bg-travel-pink/10 animate-float"></div>
      </div>

      <header>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl leading-relaxed md:leading-loose font-black lowercase flex flex-col animate-fade-in-up mb-4">
            <span>say goodbye to the chaos of</span>
            <div className="h-[1.2em] overflow-hidden relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={currentPlanningTypeIndex}
                  className="text-travel-blue dark:text-travel-blue absolute inset-0 flex items-center justify-center"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeInOut',
                  }}
                >
                  {planningTypes[currentPlanningTypeIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>
        </motion.div>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
          plan your next adventure together, make decisions easily, and create unforgettable
          memories.
        </p>
      </header>

      {/* Location search section - optimized for mobile */}
      <div className="w-full max-w-xl px-2 md:px-0 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="where to? try 'barcelona' or 'tokyo'"
            className="rounded-full py-3"
            containerClassName="flex-1"
            aria-label="Search for a destination"
          />
          <Button
            className="lowercase px-8 py-3 rounded-full h-auto w-full md:w-auto"
            onClick={handleExploreClick}
          >
            {user ? 'my trips' : 'explore'}
          </Button>
        </div>
      </div>

      {/* Popular destinations section - lazy loaded */}
      <div className="w-full px-0 -mx-3 sm:-mx-6 lg:-mx-8 overflow-visible">
        <h2 className="sr-only">Popular destinations</h2>
        <Suspense fallback={<div className="h-24"></div>}>
          {/* <CityBubbles /> */} {/* Temporarily comment out for debugging */}
        </Suspense>
      </div>
    </section>
  );
}
