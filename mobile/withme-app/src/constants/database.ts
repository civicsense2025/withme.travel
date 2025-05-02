// Database constants for use throughout the app
// This ensures consistent usage and helps prevent typos

// Table names
export const TABLES = {
  PROFILES: 'profiles',
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  ITINERARY_ITEMS: 'itinerary_items',
  DESTINATIONS: 'destinations',
  USER_PRESENCE: 'user_presence',
  ITINERARY_TEMPLATES: 'itinerary_templates',
};

// Common column names
export const COLUMNS = {
  ID: 'id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  CREATED_BY: 'created_by',

  // Profile columns
  NAME: 'name',
  EMAIL: 'email',
  AVATAR_URL: 'avatar_url',
  BIO: 'bio',
  IS_ADMIN: 'is_admin',
  LOCATION: 'location',
  WEBSITE: 'website',

  // Trip columns
  DESCRIPTION: 'description',
  TRIP_EMOJI: 'trip_emoji',
  START_DATE: 'start_date',
  END_DATE: 'end_date',
  DURATION_DAYS: 'duration_days',
  DESTINATION_ID: 'destination_id',
  STATUS: 'status',
  IS_PUBLIC: 'is_public',
  SLUG: 'slug',
  PUBLIC_SLUG: 'public_slug',
  PRIVACY_SETTING: 'privacy_setting',
  LIKES_COUNT: 'likes_count',
  VIEW_COUNT: 'view_count',

  // Trip Member columns
  TRIP_ID: 'trip_id',
  USER_ID: 'user_id',
  ROLE: 'role',
  INVITED_BY: 'invited_by',
  JOINED_AT: 'joined_at',

  // Itinerary Item columns
  TITLE: 'title',
  DATE: 'date',
  START_TIME: 'start_time',
  END_TIME: 'end_time',
  DAY_NUMBER: 'day_number',
  PLACE_ID: 'place_id',
  CATEGORY: 'category',
  LOCATION_NAME: 'location_name',
  LOCATION_ADDRESS: 'location_address',
  LOCATION_LATITUDE: 'location_latitude',
  LOCATION_LONGITUDE: 'location_longitude',
  ORDER_IN_DAY: 'order_in_day',

  // Destination columns
  CITY: 'city',
  COUNTRY: 'country',
  CONTINENT: 'continent',
  IMAGE_URL: 'image_url',
  LATITUDE: 'latitude',
  LONGITUDE: 'longitude',

  // User Presence columns
  LAST_ACTIVE: 'last_active',

  // ITINERARY_TEMPLATES columns - Aligning keys with web constants
  TEMPLATE_ID: 'id',
  TEMPLATE_TITLE: 'title',
  TEMPLATE_SLUG: 'slug',
  TEMPLATE_DESCRIPTION: 'description',
  TEMPLATE_DESTINATION_ID: 'destination_id',
  TEMPLATE_DURATION_DAYS: 'duration_days',
  TEMPLATE_CATEGORY: 'category',
  TEMPLATE_CREATED_BY: 'created_by',
  TEMPLATE_IS_PUBLISHED: 'is_published',
  TEMPLATE_VIEW_COUNT: 'view_count',
  TEMPLATE_USE_COUNT: 'use_count',
  TEMPLATE_LIKE_COUNT: 'like_count',
  TEMPLATE_FEATURED: 'featured',
  TEMPLATE_COVER_IMAGE_URL: 'cover_image_url',
  TEMPLATE_GROUPSIZE: 'groupsize',
  TEMPLATE_TAGS: 'tags',
  TEMPLATE_TYPE: 'template_type',
  TEMPLATE_SOURCE_TRIP_ID: 'source_trip_id',
  TEMPLATE_VERSION: 'version',
  TEMPLATE_COPIED_COUNT: 'copied_count',
  TEMPLATE_LAST_COPIED_AT: 'last_copied_at',
  TEMPLATE_METADATA: 'metadata',
};

// Enum values
export const ENUM_VALUES = {
  // Trip status values
  TRIP_STATUS: {
    PLANNING: 'planning',
    UPCOMING: 'upcoming',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  // Trip member roles
  TRIP_MEMBER_ROLE: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
    CONTRIBUTOR: 'contributor',
  },

  // Trip privacy settings
  PRIVACY_SETTING: {
    PRIVATE: 'private',
    SHARED_WITH_LINK: 'shared_with_link',
    PUBLIC: 'public',
  },

  // Itinerary item status
  ITINERARY_ITEM_STATUS: {
    SUGGESTED: 'suggested',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected',
  },

  // User presence status
  USER_PRESENCE_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away',
  },
};

// SQL operators (useful for query building)
export const SQL_OPERATORS = {
  EQUALS: 'eq',
  NOT_EQUALS: 'neq',
  GREATER_THAN: 'gt',
  GREATER_THAN_OR_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_OR_EQUAL: 'lte',
  IS: 'is',
  IN: 'in',
  CONTAINS: 'cs',
  CONTAINED_BY: 'cd',
  RANGE_GREATER_THAN: 'sl',
  RANGE_LESS_THAN: 'sr',
  RANGE_ADJACENT: 'nxl',
  RANGE_OVERLAPS: 'nxr',
  ILIKE: 'ilike',
  LIKE: 'like',
  OR: 'or',
};
