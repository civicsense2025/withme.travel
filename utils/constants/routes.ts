/**
 * API and page route constants for the withme.travel application
 *
 * This file contains all route-related constants:
 * - API_ROUTES: All API endpoint paths (for client->server communication)
 * - PAGE_ROUTES: All page paths (for navigation/linking)
 */

// No enums or types in this file should be duplicated from database.ts. Use Database["public"]["Enums"] for any DB enums.

// API Routes - All backend API endpoints
export const API_ROUTES = {
  // Trip routes
  TRIPS: '/api/trips',
  TRIP_DETAILS: (tripId: string) => `/api/trips/${tripId}`,
  TRIP_MEMBERS: (tripId: string) => `/api/trips/${tripId}/members`,
  TRIP_ITINERARY: (tripId: string) => `/api/trips/${tripId}/itinerary`,
  ITINERARY_ITEM: (tripId: string, itemId: string) => `/api/trips/${tripId}/itinerary/${itemId}`,
  TRIP_BUDGET: (tripId: string) => `/api/trips/${tripId}/budget`,
  BUDGET_ITEM: (tripId: string, itemId: string) => `/api/trips/${tripId}/budget/${itemId}`,
  COLLABORATIVE_NOTES: (tripId: string) => `/api/trips/${tripId}/notes`,
  TRIP_MEMBER_INVITE: (tripId: string) => `/api/trips/${tripId}/members/invite`,
  TRIP_TAGS: (tripId: string) => `/api/trips/${tripId}/tags`,
  TRIP_ITINERARY_REORDER: (tripId: string) => `/api/trips/${tripId}/itinerary/reorder`,
  TRIP_VOTE: (tripId: string) => `/api/trips/${tripId}/vote`,
  TRIP_TRAVEL_TIMES: (tripId: string) => `/api/trips/${tripId}/travel-times`,
  TRIP_APPLY_TEMPLATE: (tripId: string, templateId: string) =>
    `/api/trips/${tripId}/apply-template/${templateId}`,

  // Itinerary routes
  ITINERARY_ITEM_VOTE: (tripId: string, itemId: string) =>
    `/api/trips/${tripId}/itinerary/${itemId}/vote`,
  ITINERARIES: '/api/itineraries',
  ITINERARY_DETAILS: (slug: string) => `/api/itineraries/${slug}`,
  APPLY_TEMPLATE: (slug: string) => `/api/itineraries/${slug}/use`,

  // Destination routes
  DESTINATIONS: '/api/destinations',
  DESTINATION_DETAILS: (id: string) => `/api/destinations/${id}`,
  DESTINATION_SEARCH: (query: string) => `/api/destinations/search?q=${encodeURIComponent(query)}`,
  DESTINATION_REVIEWS: (id: string) => `/api/destinations/${id}/reviews`,
  DESTINATION_RELATED_TRIPS: (id: string) => `/api/destinations/${id}/related-trips`,
  DESTINATION_BY_ID: (id: string) => `/api/destinations/by-id/${id}`,
  DESTINATIONS_BY_CITY: (city: string) => `/api/destinations/by-city/${encodeURIComponent(city)}`,
  DESTINATION_LOOKUP_OR_CREATE: '/api/destinations/lookup-or-create',
  PLACE_LOOKUP_OR_CREATE: '/api/places/lookup-or-create',
  CITY_SUGGESTIONS: (query: string) =>
    `/api/destinations/search/cities?query=${encodeURIComponent(query)}`,
  LOCATION_SUGGESTIONS: (query: string) => `/api/mapbox/search?q=${encodeURIComponent(query)}`,
  TAGS: '/api/tags',
  TAGS_WITH_COUNTS: '/api/tags?withCounts=true',
  FEEDBACK_SUBMIT: '/api/feedback/submit',
  UNSPLASH_SEARCH: (query: string) =>
    `/api/images/search-unsplash?query=${encodeURIComponent(query)}`,
  PEXELS_SEARCH: (query: string) => `/api/images/search-pexels?query=${encodeURIComponent(query)}`,
  RANDOM_DESTINATION_IMAGE: '/api/images/random-destination',
  EXPORT_CALENDAR: (tripId: string) => `/api/trips/${tripId}/export-calendar`,
  LIKES: '/api/likes',
  LIKE_TRIP: (tripId: string) => `/api/likes?tripId=${tripId}`,
  LIKE_DESTINATION: (destinationId: string) => `/api/likes?destinationId=${destinationId}`,
  USERS: '/api/users',
  PROFILES: '/api/profiles',
  TRIP_FORMS: (tripId: string) => `/api/trips/${tripId}/forms`,
  TRIP_ACCESS_REQUEST: (tripId: string) => `/api/trips/${tripId}/request-access`,
  TRIP_EXPENSES: (tripId: string) => `/api/trips/${tripId}/expenses`,
  TRIP_EXPENSE: (tripId: string, expenseId: string) => `/api/trips/${tripId}/expenses/${expenseId}`,
  PUBLIC_TRIP: (slug: string) => `/api/trips/public/${slug}`,
  CREATE_TRIP_WITH_DEFAULTS: '/api/trips/create-with-defaults',
  SCRAPE_URL: (tripId: string) => `/api/trips/${tripId}/itinerary/scrape-url`,
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_ME: '/api/auth/me',
  AUTH_CLEAR_COOKIES: '/api/auth/clear-cookies',
  AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/api/auth/reset-password',
  NOTIFICATIONS_COUNT: '/api/notifications/count',
  ADMIN_STATS: '/api/admin/stats',
  DEBUG_AUTH_STATUS: '/api/debug/auth-status',
  GOOGLE_MAPS_PARSE: '/api/google-maps/parse',

  // Template routes - UPDATED NAMES
  ITINERARY_TEMPLATES: '/api/itineraries',
  ITINERARY_TEMPLATE_DETAILS: (id: string) => `/api/itineraries/${id}`,
  ITINERARY_TEMPLATE_SECTIONS: (id: string) => `/api/itineraries/${id}/sections`,
  ITINERARY_TEMPLATE_ITEMS: (templateId: string, sectionId: string) =>
    `/api/itineraries/${templateId}/sections/${sectionId}/items`,
  VALIDATE_ITINERARY_TEMPLATE: (id: string) => `/api/itineraries/${id}/validate`,

  // Place routes
  PLACES: '/api/places',
  PLACE_DETAILS: (id: string) => `/api/places/${id}`,
  PLACE_REVIEWS: (id: string) => `/api/places/${id}/reviews`,

  // Permission routes
  PERMISSION_REQUESTS: (tripId: string) => `/api/trips/${tripId}/permissions`,

  // User/Profile routes
  USER_PROFILE: (id: string) => `/api/profiles/${id}`,

  // Public content routes
  PUBLIC_TRIP_DETAILS: (slug: string) => `/api/trips/public/${slug}`,

  // Miscellaneous routes
  LIBRARY: '/api/library',
  LIBRARY_TEMPLATE: (id: string) => `/api/library/${id}`,
  REFERRALS: '/api/referrals',
  TRIP_REVIEWS: '/api/trip-reviews',

  // Group routes
  GROUPS: {
    LIST: '/api/groups',
    DETAIL: (id: string) => `/api/groups/${id}`,
    CREATE: '/api/groups',
    UPDATE: (id: string) => `/api/groups/${id}`,
    DELETE: (id: string) => `/api/groups/${id}`,
    MEMBERS: (id: string) => `/api/groups/${id}/members`,
    JOIN: (id: string) => `/api/groups/${id}/join`,
    INVITE: (id: string) => `/api/groups/${id}/invite`,
  },

  // Group plan routes
  GROUP_PLANS: {
    LIST: (groupId: string) => `/api/groups/${groupId}/plans`,
    DETAIL: (groupId: string, planId: string) => `/api/groups/${groupId}/plans/${planId}`,
    CREATE: (groupId: string) => `/api/groups/${groupId}/plans`,
    UPDATE: (groupId: string, planId: string) => `/api/groups/${groupId}/plans/${planId}`,
    DELETE: (groupId: string, planId: string) => `/api/groups/${groupId}/plans/${planId}`,
  },

  // Group plan ideas
  GROUP_PLAN_IDEAS: {
    LIST: (groupId: string) => `/api/groups/${groupId}/ideas`,
    DETAIL: (groupId: string, ideaId: string) => `/api/groups/${groupId}/ideas/${ideaId}`,
    CREATE: (groupId: string) => `/api/groups/${groupId}/ideas`,
    UPDATE: (groupId: string, ideaId: string) => `/api/groups/${groupId}/ideas/${ideaId}`,
    DELETE: (groupId: string, ideaId: string) => `/api/groups/${groupId}/ideas/${ideaId}`,
  },

  // Group plan idea votes
  GROUP_PLAN_IDEA_VOTES: {
    CREATE: (groupId: string, ideaId: string) => `/api/groups/${groupId}/ideas/${ideaId}/vote`,
    DELETE: (groupId: string, ideaId: string) => `/api/groups/${groupId}/ideas/${ideaId}/vote`,
  },

  // Notification Routes
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    UPDATE: '/api/notifications',
    PREFERENCES: '/api/notifications/preferences',
    HISTORY: '/api/notifications/history',
    COUNT: '/api/notifications/count',
    DEEP_LINK: '/api/notifications/deep-link',
    CLICK: '/api/notifications/click',
    ANALYTICS: '/api/notifications/analytics',
  },

  // Friends routes
  FRIENDS: {
    REQUEST: '/api/friends/request',
    RESPOND: '/api/friends/respond',
    REQUESTS: '/api/friends/requests',
    LIST: '/api/friends/list',
    UNFRIEND: '/api/friends/unfriend',
  },

  // Research routes
  RESEARCH: {
    CREATE_STUDY: '/api/admin/research/create-study',
    GENERATE_LINK: '/api/admin/research/generate-link',
    EXPORT_DATA: '/api/admin/research/export-data',
    SUBMIT_RESPONSE: '/api/research/submit-response',
    TRACK_EVENT: '/api/research/track-event',
    SESSION_INFO: '/api/research/session-info',
    GET_SURVEYS: '/api/research/surveys',
  },
} as const;

// Page Routes - All frontend navigation paths
export const PAGE_ROUTES = {
  HOME: '/',
  TRIPS: '/trips',
  TRIP_DETAILS: (tripId: string) => `/trips/${tripId}`,
  CREATE_TRIP: '/trips/create',
  EDIT_TRIP: (tripId: string) => `/trips/${tripId}/edit`,
  TRIP_ADD_ITEM: (tripId: string) => `/trips/${tripId}/add-item`,
  TRIP_INVITE: (tripId: string) => `/invite/${tripId}`,
  PROFILE: (username: string) => `/profile/${username}`,
  SETTINGS: '/settings',
  DESTINATIONS: '/destinations',
  DESTINATION_DETAILS: (id: string) => `/destinations/${id}`,
  LIBRARY: '/library',
  LIBRARY_TEMPLATE: (id: string) => `/library/${id}`,
  LOGIN: '/login',
  SIGNUP: '/signup',
  PUBLIC_TRIP: (slug: string) => `/trips/public/${slug}`,
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    TRIPS: '/admin/trips',
    ITINERARY_TEMPLATES: '/admin/itineraries', // Updated from TEMPLATES
    DESTINATIONS: '/admin/destinations',
  },
  GROUPS: '/groups',
  GROUP: (id: string) => `/groups/${id}`,
  GROUP_PLAN_IDEAS: (id: string) => `/groups/${id}/ideas`,
  GROUP_PLANS: (id: string) => `/groups/${id}/plans`,
  GROUP_PLAN: (groupId: string, planId: string) => `/groups/${groupId}/plans/${planId}`,

  // Notification Routes
  NOTIFICATIONS: {
    HOME: '/notifications',
    HISTORY: '/notifications/history',
    SETTINGS: '/settings/notifications',
  },
} as const;

// Route helpers for constructing paths with params
export const ROUTE_HELPERS = {
  addQueryParams: (base: string, params: Record<string, string>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    const queryString = searchParams.toString();
    return queryString ? `${base}?${queryString}` : base;
  },

  // Helper to validate route params
  validateRouteParams: (params: Record<string, string>) => {
    return Object.entries(params).every(
      ([_, value]) => typeof value === 'string' && value.length > 0
    );
  },
} as const;
