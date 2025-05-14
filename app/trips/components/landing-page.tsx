'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaneTakeoff, Globe, Users2, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MultiCitySelector } from '@/components/trips/multi-city-selector';
import { useTheme } from 'next-themes';
import { MultiCityItinerary } from '@/components/ui/MultiCityItinerary';
import FeaturesSection from './FeaturesSection';
import TestimonialsSection from './TestimonialsSection';
import CtaSection from './CtaSection';

// Sample witty headlines for the trips landing page
const wittyHeadlines = [
  'Create trips with friends. Without the endless group chats.',
  'Make travel planning as fun as the trip itself.',
  'Plan together, travel together, remember forever.',
  'Group travel planning that actually works.',
  'Where trip planning meets social collaboration.',
  'From dreaming to doing: collaborative trip planning made easy.',
];

// Demo cities data (from HeroSection)
const DEMO_CITIES = [
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

// Inline HeroSection as a function (prop-driven)
function HeroSection({
  cities,
  heading = 'Plan your perfect trip with friends and family',
  subheading = 'Collaborate on itineraries, share ideas, and make memories together – all in one place.',
  cta = 'Create a Trip',
  ctaHref = '/trips/create',
}: {
  cities: typeof DEMO_CITIES;
  heading?: string;
  subheading?: string;
  cta?: string;
  ctaHref?: string;
}) {
  return (
    <section className="w-full flex justify-center py-4 px-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: Heading, subheading, CTA */}
        <div className="text-left md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {heading}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            {subheading}
          </p>
          <Link href={ctaHref}>
            <Button size="lg" className="rounded-full px-8">
              {cta}
            </Button>
          </Link>
        </div>
        {/* Right: MultiCityItinerary demo */}
        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-md">
            {/*
              MultiCityItinerary will use 'light' mode by default, but will switch to 'dark' if the current theme is dark.
              This uses the next-themes useTheme hook for theme awareness.
            */}
            {(() => {
              // External dependencies
              // (Assume useTheme is already imported at the top of the file)
              // import { useTheme } from 'next-themes';
              // The MultiCityItinerary component handles its own light/dark mode via the 'mode' prop.
              // No need to use useTheme here; let the component default to its own theme logic.
              return (
                <MultiCityItinerary
                  initialCities={cities}
                  disablePopup={true}
                  withBackground={false}
                />
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * TripsLandingPage is the public landing for /trips when not logged in.
 * It showcases the value of trip planning and encourages signup.
 */
const TripsLandingPage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroSection cities={DEMO_CITIES} />
      <FeaturesSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
};

export default TripsLandingPage;
