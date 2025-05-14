'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { TrendingDestinations } from '@/components/trending-destinations';
import { PopularItineraries } from '@/components/popular-itineraries';

export function DiscoverSection() {
  return (
    <div className="mt-12 space-y-12">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Discover Destinations</h2>
          <Link
            href="/destinations"
            className="text-travel-purple hover:underline flex items-center"
          >
            View all <Info className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
          <TrendingDestinations />
        </Suspense>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Itineraries</h2>
          <Link
            href="/itineraries"
            className="text-travel-purple hover:underline flex items-center"
          >
            View all <Info className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-xl" />}>
          <PopularItineraries />
        </Suspense>
      </section>
    </div>
  );
}
