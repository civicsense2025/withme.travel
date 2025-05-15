// ============================================================================
// HERO SECTION COMPONENT (2-COLUMN LAYOUT)
// ============================================================================

/**
 * HeroSection component for the Trips landing page.
 * 
 * Displays a two-column hero section:
 * - Left: Heading, subheading, and CTA button
 * - Right: Demo MultiCitySelector showing a sample trip route
 * 
 * Responsive: Stacks vertically on mobile, side-by-side on md+ screens.
 */

// External dependencies
import React from 'react';
import Link from 'next/link';

// Internal modules
import { MultiCityItinerary } from '@/components/ui/MultiCityItinerary';
import { Button } from '@/components/ui/button';

// Types
// (No explicit types needed here; DEMO_CITIES matches TripCity shape)

/**
 * Demo cities data for the MultiCitySelector preview.
 * Should match the TripCity type.
 */
const DEMO_CITIES = [
  {
    id: '1',
    trip_id: 'demo-trip',
    city_id: '1',
    position: 0,
    arrival_date: '2025-06-10',
    departure_date: '2025-06-15',
    city: { id: '1', name: 'Paris', country: 'France' },
  },
  {
    id: '2',
    trip_id: 'demo-trip',
    city_id: '2',
    position: 1,
    arrival_date: '2025-06-15',
    departure_date: '2025-06-20',
    city: { id: '2', name: 'Rome', country: 'Italy' },
  },
  {
    id: '3',
    trip_id: 'demo-trip',
    city_id: '3',
    position: 2,
    arrival_date: '2025-06-20',
    departure_date: '2025-06-25',
    city: { id: '3', name: 'Barcelona', country: 'Spain' },
  },
];

/**
 * HeroSection
 *
 * Displays the main hero area for the trips page with a two-column layout.
 */
const HeroSection: React.FC = () => (
  <section className="w-full flex justify-center py-16 md:py-24 px-4">
    <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
      {/* Left: Heading, subheading, CTA */}
      <div className="text-left order-2 lg:order-1 mt-8 lg:mt-0">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground">
          Plan your perfect trip with friends and family
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Collaborate on itineraries, share ideas, and make memories together – all in one place.
        </p>
        <Link href="/trips/create">
          <Button size="lg" className="rounded-full px-8 py-6 text-lg">
            Create a Trip
          </Button>
        </Link>
      </div>
      {/* Right: MultiCitySelector demo */}
      <div className="flex justify-center lg:justify-end order-1 lg:order-2">
        <div className="w-full max-w-lg transform translate-y-0 md:translate-y-4 lg:translate-y-0">
            {/*
              MultiCityItinerary demo with default cities and theme-aware styling.
              The defaultCities constant provides the initial city list for the demo.
              The component will use the current theme (light/dark) from the theme provider.
            */}
            <MultiCityItinerary
              initialCities={[
                {
                  id: 1,
                  name: 'Paris',
                  emoji: '🇫🇷',
                  color: 'bg-travel-purple',
                  items: [
                    { id: 1, type: 'activity', name: 'Morning croissant at Le Marais', time: '09:00 AM', votes: 3 },
                    { id: 2, type: 'sight', name: 'Eiffel Tower', time: '11:30 AM', votes: 5 },
                    { id: 3, type: 'restaurant', name: 'Dinner at Bouillon Pigalle', time: '08:00 PM', votes: 4 },
                  ],
                },
                {
                  id: 2,
                  name: 'Rome',
                  emoji: '🇮🇹',
                  color: 'bg-travel-blue',
                  items: [
                    { id: 1, type: 'museum', name: 'Vatican Museums', time: '10:00 AM', votes: 6 },
                    { id: 2, type: 'sight', name: 'Colosseum', time: '02:30 PM', votes: 4 },
                    { id: 3, type: 'restaurant', name: 'Trattoria dinner', time: '09:00 PM', votes: 5 },
                  ],
                },
                {
                  id: 3,
                  name: 'Barcelona',
                  emoji: '🇪🇸',
                  color: 'bg-travel-pink',
                  items: [
                    { id: 1, type: 'activity', name: 'Alcázar Palace', time: '09:30 AM', votes: 4 },
                    { id: 2, type: 'sight', name: 'Sagrada Familia', time: '02:00 PM', votes: 6 },
                    { id: 3, type: 'restaurant', name: 'Tapas in El Born', time: '08:00 PM', votes: 7 },
                  ],
                },
              ]}
              // Theming is handled by the theme provider; do not set mode prop here.
              disablePopup={true}
            />
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;