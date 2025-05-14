/**
 * Trip Type Definitions
 *
 * This file contains shared type definitions for trips and related entities.
 * These types provide a consistent interface across the application.
 */

// Main trip entity type
export interface Trip {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  city_id?: string | null;
  color_scheme?: string | null;
  cover_image_url?: string | null;
  cover_image_position_y?: number | null;
  budget?: string | null; // Budget is stored as string in database
  guest_token?: string | null;
  guest_ip?: string | null;
  guest_token_text?: string | null;
  is_public?: boolean;
  privacy_setting?: 'private' | 'shared_with_link' | 'public';
  emoji?: string | null;
}

// Type for creating a new trip
export type TripInsert = Omit<Trip, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// Type for updating an existing trip
export type TripUpdate = Partial<Trip>;

// Trip with additional member information
export interface TripWithMemberInfo extends Trip {
  members_count?: number;
  role?: string;
  is_member?: boolean;
}

// Trip membership
export interface TripMembership {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

// Trip with full user profile information
export interface TripWithProfiles extends Trip {
  profiles?: UserProfile[];
}

// Simple user profile type
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}
