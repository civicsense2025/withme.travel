/**
 * API-related constants
 *
 * This file contains all API-related constants including routes,
 * endpoints, and external API configurations.
 */

/**
 * Constants related to API integrations
 */

/**
 * Unsplash API configuration
 */
export const UNSPLASH_CONFIG = {
  API_URL: 'https://api.unsplash.com',
  ENDPOINTS: {
    SEARCH: '/search/photos',
    RANDOM: '/photos/random',
    PHOTO: '/photos',
  },
  DEFAULT_QUERY_PARAMS: {
    per_page: 20,
    orientation: 'landscape',
  },
};

/**
 * Pexels API configuration
 */
export const PEXELS_CONFIG = {
  API_URL: 'https://api.pexels.com/v1',
  ENDPOINTS: {
    SEARCH: '/search',
    CURATED: '/curated',
  },
  DEFAULT_QUERY_PARAMS: {
    per_page: 20,
    orientation: 'landscape',
  },
};

/**
 * Common API routes used in the application
 */
export const API_ROUTES = {
  TRIPS: '/api/trips',
  TRIP_DETAILS: (id: string) => `/api/trips/${id}`,
  TRIP_MEMBERS: (id: string) => `/api/trips/${id}/members`,
  TRIP_ITINERARY: (id: string) => `/api/trips/${id}/itinerary`,
  ITINERARY_ITEM: (tripId: string, itemId: string) => `/api/trips/${tripId}/itinerary/${itemId}`,
  TRIP_BUDGET: (id: string) => `/api/trips/${id}/budget`,
  BUDGET_ITEM: (tripId: string, itemId: string) => `/api/trips/${tripId}/budget/${itemId}`,
  COLLABORATIVE_NOTES: (id: string) => `/api/trips/${id}/notes`,
  DESTINATIONS: '/api/destinations',
  DESTINATION_DETAILS: (id: string) => `/api/destinations/${id}`,
  DESTINATION_SEARCH: (query: string) =>
    `/api/destinations/search?query=${encodeURIComponent(query)}`,
  PERMISSION_REQUESTS: (id: string) => `/api/trips/${id}/permissions`,
  LIBRARY: '/api/library',
  LIBRARY_TEMPLATE: (id: string) => `/api/library/${id}`,
  USER_PROFILE: (id: string) => `/api/profiles/${id}`,
  REFERRALS: '/api/referrals',
  ITINERARIES: '/api/itineraries',
  ITINERARY_DETAILS: (slug: string) => `/api/itineraries/${slug}`,
  TEMPLATES: '/api/templates',
  TEMPLATE_DETAILS: (id: string) => `/api/templates/${id}`,
  TEMPLATE_SECTIONS: (id: string) => `/api/templates/${id}/sections`,
  TEMPLATE_ITEMS: (templateId: string, sectionId: string) =>
    `/api/templates/${templateId}/sections/${sectionId}/items`,
  PLACES: '/api/places',
  PLACE_DETAILS: (id: string) => `/api/places/${id}`,
  PLACE_REVIEWS: (id: string) => `/api/places/${id}/reviews`,
  TRIP_REVIEWS: '/api/trip-reviews',
  DESTINATION_REVIEWS: (id: string) => `/api/destinations/${id}/reviews`,
  AUTH_CHECK: '/api/auth/check',
  TRIP_MEMBER_INVITE: (id: string) => `/api/trips/${id}/members/invite`,
  TAGS: '/api/tags',
  TRIP_TAGS: (id: string) => `/api/trips/${id}/tags`,
  ITINERARY_ITEM_VOTE: (tripId: string, itemId: string) =>
    `/api/trips/${tripId}/itinerary/${itemId}/vote`,
  TRIP_ITINERARY_REORDER: (tripId: string) => `/api/trips/${tripId}/itinerary/reorder`,
  TRIP_VOTE: (tripId: string) => `/api/trips/${tripId}/vote`,
  ADMIN_STATS: '/api/admin/stats',
  DEBUG_AUTH_STATUS: '/api/debug/auth-status',
  TRIP_TRAVEL_TIMES: (id: string) => `/api/trips/${id}/travel-times`,
  APPLY_TEMPLATE: (slug: string) => `/api/itineraries/${slug}/use`,
  VALIDATE_TEMPLATE: (id: string) => `/api/templates/${id}/validate`,
  USERS: '/api/users',
  SEARCH: '/api/search',
} as const;

/**
 * Query snippets for common database queries
 */
export const QUERY_SNIPPETS = {
  TRIP_WITH_CREATOR: `
    id,
    name,
    description,
    start_date,
    end_date,
    destination_id,
    created_at,
    destination:destinations(
      id,
      name,
      city,
      country,
      image_url
    ),
    creator:profiles!creator_id(
      id,
      name,
      avatar_url
    )
  `,

  // Get trips created by a user
  GET_USER_TRIPS: (userId: string) => ({
    table: 'trips',
    select: '*',
    filters: [{ field: 'created_by', value: userId }],
    order: { field: 'created_at', ascending: false },
  }),

  // Get trips a user is a member of
  GET_MEMBER_TRIPS: (userId: string) => ({
    table: 'trip_members',
    select: `*, trips(*)`,
    filters: [{ field: 'user_id', value: userId }],
  }),

  // Get all members of a trip
  GET_TRIP_MEMBERS: (tripId: string) => ({
    table: 'trip_members',
    select: `*, profiles(id, name, avatar_url)`,
    filters: [{ field: 'trip_id', value: tripId }],
  }),

  // Get trending destinations
  GET_TRENDING_DESTINATIONS: (limit: number = 6) => ({
    table: 'destinations',
    select: '*',
    order: { field: 'popularity', ascending: false },
    limit,
  }),
};

// Foreign keys for relationships
export const FOREIGN_KEYS = {
  TRIP_MEMBERS_USER_ID: 'trip_members_user_id_fkey',
  TRIP_MEMBERS_INVITED_BY: 'trip_members_invited_by_fkey',
  TRIP_NOTES_UPDATED_BY: 'trip_notes_updated_by_fkey',
  TRIP_NOTES_USER_ID: 'trip_notes_user_id_fkey',
  TRIPS_USER_ID: 'trips_user_id_fkey',
  ITINERARY_ITEMS_CREATED_BY: 'itinerary_items_created_by_fkey',
  BUDGET_ITEMS_CREATED_BY: 'budget_items_created_by_fkey',
  BUDGET_ITEMS_PAID_BY: 'budget_items_paid_by_fkey',
} as const;
