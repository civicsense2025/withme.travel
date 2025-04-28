// Database Tables - Constant names for all database tables
export const DB_TABLES = {
  PROFILES: 'profiles',
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  ITINERARY_ITEMS: 'itinerary_items',
  DESTINATIONS: 'destinations',
  USER_PRESENCE: 'user_presence',
  VOTES: 'votes',
  COLLABORATIVE_SESSIONS: 'collaborative_sessions',
  TEMPLATE_SECTIONS: 'template_sections',
  TEMPLATE_ACTIVITIES: 'template_activities',
  INVITATIONS: 'invitations',
  EXPENSES: 'expenses',
  REFERRALS: 'referrals',
  PERMISSION_REQUESTS: 'permission_requests',
  LIKES: 'likes',
  TRIP_IMAGES: 'trip_images',
  TRIP_NOTES: 'trip_notes',
  IMAGE_METADATA: 'image_metadata',
  ITINERARY_TEMPLATES: 'itinerary_templates',
  TRIP_TEMPLATE_USES: 'trip_template_uses',
  ALBUMS: 'albums',
} as const;

// Database Enums - Type-safe enum values from supabase.ts
export const DB_ENUMS = {
  TRIP_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    CONTRIBUTOR: 'contributor'
  },
  CONTENT_TYPES: {
    TRIP: 'trip',
    ITINERARY_ITEM: 'itinerary_item',
    DESTINATION: 'destination',
    TEMPLATE: 'template'
  },
  URL_FORMATS: {
    SLUG: 'slug',
    UUID: 'uuid',
    CUSTOM: 'custom'
  },
  QUALITY_TIERS: {
    PREMIUM: 'premium',
    VERIFIED: 'verified',
    STANDARD: 'standard',
    COMMUNITY: 'community'
  },
  IMAGE_TYPES: {
    DESTINATION: 'destination',
    TRIP_COVER: 'trip_cover',
    USER_AVATAR: 'user_avatar',
    TEMPLATE_COVER: 'template_cover'
  },
  INVITATION_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    EXPIRED: 'expired'
  },
  PRESENCE_STATUS: {
    ONLINE: 'online',
    AWAY: 'away',
    OFFLINE: 'offline',
    EDITING: 'editing'
  },
  REQUEST_STATUSES: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },
  ACCESS_REQUEST_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  }
} as const;

// Database Field names by table
// Note: We're using DB_FIELDS instead of DB_COLUMNS for better naming consistency
export const DB_FIELDS = {
  // Common fields across tables
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // Profiles table fields
  PROFILES: {
    ID: 'id',
    NAME: 'name',
    EMAIL: 'email',
    AVATAR_URL: 'avatar_url',
    USERNAME: 'username',
    BIO: 'bio',
    IS_ADMIN: 'is_admin',
    IS_VERIFIED: 'is_verified',
    UPDATED_AT: 'updated_at',
    COVER_IMAGE_URL: 'cover_image_url',
    LOCATION: 'location',
    WEBSITE: 'website'
  },
  
  // Trips table fields
  TRIPS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    DESTINATION_ID: 'destination_id',
    DESTINATION_NAME: 'destination_name',
    TRAVELERS_COUNT: 'travelers_count',
    VIBE: 'vibe',
    BUDGET: 'budget',
    IS_PUBLIC: 'is_public',
    SLUG: 'slug',
    PUBLIC_SLUG: 'public_slug',
    COVER_IMAGE_URL: 'cover_image_url',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    DELETED: 'deleted',
    FEATURED: 'featured',
    LOCATION: 'location',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    LIKE_COUNT: 'likes_count',
    VIEW_COUNT: 'view_count',
    USE_COUNT: 'use_count',
    TRIP_TYPE: 'trip_type',
    CREATED_BY: 'created_by',
    DURATION_DAYS: 'duration_days',
    DATE_FLEXIBILITY: 'date_flexibility',
    MEMBER_COUNT: 'member_count',
    TRIP_EMOJI: 'trip_emoji',
    STATUS: 'status',
    COMMENTS_COUNT: 'comments_count',
    SHARED_URL: 'shared_url',
    PRIVACY_SETTING: 'privacy_setting'
  },
  
  // Trip members table fields
  TRIP_MEMBERS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
    CREATED_AT: 'created_at',
    INVITED_BY: 'invited_by',
    JOINED_AT: 'joined_at',
    EXTERNAL_EMAIL: 'external_email'
  },
  
  // Itinerary items table fields
  ITINERARY_ITEMS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    TITLE: 'title',
    LOCATION: 'location',
    ADDRESS: 'address',
    START_TIME: 'start_time',
    END_TIME: 'end_time',
    DATE: 'date',
    CREATED_BY: 'created_by',
    CREATED_AT: 'created_at',
    CATEGORY: 'category',
    POSITION: 'position',
    STATUS: 'status',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    TYPE: 'type',
    COVER_IMAGE_URL: 'cover_image_url',
    DAY_NUMBER: 'day_number',
    ESTIMATED_COST: 'estimated_cost',
    CURRENCY: 'currency',
    DURATION_MINUTES: 'duration_minutes',
    NOTES: 'notes',
    SECTION_ID: 'section_id',
    PLACE_ID: 'place_id',
    ITEM_TYPE: 'item_type',
    IS_CUSTOM: 'is_custom',
    DESCRIPTION: 'description',
    // Content sharing fields
    ORIGINAL_DESCRIPTION: 'original_description',
    PERSONAL_NOTES: 'personal_notes',
    SOURCE_ITEM_ID: 'source_item_id',
    ORIGINAL_CREATOR_ID: 'original_creator_id',
    ATTRIBUTION_TEXT: 'attribution_text',
    // Quality metrics
    QUALITY_TIER: 'quality_tier',
    QUALITY_SCORE: 'quality_score',
    POPULARITY_SCORE: 'popularity_score',
    // SEO fields
    CANONICAL_ID: 'canonical_id',
    CANONICAL_URL: 'canonical_url',
    PUBLIC_SLUG: 'public_slug',
    META_TITLE: 'meta_title',
    META_DESCRIPTION: 'meta_description'
  },
  
  // User presence table fields
  USER_PRESENCE: {
    ID: 'id',
    USER_ID: 'user_id',
    TRIP_ID: 'trip_id',
    STATUS: 'status',
    LAST_ACTIVE: 'last_active',
    DOCUMENT_ID: 'document_id',
    EDITING_ITEM_ID: 'editing_item_id',
    CURSOR_POSITION: 'cursor_position',
    PAGE_PATH: 'page_path'
  },
  
  // Destinations table fields
  DESTINATIONS: {
    ID: 'id',
    CITY: 'city',
    COUNTRY: 'country',
    CONTINENT: 'continent',
    IMAGE_URL: 'image_url',
    POPULARITY: 'popularity',
    DESCRIPTION: 'description',
    COUNTRY_CODE: 'country_code',
    CODE_POSTAL: 'code_postal',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    TIMEZONE: 'timezone',
    LANGUAGES: 'languages',
    CURRENCY: 'currency',
    SAFETY_RATING: 'safety_rating',
    WALKABILITY: 'walkability',
    FAMILY_FRIENDLY: 'family_friendly',
    NIGHTLIFE_RATING: 'nightlife_rating',
    BEACH_QUALITY: 'beach_quality',
    SHOPPING_RATING: 'shopping_rating',
    WINTER_RATING: 'winter_rating',
    WIFI_CONNECTIVITY: 'wifi_connectivity',
    PUBLIC_TRANSPORTATION: 'public_transportation',
    ECO_FRIENDLY_OPTIONS: 'eco_friendly_options',
    OUTDOOR_ACTIVITIES: 'outdoor_activities',
    INSTAGRAM_WORTHY_SPOTS: 'instagram_worthy_spots',
    OFF_PEAK_APPEAL: 'off_peak_appeal',
    DIGITAL_NOMAD_FRIENDLY: 'digital_nomad_friendly',
    NAME: 'name',
    TRAVELERS_COUNT: 'travelers_count',
    AVG_DAYS: 'avg_days'
  },
  
  // Collaborative notes table fields
  COLLABORATIVE_NOTES: {
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    CONTENT: 'content',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // Votes table fields
  VOTES: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    VOTE_TYPE: 'vote_type', 
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // Collaborative sessions table fields
  COLLABORATIVE_SESSIONS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    SESSION_ID: 'session_id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // Template sections table fields
  TEMPLATE_SECTIONS: {
    ID: 'id',
    TEMPLATE_ID: 'template_id', 
    TITLE: 'title',
    DESCRIPTION: 'description',
    POSITION: 'position',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  // Item customizations table fields
  ITEM_CUSTOMIZATIONS: {
    ID: 'id',
    ITEM_ID: 'item_id',
    USER_ID: 'user_id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    PERSONAL_NOTES: 'personal_notes',
    CUSTOM_TIME: 'custom_time',
    CUSTOM_DATE: 'custom_date',
    CUSTOM_DURATION: 'custom_duration',
    VISIBILITY: 'visibility'
  },
  
  // User preferences table fields
  USER_PREFERENCES: {
    ID: 'id',
    USER_ID: 'user_id',
    TRAVEL_PACE: 'travel_pace',
    PREFERRED_TIMING: 'preferred_timing',
    PREFERRED_CATEGORIES: 'preferred_categories',
    BUDGET_LEVEL: 'budget_level',
    ACCESSIBILITY_NEEDS: 'accessibility_needs',
    ADVENTURE_LEVEL: 'adventure_level',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  PERMISSION_REQUESTS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
    MESSAGE: 'message',
    STATUS: 'status',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
} as const;

// Functions that use database columns
export const DB_FUNCTIONS = {
  IS_TRIP_MEMBER: 'is_trip_member',
  HAS_TRIP_ROLE: 'has_trip_role',
  CREATE_TRIP_WITH_OWNER: 'create_trip_with_owner',
  COPY_TEMPLATE_TO_TRIP: 'copy_template_to_trip',
  GENERATE_RANDOM_SLUG: 'generate_random_slug',
  COPY_ITINERARY_ITEMS: 'copy_itinerary_items',
  GENERATE_RANDOM_ITINERARY: 'generate_random_itinerary',
  CALCULATE_PREFERENCE_MATCH: 'calculate_preference_match'
} as const;

// RLS Policy names for reference
export const DB_POLICIES = {
  TRIPS: {
    ALLOW_PUBLIC_READ: 'Allow public read access',
    ALLOW_MEMBER_READ: 'Allow member read access',
    ALLOW_ADMIN_EDITOR_UPDATE: 'Allow admin/editor update access',
    ALLOW_ADMIN_DELETE: 'Allow admin delete access'
  },
  ITINERARY_ITEMS: {
    ALLOW_MEMBERS_VIEW: 'Allow members to view itinerary items',
    ALLOW_CONTRIBUTORS_MANAGE: 'Allow contributors to manage itinerary items'
  },
  COLLABORATIVE_SESSIONS: {
    ALLOW_MEMBERS_VIEW: 'Allow members to view collaborative sessions',
    ALLOW_ADMIN_UPDATE: 'Allow admin to update collaborative sessions'
  },
} as const;

// Type helpers for improved type safety
export type TableNames = typeof DB_TABLES[keyof typeof DB_TABLES];
// TODO: Clarify the intent of this line and fix the syntax
// export const DB_FIELDS_BY_TABLE = {
//   [type: keyof DB_TABLES]: DB_FIELDS[DB_TABLES[type]]
// };
export type TripRole = typeof DB_ENUMS.TRIP_ROLES[keyof typeof DB_ENUMS.TRIP_ROLES];
export type ContentType = typeof DB_ENUMS.CONTENT_TYPES[keyof typeof DB_ENUMS.CONTENT_TYPES];
export type UrlFormat = typeof DB_ENUMS.URL_FORMATS[keyof typeof DB_ENUMS.URL_FORMATS];
export type QualityTier = typeof DB_ENUMS.QUALITY_TIERS[keyof typeof DB_ENUMS.QUALITY_TIERS];
export type ImageType = typeof DB_ENUMS.IMAGE_TYPES[keyof typeof DB_ENUMS.IMAGE_TYPES];
export type InvitationStatus = typeof DB_ENUMS.INVITATION_STATUS[keyof typeof DB_ENUMS.INVITATION_STATUS];
export type PresenceStatus = typeof DB_ENUMS.PRESENCE_STATUS[keyof typeof DB_ENUMS.PRESENCE_STATUS];
export type RequestStatus = typeof DB_ENUMS.REQUEST_STATUSES[keyof typeof DB_ENUMS.REQUEST_STATUSES];
export type AccessRequestStatus = typeof DB_ENUMS.ACCESS_REQUEST_STATUS[keyof typeof DB_ENUMS.ACCESS_REQUEST_STATUS];

/**
 * Example usage:
 * 
 * // Using table names
 * const { data } = await supabase
 *   .from(DB_TABLES.TRIPS)
 *   .select('*');
 * 
 * // Using column names
 * const { data: tripData } = await supabase
 *   .from(DB_TABLES.TRIPS)
 *   .select(`
 *     ${DB_FIELDS.COMMON.ID},
 *     ${DB_FIELDS.TRIPS.NAME},
 *     ${DB_FIELDS.TRIPS.DESCRIPTION}
 *   `)
 *   .eq(DB_FIELDS.TRIPS.CREATED_BY, userId);
 * 
 * // Using enums
 * const isAdmin = member.role === DB_ENUMS.TRIP_ROLES.ADMIN;
 * 
 * // Using with type safety
 * function updateTripRole(userId: string, tripId: string, role: TripRole) {
 *   // Type-safe role parameter
 * }
 */

