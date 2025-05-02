// This file was automatically generated from the database schema

// Database Tables - Constant names for all database tables
export const TABLES = {
  ACCESS_REQUESTS: 'access_requests',
  ALBUMS: 'albums',
  BUDGET_ITEMS: 'budget_items',
  COLLABORATIVE_NOTES: 'collaborative_notes',
  COLLABORATIVE_SESSIONS: 'collaborative_sessions',
  CONTENT_CUSTOMIZATIONS: 'content_customizations',
  CONTENT_QUALITY_METRICS: 'content_quality_metrics',
  CONTENT_SHARING_HISTORY: 'content_sharing_history',
  CONTENT_SLUGS: 'content_slugs',
  DESTINATION_TAGS: 'destination_tags',
  DESTINATIONS: 'destinations',
  EXPENSES: 'expenses',
  FOCUS_SESSIONS: 'focus_sessions',
  FORM_COLLABORATORS: 'form_collaborators',
  FORM_TEMPLATES: 'form_templates',
  FORMS: 'forms',
  IMAGE_METADATA: 'image_metadata',
  INVITATIONS: 'invitations',
  ITEM_POPULARITY_METRICS: 'item_popularity_metrics',
  ITINERARY_ITEM_VOTES: 'itinerary_item_votes',
  ITINERARY_ITEMS: 'itinerary_items',
  ITINERARY_SECTIONS: 'itinerary_sections',
  ITINERARY_TEMPLATE_ITEMS: 'itinerary_template_items',
  ITINERARY_TEMPLATE_SECTIONS: 'itinerary_template_sections',
  ITINERARY_TEMPLATES: 'itinerary_templates',
  LIKES: 'likes',
  LOCATIONS: 'locations',
  NOTE_TAGS: 'note_tags',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  NOTIFICATIONS: 'notifications',
  PERMISSION_REQUESTS: 'permission_requests',
  PLACES: 'places',
  PREFERENCE_WEIGHTS: 'preference_weights',
  PROFILES: 'profiles',
  QUESTION_BRANCHING: 'question_branching',
  QUESTIONS: 'questions',
  REFERRALS: 'referrals',
  RESPONSE_SESSIONS: 'response_sessions',
  RESPONSES: 'responses',
  SURVEY_RESPONSES: 'survey_responses',
  TAGS: 'tags',
  TEMPLATE_APPLICATIONS: 'template_applications',
  TEMPLATE_TAGS: 'template_tags',
  TEAM_INVITATIONS: 'team_invitations',
  TEAM_MEMBERS: 'team_members',
  TEAMS: 'teams',
  TRIP_COMMENT_LIKES: 'trip_comment_likes',
  TRIP_HISTORY: 'trip_history',
  TRIP_IMAGES: 'trip_images',
  TRIP_ITEM_COMMENTS: 'trip_item_comments',
  TRIP_ITEM_VOTES: 'trip_item_votes',
  TRIP_MEMBERS: 'trip_members',
  TRIP_NOTES: 'trip_notes',
  TRIP_SETTINGS: 'trip_settings',
  TRIP_TAGS: 'trip_tags',
  TRIP_TEMPLATE_USES: 'trip_template_uses',
  TRIP_VOTE_OPTIONS: 'trip_vote_options',
  TRIP_VOTE_POLLS: 'trip_vote_polls',
  TRIP_VOTES: 'trip_votes',
  TRIPS: 'trips',
  USER_ACTIVITY_HISTORY: 'user_activity_history',
  USER_INTERACTIONS: 'user_interactions',
  USER_INTERESTS: 'user_interests',
  USER_LOGIN_HISTORY: 'user_login_history',
  USER_PREFERENCES: 'user_preferences',
  USER_PRESENCE: 'user_presence',
  USER_SUGGESTED_TAGS: 'user_suggested_tags',
  USER_TRAVEL: 'user_travel',
  USERS: 'users',
  VALIDATION_LOGS: 'validation_logs',
  VOTES: 'votes',
} as const;

// Field names for all tables
export const FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  ACCESS_REQUESTS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    REQUESTED_AT: 'requested_at',
    STATUS: 'status',
    APPROVED_BY: 'approved_by',
    APPROVED_AT: 'approved_at',
    MESSAGE: 'message',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  TRIP_MEMBERS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role', 
    JOINED_AT: 'joined_at',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  ITINERARY_ITEMS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    TITLE: 'title',
    DESCRIPTION: 'description',
    DAY_NUMBER: 'day_number',
    START_TIME: 'start_time',
    END_TIME: 'end_time',
    CATEGORY: 'category',
    LOCATION_NAME: 'location_name',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    STATUS: 'status',
    CREATED_BY: 'created_by',
    SECTION_ID: 'section_id',
    ORDER: 'order',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  TRIPS: {
    ID: 'id',
    TITLE: 'title',
    DESCRIPTION: 'description',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    DESTINATION: 'destination',
    CREATED_BY: 'created_by',
    IS_PUBLIC: 'is_public',
    COVER_IMAGE_URL: 'cover_image_url',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
} as const;

// Database Enums - Constants for enum values
export const ENUMS = {
  TRIP_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    CONTRIBUTOR: 'contributor',
  },
  ITEM_STATUS: {
    SUGGESTED: 'suggested',
    CONFIRMED: 'confirmed',
    CANCELED: 'canceled',
    FLEXIBLE: 'flexible',
  },
  QUESTION_TYPES: {
    SHORT_TEXT: 'short_text',
    LONG_TEXT: 'long_text',
    SINGLE_CHOICE: 'single_choice',
    MULTIPLE_CHOICE: 'multiple_choice',
    YES_NO: 'yes_no',
    RATING: 'rating',
    DATE: 'date',
    FILE_UPLOAD: 'file_upload',
    LOCATION: 'location',
    NUMBER: 'number',
    EMAIL: 'email',
    PHONE: 'phone',
    WEBSITE: 'website',
    STATEMENT: 'statement',
    WELCOME: 'welcome',
    THANK_YOU: 'thank_you',
  },
  FORM_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CLOSED: 'closed',
    ARCHIVED: 'archived',
  },
  FORM_VISIBILITY: {
    PRIVATE: 'private',
    SHARED_WITH_LINK: 'shared_with_link',
    PUBLIC: 'public',
  },
} as const;

// Database relationships - foreign key relationships between tables
export const RELATIONSHIPS = {
  TRIP_MEMBERS_TO_TRIPS: {
    TABLE: 'trip_members',
    FOREIGN_KEY: 'trip_id',
    REFERENCE_TABLE: 'trips',
    REFERENCE_KEY: 'id',
  },
  TRIP_MEMBERS_TO_USERS: {
    TABLE: 'trip_members',
    FOREIGN_KEY: 'user_id',
    REFERENCE_TABLE: 'users',
    REFERENCE_KEY: 'id',
  },
} as const;

// Type definitions for stronger typing
export type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';
export type ItemStatus = 'suggested' | 'confirmed' | 'canceled' | 'flexible';
export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no'
  | 'rating'
  | 'date'
  | 'file_upload'
  | 'location'
  | 'number'
  | 'email'
  | 'phone'
  | 'website'
  | 'statement'
  | 'welcome'
  | 'thank_you';
export type FormStatus = 'draft' | 'published' | 'closed' | 'archived';
export type FormVisibility = 'private' | 'shared_with_link' | 'public';

export type TableNames = (typeof TABLES)[keyof typeof TABLES];
export type TableFields<T extends keyof typeof FIELDS> =
  (typeof FIELDS)[T][keyof (typeof FIELDS)[T]];

// Legacy export aliases (avoid using these in new code)
export const DB_TABLES = TABLES;
export const DB_FIELDS = FIELDS;
export const DB_ENUMS = ENUMS;
export const DB_RELATIONSHIPS = RELATIONSHIPS;
