// Database Tables - Constant names for all database tables
export const TABLES = {
  PROFILES: 'profiles',
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  ITINERARY_ITEMS: 'itinerary_items',
  DESTINATIONS: 'destinations',
  USER_PRESENCE: 'user_presence',
  VOTES: 'votes',
  COLLABORATIVE_SESSIONS: 'collaborative_sessions',
  ITINERARY_TEMPLATE_SECTIONS: 'itinerary_template_sections',
  ITINERARY_TEMPLATE_ITEMS: 'itinerary_template_items',
  INVITATIONS: 'invitations',
  EXPENSES: 'expenses',
  REFERRALS: 'referrals',
  PERMISSION_REQUESTS: 'permission_requests',
  LIKES: 'likes',
  TRIP_IMAGES: 'trip_images',
  TRIP_NOTES: 'trip_notes',
  NOTE_TAGS: 'note_tags',
  IMAGE_METADATA: 'image_metadata',
  ITINERARY_TEMPLATES: 'itinerary_templates',
  TRIP_TEMPLATE_USES: 'trip_template_uses',
  ALBUMS: 'albums',
  TRIP_TAGS: 'trip_tags',
  USER_LOGIN_HISTORY: 'user_login_history',
  TAGS: 'tags',
  PLACES: 'places',
  ACCESS_REQUESTS: 'access_requests',
  COLLABORATIVE_NOTES: 'collaborative_notes',
  USERS: 'users',
  BUDGET_ITEMS: 'budget_items',
  CONTENT_CUSTOMIZATIONS: 'content_customizations',
  CONTENT_QUALITY_METRICS: 'content_quality_metrics',
  CONTENT_SHARING_HISTORY: 'content_sharing_history',
  CONTENT_SLUGS: 'content_slugs',
  DESTINATION_TAGS: 'destination_tags',
  FOCUS_SESSIONS: 'focus_sessions',
  ITINERARY_ITEM_VOTES: 'itinerary_item_votes',
  ITINERARY_SECTIONS: 'itinerary_sections',
  ITEM_POPULARITY_METRICS: 'item_popularity_metrics',
  LOCATIONS: 'locations',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  NOTIFICATIONS: 'notifications',
  PREFERENCE_WEIGHTS: 'preference_weights',
  TEMPLATE_APPLICATIONS: 'template_applications',
  TRIP_COMMENT_LIKES: 'trip_comment_likes',
  TRIP_HISTORY: 'trip_history',
  TRIP_ITEM_COMMENTS: 'trip_item_comments',
  TRIP_VOTE_OPTIONS: 'trip_vote_options',
  TRIP_VOTE_POLLS: 'trip_vote_polls',
  TRIP_VOTES: 'trip_votes',
  USER_ACTIVITY_HISTORY: 'user_activity_history',
  USER_INTERACTIONS: 'user_interactions',
  USER_INTERESTS: 'user_interests',
  USER_PREFERENCES: 'user_preferences',
  USER_SUGGESTED_TAGS: 'user_suggested_tags',
  USER_TRAVEL: 'user_travel',
  VALIDATION_LOGS: 'validation_logs',
} as const;

// Database Fields - Common field names across tables
export const FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  PROFILES: {
    NAME: 'name',
    AVATAR_URL: 'avatar_url',
    EMAIL: 'email',
    USERNAME: 'username',
  },
  USER_PRESENCE: {
    USER_ID: 'user_id',
    TRIP_ID: 'trip_id',
    STATUS: 'status',
    EDITING_ITEM_ID: 'editing_item_id',
    CURSOR_POSITION: 'cursor_position',
    PAGE_PATH: 'page_path',
    LAST_ACTIVE: 'last_active',
  },
} as const;

// Database Enums - Type-safe enum values from supabase.ts
export const ENUMS = {
  TRIP_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    CONTRIBUTOR: 'contributor',
  },
  CONTENT_TYPES: {
    TRIP: 'trip',
    ITINERARY_ITEM: 'itinerary_item',
    DESTINATION: 'destination',
    TEMPLATE: 'template',
    COLLECTION: 'collection',
  },
  URL_FORMATS: {
    CANONICAL: 'canonical',
    SHORT: 'short',
    SOCIAL: 'social',
    TRACKING: 'tracking',
  },
  IMAGE_TYPES: {
    DESTINATION: 'destination',
    TRIP_COVER: 'trip_cover',
    USER_AVATAR: 'user_avatar',
    TEMPLATE_COVER: 'template_cover',
  },
  INVITATION_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    EXPIRED: 'expired',
  },
  PRESENCE_STATUS: {
    ONLINE: 'online',
    AWAY: 'away',
    OFFLINE: 'offline',
    EDITING: 'editing',
  },
  ACCESS_REQUEST_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  BUDGET_CATEGORY: {
    ACCOMMODATION: 'accommodation',
    TRANSPORTATION: 'transportation',
    FOOD: 'food',
    ACTIVITIES: 'activities',
    SHOPPING: 'shopping',
    OTHER: 'other',
  },
  INTERACTION_TYPE: {
    LIKE: 'like',
    VISIT: 'visit',
    BOOKMARK: 'bookmark',
    TAG: 'tag',
  },
  ITEM_STATUS: {
    SUGGESTED: 'suggested',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
  },
  ITINERARY_CATEGORY: {
    FLIGHT: 'flight',
    ACCOMMODATION: 'accommodation',
    ATTRACTION: 'attraction',
    RESTAURANT: 'restaurant',
    CAFE: 'cafe',
    TRANSPORTATION: 'transportation',
    ACTIVITY: 'activity',
    CUSTOM: 'custom',
    OTHER: 'other',
  },
  ITINERARY_ITEM_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  PLACE_CATEGORY: {
    ATTRACTION: 'attraction',
    RESTAURANT: 'restaurant',
    CAFE: 'cafe',
    HOTEL: 'hotel',
    LANDMARK: 'landmark',
    SHOPPING: 'shopping',
    TRANSPORT: 'transport',
    OTHER: 'other',
  },
  PRIVACY_SETTING: {
    PRIVATE: 'private',
    SHARED_WITH_LINK: 'shared_with_link',
    PUBLIC: 'public',
  },
  TAG_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  TRAVEL_PACE: {
    VERY_SLOW: 'very_slow',
    SLOW: 'slow',
    MODERATE: 'moderate',
    FAST: 'fast',
    VERY_FAST: 'very_fast',
  },
  TRAVEL_PERSONALITY_TYPE: {
    PLANNER: 'planner',
    ADVENTURER: 'adventurer',
    FOODIE: 'foodie',
    SIGHTSEER: 'sightseer',
    RELAXER: 'relaxer',
    CULTURE: 'culture',
  },
  TRAVEL_SQUAD_TYPE: {
    SOLO: 'solo',
    COUPLE: 'couple',
    FAMILY: 'family',
    FRIENDS: 'friends',
    BUSINESS: 'business',
    GROUP: 'group',
  },
  TRAVEL_STYLE: {
    ADVENTUROUS: 'adventurous',
    RELAXED: 'relaxed',
    CULTURAL: 'cultural',
    LUXURY: 'luxury',
    BUDGET: 'budget',
    FAMILY: 'family',
    SOLO: 'solo',
    NIGHTLIFE: 'nightlife',
    NATURE: 'nature',
    FOOD_FOCUSED: 'food_focused',
  },
  TRIP_ACTION_TYPE: {
    TRIP_CREATED: 'TRIP_CREATED',
    TRIP_UPDATED: 'TRIP_UPDATED',
    ITINERARY_ITEM_ADDED: 'ITINERARY_ITEM_ADDED',
    ITINERARY_ITEM_UPDATED: 'ITINERARY_ITEM_UPDATED',
    ITINERARY_ITEM_DELETED: 'ITINERARY_ITEM_DELETED',
    MEMBER_ADDED: 'MEMBER_ADDED',
    MEMBER_REMOVED: 'MEMBER_REMOVED',
    MEMBER_ROLE_UPDATED: 'MEMBER_ROLE_UPDATED',
    INVITATION_SENT: 'INVITATION_SENT',
    ACCESS_REQUEST_SENT: 'ACCESS_REQUEST_SENT',
    ACCESS_REQUEST_UPDATED: 'ACCESS_REQUEST_UPDATED',
    NOTE_CREATED: 'NOTE_CREATED',
    NOTE_UPDATED: 'NOTE_UPDATED',
    NOTE_DELETED: 'NOTE_DELETED',
    IMAGE_UPLOADED: 'IMAGE_UPLOADED',
    TAG_ADDED: 'TAG_ADDED',
    TAG_REMOVED: 'TAG_REMOVED',
    SPLITWISE_GROUP_LINKED: 'SPLITWISE_GROUP_LINKED',
    SPLITWISE_GROUP_UNLINKED: 'SPLITWISE_GROUP_UNLINKED',
    SPLITWISE_GROUP_CREATED_AND_LINKED: 'SPLITWISE_GROUP_CREATED_AND_LINKED',
    COMMENT_ADDED: 'COMMENT_ADDED',
    COMMENT_UPDATED: 'COMMENT_UPDATED',
    COMMENT_DELETED: 'COMMENT_DELETED',
    VOTE_CAST: 'VOTE_CAST',
    FOCUS_INITIATED: 'FOCUS_INITIATED',
  },
  TRIP_PRIVACY_SETTING: {
    PRIVATE: 'private',
    SHARED_WITH_LINK: 'shared_with_link',
    PUBLIC: 'public',
  },
  TRIP_STATUS: {
    PLANNING: 'planning',
    UPCOMING: 'upcoming',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  TRIP_TYPE: {
    LEISURE: 'leisure',
    BUSINESS: 'business',
    FAMILY: 'family',
    SOLO: 'solo',
    GROUP: 'group',
    OTHER: 'other',
  },
  VOTE_TYPE: {
    UP: 'up',
    DOWN: 'down',
  },
} as const;

// Functions that use database columns
export const FUNCTIONS = {
  IS_TRIP_MEMBER: 'is_trip_member',
  HAS_TRIP_ROLE: 'has_trip_role',
  CREATE_TRIP_WITH_OWNER: 'create_trip_with_owner',
  COPY_TEMPLATE_TO_TRIP: 'copy_template_to_trip',
  GENERATE_RANDOM_SLUG: 'generate_random_slug',
  GENERATE_RANDOM_ITINERARY: 'generate_random_itinerary',
  CALCULATE_PREFERENCE_MATCH: 'calculate_preference_match',
  APPLY_TEMPLATE_TO_TRIP: 'apply_template_to_trip',
  APPROVE_USER_SUGGESTED_TAG: 'approve_user_suggested_tag',
  APPROVE_USER_TAG: 'approve_user_tag',
  CAN_MANAGE_TRIP_MEMBERS: 'can_manage_trip_members',
  CLEANUP_OLD_METRICS: 'cleanup_old_metrics',
  COPY_AND_CUSTOMIZE_ITEM: 'copy_and_customize_item',
  COUNT_ITEM_COMMENTS: 'count_item_comments',
  GENERATE_SLUG: 'generate_slug',
  GENERATE_UNIQUE_SLUG: 'generate_unique_slug',
  GET_DESTINATION_RECOMMENDATIONS: 'get_destination_recommendations',
  GET_POLL_RESULTS: 'get_poll_results',
  GET_POLL_WITH_OPTIONS: 'get_poll_with_options',
  GET_TRIP_ACTIVITY_TIMELINE: 'get_trip_activity_timeline',
  GET_UNREAD_NOTIFICATION_COUNT: 'get_unread_notification_count',
  GET_USER_POLL_VOTE: 'get_user_poll_vote',
  GET_USER_VOTES: 'get_user_votes',
  HAS_USER_LIKED_COMMENT: 'has_user_liked_comment',
  HAS_USER_VOTED: 'has_user_voted',
  INCREMENT_COUNTER: 'increment_counter',
  INSERT_TAG_IF_NOT_EXISTS: 'insert_tag_if_not_exists',
  IS_POLL_EXPIRED: 'is_poll_expired',
  IS_TRIP_MEMBER_WITH_ROLE: 'is_trip_member_with_role',
  RECOMMEND_BY_GEOGRAPHY: 'recommend_by_geography',
  RECOMMEND_POPULAR_DESTINATIONS: 'recommend_popular_destinations',
  UPDATE_ITINERARY_ITEM_POSITION: 'update_itinerary_item_position',
  UPDATE_POPULARITY_METRICS: 'update_popularity_metrics',
  UPDATE_PROFILE_ONBOARDING: 'update_profile_onboarding',
  VALIDATE_ITINERARY: 'validate_itinerary',
} as const;

// RLS Policy names for reference
export const POLICIES = {
  TRIPS: {
    ALLOW_PUBLIC_READ: 'Allow public read access',
    ALLOW_MEMBER_READ: 'Allow member read access',
    ALLOW_ADMIN_EDITOR_UPDATE: 'Allow admin/editor update access',
    ALLOW_ADMIN_DELETE: 'Allow admin delete access',
  },
  ITINERARY_ITEMS: {
    ALLOW_MEMBERS_VIEW: 'Allow members to view itinerary items',
    ALLOW_CONTRIBUTORS_MANAGE: 'Allow contributors to manage itinerary items',
  },
  COLLABORATIVE_SESSIONS: {
    ALLOW_MEMBERS_VIEW: 'Allow members to view collaborative sessions',
    ALLOW_ADMIN_UPDATE: 'Allow admin to update collaborative sessions',
  },
} as const;

// Type helpers for improved type safety
export type TableNames = (typeof TABLES)[keyof typeof TABLES];

// Define table field types by table
export type TableFields<T extends keyof typeof FIELDS> =
  (typeof FIELDS)[T][keyof (typeof FIELDS)[T]];

// Define the TripRole type from the Database enum
export type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

// Type definitions using explicit types instead of imports
// Define all types explicitly to avoid module import issues

// For more specific types, define them explicitly
export type ContentType = 'trip' | 'itinerary_item' | 'destination' | 'collection' | 'template';
export type UrlFormat = 'canonical' | 'short' | 'social' | 'tracking';
export type ImageType = 'destination' | 'trip_cover' | 'user_avatar' | 'template_cover';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';
export type PresenceStatus = (typeof ENUMS.PRESENCE_STATUS)[keyof typeof ENUMS.PRESENCE_STATUS];
export type BudgetCategory = 'accommodation' | 'transportation' | 'food' | 'activities' | 'shopping' | 'other';
export type InteractionType = 'like' | 'visit' | 'bookmark' | 'tag';
export type ItemStatus = 'suggested' | 'confirmed' | 'rejected';
export type ItineraryCategory = 'flight' | 'accommodation' | 'attraction' | 'restaurant' | 'cafe' | 'transportation' | 'activity' | 'custom' | 'other';
export type ItineraryItemStatus = 'pending' | 'approved' | 'rejected';
export type PlaceCategory = 'attraction' | 'restaurant' | 'cafe' | 'hotel' | 'landmark' | 'shopping' | 'transport' | 'other';
export type PrivacySetting = 'private' | 'shared_with_link' | 'public';
export type TagStatus = 'pending' | 'approved' | 'rejected';
export type TravelPace = 'very_slow' | 'slow' | 'moderate' | 'fast' | 'very_fast';
export type TravelPersonalityType = 'planner' | 'adventurer' | 'foodie' | 'sightseer' | 'relaxer' | 'culture';
export type TravelSquadType = 'friends' | 'family' | 'partner' | 'solo' | 'coworkers' | 'mixed';
export type TravelStyle = 'adventurous' | 'relaxed' | 'cultural' | 'luxury' | 'budget' | 'family' | 'solo' | 'nightlife' | 'nature' | 'food_focused';
export type TripActionType = 'TRIP_CREATED' | 'TRIP_UPDATED' | 'ITINERARY_ITEM_ADDED' | 'ITINERARY_ITEM_UPDATED' | 'ITINERARY_ITEM_DELETED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'MEMBER_ROLE_UPDATED' | 'INVITATION_SENT' | 'ACCESS_REQUEST_SENT' | 'ACCESS_REQUEST_UPDATED' | 'NOTE_CREATED' | 'NOTE_UPDATED' | 'NOTE_DELETED' | 'IMAGE_UPLOADED' | 'TAG_ADDED' | 'TAG_REMOVED' | 'SPLITWISE_GROUP_LINKED' | 'SPLITWISE_GROUP_UNLINKED' | 'SPLITWISE_GROUP_CREATED_AND_LINKED' | 'COMMENT_ADDED' | 'COMMENT_UPDATED' | 'COMMENT_DELETED' | 'VOTE_CAST' | 'FOCUS_INITIATED';
export type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';
export type TripStatus = 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
export type TripType = 'leisure' | 'business' | 'family' | 'solo' | 'group' | 'other';
export type VoteType = 'up' | 'down';

// Define RequestStatus as a constant object
export const RequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

/**
 * Example usage:
 *
 * // Using table names
 * const { data } = await supabase
 *   .from(TABLES.TRIPS)
 *   .select('*');
 *
 * // Using column names with type safety (assuming `userId` is defined)
 * const { data: tripData } = await supabase
 *   .from(TABLES.TRIPS)
 *   .select(`
 *     ${FIELDS.TRIPS.ID},
 *     ${FIELDS.TRIPS.NAME},
 *     ${FIELDS.TRIPS.DESCRIPTION}
 *   `)
 *   .eq(FIELDS.TRIPS.CREATED_BY, userId); // FIELDS.TRIPS.CREATED_BY resolves to 'created_by'
 *
 * // Using enums
 * const isAdmin = member.role === TripRole.ADMIN; // Use the imported enum/const object
 *
 * // Using with type safety
 * function updateTripRole(userId: string, tripId: string, role: TripRole) { // Use the exported type
 *   // Type-safe role parameter
 * }
 */

// For backward compatibility with existing imports
export const DB_TABLES = TABLES;
export const DB_FIELDS = FIELDS;
export const DB_ENUMS = ENUMS;
export const DB_FUNCTIONS = FUNCTIONS;
export const DB_POLICIES = POLICIES;
