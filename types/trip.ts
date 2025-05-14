import { TripType, TripStatus } from '@/utils/constants/status';
import { User } from './user';
import { Destination } from './destination';
import { Database } from './database.types';

/**
 * Type for a trip member passed from SSR data
 */
export interface LocalTripMemberFromSSR {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  joined_at: string;
  profiles: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

/**
 * Type for a manual expense
 */
export interface ManualDbExpense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paid_by: string; // User ID
  date: string; // ISO string
  created_at: string;
  updated_at?: string | null;
  source?: string | null;
}

/**
 * Type for a unified expense representation
 */
export interface UnifiedExpense {
  id: string | number;
  title: string | null;
  amount: number | null;
  currency: string | null;
  category: string | null;
  date: string | null;
  paidBy?: string | null;
  source: 'manual' | 'planned';
}

/**
 * Type for trip privacy settings
 */
export type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';

/**
 * Type for an itinerary section
 */
export interface ItinerarySection {
  id: string;
  trip_id: string;
  day_number: number | null;
  date: string | null;
  title: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  items: any[]; // Use a more specific type in your actual implementation
}

// Define the complex budget object type
export interface TripBudgetObject {
  total: number;
  currency: string;
  categories?: {
    // Made categories optional as it might not always be present
    accommodation?: number;
    transportation?: number;
    activities?: number;
    food?: number;
    shopping?: number;
    other?: number;
  };
}

// Modify the existing interface Trip
export interface Trip {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null; // Allow null
  start_date: string | null;
  end_date: string | null;
  destination_id: string | null;
  destination_name: string | null;
  cover_image_url: string | null | undefined; // Allow undefined
  created_at: string;
  updated_at: string | null; // Allow null
  status: TripStatus | null;
  is_public: boolean;
  vibe: string | null;
  trip_type: TripType | null;
  // Add/Ensure missing fields are present
  slug: string | null;
  public_slug: string | null; // Keep if needed elsewhere
  privacy_setting: 'private' | 'shared_with_link' | 'public' | null;
  duration_days: number | null;
  playlist_url: string | null;
  // Update budget type
  budget: TripBudgetObject | number | null; // Allow number for simpler budget or the object
}

// Define TripRole based on the constants structure
export type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';
