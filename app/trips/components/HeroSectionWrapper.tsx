// ============================================================================
// HERO SECTION WRAPPER COMPONENT
// ============================================================================

/**
 * HeroSectionWrapper serves as a configurable wrapper around the HeroSection component
 * It allows passing custom props to the hero section without modifying the original component
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MultiCityItinerary } from '@/components/ui/MultiCityItinerary';

interface HeroSectionWrapperProps {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?: string;
  cities?: any[]; // Could be strongly typed based on your data structure
  className?: string;
  showBackground?: boolean;
}

/**
 * Demo cities data for the MultiCitySelector preview.
 */
const DEFAULT_CITIES = [
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
];

export function HeroSectionWrapper({
  heading = 'Plan your perfect trip with friends and family',
  subheading = 'Collaborate on itineraries, share ideas, and make memories together – all in one place.',
  ctaText = 'Create a Trip',
  ctaHref = '/trips/create',
  cities = DEFAULT_CITIES,
  className = '',
  showBackground = true,
}: HeroSectionWrapperProps) {
  return (
    <section className={`w-full flex justify-center py-16 md:py-24 px-4 ${className}`}>
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        {/* Left: Heading, subheading, CTA */}
        <div className="text-left order-2 lg:order-1 mt-8 lg:mt-0">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground">
            {heading}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {subheading}
          </p>
          <Link href={ctaHref}>
            <Button size="lg" className="rounded-full px-8 py-6 text-lg">
              {ctaText}
            </Button>
          </Link>
        </div>
        {/* Right: MultiCitySelector demo */}
        <div className="flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="w-full max-w-lg transform translate-y-0 md:translate-y-4 lg:translate-y-0">
            <MultiCityItinerary
              initialCities={cities}
              disablePopup={true}
              withBackground={showBackground}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSectionWrapper; 