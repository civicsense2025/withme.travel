'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface ItineraryTemplateCardProps {
  itinerary: {
    id: string;
    title: string;
    slug: string;
    cover_image_url: string | null;
  };
  index?: number;
}

export function ItineraryTemplateCard({ itinerary, index = 0 }: ItineraryTemplateCardProps) {
  const [imgError, setImgError] = useState(false);
  const isExternal = itinerary.cover_image_url?.startsWith('http');

  // Helper to get city image path
  function getCityImage(): string {
    let city = (itinerary as any).location || '';
    if (!city && itinerary.title) {
      const match = itinerary.title.match(/^[^: ]+/);
      city = match ? match[0] : '';
    }
    if (city) {
      const kebab = city
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      return `/destinations/${kebab}.jpg`;
    }
    return '/destinations/placeholder-itinerary.jpg';
  }

  // Try cover_image_url, then destination image_url, then city fallback, then placeholder
  let imageUrl = !imgError && itinerary.cover_image_url ? itinerary.cover_image_url : null;
  if (!imageUrl && !imgError) {
    // Try destination image_url
    const destImage =
      (itinerary as any).destination?.image_url ||
      (Array.isArray((itinerary as any).destinations) &&
        (itinerary as any).destinations[0]?.image_url);
    if (destImage) {
      imageUrl = destImage;
    }
  }
  if (!imageUrl && !imgError) {
    imageUrl = getCityImage();
  }
  if (!imageUrl) {
    imageUrl = '/destinations/placeholder-itinerary.jpg';
  }

  return (
    <Link href={`/itineraries/${itinerary.slug}`}>
      <div className="h-full rounded-lg overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200">
        <div className="relative w-full aspect-[3/2]">
          <Image
            src={imageUrl}
            alt={itinerary.title || 'Itinerary template'}
            fill
            className="object-cover"
            priority={index < 4}
            unoptimized={!!isExternal && !imgError}
            onError={() => setImgError(true)}
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-lg line-clamp-2">{itinerary.title}</h3>
        </div>
      </div>
    </Link>
  );
}
