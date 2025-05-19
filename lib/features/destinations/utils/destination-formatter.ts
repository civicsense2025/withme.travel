/**
 * Destination Formatter Utilities
 * 
 * Helper functions for formatting destination data for display
 */

import type { Destination } from '../types';

/**
 * Formats a destination's location string (City, Country)
 */
export function formatDestinationLocation(destination: Destination): string {
  const parts = [];
  
  if (destination.name) parts.push(destination.name);
  if (destination.country) parts.push(destination.country);
  
  return parts.join(', ');
}

/**
 * Gets a simple display name for a destination
 */
export function getDestinationDisplayName(destination: Destination): string {
  return destination.name || 'Unknown Destination';
}

/**
 * Creates a URL-friendly path for a destination
 */
export function getDestinationPath(destination: Destination): string {
  return `/destinations/${destination.slug || destination.id}`;
}

/**
 * Returns the appropriate image URL for a destination
 * Falls back to thumbnail or a default image if hero image is not available
 */
export function getDestinationImageUrl(destination: Destination): string {
  return destination.hero_image_url || 
    destination.thumbnail_url || 
    '/images/default-destination.jpg';
}

/**
 * Returns a short excerpt from the destination description
 */
export function getDestinationExcerpt(destination: Destination, maxLength = 150): string {
  if (!destination.description) return '';
  
  if (destination.description.length <= maxLength) {
    return destination.description;
  }
  
  // Find the last space before maxLength to avoid cutting words
  const lastSpaceIndex = destination.description.substring(0, maxLength).lastIndexOf(' ');
  const excerpt = destination.description.substring(0, lastSpaceIndex > 0 ? lastSpaceIndex : maxLength);
  
  return `${excerpt}...`;
} 