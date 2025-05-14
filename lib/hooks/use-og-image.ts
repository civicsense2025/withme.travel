/**
 * Hook for generating Open Graph images for use in Next.js metadata
 *
 * This utility helps generate dynamic OG images for social sharing, similar to
 * how Perplexity auto-generates sharing thumbnails.
 */

import { useMemo } from 'react';

export interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

interface ThumbnailBaseParams {
  width?: number;
  height?: number;
  bgColor?: string;
  textColor?: string;
}

interface GenericThumbnailParams extends ThumbnailBaseParams {
  title: string;
  subtitle?: string;
}

interface TripThumbnailParams extends ThumbnailBaseParams {
  tripId: string;
}

interface DestinationThumbnailParams extends ThumbnailBaseParams {
  destinationId?: string;
  city?: string;
  country?: string;
  imageUrl?: string;
  description?: string;
}

const DEFAULT_DIMENSIONS = {
  width: 1200,
  height: 630,
};

/**
 * Generates a generic thumbnail URL with the provided parameters
 */
export function getGenericThumbnailUrl({
  title,
  subtitle,
  bgColor,
  textColor,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
}: GenericThumbnailParams): string {
  // Create URL for the thumbnail API
  const url = new URL(
    '/api/thumbnail',
    process.env.NEXT_PUBLIC_SITE_URL || 'https://withme.travel'
  );

  // Add parameters
  const params = new URLSearchParams();
  params.append('title', title);
  if (subtitle) params.append('subtitle', subtitle);
  if (bgColor) params.append('bgColor', bgColor);
  if (textColor) params.append('textColor', textColor);
  if (width !== DEFAULT_DIMENSIONS.width) params.append('width', width.toString());
  if (height !== DEFAULT_DIMENSIONS.height) params.append('height', height.toString());

  return `${url.toString()}?${params.toString()}`;
}

/**
 * Generates a trip-specific thumbnail URL
 */
export function getTripThumbnailUrl({
  tripId,
  width = DEFAULT_DIMENSIONS.width,
  height = DEFAULT_DIMENSIONS.height,
}: TripThumbnailParams): string {
  const url = new URL(
    `/api/thumbnail/trip`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://withme.travel'
  );

  // Add parameters
  const params = new URLSearchParams();
  params.append('tripId', tripId);
  if (width !== DEFAULT_DIMENSIONS.width) params.append('width', width.toString());
  if (height !== DEFAULT_DIMENSIONS.height) params.append('height', height.toString());

  return `${url.toString()}?${params.toString()}`;
}

/**
 * Generates a destination-specific thumbnail URL
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
  const url = new URL(
    `/api/thumbnail/destination`,
    process.env.NEXT_PUBLIC_SITE_URL || 'https://withme.travel'
  );

  // Add parameters
  const params = new URLSearchParams();

  if (destinationId) {
    // If we have a destination ID, use that
    params.append('destinationId', destinationId);
  } else if (city && country) {
    // Otherwise, we need city and country
    params.append('city', city);
    params.append('country', country);

    // Add optional parameters
    if (imageUrl) params.append('image_url', imageUrl);
    if (description) params.append('description', description);
  } else {
    throw new Error('Either destinationId or both city and country must be provided');
  }

  if (width !== DEFAULT_DIMENSIONS.width) params.append('width', width.toString());
  if (height !== DEFAULT_DIMENSIONS.height) params.append('height', height.toString());

  return `${url.toString()}?${params.toString()}`;
}

/**
 * Creates Open Graph image objects for Next.js metadata
 *
 * @example
 * ```tsx
 * // In a Metadata function
 * export async function generateMetadata({ params }): Metadata {
 *   const trip = await getTrip(params.tripId);
 *   return {
 *     title: trip.name,
 *     openGraph: {
 *       images: getOpenGraphImageForTrip({ tripId: trip.id }),
 *     }
 *   };
 * }
 * ```
 */
export function getOpenGraphImageForTrip(params: TripThumbnailParams): OpenGraphImage[] {
  const url = getTripThumbnailUrl(params);

  return [
    {
      url,
      width: params.width || DEFAULT_DIMENSIONS.width,
      height: params.height || DEFAULT_DIMENSIONS.height,
      alt: 'Trip thumbnail',
    },
  ];
}

/**
 * Creates Open Graph image objects for destination pages
 */
export function getOpenGraphImageForDestination(
  params: DestinationThumbnailParams
): OpenGraphImage[] {
  const url = getDestinationThumbnailUrl(params);

  return [
    {
      url,
      width: params.width || DEFAULT_DIMENSIONS.width,
      height: params.height || DEFAULT_DIMENSIONS.height,
      alt: params.city ? `${params.city}, ${params.country}` : 'Destination thumbnail',
    },
  ];
}

/**
 * Creates Open Graph image objects for generic content
 */
export function getOpenGraphImage(params: GenericThumbnailParams): OpenGraphImage[] {
  const url = getGenericThumbnailUrl(params);

  return [
    {
      url,
      width: params.width || DEFAULT_DIMENSIONS.width,
      height: params.height || DEFAULT_DIMENSIONS.height,
      alt: params.title,
    },
  ];
}

/**
 * React hook for generating Open Graph images
 *
 * This is primarily useful in client-side components that need to generate
 * preview URLs for social sharing features.
 *
 * @example
 * ```tsx
 * const MyComponent = ({ trip }) => {
 *   const ogImage = useOpenGraphImage({
 *     type: 'trip',
 *     tripId: trip.id
 *   });
 *
 *   return (
 *     <SocialShareButton
 *       title={trip.name}
 *       imageUrl={ogImage.url}
 *     />
 *   );
 * }
 * ```
 */
export function useOpenGraphImage(
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
      return getOpenGraphImageForTrip({ tripId: params.tripId })[0];
    } else if (params.type === 'destination') {
      return getOpenGraphImageForDestination({
        destinationId: params.destinationId,
        city: params.city,
        country: params.country,
        imageUrl: params.imageUrl,
        description: params.description,
      })[0];
    } else {
      return getOpenGraphImage({
        title: params.title,
        subtitle: params.subtitle,
      })[0];
    }
  }, [params]);
}

export default useOpenGraphImage;
