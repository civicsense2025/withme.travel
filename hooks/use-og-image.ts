/**
 * useOgImage Hook
 * 
 * React hook for generating and managing Open Graph images.
 * 
 * @module hooks/use-og-image
 */

'use client';

import { useMemo } from 'react';

/**
 * OpenGraph image metadata
 */
export interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Base parameters for thumbnail generation
 */
interface ThumbnailBaseParams {
  width?: number;
  height?: number;
  bgColor?: string;
  textColor?: string;
}

/**
 * Parameters for generic thumbnails
 */
interface GenericThumbnailParams extends ThumbnailBaseParams {
  title: string;
  subtitle?: string;
}

/**
 * Parameters for trip thumbnails
 */
interface TripThumbnailParams extends ThumbnailBaseParams {
  tripId: string;
}

/**
 * Parameters for destination thumbnails
 */
interface DestinationThumbnailParams extends ThumbnailBaseParams {
  destinationId?: string;
  city?: string;
  country?: string;
  imageUrl?: string;
  description?: string;
}

// Default dimensions for thumbnails
const DEFAULT_DIMENSIONS = {
  width: 1200,
  height: 630
};

/**
 * Generate a URL for a generic thumbnail
 */
export function getGenericThumbnailUrl({
  title,
  subtitle,
  bgColor,
  textColor,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
}: GenericThumbnailParams): string {
  // Build the URL with query parameters
  const url = new URL('/api/thumbnail', window.location.origin);
  
  // Add parameters
  url.searchParams.append('title', encodeURIComponent(title));
  if (subtitle) url.searchParams.append('subtitle', encodeURIComponent(subtitle));
  if (bgColor) url.searchParams.append('bg', bgColor);
  if (textColor) url.searchParams.append('color', textColor);
  url.searchParams.append('width', width.toString());
  url.searchParams.append('height', height.toString());
  
  return url.toString();
}

/**
 * Generate a URL for a trip thumbnail
 */
export function getTripThumbnailUrl({
  tripId,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
}: TripThumbnailParams): string {
  // Build the URL with query parameters
  const url = new URL('/api/thumbnail/trip', window.location.origin);
  
  // Add parameters
  url.searchParams.append('tripId', tripId);
  url.searchParams.append('width', width.toString());
  url.searchParams.append('height', height.toString());
  
  return url.toString();
}

/**
 * Generate a URL for a destination thumbnail
 */
export function getDestinationThumbnailUrl({
  destinationId,
  city,
  country,
  imageUrl,
  description,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
}: DestinationThumbnailParams): string {
  // Build the URL with query parameters
  const url = new URL('/api/thumbnail/destination', window.location.origin);
  
  // Add parameters - either destinationId OR city/country must be provided
  if (destinationId) {
    url.searchParams.append('id', destinationId);
  } else if (city || country) {
    if (city) url.searchParams.append('city', encodeURIComponent(city));
    if (country) url.searchParams.append('country', encodeURIComponent(country));
  } else {
    throw new Error('Either destinationId or city/country must be provided');
  }
  
  // Optional parameters
  if (imageUrl) url.searchParams.append('imageUrl', encodeURIComponent(imageUrl));
  if (description) url.searchParams.append('description', encodeURIComponent(description));
  url.searchParams.append('width', width.toString());
  url.searchParams.append('height', height.toString());
  
  return url.toString();
}

/**
 * Get Open Graph image array for a trip
 */
export function getOpenGraphImageForTrip(params: TripThumbnailParams): OpenGraphImage[] {
  return [
    {
      url: getTripThumbnailUrl(params),
      width: params.width || DEFAULT_DIMENSIONS.width,
      height: params.height || DEFAULT_DIMENSIONS.height,
      alt: `Trip plan thumbnail`,
    }
  ];
}

/**
 * Get Open Graph image array for a destination
 */
export function getOpenGraphImageForDestination(
  params: DestinationThumbnailParams
): OpenGraphImage[] {
  return [
    {
      url: getDestinationThumbnailUrl(params),
      width: params.width || DEFAULT_DIMENSIONS.width,
      height: params.height || DEFAULT_DIMENSIONS.height,
      alt: `${params.city || ''} ${params.country || ''} destination thumbnail`.trim(),
    }
  ];
}

/**
 * Get generic Open Graph image array
 */
export function getOpenGraphImage(params: GenericThumbnailParams): OpenGraphImage[] {
  return [
    {
      url: getGenericThumbnailUrl(params),
      width: params.width || DEFAULT_DIMENSIONS.width,
      height: params.height || DEFAULT_DIMENSIONS.height,
      alt: params.title,
    }
  ];
}

/**
 * Hook to generate appropriate OpenGraph image based on content type
 */
export function useOgImage(
  params:
    | { type: 'trip'; tripId: string }
    | {
        type: 'destination';
        destinationId?: string;
        city?: string;
        country?: string;
        imageUrl?: string;
        description?: string;
      }
    | { type: 'generic'; title: string; subtitle?: string }
): OpenGraphImage {
  return useMemo(() => {
    if (params.type === 'trip') {
      return getOpenGraphImageForTrip(params)[0];
    } else if (params.type === 'destination') {
      return getOpenGraphImageForDestination(params)[0];
    } else {
      return getOpenGraphImage(params)[0];
    }
  }, [params]);
} 