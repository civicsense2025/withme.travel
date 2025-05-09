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
  GROUPS: 'groups',
  GROUP_MEMBERS: 'group_members',
  GROUP_PLANS: 'group_plans',
  GROUP_PLAN_IDEAS: 'group_plan_ideas',
  GROUP_PLAN_IDEA_COMMENTS: 'group_plan_idea_comments',
  GROUP_PLAN_IDEA_REACTIONS: 'group_plan_idea_reactions',
  GROUP_PLAN_IDEA_VOTES: 'group_plan_idea_votes',
  GROUP_PLAN_EVENTS: 'group_plan_events',
  GUEST_TOKENS: 'guest_tokens',
  IMAGE_METADATA: 'image_metadata',
  INVITATIONS: 'invitations',
  ITINERARY_ITEM_COMMENTS: 'itinerary_item_comments',
  ITINERARY_ITEM_REACTIONS: 'itinerary_item_reactions',
  ITINERARY_ITEMS: 'itinerary_items',
  ITINERARY_TEMPLATES: 'itinerary_templates',
  ITINERARY_TEMPLATE_SECTIONS: 'itinerary_template_sections',
  ITINERARY_TEMPLATE_ITEMS: 'itinerary_template_items',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
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
  VOTES: 'votes',
  GROUP_GUEST_MEMBERS: 'group_guest_members',
  GROUP_IDEAS: 'group_ideas',
  IMAGES: 'images',
  ITEM_TAGS: 'item_tags',
  LIKES: 'likes',
  LOCATIONS: 'locations',
  MEMBERS: 'members',
  MESSAGES: 'messages',
  METADATA: 'metadata',
  PAYMENT_METHODS: 'payment_methods',
  PERMISSIONS: 'permissions',
  PRIVACY_SETTINGS: 'privacy_settings',
  SEARCH_HISTORY: 'search_history',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
  SUBSCRIPTIONS: 'subscriptions',
  TEMPLATE_ITEMS: 'template_items',
  TRAVEL_PREFERENCES: 'travel_preferences',
  USER_TRIP_VOTES: 'user_trip_votes',
  USERS: 'users'
} as const;

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
  },
  GROUPS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    CREATED_BY: 'created_by',
    SLUG: 'slug',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
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
    SELECTED: 'selected',
    META: 'meta',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  GROUP_PLAN_IDEA_COMMENTS: {
    IDEA_ID: 'idea_id',
    USER_ID: 'user_id'
  },
  GROUP_PLAN_IDEA_REACTIONS: {
    IDEA_ID: 'idea_id',
    USER_ID: 'user_id'
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
    GROUP_PLAN_IDEA: 'group_plan_idea'
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
  },
  GROUP_PLAN_IDEA_TYPE: {
    DESTINATION: 'destination',
    DATE: 'date',
    ACTIVITY: 'activity',
    BUDGET: 'budget',
    OTHER: 'other',
    QUESTION: 'question',
    NOTE: 'note',
    PLACE: 'place'
  },
  VOTE_TYPE: {
    UP: 'up',
    DOWN: 'down'
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