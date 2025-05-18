/**
 * Destination Detail Page
 *
 * Page displaying detailed information about a specific destination
 */

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DestinationDetail } from '@/components/destinations/organisms/DestinationDetail';
import { PopularDestinations } from '@/components/destinations/templates/PopularDestinations';
import { getDestination } from '@/lib/api/destinations';

// Dynamic metadata for each destination
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const result = await getDestination(params.slug);

  if (!result.success) {
    return {
      title: 'Destination Not Found | withme.travel',
      description: 'The destination you were looking for could not be found.',
    };
  }

  const destination = result.data;

  return {
    title: `${destination.name} Travel Guide | withme.travel`,
    description: destination.description
      ? destination.description.substring(0, 160)
      : `Explore ${destination.name}, ${destination.country || ''} with our comprehensive travel guide on withme.travel`,
    openGraph: {
      title: `${destination.name} - Travel Guide`,
      description: destination.description?.substring(0, 160),
      images: [
        {
          url: destination.image_url || '/images/destinations/default.jpg',
          width: 1200,
          height: 630,
          alt: `${destination.name}, ${destination.country || ''}`,
        },
      ],
    },
  };
}

export default async function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const result = await getDestination(params.slug);

  if (!result.success) {
    notFound();
  }

  const destination = result.data;

  // Transform API destination into the format expected by DestinationDetail
  const destinationForDetail = {
    id: destination.id,
    name: destination.name || undefined, // Convert null to undefined
    city: destination.city || null,
    country: destination.country || null,
    continent: destination.region || undefined, // Using region as continent
    description: destination.description || null,
    byline: destination.description ? destination.description.substring(0, 60) + '...' : null,
    image_url: destination.cover_image_url || destination.image_url || null,
    // Provide defaults for other properties that might be missing
    highlights: (destination.highlights as string[]) || null,
    emoji: destination.emoji || null,
    best_season: destination.best_season || undefined,
    cuisine_rating: destination.cuisine_rating || undefined,
    nightlife_rating: destination.nightlife_rating || undefined,
    cultural_attractions: destination.cultural_attractions || undefined,
    outdoor_activities: destination.outdoor_activities || undefined,
    beach_quality: destination.beach_quality || undefined,
    avg_cost_per_day: destination.avg_cost_per_day || undefined,
    safety_rating: destination.safety_rating || undefined,
    image_metadata: destination.image_metadata || undefined,
  };

  return (
    <div className="container py-8 md:py-12">
      <DestinationDetail destination={destinationForDetail} />

      {/* Related destinations section */}
      <div className="mt-16 md:mt-24">
        <PopularDestinations
          title="Similar Destinations"
          subtitle={`Explore more destinations like ${destination.name}`}
          limit={3}
          showSearch={false}
          showFilters={false}
          columns={{ sm: 1, md: 3, lg: 3 }}
        />
      </div>
    </div>
  );
}
