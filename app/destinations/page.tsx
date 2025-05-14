// Server component wrapper
import { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { SEO, LAYOUT } from './constants';
import DestinationsClient from './destinations-client';
import { createServerComponentClient } from '@/utils/supabase/server';
import { FIELDS } from '@/utils/constants/tables';

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
  continent?: string;
  emoji?: string;
}

// Type assertion for Supabase data
interface DestinationData {
  id: string;
  name?: string;
  city?: string;
  country?: string;
  image_url?: string;
  description?: string;
}

/**
 * Fetch all destinations from Supabase, selecting only the fields we need.
 */
async function fetchAllDestinations(): Promise<any[]> {
  const supabase = await createServerComponentClient();
  console.log('[fetchAllDestinations] Fetching destinations from Supabase');

  const { data, error } = await supabase
    .from('destinations')
    .select(['id', 'name', 'city', 'country', 'image_url', 'continent', 'emoji'].join(','))
    .order('country', { ascending: true })
    .order('city', { ascending: true });

  if (error) {
    console.error('[fetchAllDestinations] Error fetching destinations:', error);
    return [];
  }

  if (!Array.isArray(data)) {
    console.error('[fetchAllDestinations] Data is not an array:', data);
    return [];
  }

  console.log(`[fetchAllDestinations] Fetched ${data.length} destinations from Supabase`);

  // Log the first item to see its structure
  if (data.length > 0) {
    console.log(`[fetchAllDestinations] First raw item: ${JSON.stringify(data[0])}`);

    // Check if continent exists on each item
    const hasContinentCount = data.filter((item: any) => item.continent).length;
    console.log(
      `[fetchAllDestinations] ${hasContinentCount} out of ${data.length} destinations have continent field`
    );
  }

  // Simply return the raw data from Supabase
  return data;
}

/**
 * Destinations Page
 *
 * Server component that renders the destinations page.
 * Uses a client component for the interactive elements.
 */
export default async function DestinationsPage() {
  const destinations: Destination[] = await fetchAllDestinations();
  console.log(`[DestinationsPage] Fetched ${destinations.length} destinations`);

  // Log the first few destinations for debugging
  if (destinations.length > 0) {
    console.log(`[DestinationsPage] First destination: ${JSON.stringify(destinations[0])}`);
  }

  return (
    <main>
      <PageHeader
        title="Explore Destinations"
        description="Find your next adventure"
        centered={true}
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
