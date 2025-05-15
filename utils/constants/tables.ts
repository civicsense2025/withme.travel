/**
 * Database Tables Constants
 *
 * This file contains all database table names and related constants used throughout the application.
 * Tables are organized into logical domains to improve maintainability and discoverability.
 *
 * IMPORTANT:
 * - Always import table names from this file, never hardcode them
 * - Keep this file organized by domain/feature area
 * - Add JSDoc comments for non-obvious tables
 * - Use as const to ensure type safety
 *
 * Last updated: May 2025
 * This file is synchronized with the database schema in schema.csv
 */

// ============================================================================
// CORE USER & AUTHENTICATION
// ============================================================================

/**
 * Core user and authentication related tables
 */
export const USER_TABLES = {
  /** Users */
  USERS: 'users',
  /** Profiles */
  PROFILES: 'profiles',
  /** Access requests */
  ACCESS_REQUESTS: 'access_requests',
  /** Admin permissions */
  ADMIN_PERMISSIONS: 'admin_permissions',
  /** Sessions */
  SESSIONS: 'sessions',
  /** Authentication log */
  AUTH_LOG: 'auth_log',
  /** User followers */
  USER_FOLLOWERS: 'user_followers',
  /** User metrics */
  USER_METRICS: 'user_metrics',
  /** User events */
  USER_EVENTS: 'user_events',
  /** Authentication history and events */
  USER_LOGIN_HISTORY: 'user_login_history',
  /** User activity tracking */
  USER_ACTIVITY_HISTORY: 'user_activity_history',
  /** User interactions (likes, views, etc.) */
  USER_INTERACTIONS: 'user_interactions',
  /** Real-time user presence tracking */
  USER_PRESENCE: 'user_presence',
  /** Rate limiting for API endpoints */
  RATE_LIMITS: 'rate_limits',
  /** Referral tracking */
  REFERRALS: 'referrals',
  /** Friend requests between users */
  FRIEND_REQUESTS: 'friend_requests',
  /** Established friend connections */
  FRIENDS: 'friends',
} as const;



/**
 * Database enum types
 * These represent fixed values used in specific table columns
 */
export const ENUMS = {
  CONTENT_TYPE: {
    TRIP: 'trip',
    DESTINATION: 'destination',
    ITINERARY_ITEM: 'itinerary_item',
    COLLECTION: 'collection',
    TEMPLATE: 'template',
    GROUP_PLAN_IDEA: 'group_plan_idea',
  },
  TRIP_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    CONTRIBUTOR: 'contributor',
  },
  ITEM_STATUS: {
    SUGGESTED: 'suggested',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
  },
  ITINERARY_ITEM_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  IMAGE_TYPE: {
    DESTINATION: 'destination',
    TRIP_COVER: 'trip_cover',
    USER_AVATAR: 'user_avatar',
    TEMPLATE_COVER: 'template_cover',
  },
  GROUP_PLAN_IDEA_TYPE: {
    DESTINATION: 'destination',
    DATE: 'date',
    ACTIVITY: 'activity',
    BUDGET: 'budget',
    OTHER: 'other',
    QUESTION: 'question',
    NOTE: 'note',
    PLACE: 'place',
  },
  VOTE_TYPE: {
    UP: 'up',
    DOWN: 'down',
  },
  INVITATION_TYPE: {
    TRIP: 'trip',
    GROUP: 'group',
    FRIEND: 'friend',
    RESEARCH: 'research',
    OTHER: 'other',
  },
  ITINERARY_CATEGORY: {
    ICONIC_LANDMARKS: 'Iconic Landmarks',
    LOCAL_SECRETS: 'Local Secrets',
    CULTURAL_EXPERIENCES: 'Cultural Experiences',
    OUTDOOR_ADVENTURES: 'Outdoor Adventures',
    FOOD_AND_DRINK: 'Food & Drink',
    NIGHTLIFE: 'Nightlife',
    RELAXATION: 'Relaxation',
    SHOPPING: 'Shopping',
    GROUP_ACTIVITIES: 'Group Activities',
    DAY_EXCURSIONS: 'Day Excursions',
    ACCOMMODATIONS: 'Accommodations',
    TRANSPORTATION: 'Transportation',
    FLEXIBLE_OPTIONS: 'Flexible Options',
    SPECIAL_OCCASIONS: 'Special Occasions',
    OTHER: 'Other',
  },
  NOMINATION_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
  },
  PUBLISHED_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },
  STATE_PROVINCE_TYPE_ENUM: {
    STATE: 'state',
    PROVINCE: 'province',
    REGION: 'region',
    TERRITORY: 'territory',
    OTHER: 'other',
  },
  SUBSCRIPTION_LEVEL: {
    FREE: 'free',
    PREMIUM: 'premium',
    ENTERPRISE: 'enterprise',
  },
  USER_ROLE: {
    ADMIN: 'admin',
    MEMBER: 'member',
    GUEST: 'guest',
    RESEARCHER: 'researcher',
    PARTICIPANT: 'participant',
  },
  /** Milestone types used in forms and triggers */
  MILESTONE_TYPE: {
    COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',
    ITINERARY_MILESTONE_3_ITEMS: 'ITINERARY_MILESTONE_3_ITEMS',
    GROUP_FORMATION_COMPLETE: 'GROUP_FORMATION_COMPLETE',
    VOTE_PROCESS_USED: 'VOTE_PROCESS_USED',
    TRIP_FROM_TEMPLATE_CREATED: 'TRIP_FROM_TEMPLATE_CREATED',
  },
} as const;

/**
 * Types for commentable content
 */
export type CommentableContentType =
  | 'trip'
  | 'destination'
  | 'itinerary_item'
  | 'collection'
  | 'template'
  | 'group_plan_idea';

/**
 * Interface for itinerary template metadata
 */
export interface ItineraryTemplateMetadata {
  title: string;
  description: string;
  days: number;
  destination: string;
  tags: string[];
  coverImage?: string;
  authorId?: string;
  pace?: string;
  best_for?: string[];
  highlights?: string[];
}

// ============================================================================
// TRIPS & ITINERARIES
// ============================================================================

/**
 * Core trip management and itinerary tables
 */
export const TRIP_TABLES = {
  /** Main trips table */
  TRIPS: 'trips',
  /** Trip members and roles */
  TRIP_MEMBERS: 'trip_members',
  /** Trip history and changes log */
  TRIP_HISTORY: 'trip_history',
  /** Trip analytics events */
  TRIP_ANALYTICS_EVENTS: 'trip_analytics_events',
  /** Trip tags */
  TRIP_TAGS: 'trip_tags',
  /** Trip cities */
  TRIP_CITIES: 'trip_cities',
  /** Trip notes */
  TRIP_NOTES: 'trip_notes',
  /** Images attached to trips */
  TRIP_IMAGES: 'trip_images',
  /** Trip comment likes */
  TRIP_COMMENT_LIKES: 'trip_comment_likes',
  /** Trip logistics (flights, accommodations) */
  TRIP_LOGISTICS: 'trip_logistics',
  /** Trip item comments */
  TRIP_ITEM_COMMENTS: 'trip_item_comments',
  /** Trip voting options */
  TRIP_VOTE_OPTIONS: 'trip_vote_options',
  /** Trip voting polls */
  TRIP_VOTE_POLLS: 'trip_vote_polls',
  /** Trip votes */
  TRIP_VOTES: 'trip_votes',
  /** Album for trip photos */
  ALBUMS: 'albums',
  /** Permission requests for trips */
  PERMISSION_REQUESTS: 'permission_requests',
} as const;

/**
 * Itinerary-specific tables
 */
export const ITINERARY_TABLES = {
  /** Itinerary items (activities, restaurants, etc.) */
  ITINERARY_ITEMS: 'itinerary_items',
  /** Itinerary sections (days, categories) */
  ITINERARY_SECTIONS: 'itinerary_sections',
  /** Comments on itinerary items */
  ITINERARY_ITEM_COMMENTS: 'itinerary_item_comments',
  /** Emoji reactions to itinerary items */
  ITINERARY_ITEM_REACTIONS: 'itinerary_item_reactions',
  /** Comment reactions on itinerary items */
  ITINERARY_ITEM_COMMENT_REACTIONS: 'itinerary_item_comment_reactions',
  /** Votes on itinerary items */
  VOTES: 'votes',
  /** Collaborative notes for trip planning */
  COLLABORATIVE_NOTES: 'collaborative_notes',
  /** Collaborative editing sessions */
  COLLABORATIVE_SESSIONS: 'collaborative_sessions',
  /** Focus sessions for collaborative editing */
  FOCUS_SESSIONS: 'focus_sessions',
} as const;

/**
 * Itinerary templates
 */
export const TEMPLATE_TABLES = {
  /** Itinerary templates */
  ITINERARY_TEMPLATES: 'itinerary_templates',
  /** Template sections */
  ITINERARY_TEMPLATE_SECTIONS: 'itinerary_template_sections',
  /** Template items */
  ITINERARY_TEMPLATE_ITEMS: 'itinerary_template_items',
  /** Template applications */
  TEMPLATE_APPLICATIONS: 'template_applications',
  /** Trip template uses */
  TRIP_TEMPLATE_USES: 'trip_template_uses',
  /** Validation logs for templates */
  VALIDATION_LOGS: 'validation_logs',
} as const;

// ============================================================================
// DESTINATIONS & GEOGRAPHY
// ============================================================================

/**
 * Destination and geography tables
 */
export const DESTINATION_TABLES = {
  /** Destination information */
  DESTINATIONS: 'destinations',
  /** Cities information */
  CITIES: 'cities',
  /** Destination tags */
  DESTINATION_TAGS: 'destination_tags',
  /** Countries information */
  COUNTRIES: 'countries',
  /** Continents information */
  CONTINENTS: 'continents',
  /** States and provinces */
  STATES_PROVINCES: 'states_provinces',
  /** Languages information */
  LANGUAGES: 'languages',
  /** Country-language relationships */
  COUNTRY_LANGUAGES: 'country_languages',
  /** Currency information */
  CURRENCIES: 'currencies',
  /** Location hierarchies */
  LOCATIONS: 'locations',
} as const;

// ============================================================================
// GROUPS & COLLABORATIVE PLANNING
// ============================================================================

/**
 * Group and collaborative planning tables
 */
export const GROUP_TABLES = {
  /** User groups */
  GROUPS: 'groups',
  /** Group members */
  GROUP_MEMBERS: 'group_members',
  /** Group guest members */
  GROUP_GUEST_MEMBERS: 'group_guest_members',
  /** Group roles */
  GROUP_ROLES: 'group_roles',
  /** Group activities */
  GROUP_ACTIVITIES: 'group_activities',
  /** Group trips */
  GROUP_TRIPS: 'group_trips',
  /** Discoverable groups */
  DISCOVERABLE_GROUPS: 'discoverable_groups',
  /** Group board log */
  GROUP_BOARD_LOG: 'group_board_log',
  /** Guest tokens */
  GUEST_TOKENS: 'guest_tokens',
} as const;

/**
 * Group planning features
 */
export const GROUP_PLANNING_TABLES = {
  /** Group plans */
  GROUP_PLANS: 'group_plans',
  /** Group plan log */
  GROUP_PLANS_LOG: 'group_plans_log',
  /** Group plan ideas */
  GROUP_PLAN_IDEAS: 'group_plan_ideas',
  /** Group plan idea comments */
  GROUP_PLAN_IDEA_COMMENTS: 'group_plan_idea_comments',
  /** Group plan idea reactions */
  GROUP_PLAN_IDEA_REACTIONS: 'group_plan_idea_reactions',
  /** Group plan idea votes */
  GROUP_PLAN_IDEA_VOTES: 'group_plan_idea_votes',
} as const;

// ============================================================================
// CONTENT & MEDIA
// ============================================================================

/**
 * Content and media tables
 */
export const CONTENT_TABLES = {
  /** Images */
  IMAGES: 'images',
  /** Image metadata */
  IMAGE_METADATA: 'image_metadata',
  /** Content slugs */
  CONTENT_SLUGS: 'content_slugs',
  /** Content customizations */
  CONTENT_CUSTOMIZATIONS: 'content_customizations',
  /** Content quality metrics */
  CONTENT_QUALITY_METRICS: 'content_quality_metrics',
  /** Content sharing history */
  CONTENT_SHARING_HISTORY: 'content_sharing_history',
  /** Item popularity metrics */
  ITEM_POPULARITY_METRICS: 'item_popularity_metrics',
  /** Viator link click tracking */
  VIATOR_LINK_CLICKS: 'viator_link_clicks',
} as const;

/**
 * Social interaction tables
 */
export const SOCIAL_TABLES = {
  /** Comments on various content types */
  COMMENTS: 'comments',
  /** Likes on various content types */
  LIKES: 'likes',
  /** Comment reactions */
  COMMENT_REACTIONS: 'comment_reactions',
  /** Place metrics */
  PLACE_METRICS: 'place_metrics',
  /** Place nominations */
  PLACE_NOMINATIONS: 'place_nominations',
  /** User suggested tags */
  USER_SUGGESTED_TAGS: 'user_suggested_tags',
  /** Reviews */
  REVIEWS: 'reviews',
  /** Tags */
  TAGS: 'tags',
  /** Note tags */
  NOTE_TAGS: 'note_tags',
  /** Invitations */
  INVITATIONS: 'invitations',
} as const;

// ============================================================================
// FINANCE & BUDGET
// ============================================================================

/**
 * Finance and budget tables
 */
export const FINANCE_TABLES = {
  /** Budget items */
  BUDGET_ITEMS: 'budget_items',
  /** Expenses */
  EXPENSES: 'expenses',
} as const;

// ============================================================================
// NOTIFICATIONS & PREFERENCES
// ============================================================================

/**
 * Notification and preference tables
 */
export const NOTIFICATION_TABLES = {
  /** Notifications */
  NOTIFICATIONS: 'notifications',
  /** Notification preferences */
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  /** Notification history */
  NOTIFICATION_HISTORY: 'notification_history',
  /** Notification analytics */
  NOTIFICATION_ANALYTICS: 'notification_analytics',
} as const;

/**
 * User preference tables
 */
export const PREFERENCE_TABLES = {
  /** User interests */
  USER_INTERESTS: 'user_interests',
  /** User travel history */
  USER_TRAVEL: 'user_travel',
  /** Preference weights */
  PREFERENCE_WEIGHTS: 'preference_weights',
  /** Onboarding preferences */
  ONBOARDING_PREFERENCES: 'onboarding_preferences',
  /** Onboarding tour completions */
  ONBOARDING_TOUR_COMPLETIONS: 'onboarding_tour_completions',
  /** Onboarding events */
  ONBOARDING_EVENTS: 'onboarding_events',
} as const;

// ============================================================================
// RESEARCH & TESTING
// ============================================================================

/**
 * Research system tables
 */
export const RESEARCH_TABLES = {
  /** A/B test variants */
  AB_TEST_VARIANTS: 'ab_test_variants',
  /** Onboarding analytics for admins */
  ADMIN_ONBOARDING_ANALYTICS: 'admin_onboarding_analytics',
  /** Conversion goals */
  CONVERSION_GOALS: 'conversion_goals',
  /** Participant status history */
  PARTICIPANT_STATUS_HISTORY: 'participant_status_history',
  /** Participant variants */
  PARTICIPANT_VARIANTS: 'participant_variants',
} as const;

/**
 * Survey and form tables
 */
export const FORM_TABLES = {
  /** Forms */
  FORMS: 'forms',
  /** Form fields */
  FORM_FIELDS: 'form_fields',
  /** Form responses */
  FORM_RESPONSES: 'form_responses',
  /** Milestone triggers */
  MILESTONE_TRIGGERS: 'milestone_triggers',
  /** User testing sessions */
  USER_TESTING_SESSIONS: 'user_testing_sessions',
  /** User testing events */
  USER_TESTING_EVENTS: 'user_testing_events',
} as const;

/**
 * User testing tables
 */
export const USER_TESTING_TABLES = {
  /** User testing sessions */
  USER_TESTING_SESSIONS: 'user_testing_sessions',
  /** User testing events */
  USER_TESTING_EVENTS: 'user_testing_events',
} as const;

// ============================================================================
// GEOGRAPHY SUPPORT TABLES
// ============================================================================

/**
 * PostGIS and spatial data support tables
 */
export const SPATIAL_TABLES = {
  /** Spatial reference systems */
  SPATIAL_REF_SYS: 'spatial_ref_sys',
  /** Geography columns */
  GEOGRAPHY_COLUMNS: 'geography_columns',
  /** Geometry columns */
  GEOMETRY_COLUMNS: 'geometry_columns',
} as const;

// ============================================================================
// COMBINED EXPORT
// ============================================================================

/**
 * All database tables combined
 * Use this for generic operations or when the domain isn't clear
 */
export const TABLES = {
  ...USER_TABLES,
  ...TRIP_TABLES,
  ...ITINERARY_TABLES,
  ...TEMPLATE_TABLES,
  ...DESTINATION_TABLES,
  ...GROUP_TABLES,
  ...GROUP_PLANNING_TABLES,
  ...CONTENT_TABLES,
  ...SOCIAL_TABLES,
  ...FINANCE_TABLES,
  ...NOTIFICATION_TABLES,
  ...PREFERENCE_TABLES,
  ...RESEARCH_TABLES,
  ...FORM_TABLES,
  ...USER_TESTING_TABLES,
  ...SPATIAL_TABLES,
  AUTH_MODAL_ANALYTICS: 'auth_modal_analytics',
  FORM_TEMPLATES: 'form_templates',
  MEMBERS: 'members',
  FORMS: 'forms',
  FORM_FIELDS: 'form_fields',
  FORM_RESPONSES: 'form_responses',
  MILESTONE_TRIGGERS: 'milestone_triggers',
  USER_TESTING_SESSIONS: 'user_testing_sessions',
  USER_TESTING_EVENTS: 'user_testing_events',
} as const;

/**
 * Common field names used across multiple tables
 */
export const FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  // Core entity fields
  PROFILES: {
    ID: 'id',
    NAME: 'name',
    EMAIL: 'email',
    AVATAR_URL: 'avatar_url',
    USERNAME: 'username',
    IS_ADMIN: 'is_admin',
    BIO: 'bio',
    LOCATION: 'location',
    WEBSITE: 'website',
    COVER_IMAGE_URL: 'cover_image_url',
    SUBSCRIPTION_LEVEL: 'subscription_level',
  },
  TRIPS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    CREATED_BY: 'created_by',
    DESTINATION_NAME: 'destination_name',
    DATE_FLEXIBILITY: 'date_flexibility',
    TRAVELERS_COUNT: 'travelers_count',
    VIBE: 'vibe',
    BUDGET: 'budget',
    IS_PUBLIC: 'is_public',
    PRIVACY_SETTING: 'privacy_setting',
    COVER_IMAGE_URL: 'cover_image_url',
    TRIP_EMOJI: 'trip_emoji',
    MEMBER_COUNT: 'member_count',
    SLUG: 'slug',
    STATUS: 'status',
    PRIMARY_CITY_ID: 'primary_city_id',
  },
  GROUPS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    CREATED_BY: 'created_by',
    SLUG: 'slug',
    EMOJI: 'emoji',
    VISIBILITY: 'visibility',
    COVER_IMAGE_URL: 'cover_image_url',
    THUMBNAIL_URL: 'thumbnail_url',
    MEMBER_COUNT: 'member_count',
    TRIP_COUNT: 'trip_count',
    GUEST_TOKEN: 'guest_token',
  },
  ITINERARY_ITEMS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    TITLE: 'title',
    TYPE: 'type',
    DATE: 'date',
    START_TIME: 'start_time',
    END_TIME: 'end_time',
    LOCATION: 'location',
    PLACE_ID: 'place_id',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    COST: 'cost',
    NOTES: 'notes',
    CREATED_BY: 'created_by',
    DAY_NUMBER: 'day_number',
    POSITION: 'position',
    SECTION_ID: 'section_id',
  },
  DESTINATIONS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    CITY: 'city',
    COUNTRY: 'country',
    STATE_PROVINCE: 'state_province',
    CONTINENT: 'continent',
    IMAGE_URL: 'image_url',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    SLUG: 'slug',
    EMOJI: 'emoji',
  },
  // Group planning fields
  GROUP_PLAN_IDEAS: {
    ID: 'id',
    GROUP_ID: 'group_id',
    CREATED_BY: 'created_by',
    GUEST_TOKEN: 'guest_token',
    TYPE: 'type',
    TITLE: 'title',
    DESCRIPTION: 'description',
    POSITION: 'position',
    VOTES_UP: 'votes_up',
    VOTES_DOWN: 'votes_down',
    META: 'meta',
  },
  // Form fields
  FORMS: {
    ID: 'id',
    TYPE: 'type',
    NAME: 'name',
    DESCRIPTION: 'description',
    CONFIG: 'config',
    MILESTONE_TRIGGER: 'milestone_trigger',
    MILESTONES: 'milestones',
    IS_ACTIVE: 'is_active',
  },
} as const;

// ============================================================================
// DIRECT TABLE NAME STRINGS
// ============================================================================

/**
 * Table names as direct string literals for database operations
 *
 * These are properly typed for Supabase queries. Use these constants
 * when performing database operations with from() or similar methods.
 */
export const TABLE_NAMES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  TRIP_TAGS: 'trip_tags',
  ITINERARY_ITEMS: 'itinerary_items',
  ITINERARY_SECTIONS: 'itinerary_sections',
  TRIP_VOTE_POLLS: 'trip_vote_polls',
  TRIP_VOTE_OPTIONS: 'trip_vote_options',
  TRIP_VOTES: 'trip_votes',
  GROUP_PLAN_IDEAS: 'group_plan_ideas',
  GROUP_PLAN_IDEA_VOTES: 'group_plan_idea_votes',
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  PROFILES: 'profiles',
  USERS: 'users',
  SURVEY_DEFINITIONS: 'survey_definitions',
  SURVEY_RESPONSES: 'survey_responses',
  GUEST_TOKENS: 'guest_tokens',
  DESTINATIONS: 'destinations',
} as const;
