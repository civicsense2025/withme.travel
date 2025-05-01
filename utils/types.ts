import { TripRole, PermissionStatus, ItineraryCategory } from './constants';

// Define ItemStatus before its use
export type ItemStatus = 'suggested' | 'confirmed' | 'rejected';

// Trip entity as stored in the database
export interface Trip {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  created_by: string | null; // Allow null for creator
  destination_id?: string;
  destination_name?: string;
  travelers_count?: number;
  vibe?: string;
  budget?: string;
  is_public: boolean;
  slug?: string;
  public_slug?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at?: string;
  deleted?: boolean;
  featured?: boolean;
  location?: string;
  latitude?: number;
  longitude?: number;
  like_count?: number;
  view_count?: number;
  use_count?: number;
  trip_type?: string;
}

// Extended trip interface with calculated fields
export interface TripWithDetails extends Trip {
  members?: number; // Count of members
  created_by: string; // Legacy field for compatibility with TripCard
  description?: string; // Generated or provided description
  title?: string; // Alternative to name
  cover_image?: string; // Alternative to cover_image_url
}

// Trip with member role information
export interface TripWithMemberInfo extends TripWithDetails {
  role: TripRole | null; // Allow null for role
  memberSince?: string;
}

// Trip member entity
export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  created_at: string;
  invited_by?: string;
  joined_at?: string;
  external_email?: string;
}

// User profile entity
export interface Profile {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  updated_at?: string;
  username?: string;
  cover_image_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  is_verified?: boolean;
}

// Trip member with user profile
export interface TripMemberWithProfile extends TripMember {
  profiles?: Profile;
}

// Destination entity
export interface Destination {
  id: string;
  city: string;
  country: string;
  continent: string;
  image_url: string | null;
  popularity?: number;
  travelers_count?: number;
  avg_days?: number;
  description?: string;
  country_code?: string;
  code_postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  languages?: string[];
  currency?: string;
  safety_rating?: number;
  walkability?: number;
  family_friendly?: number;
  nightlife_rating?: number;
  beach_quality?: number;
  shopping_rating?: number;
  winter_rating?: number;
  wifi_connectivity?: number;
  public_transportation?: number;
  eco_friendly_options?: number;
  outdoor_activities?: number;
  instagram_worthy_spots?: number;
  off_peak_appeal?: number;
  digital_nomad_friendly?: number;
}

// Replace the old ItineraryItem definition with the more complete one
export interface ItineraryItem {
  id: string;
  trip_id: string;
  section_id?: string | null; // Added from API response structure
  title: string | null;
  type?: string | null; // Original 'type' field from schema
  item_type?: string | null; // Added 'item_type' field from schema
  date: string | null; // Kept as string from fetch
  start_time?: string | null; // Optional start time
  end_time?: string | null; // Optional end time
  description?: string | null; // Add optional description field
  location?: string | null;
  address?: string | null;
  place_id?: string | null; // Added from schema
  latitude?: number | null;
  longitude?: number | null;
  estimated_cost?: number | null; // Use correct name
  currency?: string | null;
  notes?: string | null; // Added notes field
  created_at: string;
  created_by?: string | null; // Added from schema
  is_custom?: boolean | null; // Added from schema
  day_number?: number | null; // Added from schema
  category?: ItineraryCategory | null; // Use ItineraryCategory enum type
  status?: ItemStatus | null; // Use ItemStatus enum type
  position?: number | null; // Type is numeric in schema
  duration_minutes?: number | null; // Added from schema
  cover_image_url?: string | null; // Added from schema
  // Define ProcessedVotes structure directly or import if defined elsewhere
  votes: {
    up: number;
    down: number;
    upVoters: Profile[]; // Assuming Profile is defined/imported
    downVoters: Profile[]; // Assuming Profile is defined/imported
    userVote: 'up' | 'down' | null;
  };
  user_vote: 'up' | 'down' | null; // Keep this for direct access if needed
}

// Budget item entity
export interface BudgetItem {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category?: string;
  paid_by?: string;
  split_type?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  date?: string;
}

// Collaborative notes entity
export interface CollaborativeNote {
  trip_id: string;
  content: string;
  updated_at: string;
  updated_by?: string;
}

// Library template entity
export interface LibraryTemplate {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  destination_type?: string;
  destination_name?: string;
  created_at: string;
  updated_at?: string;
  cover_image_url?: string;
  category?: string;
  is_published?: boolean;
  view_count?: number;
  like_count?: number;
  grouptype?: string;
}

// Permission request entity
export interface PermissionRequest {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  created_at: string;
  status: PermissionStatus;
}

// Referral entity
export interface Referral {
  id: string;
  user_id: string;
  referral_code: string;
  created_at: string;
  updated_at?: string;
}

// Query parameters for database requests
export interface DbQueryParams {
  table: string;
  select: string;
  filters?: Array<{
    field: string;
    value: string | number | boolean;
    operator?: string;
  }>;
  order?: {
    field: string;
    ascending: boolean;
  };
  limit?: number;
  offset?: number;
}

// Standard API response shape
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  status?: number;
  meta?: {
    count?: number;
    page?: number;
    totalPages?: number;
  };
}
