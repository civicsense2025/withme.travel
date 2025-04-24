// types/itinerary.ts

import { ItineraryCategory } from "@/utils/constants";

// Basic Itinerary Item type based on usage in ItineraryDisplay/Builder
export interface ItineraryItem {
  id: string;
  trip_id?: string; // Added from ItineraryBuilder usage
  title: string;
  description?: string | null;
  status?: 'suggested' | 'confirmed' | 'rejected';
  // votes?: { // Original complex votes object - commented out as ItineraryTab expects a number
  //   up: number;
  //   down: number;
  //   userVote?: 'up' | 'down' | null;
  //   upVoters?: any[];
  //   downVoters?: any[];
  // };
  votes: number; // Added simple vote count based on ItineraryTab usage
  user_vote: 'up' | 'down' | null; // Added user_vote based on ItineraryTab usage
  is_custom?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  date: string | null; // Added date based on ItineraryTab usage
  day_number?: number | null;
  position?: number | null;
  address?: string | null;
  location?: string | null; // Added location based on ItineraryTab usage
  latitude?: number | null;
  longitude?: number | null;
  place_id?: string | null;
  created_at?: string | null;
  created_by?: string | null;
  // Add missing optional fields
  estimated_cost?: number | null;
  cost?: number | null; // Added cost as potentially different from estimated_cost
  currency?: string | null;
  duration_minutes?: number | null;
  category?: ItineraryCategory | null; // Added category
  type?: string | null; // Added generic type string field
  notes?: any | null; // Added notes field (type any for now, could be refined)
  cover_image_url?: string | null; // Added cover image url
  // Add other fields as needed
}

// Define the structure for items grouped by day number
export interface ItemsByDay {
    [day: number]: ItineraryItem[];
} 