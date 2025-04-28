import { ItemStatus, ItineraryCategory } from '@/utils/constants';
import { ProcessedVotes } from './votes';
import { Profile } from './profile';

/**
 * Consolidated DisplayItineraryItem interface.
 * This should represent the data structure needed by components.
 */
export interface DisplayItineraryItem {
  id: string;
  trip_id: string;
  section_id?: string | null;
  title: string | null;
  type?: string | null;
  item_type?: string | null;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  address?: string | null;
  place_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  estimated_cost?: number | null;
  currency?: string | null;
  notes?: string | null;
  description?: string | null;
  created_at: string;
  updated_at?: string;
  created_by?: string | null;
  is_custom?: boolean | null;
  day_number?: number | null;
  category?: ItineraryCategory | null;
  status?: ItemStatus | null;
  position?: number | null;
  duration_minutes?: number | null;
  cover_image_url?: string | null;
  votes?: ProcessedVotes;
  user_vote?: 'up' | 'down' | null;
  creatorProfile?: Profile | null;
}

export interface ItemsByDay {
  [key: number]: DisplayItineraryItem[];
}

export interface ItinerarySection {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  title: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  items: DisplayItineraryItem[];
}

/**
 * Interface for backward compatibility with components that use the old ItinerarySection format
 */
export interface LegacyItinerarySection {
  dayNumber: number;
  date: string;
  items: DisplayItineraryItem[];
}

/**
 * Interface for fetched itinerary data from the API
 */
export interface FetchedItineraryData {
  sections: ItinerarySection[];
  unscheduled: DisplayItineraryItem[];
}

// Optional: Interface for Places (if needed)
export interface Place {
  id: string; // UUID
  google_place_id?: string | null;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null; // Or a specific PlaceCategory enum
}