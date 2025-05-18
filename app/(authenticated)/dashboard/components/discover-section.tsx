'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Compass, ArrowRight } from 'lucide-react';
import { TrendingDestinations } from '@/components/destinations/templates/TrendingDestinations';
import { PopularItineraries } from '@/components/itinerary/templates/PopularItineraries';
import { Button } from '@/components/ui/button';

export function DiscoverSection() {
  return (
    <div className="mt-16 space-y-16">
      <section>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-2xl font-bold">🧭 Discover Destinations</h2>
          </div>
          <p className="text-muted-foreground max-w-md mb-6">
            Explore trending destinations and find your next adventure
          </p>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/destinations" className="flex items-center">
              View all destinations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Suspense fallback={<div className="h-64 bg-muted/30 animate-pulse rounded-xl" />}>
          <TrendingDestinations />
        </Suspense>
      </section>

      <section>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-10 w-10 rounded-full bg-travel-mint/10 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-travel-mint"
              >
                <rect width="16" height="16" x="4" y="4" rx="2" />
                <path d="M9 9h6v6H9z" />
                <path d="M15 2v2" />
                <path d="M15 20v2" />
                <path d="M2 15h2" />
                <path d="M2 9h2" />
                <path d="M20 15h2" />
                <path d="M20 9h2" />
                <path d="M9 2v2" />
                <path d="M9 20v2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Popular Itineraries</h2>
          </div>
          <p className="text-muted-foreground max-w-md mb-6">
            Get inspired by curated travel plans from our community
          </p>
        </div>
        <Suspense fallback={<div className="h-64 bg-muted/30 animate-pulse rounded-xl" />}>
          <PopularItineraries />
        </Suspense>
      </section>
    </div>
  );
}
