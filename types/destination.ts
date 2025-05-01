export interface Destination {
  id: string;
  name: string;
  description?: string;
  location: {
    address: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    timezone?: string;
    population?: number;
  };
  place_details?: {
    place_id?: string; // For external APIs like Google Places
    rating?: number;
    total_ratings?: number;
    website?: string;
    phone?: string;
    opening_hours?: {
      periods: Array<{
        open: { day: number; time: string };
        close: { day: number; time: string };
      }>;
      weekday_text: string[];
    };
    price_level?: 1 | 2 | 3 | 4; // $ to $$$$
    types: string[]; // e.g., ['restaurant', 'food', 'point_of_interest']
    photos?: Array<{
      url: string;
      width: number;
      height: number;
      attribution?: string;
    }>;
  };
  weather_data?: {
    average_temperature?: number;
    rainfall?: number;
    humidity?: number;
    best_time_to_visit?: string[];
  };
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  travel_info: {
    local_currency?: string;
    languages?: string[];
    visa_requirements?: string;
    safety_index?: number;
    cost_of_living_index?: number;
  };
  tags: string[];
  popular_activities: string[];
  created_at: string;
  updated_at: string;
  user_generated: boolean; // Whether this was created by a user or from an external API
  verified: boolean; // Whether this has been verified by moderators
  custom_fields?: Record<string, any>; // For additional metadata
}
