// Server component wrapper
import { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { SEO, LAYOUT } from './constants';
import DestinationsClient from './destinations-client';
import { createServerComponentClient } from '@/utils/supabase/server';
import { FIELDS } from '@/utils/constants/database';

// Mark as a dynamic route for fresh data
export const dynamic = 'force-dynamic';

// Define metadata for SEO
export const metadata: Metadata = {
  title: SEO.TITLE,
  description: SEO.DESCRIPTION,
  keywords: SEO.KEYWORDS,
  openGraph: {
    title: 'Discover Your Next Travel Adventure',
    description: SEO.DESCRIPTION,
    images: [
      {
        url: '/images/og-destinations.jpg',
        width: 1200,
        height: 630,
        alt: 'Discover destinations with withme.travel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Amazing Travel Destinations',
    description: SEO.DESCRIPTION,
    images: ['/images/og-destinations.jpg'],
  },
};

interface Destination {
  id: string;
  name: string;
  city: string;
  country: string;
  image_url: string;
  description: string;
}

/**
 * Fetch all destinations from Supabase, selecting only the fields we need.
 */
async function fetchAllDestinations(): Promise<Destination[]> {
  const supabase = await createServerComponentClient();
  const { data, error } = await supabase
    .from('destinations')
    .select([
      'id',
      'name',
      'city',
      'country',
      'image_url',
      'description'
    ].join(','))
    .order('country', { ascending: true })
    .order('city', { ascending: true });

  if (error || !Array.isArray(data)) {
    // In production, you might want to log this
    return [];
  }

  function isDestination(item: any): item is Destination {
    return (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.name === 'string'
    );
  }

  return data.reduce<Destination[]>((acc, item) => {
    if (isDestination(item)) {
      acc.push({
        id: item.id,
        name: item.name,
        city: item.city ?? '',
        country: item.country ?? '',
        image_url: item.image_url ?? '',
        description: item.description ?? '',
      });
    }
    return acc;
  }, []);
}

/**
 * Destinations Page
 * 
 * Server component that renders the destinations page.
 * Uses a client component for the interactive elements.
 */
export default async function DestinationsPage() {
  const destinations: Destination[] = await fetchAllDestinations();
  return (
    <main>
      <PageHeader
        heading="Discover Amazing Places"
        description="Explore destinations from around the world and start planning your next adventure."
      />

      <Suspense fallback={<LoadingFallback />}>
        <DestinationsClient destinations={destinations} />
      </Suspense>
    </main>
  );
}

// Loading state component
function LoadingFallback() {
  return (
    <div className={LAYOUT.CONTAINER_CLASS}>
      <div className="mx-auto max-w-xl mb-8 animate-pulse">
        <div className="h-7 bg-muted-foreground/20 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
      </div>
      
      <div className={LAYOUT.GRID_CLASS}>
        {Array.from({ length: LAYOUT.SKELETON_COUNT }).map((_, index) => (
          <div 
            key={`loading-skeleton-${index}`}
            className={`${LAYOUT.CARD_CLASSES} ${LAYOUT.ITEM_HEIGHT} animate-pulse bg-muted/50`}
          >
            <div className="h-full w-full flex items-end p-4">
              <div className="w-2/3">
                <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

