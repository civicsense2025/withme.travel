/**
 * Place type definitions
 * 
 * Unified definition for place objects throughout the application.
 */

// Place categories enum
export enum PlaceCategory {
  ATTRACTION = 'attraction',
  RESTAURANT = 'restaurant',
  HOTEL = 'hotel',
  CAFE = 'cafe',
  BAR = 'bar',
  SHOPPING = 'shopping',
  LANDMARK = 'landmark',
  MUSEUM = 'museum',
  PARK = 'park',
  BEACH = 'beach',
  AIRPORT = 'airport',
  TRANSPORTATION = 'transportation',
  ENTERTAINMENT = 'entertainment',
  NIGHTLIFE = 'nightlife',
  SERVICE = 'service',
  SPORTS = 'sports',
  OTHER = 'other',
}

// Core Place interface
export interface Place {
  id: string;
  name: string;
  
  // Location details
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  
  // Descriptive details
  description: string | null;
  category: PlaceCategory | string | null;
  
  // Optional commerce-related attributes
  price_level?: number | null;
  rating?: number | null;
  rating_count?: number | null;
  
  // Optional web details
  website?: string | null;
  phone_number?: string | null;
  
  // Contextual metadata
  destination_id?: string | null;
  is_verified?: boolean;
  suggested_by?: string | null;
  source?: string | null;
  place_type?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string | null;
  
  // Tags and additional data
  tags?: string[] | null;
  cover_image_url?: string | null;
  external_id?: string | null;
  external_source?: string | null;
}

// Type for creating new places with minimal required fields
export interface CreatePlaceInput {
  name: string;
  description?: string | null;
  category?: PlaceCategory | string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  destination_id?: string | null;
  website?: string | null;
  phone_number?: string | null;
}

// Place with associated trips
export interface PlaceWithTrips extends Place {
  trips: {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    destination_name: string | null;
    is_draft: boolean;
  }[];
}

// Export the default Place type as a shorthand
export default Place;
