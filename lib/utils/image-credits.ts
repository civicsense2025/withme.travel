/**
 * Utility functions for handling image attribution and credits
 */

/**
 * Image data interface matching database schema
 */
export interface ImageAttributionData {
  id?: string | number;
  external_id?: string | null;
  source?: string | null;
  url?: string | null;
  image_url?: string | null;
  alt_text?: string | null;
  photographer?: string | null;
  photographer_url?: string | null;
  attribution_html?: string | null;
  // Legacy fields for backward compatibility
  source_name?: string | null;
  source_url?: string | null;
}

/**
 * Generate HTML attribution string for image credits with hyperlinks
 */
export function createImageAttribution(
  image: ImageAttributionData | null | undefined
): string | null {
  if (!image) return null;

  // Extract relevant fields, using newer field names with fallbacks to legacy fields
  const source = image.source || image.source_name;
  const sourceUrl = getSourceUrl(image);
  const photographer = image.photographer;
  const photographerUrl = image.photographer_url;

  // Return existing HTML attribution if available
  if (image.attribution_html) return image.attribution_html;

  // If we have both source and photographer, create a new attribution
  if (source && photographer) {
    const sourceName = source.charAt(0).toUpperCase() + source.slice(1); // Capitalize source

    const photographerPart = photographerUrl
      ? `<a href="${photographerUrl}" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">${photographer}</a>`
      : photographer;

    const sourcePart = sourceUrl
      ? `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">${sourceName}</a>`
      : sourceName;

    return `Photo by ${photographerPart} on ${sourcePart}`;
  }

  // If we have only photographer, mention them without source
  if (photographer) {
    return photographerUrl
      ? `Photo by <a href="${photographerUrl}" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">${photographer}</a>`
      : `Photo by ${photographer}`;
  }

  // If we have only source, mention it without photographer
  if (source) {
    const sourceName = source.charAt(0).toUpperCase() + source.slice(1); // Capitalize source
    return sourceUrl
      ? `Photo from <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="underline hover:text-white">${sourceName}</a>`
      : `Photo from ${sourceName}`;
  }

  return null;
}

/**
 * Generate the source URL from image data for Unsplash and Pexels
 */
function getSourceUrl(image: ImageAttributionData): string | null {
  // Use existing source_url if available
  if (image.source_url) return image.source_url;

  const source = image.source || image.source_name;
  const externalId = image.external_id;
  const url = image.url;

  if (!source) return null;

  // Build standard URLs for known sources
  if (source.toLowerCase() === 'pexels' && externalId) {
    return `https://www.pexels.com/photo/${externalId}`;
  }

  if (source.toLowerCase() === 'unsplash' && externalId) {
    return `https://unsplash.com/photos/${externalId}`;
  }

  // Fallback to general image URL if available
  return url || null;
}

/**
 * Create a React-friendly object with attribution details
 */
export function getImageAttributionDetails(image: ImageAttributionData | null | undefined) {
  if (!image) return null;

  return {
    alt: image.alt_text || 'Image',
    attributionHtml: createImageAttribution(image),
    source: image.source || image.source_name,
    sourceUrl: getSourceUrl(image),
    photographer: image.photographer,
    photographerUrl: image.photographer_url,
  };
}
