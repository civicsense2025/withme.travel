import { Place } from './places';
import { Profile } from './profile';
import { ProcessedVotes, Vote } from './votes';
import { type ItemStatus } from '@/utils/constants/status';
import type { Tables } from './.database.types';
type ItineraryItemReaction = Tables<'itinerary_item_reactions'>;

// --- Base Itinerary Item Interfaces ---

export interface FetchedItineraryItemData {
  id: string;
  trip_id: string;
  title: string | null;
  created_at: string;
  section_id: string | null;
  type: string | null;
  item_type: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  address: string | null;
  place_id: string | null;
  latitude: number | null;
  longitude: number | null;
  estimated_cost: number | null;
  currency: string | null;
  notes: string | null;
  description: string | null;
  updated_at: string | null;
  created_by: string | null;
  is_custom: boolean | null;
  day_number: number | null;
  category: string | null;
  status: ItemStatus | null;
  position: number | null;
  duration_minutes: number | null;
  cover_image_url: string | null;
  creator_profile?: Profile;
  votes?: ProcessedVotes;
}

// Define accepted categories
export type ItineraryCategory =
  | 'Iconic Landmarks'
  | 'Local Secrets'
  | 'Cultural Experiences'
  | 'Outdoor Adventures'
  | 'Food & Drink'
  | 'Nightlife'
  | 'Relaxation'
  | 'Shopping'
  | 'Group Activities'
  | 'Day Excursions'
  | 'Accommodations'
  | 'Transportation'
  | 'Flexible Options'
  | 'Special Occasions';

/**
 * Interface for displaying itinerary items in the UI
 */
export interface DisplayItineraryItem extends FetchedItineraryItemData {
  // Add any UI-specific properties if needed in the future
  votes: ProcessedVotes; // Processed vote counts and user's vote
  user_vote?: 'up' | 'down' | null; // Optional duplication for easier access
  creatorProfile: Profile | null; // Ensure creator profile is properly typed
  place?: Place | null; // Optional associated place details
  formattedCategory?: string; // Formatted category name for display
}

export interface OrganizedItinerary {
  sections: ItinerarySection[];
  unscheduled: DisplayItineraryItem[];
}

/**
 * Vote information for an item
 */
export type ItemVote = {
  up: number;
  down: number;
  upVoters: string[];
  downVoters: string[];
  userVote: 'up' | 'down' | null; // User's vote on this item
};

// Re-export ItemStatus for backward compatibility
export type { ItemStatus };

// --- Combined Itinerary Item Types ---

/**
 * Comprehensive ItineraryItem interface that combines all needed fields
 */
export interface ItineraryItem {
  // Required fields
  id: string;
  trip_id: string;
  created_at: string;

  // Optional fields with proper typing
  section_id: string | null;
  title: string | null;
  type: string | null;
  item_type: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  address: string | null;
  place_id: string | null;
  latitude: number | null;
  longitude: number | null;
  estimated_cost: number | null;
  currency: string | null;
  notes: string | null;
  description: string | null;
  updated_at: string | null;
  created_by: string | null;
  is_custom: boolean | null;
  day_number: number | null;
  category: ItineraryCategory | string | null;
  status: ItemStatus | 'pending' | 'approved' | 'rejected' | null;
  position: number | null;
  duration_minutes: number | null;
  cover_image_url: string | null;

  // Related data
  votes: ProcessedVotes;
  user_vote?: 'up' | 'down' | null;
  creatorProfile: Profile | null;
  place?: Place | null;
  reactions?: ItineraryItemReaction[]; // All emoji reactions for this item
}

/**
 * Comprehensive ItinerarySection interface
 */
export interface ItinerarySection {
  // Required fields
  id: string;
  trip_id: string;
  position: number;
  created_at: string;
  updated_at: string;

  // Optional fields
  day_number: number | null;
  date: string | null;
  title: string | null;

  // Items in this section (optional since some uses don't include items)
  items?: ItineraryItem[];
}

/**
 * Helper interface for organizing items by day
 */
export interface ItemsByDay {
  [key: number]: ItineraryItem[];
}

/**
 * Interface for backward compatibility with components that use the old ItinerarySection format
 */
export interface LegacyItinerarySection {
  dayNumber: number;
  date: string;
  items: ItineraryItem[];
}

/**
 * Interface for fetched itinerary data from the API
 */
export interface FetchedItineraryData {
  sections: ItinerarySection[];
  unscheduled: ItineraryItem[];
}

/**
 * Interface for data returned from the URL scraping endpoint
 */
export interface ScrapedUrlData {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  scrapedUrl: string;
}

/**
 * Types for itinerary-related functionality
 */

export interface ItineraryTemplateMetadata {
  // Basic fields
  pace?: string;
  budget?: string;
  budget_level?: string;
  travel_style?: string;
  audience?: string;
  seasonality?: string;
  highlights?: string[];
  rating?: number;

  // New detailed metadata fields
  best_for?: string[];
  languages?: string[];
  local_tips?: string[];
  best_seasons?: string[];
  avoid_seasons?: string[];
  morning_start?: string;
  accessibility_level?: string;
  sustainability_aspects?: string[];
  estimated_budget_usd_per_day?: number;

  // Allow for additional fields
  [key: string]: any;
}

/**
 * Interface for an itinerary template with proper typing for metadata
 */
export interface ItineraryTemplate {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  destination_id: string;
  duration_days: number;
  category: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  view_count: number;
  use_count: number;
  like_count: number;
  featured: boolean;
  cover_image_url: string | null;
  groupsize: string | null;
  tags: string[] | null;
  template_type: 'official' | 'user_created' | 'trip_based' | null;
  source_trip_id: string | null;
  version: number;
  copied_count: number;
  last_copied_at: string | null;
  metadata: ItineraryTemplateMetadata | null;
}
