/**
 * Application Types
 *
 * This file defines shared TypeScript interfaces and types used throughout the application.
 * Types are organized by domain and include comprehensive JSDoc documentation.
 *
 * Note: These types are defined directly in this file to avoid circular dependencies.
 * TODO: Once the imports from database.ts and status.ts are fixed, switch back to importing them.
 */

// ============================================================================
// COMMON ENUMS
// ============================================================================

/**
 * Trip member role types
 * Defines the permission levels for trip members
 */
export type TripRole = 'admin' | 'editor' | 'contributor' | 'viewer';

/**
 * Item status types
 * Defines the possible states for itinerary items
 */
export type ItemStatus = 'suggested' | 'confirmed' | 'canceled' | 'flexible' | 'rejected';

/**
 * Standard itinerary categories
 * Used for categorizing itinerary items and activities
 */
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
  | 'Special Occasions'
  | 'Other';

/**
 * Permission request status types
 * Used for access requests to trips
 */
export type PermissionStatus = 'pending' | 'approved' | 'rejected';

// ============================================================================
// TRIP INTERFACES
// ============================================================================

/**
 * Trip entity as stored in the database
 * Represents the core trip information
 */
export interface Trip {
  /** Unique trip identifier */
  id: string;
  /** Trip name/title */
  name: string;
  /** Trip start date (ISO format) */
  start_date?: string;
  /** Trip end date (ISO format) */
  end_date?: string;
  /** User ID of trip creator (null for anonymous/system created) */
  created_by: string | null;
  /** Linked destination ID */
  destination_id?: string;
  /** Destination name (for denormalized queries) */
  destination_name?: string;
  /** Expected number of travelers */
  travelers_count?: number;
  /** Trip vibe/theme */
  vibe?: string;
  /** Budget range */
  budget?: string;
  /** Whether trip is publicly viewable */
  is_public: boolean;
  /** URL-friendly unique identifier */
  slug?: string;
  /** Public URL slug (may differ from internal slug) */
  public_slug?: string;
  /** Cover image URL */
  cover_image_url?: string;
  /** Creation timestamp (ISO format) */
  created_at: string;
  /** Last updated timestamp (ISO format) */
  updated_at?: string;
  /** Soft delete flag */
  deleted?: boolean;
  /** Featured/staff pick flag */
  featured?: boolean;
  /** Location name (e.g., "Paris, France") */
  location?: string;
  /** Location latitude coordinate */
  latitude?: number;
  /** Location longitude coordinate */
  longitude?: number;
  /** Count of likes/saves */
  like_count?: number;
  /** Count of views */
  view_count?: number;
  /** Count of times used as template */
  use_count?: number;
  /** Trip type (vacation, business, etc.) */
  trip_type?: string;
}

/**
 * Extended trip interface with calculated and display fields
 * Used for UI components that need additional context
 */
export interface TripWithDetails extends Trip {
  /** Count of members on the trip */
  members?: number;
  /** Legacy field for compatibility with TripCard component */
  created_by: string;
  /** Generated or provided description */
  description?: string;
  /** Alternative to name (for UI consistency) */
  title?: string;
  /** Alternative to cover_image_url (for component compatibility) */
  cover_image?: string;
}

/**
 * Trip with member role information
 * Used when displaying trips in the context of a specific user
 */
export interface TripWithMemberInfo extends TripWithDetails {
  /** Current user's role on this trip */
  role: TripRole | null;
  /** When the current user joined this trip */
  memberSince?: string;
}

// ============================================================================
// MEMBER INTERFACES
// ============================================================================

/**
 * Trip member entity
 * Represents a user's membership in a trip
 */
export interface TripMember {
  /** Unique member record ID */
  id: string;
  /** Associated trip ID */
  trip_id: string;
  /** Associated user ID */
  user_id: string;
  /** Member's permission level */
  role: TripRole;
  /** Timestamp when added to trip */
  created_at: string;
  /** User ID of who invited this member */
  invited_by?: string;
  /** Timestamp when user accepted invitation */
  joined_at?: string;
  /** Email for invitees who don't have accounts yet */
  external_email?: string;
  /** Member's preferred category (for filtering) */
  category?: ItineraryCategory | null;
  /** Member status in the group */
  status?: ItemStatus | null;
  /** Display order position */
  position?: number | null;
  /** Role duration in minutes (for temporary roles) */
  duration_minutes?: number | null;
}

/**
 * User profile entity
 * Core user information
 */
export interface Profile {
  /** Unique user identifier */
  id: string;
  /** User's display name */
  name?: string;
  /** User's email address */
  email?: string;
  /** User's avatar image URL */
  avatar_url?: string;
  /** Last profile update timestamp */
  updated_at?: string;
  /** Unique username */
  username?: string;
  /** Profile cover/header image URL */
  cover_image_url?: string;
  /** User biography/about text */
  bio?: string;
  /** User's location */
  location?: string;
  /** User's website URL */
  website?: string;
  /** Verified status flag */
  is_verified?: boolean;
}

/**
 * Trip member with user profile information
 * Used for displaying member information in trip contexts
 */
export interface TripMemberWithProfile extends TripMember {
  /** Associated user profile data */
  profiles?: Profile;
}

// ============================================================================
// DESTINATION & PLACE INTERFACES
// ============================================================================

/**
 * Destination entity
 * Represents a travel destination with detailed attributes
 */
export interface Destination {
  /** Unique destination identifier */
  id: string;
  /** City name */
  city: string;
  /** Country name */
  country: string;
  /** Continent name */
  continent: string;
  /** Featured image URL */
  image_url: string | null;
  /** Popularity score (higher = more popular) */
  popularity?: number;
  /** Average number of travelers */
  travelers_count?: number;
  /** Average days spent in destination */
  avg_days?: number;
  /** Destination description */
  description?: string;
  /** ISO country code */
  country_code?: string;
  /** Postal/ZIP code */
  code_postal?: string;
  /** Latitude coordinate */
  latitude?: number;
  /** Longitude coordinate */
  longitude?: number;
  /** Timezone identifier */
  timezone?: string;
  /** Common languages spoken */
  languages?: string[];
  /** Local currency code */
  currency?: string;
  /** Safety rating (1-10) */
  safety_rating?: number;
  /** Walkability score (1-10) */
  walkability?: number;
  /** Family friendliness score (1-10) */
  family_friendly?: number;
  /** Nightlife quality score (1-10) */
  nightlife_rating?: number;
  /** Beach quality score (1-10) */
  beach_quality?: number;
  /** Shopping experience score (1-10) */
  shopping_rating?: number;
  /** Winter activities score (1-10) */
  winter_rating?: number;
  /** Internet quality score (1-10) */
  wifi_connectivity?: number;
  /** Public transit score (1-10) */
  public_transportation?: number;
  /** Environmental/sustainability score (1-10) */
  eco_friendly_options?: number;
  /** Outdoor recreation score (1-10) */
  outdoor_activities?: number;
  /** Photogenic locations score (1-10) */
  instagram_worthy_spots?: number;
  /** Off-season appeal score (1-10) */
  off_peak_appeal?: number;
  /** Remote work friendliness score (1-10) */
  digital_nomad_friendly?: number;
}

// ============================================================================
// ITINERARY INTERFACES
// ============================================================================

/**
 * Itinerary item entity
 * Represents an activity, event, or place in a trip itinerary
 */
export interface ItineraryItem {
  /** Unique item identifier */
  id: string;
  /** Associated trip ID */
  trip_id: string;
  /** Section ID (grouping by day/category) */
  section_id?: string | null;
  /** Item title */
  title: string | null;
  /** General type category */
  type?: string | null;
  /** Specific item type */
  item_type?: string | null;
  /** Date when activity occurs */
  date: string | null;
  /** Start time (ISO or 24h format) */
  start_time?: string | null;
  /** End time (ISO or 24h format) */
  end_time?: string | null;
  /** Detailed description */
  description?: string | null;
  /** Location name */
  location?: string | null;
  /** Full address */
  address?: string | null;
  /** Reference to external place API (e.g., Google Places) */
  place_id?: string | null;
  /** Latitude coordinate */
  latitude?: number | null;
  /** Longitude coordinate */
  longitude?: number | null;
  /** Estimated cost amount */
  estimated_cost?: number | null;
  /** Currency code for cost */
  currency?: string | null;
  /** Additional notes */
  notes?: string | null;
  /** Creation timestamp */
  created_at: string;
  /** User ID of creator */
  created_by?: string | null;
  /** Flag for custom vs template items */
  is_custom?: boolean | null;
  /** Day number in itinerary */
  day_number?: number | null;
  /** Activity category */
  category?: ItineraryCategory | null;
  /** Item status */
  status?: ItemStatus | null;
  /** Display order position */
  position?: number | null;
  /** Duration in minutes */
  duration_minutes?: number | null;
  /** Cover image URL */
  cover_image_url?: string | null;
  /** Vote statistics for this item */
  votes: {
    /** Count of upvotes */
    up: number;
    /** Count of downvotes */
    down: number;
    /** Users who upvoted */
    upVoters: Profile[];
    /** Users who downvoted */
    downVoters: Profile[];
    /** Current user's vote, if any */
    userVote: 'up' | 'down' | null;
  };
  /** Current user's vote (for quick access) */
  user_vote: 'up' | 'down' | null;
}

// ============================================================================
// BUDGET & FINANCE INTERFACES
// ============================================================================

/**
 * Budget item entity
 * Represents an expense or financial item for a trip
 */
export interface BudgetItem {
  /** Unique budget item identifier */
  id: string;
  /** Associated trip ID */
  trip_id: string;
  /** Item title/description */
  title: string;
  /** Monetary amount */
  amount: number;
  /** Currency code */
  currency: string;
  /** Expense category */
  category?: string;
  /** User ID of payer */
  paid_by?: string;
  /** How the expense is split among travelers */
  split_type?: string;
  /** User ID of creator */
  created_by: string;
  /** Creation timestamp */
  created_at: string;
  /** Last updated timestamp */
  updated_at?: string;
  /** Date of expense */
  date?: string;
}

// ============================================================================
// NOTES & CONTENT INTERFACES
// ============================================================================

/**
 * Collaborative notes entity
 * Represents shared notes for a trip
 */
export interface CollaborativeNote {
  /** Associated trip ID */
  trip_id: string;
  /** Note content (markdown or HTML) */
  content: string;
  /** Last updated timestamp */
  updated_at: string;
  /** User ID of last editor */
  updated_by?: string;
}

/**
 * Library template entity
 * Represents a reusable trip template
 */
export interface LibraryTemplate {
  /** Unique template identifier */
  id: string;
  /** Creator's user ID */
  user_id: string;
  /** Template title */
  title: string;
  /** Template description */
  description?: string;
  /** Destination type category */
  destination_type?: string;
  /** Target destination name */
  destination_name?: string;
  /** Creation timestamp */
  created_at: string;
  /** Last updated timestamp */
  updated_at?: string;
  /** Cover image URL */
  cover_image_url?: string;
  /** Template category */
  category?: string;
  /** Published status flag */
  is_published?: boolean;
  /** View count */
  view_count?: number;
  /** Like/save count */
  like_count?: number;
  /** Target group type */
  grouptype?: string;
}

// ============================================================================
// PERMISSION & ACCESS INTERFACES
// ============================================================================

/**
 * Permission request entity
 * Represents a request to join or access a trip
 */
export interface PermissionRequest {
  /** Unique request identifier */
  id: string;
  /** Associated trip ID */
  trip_id: string;
  /** Requesting user ID */
  user_id: string;
  /** Requested permission level */
  role: TripRole;
  /** Request timestamp */
  created_at: string;
  /** Request status */
  status: PermissionStatus;
}

/**
 * Referral entity
 * Represents a user referral code
 */
export interface Referral {
  /** Unique referral identifier */
  id: string;
  /** Referring user ID */
  user_id: string;
  /** Unique referral code */
  referral_code: string;
  /** Creation timestamp */
  created_at: string;
  /** Last updated timestamp */
  updated_at?: string;
}

// ============================================================================
// API & DATA ACCESS INTERFACES
// ============================================================================

/**
 * Query parameters for database requests
 * Used for constructing parameterized queries
 */
export interface DbQueryParams {
  /** Target database table */
  table: string;
  /** Comma-separated list of fields to select */
  select: string;
  /** Optional filter conditions */
  filters?: Array<{
    /** Field to filter on */
    field: string;
    /** Value to match */
    value: string | number | boolean;
    /** Comparison operator (default: =) */
    operator?: string;
  }>;
  /** Optional sorting */
  order?: {
    /** Field to sort by */
    field: string;
    /** Sort direction */
    ascending: boolean;
  };
  /** Maximum number of records to return */
  limit?: number;
  /** Number of records to skip (for pagination) */
  offset?: number;
}

/**
 * Standard API response shape
 * Consistent structure for all API responses
 */
export interface ApiResponse<T> {
  /** Response data payload */
  data?: T;
  /** Error information (if any) */
  error?: {
    /** Error message */
    message: string;
    /** Additional error details */
    details?: any;
  };
  /** HTTP status code */
  status?: number;
  /** Metadata for pagination/counts */
  meta?: {
    /** Count of returned items */
    count?: number;
    /** Current page number */
    page?: number;
    /** Total available pages */
    totalPages?: number;
  };
}
