/**
 * Multi-City Trip TypeScript Definitions
 *
 * This file contains type definitions related to the multi-city trip feature.
 */

/**
 * Canonical City entity from the cities table
 */
export interface City {
  id: string;
  name: string;
  country?: string | null;
  region?: string | null;
  continent?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapbox_id?: string | null;
  population?: number | null;
  timezone?: string | null;
  country_code?: string | null;
  metadata?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Trip City join table entity that links trips to cities with ordering
 */
export interface TripCity {
  id: string;
  trip_id: string;
  city_id: string;
  position: number;
  arrival_date?: string | null;
  departure_date?: string | null;
  created_at?: string;
  updated_at?: string;

  // Expanded relationship data (not in DB)
  city?: City;
  sections?: ItinerarySectionWithItems[];
}

/**
 * Itinerary Section with Trip City relationship
 * Extends the base ItinerarySection interface from itinerary.ts
 */
export interface ItinerarySectionWithCity {
  id: string;
  trip_id: string;
  trip_city_id?: string | null;
  day_number?: number | null;
  date?: string | null;
  title?: string | null;
  position: number;
  created_at: string;
  updated_at: string;

  // Expanded relationship data (not in DB)
  trip_city?: TripCity;
}

/**
 * Itinerary Section with items included
 */
export interface ItinerarySectionWithItems extends ItinerarySectionWithCity {
  items?: ItineraryItem[];
}

/**
 * Simplified Itinerary Item interface for multi-city context
 */
export interface ItineraryItem {
  id: string;
  trip_id: string;
  section_id?: string | null;
  day_number?: number | null;
  position?: number | null;
  title: string;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  address?: string | null;
  place_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cost?: number | null;
  currency?: string | null;
  category?: string | null;
  status?: string | null;
  cover_image_url?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

/**
 * Multi-City Trip data structure
 * Combines trip data with ordered cities
 */
export interface MultiCityTrip {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;

  // Multi-city specific data
  trip_cities: TripCity[];

  // Helper functions
  getCityById?: (cityId: string) => TripCity | undefined;
  getNextCity?: (currentCityId: string) => TripCity | undefined;
  getPreviousCity?: (currentCityId: string) => TripCity | undefined;
}

/**
 * Request payload for adding a city to a trip
 */
export interface AddCityToTripRequest {
  trip_id: string;
  city_id: string;
  position?: number;
  arrival_date?: string;
  departure_date?: string;
}

/**
 * Response for a successful city addition
 */
export interface AddCityToTripResponse {
  trip_city_id: string;
  position: number;
}

/**
 * Request payload for reordering cities in a trip
 */
export interface ReorderTripCitiesRequest {
  trip_id: string;
  city_ids: string[]; // Ordered array of city IDs
}

/**
 * Simplified destination with city reference
 */
export interface DestinationWithCity {
  id: string;
  name: string;
  description?: string | null;
  city_id?: string | null;
  is_city_deprecated?: boolean;

  // Expanded relationship data (not in DB)
  city?: City;
}
