/* eslint-disable prettier/prettier */
// Type definitions for common Supabase tables used in the app
// Basic types for Supabase database tables aligned with the web application
// For table and column names, see: src/constants/database.ts

export interface Profile {
  id: string; // Corresponds to auth.users.id
  created_at: string;
  updated_at: string | null;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean | null;
  location: string | null;
  website: string | null;
  // Add other profile fields as needed
}

export interface Trip {
  id: string;
  created_at: string;
  updated_at: string | null;
  created_by: string; // foreign key to profiles.id
  name: string;
  description: string | null;
  trip_emoji: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  destination_id: string | null; // foreign key to destinations.id
  status: string; // e.g., 'planning', 'upcoming', 'completed'
  is_public: boolean;
  slug: string | null;
  public_slug: string | null;
  privacy_setting: string; // e.g., 'private', 'shared_with_link', 'public'
  likes_count: number;
  view_count: number;
  // Adding these fields to support the UI
  image_url: string | null;
  destination_city: string | null;
  // Add other trip fields as needed
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  day_number?: number;
  start_time?: string;
  end_time?: string;
  category?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  order_in_day?: number;
}

// New Type Definition for Itinerary Templates
export interface ItineraryTemplate {
  id: string;
  created_at?: string; // Optional timestamp
  updated_at?: string; // Optional timestamp
  name: string;
  description: string | null;
  image_url: string | null;
  duration_days: number | null;
  destination_city: string | null;
  tags?: string[] | null; // Assuming tags might be an array of strings
  // Add any other fields from your 'itinerary_templates' table
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  continent?: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at?: string;
}
