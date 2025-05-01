// Basic types for Supabase database tables aligned with the web application
// For table and column names, see: src/constants/database.ts

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  location: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  created_by: string;
  name: string;
  description: string | null;
  trip_emoji: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  destination_id: string | null;
  status: 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled'; // See ENUM_VALUES.TRIP_STATUS
  is_public: boolean;
  slug: string | null;
  public_slug: string | null;
  privacy_setting: 'private' | 'shared_with_link' | 'public' | null; // See ENUM_VALUES.PRIVACY_SETTING
  likes_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface TripMember {
  trip_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer' | 'contributor'; // See ENUM_VALUES.TRIP_MEMBER_ROLE
  invited_by: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  continent: string | null;
  description: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  created_by: string;
  title: string;
  description: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  day_number: number | null;
  place_id: string | null;
  category: string | null;
  location_name: string | null;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  status: 'suggested' | 'confirmed' | 'rejected' | null; // See ENUM_VALUES.ITINERARY_ITEM_STATUS
  created_at: string;
  updated_at: string;
}

export interface UserPresence {
  user_id: string;
  trip_id: string;
  status: 'online' | 'offline' | 'away'; // See ENUM_VALUES.USER_PRESENCE_STATUS
  last_active: string;
  name?: string;
  email?: string;
  avatar_url?: string | null;
}
