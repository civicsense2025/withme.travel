/**
 * Database Table Constants
 * 
 * This file defines all the database table names used throughout the application.
 * Table names are organized by domain area for better organization.
 */

// ============================================================================
// CORE TABLES
// ============================================================================

/**
 * Core database table names
 */
export const TABLES = {
  ACCESS_REQUESTS: 'access_requests',
  ALBUMS: 'albums',
  BUDGET_ITEMS: 'budget_items',
  CITIES: 'cities',
  COLLABORATIVE_NOTES: 'collaborative_notes',
  COLLABORATIVE_SESSIONS: 'collaborative_sessions',
  COMMENTS: 'comments',
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
  GROUP_GUEST_MEMBERS: 'group_guest_members',
  GROUP_IDEAS: 'group_ideas',
  GROUP_ROLES: 'group_roles',
  GROUP_TRIPS: 'group_trips',
  GROUP_ACTIVITIES: 'group_activities',
  GROUP_BOARD_LOG: 'group_board_log',
  GROUP_PLANS_LOG: 'group_plans_log',
  GUEST_TOKENS: 'guest_tokens',
  IMAGES: 'images',
  INVITATIONS: 'invitations',
  ITINERARY_ITEMS: 'itinerary_items',
  ITINERARY_ITEM_VOTES: 'itinerary_item_votes',
  ITINERARY_SECTIONS: 'itinerary_sections',
  ITEM_TAGS: 'item_tags',
  LIKES: 'likes',
  LOCATIONS: 'locations',
  MEMBERS: 'members',
  MESSAGES: 'messages',
  METADATA: 'metadata',
  NOTIFICATIONS: 'notifications',
  PAYMENT_METHODS: 'payment_methods',
  PERMISSIONS: 'permissions',
  PLACES: 'places',
  PRIVACY_SETTINGS: 'privacy_settings',
  PROFILES: 'profiles',
  SEARCH_HISTORY: 'search_history',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
  SUBSCRIPTIONS: 'subscriptions',
  TAGS: 'tags',
  TEMPLATES: 'templates',
  TEMPLATE_ITEMS: 'template_items',
  TEMPLATE_SECTIONS: 'template_sections',
  TRAVEL_PREFERENCES: 'travel_preferences',
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  TRIP_CITIES: 'trip_cities',
  TRIP_LOGISTICS: 'trip_logistics',
  TRIP_TAGS: 'trip_tags',
  TRIP_NOTES: 'trip_notes',
  TRIP_HISTORY: 'trip_history',
  TRIP_IMAGES: 'trip_images',
  TRIP_TEMPLATE_USES: 'trip_template_uses',
  TRIP_VOTE_OPTIONS: 'trip_vote_options',
  TRIP_VOTE_POLLS: 'trip_vote_polls',
  TRIP_VOTES: 'trip_votes',
  TRIP_ACTIVITY_LOG: 'trip_activity_log',
  TRIP_COLLABORATIONS: 'trip_collaborations',
  USER_TRIP_VOTES: 'user_trip_votes',
  USERS: 'users',
  TASKS: 'tasks',
  TASK_VOTES: 'task_votes',
  TASK_TAGS: 'task_tags'
};

// ============================================================================
// DOMAIN-SPECIFIC TABLE GROUPS
// ============================================================================

/**
 * Trip-related tables
 */
export const TRIP_TABLES = {
  TRIPS: TABLES.TRIPS,
  TRIP_MEMBERS: TABLES.TRIP_MEMBERS,
  TRIP_CITIES: TABLES.TRIP_CITIES,
  TRIP_LOGISTICS: TABLES.TRIP_LOGISTICS,
  TRIP_TAGS: TABLES.TRIP_TAGS,
  TRIP_NOTES: TABLES.TRIP_NOTES,
  TRIP_HISTORY: TABLES.TRIP_HISTORY,
  TRIP_IMAGES: TABLES.TRIP_IMAGES,
  TRIP_TEMPLATE_USES: TABLES.TRIP_TEMPLATE_USES,
  TRIP_VOTE_OPTIONS: TABLES.TRIP_VOTE_OPTIONS,
  TRIP_VOTE_POLLS: TABLES.TRIP_VOTE_POLLS,
  TRIP_VOTES: TABLES.TRIP_VOTES,
  TRIP_ACTIVITY_LOG: TABLES.TRIP_ACTIVITY_LOG,
  TRIP_COLLABORATIONS: TABLES.TRIP_COLLABORATIONS,
};

/**
 * Multi-city related tables
 */
export const MULTI_CITY_TABLES = {
  CITIES: TABLES.CITIES,
  TRIP_CITIES: TABLES.TRIP_CITIES,
};

/**
 * Group-related tables
 */
export const GROUP_TABLES = {
  GROUPS: TABLES.GROUPS,
  GROUP_MEMBERS: TABLES.GROUP_MEMBERS,
  GROUP_PLANS: TABLES.GROUP_PLANS,
  GROUP_PLAN_IDEAS: TABLES.GROUP_PLAN_IDEAS,
  GROUP_PLAN_IDEA_COMMENTS: TABLES.GROUP_PLAN_IDEA_COMMENTS,
  GROUP_PLAN_IDEA_REACTIONS: TABLES.GROUP_PLAN_IDEA_REACTIONS,
  GROUP_PLAN_IDEA_VOTES: TABLES.GROUP_PLAN_IDEA_VOTES,
  GROUP_PLAN_EVENTS: TABLES.GROUP_PLAN_EVENTS,
  GROUP_GUEST_MEMBERS: TABLES.GROUP_GUEST_MEMBERS,
  GROUP_IDEAS: TABLES.GROUP_IDEAS,
  GROUP_ROLES: TABLES.GROUP_ROLES,
  GROUP_TRIPS: TABLES.GROUP_TRIPS,
  GROUP_ACTIVITIES: TABLES.GROUP_ACTIVITIES,
  GROUP_BOARD_LOG: TABLES.GROUP_BOARD_LOG,
  GROUP_PLANS_LOG: TABLES.GROUP_PLANS_LOG,
};

/**
 * User-related tables
 */
export const USER_TABLES = {
  USERS: TABLES.USERS,
  PROFILES: TABLES.PROFILES,
  TRAVEL_PREFERENCES: TABLES.TRAVEL_PREFERENCES,
  PRIVACY_SETTINGS: TABLES.PRIVACY_SETTINGS,
  SETTINGS: TABLES.SETTINGS,
};

/**
 * Destination/Places tables
 */
export const DESTINATION_TABLES = {
  DESTINATIONS: TABLES.DESTINATIONS,
  PLACES: TABLES.PLACES,
  LOCATIONS: TABLES.LOCATIONS,
  DESTINATION_TAGS: TABLES.DESTINATION_TAGS,
  CITIES: TABLES.CITIES,
};

/**
 * Content-related tables
 */
export const CONTENT_TABLES = {
  CONTENT_SLUGS: TABLES.CONTENT_SLUGS,
  CONTENT_CUSTOMIZATIONS: TABLES.CONTENT_CUSTOMIZATIONS,
  CONTENT_QUALITY_METRICS: TABLES.CONTENT_QUALITY_METRICS,
  CONTENT_SHARING_HISTORY: TABLES.CONTENT_SHARING_HISTORY,
};

/**
 * Itinerary and template tables
 */
export const ITINERARY_TABLES = {
  ITINERARY_ITEMS: TABLES.ITINERARY_ITEMS,
  ITINERARY_ITEM_VOTES: TABLES.ITINERARY_ITEM_VOTES,
  ITINERARY_SECTIONS: TABLES.ITINERARY_SECTIONS,
  TEMPLATES: TABLES.TEMPLATES,
  TEMPLATE_ITEMS: TABLES.TEMPLATE_ITEMS,
  TEMPLATE_SECTIONS: TABLES.TEMPLATE_SECTIONS,
};

/**
 * Template-specific tables
 */
export const TEMPLATE_TABLES = {
  TEMPLATES: TABLES.TEMPLATES,
  TEMPLATE_ITEMS: TABLES.TEMPLATE_ITEMS,
  TEMPLATE_SECTIONS: TABLES.TEMPLATE_SECTIONS,
  TRIP_TEMPLATE_USES: TABLES.TRIP_TEMPLATE_USES,
};

/**
 * Social interaction tables
 */
export const SOCIAL_TABLES = {
  LIKES: TABLES.LIKES,
  MESSAGES: TABLES.MESSAGES,
  NOTIFICATIONS: TABLES.NOTIFICATIONS,
  INVITATIONS: TABLES.INVITATIONS,
};

/**
 * Financial tables
 */
export const FINANCE_TABLES = {
  BUDGET_ITEMS: TABLES.BUDGET_ITEMS,
  EXPENSES: TABLES.EXPENSES,
  PAYMENT_METHODS: TABLES.PAYMENT_METHODS,
  SUBSCRIPTIONS: TABLES.SUBSCRIPTIONS,
};

/**
 * Form and research tables
 */
export const FORM_TABLES = {
  FORMS: TABLES.FORMS,
  FORM_TEMPLATES: TABLES.FORM_TEMPLATES, 
  FORM_COLLABORATORS: TABLES.FORM_COLLABORATORS,
};

/**
 * Spatial data tables
 */
export const SPATIAL_TABLES = {
  LOCATIONS: TABLES.LOCATIONS,
  PLACES: TABLES.PLACES,
};

/**
 * Notification-related tables
 */
export const NOTIFICATION_TABLES = {
  NOTIFICATIONS: TABLES.NOTIFICATIONS,
  SETTINGS: TABLES.SETTINGS,
};

/**
 * User preference tables
 */
export const PREFERENCE_TABLES = {
  SETTINGS: TABLES.SETTINGS,
  TRAVEL_PREFERENCES: TABLES.TRAVEL_PREFERENCES,
  PRIVACY_SETTINGS: TABLES.PRIVACY_SETTINGS,
};

/**
 * Research and user testing tables
 */
export const RESEARCH_TABLES = {
  FEEDBACK: TABLES.FEEDBACK,
  FORMS: TABLES.FORMS,
  SEARCH_HISTORY: TABLES.SEARCH_HISTORY,
  FOCUS_SESSIONS: TABLES.FOCUS_SESSIONS,
};

/**
 * User testing tables
 */
export const USER_TESTING_TABLES = {
  FEEDBACK: TABLES.FEEDBACK,
  FOCUS_SESSIONS: TABLES.FOCUS_SESSIONS,
};

/**
 * Query snippets for multi-city features
 */
export const MULTI_CITY_QUERY_SNIPPETS = {
  // Get all cities for a trip with basic city data
  GET_TRIP_CITIES: `
    id,
    trip_id,
    city_id,
    position,
    arrival_date,
    departure_date,
    city:cities(
      id,
      name,
      country,
      admin_name,
      continent,
      latitude,
      longitude
    )
  `,

  // Get all sections for a trip city
  GET_TRIP_CITY_SECTIONS: `
    id,
    trip_id,
    trip_city_id,
    day_number,
    date,
    title,
    position,
    items:itinerary_items(
      id,
      title,
      description,
      start_time,
      end_time,
      position,
      category,
      status
    )
  `,

  // Get a destination with its canonical city
  GET_DESTINATION_WITH_CITY: `
    id,
    name,
    city,
    country,
    city_id,
    is_city_deprecated,
    canonical_city:cities(
      id,
      name,
      country,
      admin_name
    )
  `,
};

/**
 * Type for content types that can have comments
 */
export type CommentableContentType = 'trip' | 'destination' | 'itinerary_item' | 'collection' | 'template' | 'group_plan_idea';

/**
 * Type for itinerary template metadata
 */
export type ItineraryTemplateMetadata = {
  name: string;
  description?: string;
  duration: number;
  image_url?: string;
  location?: string;
  categories?: string[];
  tags?: string[];
};
