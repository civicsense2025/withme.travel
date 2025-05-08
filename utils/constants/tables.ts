/**
 * Constants for database table names
 */
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
  FEEDBACK: 'feedback',
  FOCUS_SESSIONS: 'focus_sessions',
  FORM_COLLABORATORS: 'form_collaborators',
  FORM_TEMPLATES: 'form_templates',
  FORMS: 'forms',
  GROUP_IDEAS: 'group_ideas',
  GROUP_IDEA_COMMENTS: 'group_idea_comments',
  GROUP_IDEA_REACTIONS: 'group_idea_reactions',
  GROUP_PLAN_EVENTS: 'group_plan_events',
  IMAGE_METADATA: 'image_metadata',
  INVITATIONS: 'invitations',
  ITINERARY_ITEM_COMMENTS: 'itinerary_item_comments',
  ITINERARY_ITEM_REACTIONS: 'itinerary_item_reactions',
  ITINERARY_ITEMS: 'itinerary_items',
  ITINERARY_TEMPLATES: 'itinerary_templates',
  NOTIFICATIONS: 'notifications',
  ONBOARDING_PREFERENCES: 'onboarding_preferences',
  ONBOARDING_TOUR_COMPLETIONS: 'onboarding_tour_completions',
  PHOTOS: 'photos',
  PLACES: 'places',
  POLL_OPTIONS: 'poll_options',
  POLL_VOTES: 'poll_votes',
  POLLS: 'polls',
  PROFILES: 'profiles',
  SURVEY_DEFINITIONS: 'survey_definitions',
  SURVEY_RESPONSES: 'survey_responses',
  TAGS: 'tags',
  TEMPLATES: 'templates',
  TEMPLATE_SECTIONS: 'template_sections',
  TRAVEL_STYLES: 'travel_styles',
  TRIP_ACTIVITY_LOG: 'trip_activity_log',
  TRIP_COLLABORATIONS: 'trip_collaborations',
  TRIP_MEMBERS: 'trip_members',
  TRIPS: 'trips',
  USER_ACTIVITY_HISTORY: 'user_activity_history',
  USER_EVENTS: 'user_events',
  USER_INTERACTIONS: 'user_interactions',
  USER_INTERESTS: 'user_interests',
  USER_LOGIN_HISTORY: 'user_login_history',
  USER_PREFERENCES: 'user_preferences',
  USER_PRESENCE: 'user_presence',
  USER_SUGGESTED_TAGS: 'user_suggested_tags',
  USER_TESTING_SIGNUPS: 'user_testing_signups',
  USER_TRAVEL: 'user_travel',
  VALIDATION_LOGS: 'validation_logs',
  VOTES: 'votes'
};

/**
 * Common database field names
 */
export const FIELDS = {
  COMMON: {
    ID: 'id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  // Add common fields for frequently used tables
  PROFILES: {
    ID: 'id',
    NAME: 'name',
    EMAIL: 'email',
    AVATAR_URL: 'avatar_url'
  },
  TRIPS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    CREATED_BY: 'created_by',
    DESTINATION_ID: 'destination_id'
  }
};

/**
 * Database enum types
 */
export const ENUMS = {
  CONTENT_TYPE: {
    TRIP: 'trip',
    DESTINATION: 'destination',
    ITINERARY_ITEM: 'itinerary_item',
    COLLECTION: 'collection',
    TEMPLATE: 'template',
    GROUP_IDEA: 'group_idea'
  },
  TRIP_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    CONTRIBUTOR: 'contributor'
  },
  ITEM_STATUS: {
    SUGGESTED: 'suggested',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected'
  },
  IMAGE_TYPE: {
    DESTINATION: 'destination',
    TRIP_COVER: 'trip_cover',
    USER_AVATAR: 'user_avatar',
    TEMPLATE_COVER: 'template_cover'
  }
};

/**
 * Types for commentable content
 */
export type CommentableContentType = 
  | 'trip' 
  | 'destination' 
  | 'itinerary_item' 
  | 'collection' 
  | 'template'
  | 'group_idea';

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