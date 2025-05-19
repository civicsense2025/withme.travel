/**
 * Itineraries Types
 *
 * Shared type definitions for itinerary-related features.
 * 
 * @module lib/features/itineraries/types
 */

// ============================================================================
// ITINERARY ITEM TYPES
// ============================================================================

/**
 * Core itinerary item interface
 */
export interface ItineraryItem {
  /** Unique identifier */
  id: string;
  /** Reference to the trip this item belongs to */
  trip_id: string;
  /** Title of the itinerary item */
  title: string;
  /** Optional description with details */
  description?: string | null;
  /** Start time in ISO format */
  start_time?: string | null;
  /** End time in ISO format */
  end_time?: string | null;
  /** Location description */
  location?: string | null;
  /** When the item was created */
  created_at: string;
  /** User who created the item */
  created_by?: string;
  /** When the item was last updated */
  updated_at?: string | null;
  /** Current status of the item */
  status?: 'suggested' | 'planned' | 'confirmed' | 'cancelled' | null;
  /** Order within the itinerary */
  order?: number;
  /** Specific day for multi-day trips */
  day?: number;
  /** Reference to a place entity */
  place_id?: string | null;
  /** Item category */
  category?: string | null;
  /** Additional data */
  meta?: Record<string, any>;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Itinerary template interface
 */
export interface ItineraryTemplate {
  /** Unique identifier */
  id: string;
  /** Template title */
  title: string;
  /** URL-friendly identifier */
  slug: string;
  /** Detailed description */
  description?: string | null;
  /** Number of days covered by template */
  duration_days?: number | null;
  /** User who created the template */
  created_by: string;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at?: string | null;
  /** Cover image URL */
  image_url?: string | null;
  /** Whether template is publicly available */
  is_published: boolean;
  /** Number of times viewed */
  view_count: number;
  /** Number of times used */
  use_count: number;
  /** Additional metadata */
  metadata?: Record<string, any> | null;
}

/**
 * Template section interface
 */
export interface TemplateSection {
  /** Unique identifier */
  id: string;
  /** Reference to the template */
  template_id: string;
  /** Which day this section represents */
  day_number: number;
  /** Optional section title */
  title?: string | null;
  /** Order within template */
  position: number;
  /** Items within this section */
  items?: TemplateItem[];
}

/**
 * Template item interface
 */
export interface TemplateItem {
  /** Unique identifier */
  id: string;
  /** Reference to parent section */
  section_id: string;
  /** Item title */
  title: string;
  /** Optional details */
  description?: string | null;
  /** Location description */
  location?: string | null;
  /** Duration in minutes */
  duration_minutes?: number | null;
  /** Start time (HH:MM format) */
  start_time?: string | null;
  /** End time (HH:MM format) */
  end_time?: string | null;
  /** Item category */
  category?: string | null;
  /** Order within section */
  position: number;
}

// ============================================================================
// LOGISTICS TYPES
// ============================================================================

/**
 * Logistics item interface
 */
export interface LogisticsItem {
  /** Unique identifier */
  id: string;
  /** Type of logistics item */
  type: 'accommodation' | 'transportation' | 'form';
  /** Item title */
  title: string;
  /** Optional description */
  description?: string | null;
  /** Location information */
  location?: string | null;
  /** Start date in ISO format */
  start_date?: string | null;
  /** End date in ISO format */
  end_date?: string | null;
  /** Reference to trip */
  trip_id?: string | null;
  /** Creation timestamp */
  created_at: string | null;
  /** Additional data */
  meta?: Record<string, any>;
  /** Allow additional properties from database */
  [key: string]: any;
}

// ============================================================================
// API PARAMETER TYPES
// ============================================================================

/**
 * Parameters for creating a template
 */
export interface CreateTemplateParams {
  /** Template title */
  title: string;
  /** Optional description */
  description?: string;
  /** Duration in days */
  durationDays?: number;
  /** Cover image URL */
  imageUrl?: string;
}

/**
 * Parameters for listing templates
 */
export interface ListTemplatesParams {
  /** Maximum number to retrieve */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Filter by published status */
  isPublished?: boolean;
}

/**
 * Accommodation data for creating logistics items
 */
export interface AccommodationData {
  /** Accommodation name */
  title: string;
  /** Address or location */
  location?: string;
  /** Check-in date */
  startDate?: string;
  /** Check-out date */
  endDate?: string;
  /** Additional details */
  description?: string;
}

/**
 * Transportation data for creating logistics items
 */
export interface TransportationData {
  /** Transportation name (e.g., "Flight to Paris") */
  title: string;
  /** Departure location */
  departureLocation?: string;
  /** Arrival location */
  arrivalLocation?: string;
  /** Departure date/time */
  departureDate?: string;
  /** Arrival date/time */
  arrivalDate?: string;
  /** Additional details */
  description?: string;
} 