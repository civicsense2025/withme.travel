/**
 * Place Components Types
 * 
 * Shared type definitions for place-related components
 */

import type { Place as ApiPlace, PlaceCategory } from '@/types/places';

// ============================================================================
// COMPONENT PLACE TYPE
// ============================================================================

/**
 * Place type for UI components
 */
export interface Place {
  id: string;
  name: string;
  category?: string;
  address?: string;
  rating?: number;
  image_url?: string;
  description?: string;
}

/**
 * Props for place list component
 */
export interface PlaceListProps {
  /** List of places to display */
  places: Place[];
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Function called when a place is selected */
  onSelectPlace?: (placeId: string) => void;
  /** Error message if places failed to load */
  error?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for place card component
 */
export interface PlaceCardProps {
  /** Place information */
  place: Place;
  /** Handler for when the card is clicked */
  onClick?: (placeId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert API Place to component-friendly Place format
 */
export function mapApiPlaceToComponentPlace(apiPlace: ApiPlace): Place {
  return {
    id: apiPlace.id,
    name: apiPlace.name,
    category: apiPlace.category || undefined,
    address: apiPlace.address || undefined,
    rating: apiPlace.rating || undefined,
    image_url: apiPlace.cover_image_url || undefined,
    description: apiPlace.description || undefined
  };
} 