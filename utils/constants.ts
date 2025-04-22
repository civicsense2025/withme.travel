// Database table names
export const DB_TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  PROFILES: 'profiles',
  DESTINATIONS: 'destinations',
  ITINERARY_ITEMS: 'itinerary_items',
  COLLABORATIVE_NOTES: 'collaborative_notes',
  BUDGET_ITEMS: 'budget_items',
  LIBRARY_TEMPLATES: 'library_templates',
  PERMISSION_REQUESTS: 'permission_requests',
  REFERRALS: 'referrals',
} as const;

// Database field names by table
export const DB_FIELDS = {
  // Trips table fields
  TRIPS: {
    ID: 'id',
    NAME: 'name',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    USER_ID: 'user_id', // Creator of the trip
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
    LIKE_COUNT: 'like_count',
    VIEW_COUNT: 'view_count',
    USE_COUNT: 'use_count',
    TRIP_TYPE: 'trip_type',
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
    EXTERNAL_EMAIL: 'external_email',
  },
  
  // Profiles table fields
  PROFILES: {
    ID: 'id',
    NAME: 'name',
    EMAIL: 'email',
    AVATAR_URL: 'avatar_url',
    UPDATED_AT: 'updated_at',
    USERNAME: 'username',
    COVER_IMAGE_URL: 'cover_image_url',
    BIO: 'bio',
    LOCATION: 'location',
    WEBSITE: 'website',
    IS_VERIFIED: 'is_verified',
  },
  
  // Destinations table fields
  DESTINATIONS: {
    ID: 'id',
    CITY: 'city',
    COUNTRY: 'country',
    CONTINENT: 'continent',
    IMAGE_URL: 'image_url',
    POPULARITY: 'popularity',
    TRAVELERS_COUNT: 'travelers_count',
    AVG_DAYS: 'avg_days',
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
  },
  
  // Itinerary items table fields
  ITINERARY_ITEMS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    TITLE: 'title',
    DESCRIPTION: 'description',
    LOCATION: 'location',
    ADDRESS: 'address',
    START_TIME: 'start_time',
    END_TIME: 'end_time',
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    DATE: 'date', 
    DATE_FLEXIBILITY: 'date_flexibility',
    CREATED_BY: 'created_by',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    CATEGORY: 'category',
    POSITION: 'position',
    STATUS: 'status',
    LATITUDE: 'latitude',
    LONGITUDE: 'longitude',
    TYPE: 'type',
    COVER_IMAGE_URL: 'cover_image_url',
  },

  // Collaborative notes table fields
  COLLABORATIVE_NOTES: {
    TRIP_ID: 'trip_id',
    CONTENT: 'content',
    UPDATED_AT: 'updated_at',
    UPDATED_BY: 'updated_by',
  },

  // Budget items table fields
  BUDGET_ITEMS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    TITLE: 'title',
    AMOUNT: 'amount',
    CURRENCY: 'currency',
    CATEGORY: 'category',
    PAID_BY: 'paid_by',
    SPLIT_TYPE: 'split_type',
    CREATED_BY: 'created_by',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    DATE: 'date',
  },

  // Library templates table fields
  LIBRARY_TEMPLATES: {
    ID: 'id',
    USER_ID: 'user_id',
    TITLE: 'title',
    DESCRIPTION: 'description',
    DESTINATION_TYPE: 'destination_type',
    DESTINATION_NAME: 'destination_name',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    COVER_IMAGE_URL: 'cover_image_url',
    CATEGORY: 'category',
    IS_PUBLISHED: 'is_published',
    VIEW_COUNT: 'view_count',
    LIKE_COUNT: 'like_count',
    GROUPTYPE: 'grouptype',
  },

  // Permission requests table fields
  PERMISSION_REQUESTS: {
    ID: 'id',
    TRIP_ID: 'trip_id',
    USER_ID: 'user_id',
    ROLE: 'role',
    CREATED_AT: 'created_at',
    STATUS: 'status',
  },
} as const;

// Trip member roles
export const TRIP_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

// Permission request statuses
export const PERMISSION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Common database relationships
export const DB_RELATIONSHIPS = {
  // Relationships for the trips table
  TRIPS: {
    MEMBERS: `${DB_TABLES.TRIP_MEMBERS}`,
    ITINERARY: `${DB_TABLES.ITINERARY_ITEMS}`,
    DESTINATION: `${DB_TABLES.DESTINATIONS}`,
    BUDGET: `${DB_TABLES.BUDGET_ITEMS}`,
    NOTES: `${DB_TABLES.COLLABORATIVE_NOTES}`,
    CREATOR: `${DB_TABLES.PROFILES}:${DB_FIELDS.TRIPS.USER_ID}`,
  },
  
  // Relationships for the trip_members table
  TRIP_MEMBERS: {
    TRIP: `${DB_TABLES.TRIPS}:${DB_FIELDS.TRIP_MEMBERS.TRIP_ID}`,
    USER: `${DB_TABLES.PROFILES}:${DB_FIELDS.TRIP_MEMBERS.USER_ID}`,
    INVITER: `${DB_TABLES.PROFILES}:${DB_FIELDS.TRIP_MEMBERS.INVITED_BY}`,
  },
  
  // Relationships for the itinerary_items table
  ITINERARY_ITEMS: {
    TRIP: `${DB_TABLES.TRIPS}:${DB_FIELDS.ITINERARY_ITEMS.TRIP_ID}`,
    CREATOR: `${DB_TABLES.PROFILES}:${DB_FIELDS.ITINERARY_ITEMS.CREATED_BY}`,
  },

  // Relationships for library templates
  LIBRARY_TEMPLATES: {
    CREATOR: `${DB_TABLES.PROFILES}:${DB_FIELDS.LIBRARY_TEMPLATES.USER_ID}`,
  },

  // Relationships for permission requests
  PERMISSION_REQUESTS: {
    TRIP: `${DB_TABLES.TRIPS}:${DB_FIELDS.PERMISSION_REQUESTS.TRIP_ID}`,
    USER: `${DB_TABLES.PROFILES}:${DB_FIELDS.PERMISSION_REQUESTS.USER_ID}`,
  },
} as const;

// Database query examples using the constants
export const DB_QUERIES = {
  // Get trips created by a user
  GET_USER_TRIPS: (userId: string) => ({
    table: DB_TABLES.TRIPS,
    select: '*',
    filters: [{ field: DB_FIELDS.TRIPS.USER_ID, value: userId }],
    order: { field: DB_FIELDS.TRIPS.CREATED_AT, ascending: false },
  }),
  
  // Get trips a user is a member of
  GET_MEMBER_TRIPS: (userId: string) => ({
    table: DB_TABLES.TRIP_MEMBERS,
    select: `*, ${DB_TABLES.TRIPS}:${DB_FIELDS.TRIP_MEMBERS.TRIP_ID}(*)`,
    filters: [
      { field: DB_FIELDS.TRIP_MEMBERS.USER_ID, value: userId },
    ],
  }),
  
  // Get all members of a trip
  GET_TRIP_MEMBERS: (tripId: string) => ({
    table: DB_TABLES.TRIP_MEMBERS,
    select: `*, ${DB_TABLES.PROFILES}(${DB_FIELDS.PROFILES.ID}, ${DB_FIELDS.PROFILES.NAME}, ${DB_FIELDS.PROFILES.AVATAR_URL})`,
    filters: [{ field: DB_FIELDS.TRIP_MEMBERS.TRIP_ID, value: tripId }],
  }),
  
  // Get trending destinations
  GET_TRENDING_DESTINATIONS: (limit: number = 6) => ({
    table: DB_TABLES.DESTINATIONS,
    select: '*',
    order: { field: DB_FIELDS.DESTINATIONS.POPULARITY, ascending: false },
    limit,
  }),

  // Get itinerary items for a trip
  GET_ITINERARY_ITEMS: (tripId: string) => ({
    table: DB_TABLES.ITINERARY_ITEMS,
    select: '*',
    filters: [{ field: DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, value: tripId }],
    order: { field: DB_FIELDS.ITINERARY_ITEMS.START_TIME, ascending: true },
  }),

  // Get template libraries
  GET_PUBLIC_TEMPLATES: (limit: number = 10) => ({
    table: DB_TABLES.LIBRARY_TEMPLATES,
    select: '*, profiles(name, avatar_url)',
    filters: [{ field: DB_FIELDS.LIBRARY_TEMPLATES.IS_PUBLISHED, value: true }],
    order: { field: DB_FIELDS.LIBRARY_TEMPLATES.CREATED_AT, ascending: false },
    limit,
  }),
};

// API endpoints
export const API_ENDPOINTS = {
  TRIPS: '/api/trips',
  TRIP_BY_ID: (id: string) => `/api/trips/${id}`,
  TRIP_MEMBERS: (tripId: string) => `/api/trips/${tripId}/members`,
  ITINERARY: (tripId: string) => `/api/trips/${tripId}/itinerary`,
  ITINERARY_ITEM: (tripId: string, itemId: string) => `/api/trips/${tripId}/itinerary/${itemId}`,
  DESTINATIONS: '/api/destinations',
  TRENDING_DESTINATIONS: '/api/destinations?trending=true',
  DESTINATION_BY_ID: (id: string) => `/api/destinations/${id}`,
  TEMPLATES: '/api/templates',
  TEMPLATE_BY_ID: (id: string) => `/api/templates/${id}`,
  PERMISSIONS: '/api/permissions',
  PERMISSION_BY_ID: (id: string) => `/api/permissions/${id}`,
};

// Theme related constants
export const THEME = {
  COLORS: {
    BLUE: 'travel-blue',
    PINK: 'travel-pink',
    YELLOW: 'travel-yellow',
    PURPLE: 'travel-purple',
    MINT: 'travel-mint',
    PEACH: 'travel-peach',
  },
};

// Itinerary item categories
export const ITINERARY_CATEGORIES = {
  FLIGHT: 'flight',
  ACCOMMODATION: 'accommodation',
  ATTRACTION: 'attraction',
  RESTAURANT: 'restaurant',
  TRANSPORTATION: 'transportation',
  ACTIVITY: 'activity',
  OTHER: 'other',
} as const;

// Type declarations for our enums
export type TripRole = typeof TRIP_ROLES[keyof typeof TRIP_ROLES];
export type DbTable = typeof DB_TABLES[keyof typeof DB_TABLES];
export type PermissionStatus = typeof PERMISSION_STATUSES[keyof typeof PERMISSION_STATUSES];
export type ItineraryCategory = typeof ITINERARY_CATEGORIES[keyof typeof ITINERARY_CATEGORIES];

// Split Types for Budget Items
export const SPLIT_TYPES = {
  EQUAL: "equal",
  CUSTOM: "custom",
  INDIVIDUAL: "individual",
} as const;

export type SplitType = typeof SPLIT_TYPES[keyof typeof SPLIT_TYPES];

// Trip Types
export const TRIP_TYPES = {
  LEISURE: "leisure",
  BUSINESS: "business",
  FAMILY: "family",
  SOLO: "solo",
  GROUP: "group",
  OTHER: "other",
} as const;

export type TripType = typeof TRIP_TYPES[keyof typeof TRIP_TYPES];

// Budget Item Categories
export const BUDGET_CATEGORIES = {
  ACCOMMODATION: "accommodation",
  TRANSPORTATION: "transportation",
  FOOD: "food",
  ACTIVITIES: "activities",
  SHOPPING: "shopping",
  OTHER: "other",
} as const;

export type BudgetCategory = typeof BUDGET_CATEGORIES[keyof typeof BUDGET_CATEGORIES];

// Template Categories
export const TEMPLATE_CATEGORIES = {
  WEEKEND_GETAWAY: "weekend_getaway",
  FAMILY_VACATION: "family_vacation",
  BUSINESS_TRIP: "business_trip",
  ADVENTURE: "adventure",
  ROMANTIC: "romantic",
  CULTURAL: "cultural",
  EDUCATIONAL: "educational",
  OTHER: "other",
} as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[keyof typeof TEMPLATE_CATEGORIES];

// API Routes
export const API_ROUTES = {
  TRIPS: "/api/trips",
  TRIP_DETAILS: (id: string) => `/api/trips/${id}`,
  TRIP_MEMBERS: (id: string) => `/api/trips/${id}/members`,
  TRIP_ITINERARY: (id: string) => `/api/trips/${id}/itinerary`,
  ITINERARY_ITEM: (tripId: string, itemId: string) => `/api/trips/${tripId}/itinerary/${itemId}`,
  TRIP_BUDGET: (id: string) => `/api/trips/${id}/budget`,
  BUDGET_ITEM: (tripId: string, itemId: string) => `/api/trips/${tripId}/budget/${itemId}`,
  COLLABORATIVE_NOTES: (id: string) => `/api/trips/${id}/notes`,
  DESTINATIONS: "/api/destinations",
  DESTINATION_DETAILS: (id: string) => `/api/destinations/${id}`,
  DESTINATION_SEARCH: (query: string) => `/api/destinations/search?query=${encodeURIComponent(query)}`,
  PERMISSION_REQUESTS: (id: string) => `/api/trips/${id}/permissions`,
  LIBRARY: "/api/library",
  LIBRARY_TEMPLATE: (id: string) => `/api/library/${id}`,
  USER_PROFILE: (id: string) => `/api/profiles/${id}`,
  REFERRALS: "/api/referrals"
};

// Page Routes
export const PAGE_ROUTES = {
  HOME: "/",
  TRIPS: "/trips",
  TRIP_DETAILS: (id: string) => `/trips/${id}`,
  CREATE_TRIP: "/trips/create",
  EDIT_TRIP: (id: string) => `/trips/${id}/edit`,
  TRIP_INVITE: (id: string) => `/invite/${id}`,
  PROFILE: (username: string) => `/profile/${username}`,
  SETTINGS: "/settings",
  DESTINATIONS: "/destinations",
  DESTINATION_DETAILS: (id: string) => `/destinations/${id}`,
  LIBRARY: "/library",
  LIBRARY_TEMPLATE: (id: string) => `/library/${id}`
};

// Form Field Limits
export const LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 500,
  MEMBERS_MAX: 20
};

// Time Formats
export const TIME_FORMATS = {
  DEFAULT: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  DISPLAY_DATE: "MMM d, yyyy",
  DISPLAY_TIME: "h:mm a",
  INPUT_DATE: "yyyy-MM-dd",
  FULL_DATE: "EEEE, MMMM d, yyyy",
  SHORT_DATE: "MMM d"
}; 