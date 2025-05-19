/**
 * Destinations types
 * 
 * Exports all types related to the destinations feature
 */

// Re-export API types from the canonical API shared types
export type {
  Destination,
  // DestinationFilter, // Not defined in _shared, so remove
  // CreateDestinationData, // Not defined in _shared, so remove
  // UpdateDestinationData // Not defined in _shared, so remove
} from '@/lib/api/_shared';

// Additional component-specific types
export interface DisplayDestination {
  id: string;
  city: string | null;
  country: string | null;
  continent?: string;
  name?: string;
  description?: string | null;
  byline?: string | null;
  highlights?: string[] | string | null;
  image_url?: string | null;
  emoji?: string | null;
  image_metadata?: {
    alt_text?: string;
    attribution?: string;
    attributionHtml?: string;
    photographer_name?: string;
    photographer_url?: string;
    source?: string;
    source_id?: string;
    url?: string;
  };
}

/**
 * Converts an API Destination to a DisplayDestination suitable for UI components
 */
export function adaptDestinationForDisplay(apiDestination: Destination): DisplayDestination {
  return {
    id: apiDestination.id,
    name: apiDestination.name ?? undefined,
    city: null,
    country: apiDestination.country ?? null,
    description: apiDestination.description ?? null,
    image_url: ((apiDestination as any).hero_image_url || (apiDestination as any).thumbnail_url) ?? undefined
  };
} 