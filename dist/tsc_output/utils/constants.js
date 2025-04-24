// Database table names
export const DB_TABLES = {
    TRIPS: 'trips',
    TRIP_MEMBERS: 'trip_members',
    PROFILES: 'profiles',
    USERS: 'users',
    DESTINATIONS: 'destinations',
    ITINERARY_ITEMS: 'itinerary_items',
    PLACES: 'places',
    COLLABORATIVE_NOTES: 'trip_notes',
    BUDGET_ITEMS: 'budget_items',
    LIBRARY_TEMPLATES: 'library_templates',
    PERMISSION_REQUESTS: 'permission_requests',
    REFERRALS: 'referrals',
    ITINERARY_TEMPLATES: 'itinerary_templates',
    TEMPLATE_SECTIONS: 'template_sections',
    TEMPLATE_ACTIVITIES: 'template_activities',
    TRIP_TEMPLATE_USES: 'trip_template_uses',
    LIKES: 'likes',
    SPLITWISE_CONNECTIONS: 'splitwise_connections',
    USER_PRESENCE: 'user_presence',
    VOTES: 'votes',
    ALBUMS: 'albums',
    TRIP_IMAGES: 'trip_images',
    IMAGE_METADATA: 'image_metadata',
    INVITATIONS: 'invitations',
    TAGS: 'tags',
    TRIP_TAGS: 'trip_tags',
    NOTE_TAGS: 'note_tags',
};
// Database field names by table
export const DB_FIELDS = {
    // Trips table fields
    TRIPS: {
        ID: 'id',
        NAME: 'name',
        START_DATE: 'start_date',
        END_DATE: 'end_date',
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
        CREATED_BY: 'created_by',
        SPLITWISE_GROUP_ID: 'splitwise_group_id',
        DESCRIPTION: 'description',
        DURATION_DAYS: 'duration_days',
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
        DAY_NUMBER: 'day_number',
        ESTIMATED_COST: 'estimated_cost',
        CURRENCY: 'currency',
        DURATION_MINUTES: 'duration_minutes',
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
    // Itinerary templates table fields
    ITINERARY_TEMPLATES: {
        ID: 'id',
        TITLE: 'title',
        DESCRIPTION: 'description',
        IMAGE_URL: 'image_url',
        DESTINATION_ID: 'destination_id',
        DURATION_DAYS: 'duration_days',
        CATEGORY: 'category',
        TAGS: 'tags',
        IS_PUBLISHED: 'is_published',
        CREATED_BY: 'created_by',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
        TEMPLATE_TYPE: 'template_type',
        SOURCE_TRIP_ID: 'source_trip_id',
        VERSION: 'version',
        COPIED_COUNT: 'copied_count',
        LAST_COPIED_AT: 'last_copied_at',
        METADATA: 'metadata',
        SLUG: 'slug',
    },
    // Template sections table fields
    TEMPLATE_SECTIONS: {
        ID: 'id',
        TEMPLATE_ID: 'template_id',
        DAY_NUMBER: 'day_number',
        TITLE: 'title',
        DESCRIPTION: 'description',
        POSITION: 'position',
        METADATA: 'metadata',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
    },
    // Template activities table fields
    TEMPLATE_ACTIVITIES: {
        ID: 'id',
        SECTION_ID: 'section_id',
        TITLE: 'title',
        DESCRIPTION: 'description',
        LOCATION: 'location',
        DURATION_MINUTES: 'duration_minutes',
        START_TIME: 'start_time',
        POSITION: 'position',
        CATEGORY: 'category',
        METADATA: 'metadata',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
    },
    // Trip template uses table fields
    TRIP_TEMPLATE_USES: {
        ID: 'id',
        TRIP_ID: 'trip_id',
        TEMPLATE_ID: 'template_id',
        APPLIED_AT: 'applied_at',
        APPLIED_BY: 'applied_by',
        VERSION_USED: 'version_used',
        MODIFICATIONS: 'modifications',
    },
    // Likes table fields
    LIKES: {
        ID: 'id',
        USER_ID: 'user_id',
        ITEM_ID: 'item_id',
        ITEM_TYPE: 'item_type',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
    },
    // Splitwise connections table fields
    SPLITWISE_CONNECTIONS: {
        ID: 'id',
        USER_ID: 'user_id',
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
        EXPIRES_AT: 'expires_at',
        SPLITWISE_USER_ID: 'splitwise_user_id',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
    },
    // User presence table fields
    USER_PRESENCE: {
        ID: 'id',
        USER_ID: 'user_id',
        TRIP_ID: 'trip_id',
        DOCUMENT_ID: 'document_id',
        STATUS: 'status',
        LAST_ACTIVE: 'last_active',
    },
    // Votes table fields
    VOTES: {
        ID: 'id',
        USER_ID: 'user_id',
        ITINERARY_ITEM_ID: 'itinerary_item_id',
        VOTE_TYPE: 'vote_type',
        CREATED_AT: 'created_at',
    },
    // Albums table fields
    ALBUMS: {
        ID: 'id',
        USER_ID: 'user_id',
        TITLE: 'title',
        DESCRIPTION: 'description',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
    },
    // Trip images table fields
    TRIP_IMAGES: {
        ID: 'id',
        TRIP_ID: 'trip_id',
        ALBUM_ID: 'album_id',
        FILE_NAME: 'file_name',
        FILE_PATH: 'file_path',
        CONTENT_TYPE: 'content_type',
        SIZE_BYTES: 'size_bytes',
        WIDTH: 'width',
        HEIGHT: 'height',
        DESCRIPTION: 'description',
        CREATED_BY: 'created_by',
        CREATED_AT: 'created_at',
    },
    // Image metadata table fields
    IMAGE_METADATA: {
        ID: 'id',
        ENTITY_ID: 'entity_id',
        ENTITY_TYPE: 'entity_type',
        URL: 'url',
        SOURCE: 'source',
        SOURCE_ID: 'source_id',
        ALT_TEXT: 'alt_text',
        WIDTH: 'width',
        HEIGHT: 'height',
        FOCAL_POINT_X: 'focal_point_x',
        FOCAL_POINT_Y: 'focal_point_y',
        ATTRIBUTION: 'attribution',
        LICENSE: 'license',
        PHOTOGRAPHER_NAME: 'photographer_name',
        PHOTOGRAPHER_URL: 'photographer_url',
        CREATED_AT: 'created_at',
        UPDATED_AT: 'updated_at',
    },
    // Invitations table fields
    INVITATIONS: {
        ID: 'id',
        EMAIL: 'email',
        TOKEN: 'token',
        TRIP_ID: 'trip_id',
        INVITED_BY: 'invited_by',
        INVITATION_STATUS: 'invitation_status',
        CREATED_AT: 'created_at',
        EXPIRES_AT: 'expires_at',
    },
    TAGS: {
        ID: 'id',
        NAME: 'name',
        CREATED_AT: 'created_at'
    },
    TRIP_TAGS: {
        TRIP_ID: 'trip_id',
        TAG_ID: 'tag_id',
        ASSIGNED_AT: 'assigned_at'
    },
    // Added Note Tags fields
    NOTE_TAGS: {
        NOTE_ID: 'note_id',
        TAG_ID: 'tag_id',
        ASSIGNED_AT: 'assigned_at'
    }
};
// Trip member roles
export const TRIP_ROLES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    CONTRIBUTOR: 'contributor',
    VIEWER: 'viewer',
};
// Permission request statuses
export const PERMISSION_STATUSES = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
// Common database relationships
export const DB_RELATIONSHIPS = {
    // Relationships for the trips table
    TRIPS: {
        MEMBERS: `${DB_TABLES.TRIP_MEMBERS}`,
        ITINERARY: `${DB_TABLES.ITINERARY_ITEMS}`,
        DESTINATION: `${DB_TABLES.DESTINATIONS}`,
        BUDGET: `${DB_TABLES.BUDGET_ITEMS}`,
        NOTES: `${DB_TABLES.COLLABORATIVE_NOTES}`,
        CREATOR: `${DB_TABLES.PROFILES}:${DB_FIELDS.TRIPS.CREATED_BY}`,
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
    // Template relationships
    ITINERARY_TEMPLATES: {
        CREATOR: `${DB_TABLES.PROFILES}:${DB_FIELDS.ITINERARY_TEMPLATES.CREATED_BY}`,
        DESTINATION: `${DB_TABLES.DESTINATIONS}:${DB_FIELDS.ITINERARY_TEMPLATES.DESTINATION_ID}`,
        SOURCE_TRIP: `${DB_TABLES.TRIPS}:${DB_FIELDS.ITINERARY_TEMPLATES.SOURCE_TRIP_ID}`,
        SECTIONS: `${DB_TABLES.TEMPLATE_SECTIONS}`,
    },
    TEMPLATE_SECTIONS: {
        TEMPLATE: `${DB_TABLES.ITINERARY_TEMPLATES}:${DB_FIELDS.TEMPLATE_SECTIONS.TEMPLATE_ID}`,
        ACTIVITIES: `${DB_TABLES.TEMPLATE_ACTIVITIES}`,
    },
    TEMPLATE_ACTIVITIES: {
        SECTION: `${DB_TABLES.TEMPLATE_SECTIONS}:${DB_FIELDS.TEMPLATE_ACTIVITIES.SECTION_ID}`,
    },
    TRIP_TEMPLATE_USES: {
        TRIP: `${DB_TABLES.TRIPS}:${DB_FIELDS.TRIP_TEMPLATE_USES.TRIP_ID}`,
        TEMPLATE: `${DB_TABLES.ITINERARY_TEMPLATES}:${DB_FIELDS.TRIP_TEMPLATE_USES.TEMPLATE_ID}`,
        APPLIED_BY_USER: `${DB_TABLES.PROFILES}:${DB_FIELDS.TRIP_TEMPLATE_USES.APPLIED_BY}`,
    },
    // Likes relationships
    LIKES: {
        USER: `${DB_TABLES.USERS}:${DB_FIELDS.LIKES.USER_ID}`,
    },
    // Splitwise connections relationships
    SPLITWISE_CONNECTIONS: {
        USER: `${DB_TABLES.USERS}:${DB_FIELDS.SPLITWISE_CONNECTIONS.USER_ID}`,
    },
    // User presence relationships
    USER_PRESENCE: {
        USER: `${DB_TABLES.USERS}:${DB_FIELDS.USER_PRESENCE.USER_ID}`,
        TRIP: `${DB_TABLES.TRIPS}:${DB_FIELDS.USER_PRESENCE.TRIP_ID}`,
    },
    // Votes relationships
    VOTES: {
        USER: `${DB_TABLES.PROFILES}:${DB_FIELDS.VOTES.USER_ID}`,
        ITINERARY_ITEM: `${DB_TABLES.ITINERARY_ITEMS}:${DB_FIELDS.VOTES.ITINERARY_ITEM_ID}`,
    },
    // Albums relationships
    ALBUMS: {
        USER: `${DB_TABLES.USERS}:${DB_FIELDS.ALBUMS.USER_ID}`,
    },
    // Trip images relationships
    TRIP_IMAGES: {
        TRIP: `${DB_TABLES.TRIPS}:${DB_FIELDS.TRIP_IMAGES.TRIP_ID}`,
        ALBUM: `${DB_TABLES.ALBUMS}:${DB_FIELDS.TRIP_IMAGES.ALBUM_ID}`,
        CREATOR: `${DB_TABLES.USERS}:${DB_FIELDS.TRIP_IMAGES.CREATED_BY}`,
    },
    // Image metadata relationships
    IMAGE_METADATA: {
        ENTITY: (type) => `${type}:${DB_FIELDS.IMAGE_METADATA.ENTITY_ID}`,
    },
    // Invitations relationships
    INVITATIONS: {
        TRIP: `${DB_TABLES.TRIPS}:${DB_FIELDS.INVITATIONS.TRIP_ID}`,
        INVITER: `${DB_TABLES.USERS}:${DB_FIELDS.INVITATIONS.INVITED_BY}`,
    },
};
// Database query examples using the constants
export const DB_QUERIES = {
    // Get trips created by a user
    GET_USER_TRIPS: (userId) => ({
        table: DB_TABLES.TRIPS,
        select: '*',
        filters: [{ field: DB_FIELDS.TRIPS.CREATED_BY, value: userId }],
        order: { field: DB_FIELDS.TRIPS.CREATED_AT, ascending: false },
    }),
    // Get trips a user is a member of
    GET_MEMBER_TRIPS: (userId) => ({
        table: DB_TABLES.TRIP_MEMBERS,
        select: `*, ${DB_TABLES.TRIPS}:${DB_FIELDS.TRIP_MEMBERS.TRIP_ID}(*)`,
        filters: [
            { field: DB_FIELDS.TRIP_MEMBERS.USER_ID, value: userId },
        ],
    }),
    // Get all members of a trip
    GET_TRIP_MEMBERS: (tripId) => ({
        table: DB_TABLES.TRIP_MEMBERS,
        select: `*, ${DB_TABLES.PROFILES}(${DB_FIELDS.PROFILES.ID}, ${DB_FIELDS.PROFILES.NAME}, ${DB_FIELDS.PROFILES.AVATAR_URL})`,
        filters: [{ field: DB_FIELDS.TRIP_MEMBERS.TRIP_ID, value: tripId }],
    }),
    // Get trending destinations
    GET_TRENDING_DESTINATIONS: (limit = 6) => ({
        table: DB_TABLES.DESTINATIONS,
        select: '*',
        order: { field: DB_FIELDS.DESTINATIONS.POPULARITY, ascending: false },
        limit,
    }),
    // Get itinerary items for a trip
    GET_ITINERARY_ITEMS: (tripId) => ({
        table: DB_TABLES.ITINERARY_ITEMS,
        select: '*',
        filters: [{ field: DB_FIELDS.ITINERARY_ITEMS.TRIP_ID, value: tripId }],
        order: { field: DB_FIELDS.ITINERARY_ITEMS.START_TIME, ascending: true },
    }),
    // Get template libraries
    GET_PUBLIC_TEMPLATES: (limit = 10) => ({
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
    TRIP_BY_ID: (id) => `/api/trips/${id}`,
    TRIP_MEMBERS: (tripId) => `/api/trips/${tripId}/members`,
    ITINERARY: (tripId) => `/api/trips/${tripId}/itinerary`,
    ITINERARY_ITEM: (tripId, itemId) => `/api/trips/${tripId}/itinerary/${itemId}`,
    DESTINATIONS: '/api/destinations',
    DESTINATION_SEARCH: (query) => `/api/destinations/search?query=${encodeURIComponent(query)}`,
    TRENDING_DESTINATIONS: '/api/destinations?trending=true',
    DESTINATION_BY_ID: (id) => `/api/destinations/${id}`,
    TEMPLATES: '/api/templates',
    TEMPLATE_BY_ID: (id) => `/api/templates/${id}`,
    PERMISSIONS: '/api/permissions',
    PERMISSION_BY_ID: (id) => `/api/permissions/${id}`,
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
};
// Split Types for Budget Items
export const SPLIT_TYPES = {
    EQUAL: "equal",
    CUSTOM: "custom",
    INDIVIDUAL: "individual",
};
// Trip Types
export const TRIP_TYPES = {
    LEISURE: "leisure",
    BUSINESS: "business",
    FAMILY: "family",
    SOLO: "solo",
    GROUP: "group",
    OTHER: "other",
};
// Budget Item Categories
export const BUDGET_CATEGORIES = {
    ACCOMMODATION: "accommodation",
    TRANSPORTATION: "transportation",
    FOOD: "food",
    ACTIVITIES: "activities",
    SHOPPING: "shopping",
    OTHER: "other",
};
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
};
// Add template types
export const TEMPLATE_TYPES = {
    OFFICIAL: 'official',
    USER_CREATED: 'user_created',
    TRIP_BASED: 'trip_based',
};
// API Routes
export const API_ROUTES = {
    TRIPS: "/api/trips",
    TRIP_DETAILS: (id) => `/api/trips/${id}`,
    TRIP_MEMBERS: (id) => `/api/trips/${id}/members`,
    TRIP_ITINERARY: (id) => `/api/trips/${id}/itinerary`,
    ITINERARY_ITEM: (tripId, itemId) => `/api/trips/${tripId}/itinerary/${itemId}`,
    TRIP_BUDGET: (id) => `/api/trips/${id}/budget`,
    BUDGET_ITEM: (tripId, itemId) => `/api/trips/${tripId}/budget/${itemId}`,
    COLLABORATIVE_NOTES: (id) => `/api/trips/${id}/notes`,
    DESTINATIONS: "/api/destinations",
    DESTINATION_DETAILS: (id) => `/api/destinations/${id}`,
    DESTINATION_SEARCH: (query) => `/api/destinations/search?query=${encodeURIComponent(query)}`,
    PERMISSION_REQUESTS: (id) => `/api/trips/${id}/permissions`,
    LIBRARY: "/api/library",
    LIBRARY_TEMPLATE: (id) => `/api/library/${id}`,
    USER_PROFILE: (id) => `/api/profiles/${id}`,
    REFERRALS: "/api/referrals",
    ITINERARIES: "/api/itineraries",
    ITINERARY_DETAILS: (slug) => `/api/itineraries/${slug}`,
    TEMPLATES: "/api/templates",
    TEMPLATE_DETAILS: (id) => `/api/templates/${id}`,
    TEMPLATE_SECTIONS: (id) => `/api/templates/${id}/sections`,
    TEMPLATE_ACTIVITIES: (templateId, sectionId) => `/api/templates/${templateId}/sections/${sectionId}/activities`,
    APPLY_TEMPLATE: (tripId, templateId) => `/api/trips/${tripId}/apply-template/${templateId}`,
    PLACES: "/api/places",
    PLACE_DETAILS: (id) => `/api/places/${id}`,
    PLACE_REVIEWS: (id) => `/api/places/${id}/reviews`,
    TRIP_REVIEWS: "/api/trip-reviews",
    DESTINATION_REVIEWS: (id) => `/api/destinations/${id}/reviews`,
    AUTH_CHECK: "/api/auth/check",
    TRIP_MEMBER_INVITE: (id) => `/api/trips/${id}/members/invite`,
    TAGS: '/api/tags',
    TRIP_TAGS: (id) => `/api/trips/${id}/tags`,
    // Itinerary specific routes
    ITINERARY_ITEM_VOTE: (tripId, itemId) => `/api/trips/${tripId}/itinerary/${itemId}/vote`,
    TRIP_ITINERARY_REORDER: (tripId) => `/api/trips/${tripId}/itinerary/reorder`,
    // Splitwise specific routes
    SPLITWISE_AUTH: (tripId) => `/api/splitwise/auth?tripId=${tripId}`,
    SPLITWISE_CALLBACK: "/api/splitwise/callback",
    SPLITWISE_EXPENSES: (tripId) => `/api/splitwise/expenses?tripId=${tripId}`,
    SPLITWISE_GROUPS: "/api/splitwise/groups",
    SPLITWISE_LINK: "/api/splitwise/link",
    SPLITWISE_IMPORT_CANDIDATES: (tripId) => `/api/splitwise/import-candidates?tripId=${tripId}`,
};
// Page Routes
export const PAGE_ROUTES = {
    HOME: "/",
    TRIPS: "/trips",
    TRIP_DETAILS: (id) => `/trips/${id}`,
    CREATE_TRIP: "/trips/create",
    EDIT_TRIP: (id) => `/trips/${id}/edit`,
    TRIP_INVITE: (id) => `/invite/${id}`,
    PROFILE: (username) => `/profile/${username}`,
    SETTINGS: "/settings",
    DESTINATIONS: "/destinations",
    DESTINATION_DETAILS: (id) => `/destinations/${id}`,
    LIBRARY: "/library",
    LIBRARY_TEMPLATE: (id) => `/library/${id}`
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
// Supabase foreign key relationship names
export const FOREIGN_KEYS = {
    // Users/Profiles relationships
    TRIP_MEMBERS_USER_ID: 'trip_members_user_id_fkey',
    TRIP_MEMBERS_INVITED_BY: 'trip_members_invited_by_fkey',
    TRIP_NOTES_UPDATED_BY: 'trip_notes_updated_by_fkey',
    TRIP_NOTES_USER_ID: 'trip_notes_user_id_fkey',
    TRIPS_USER_ID: 'trips_user_id_fkey',
    ITINERARY_ITEMS_CREATED_BY: 'itinerary_items_created_by_fkey',
    BUDGET_ITEMS_CREATED_BY: 'budget_items_created_by_fkey',
    BUDGET_ITEMS_PAID_BY: 'budget_items_paid_by_fkey',
};
// Supabase query snippets for commonly used joins
export const QUERY_SNIPPETS = {
    // User joins
    USER_BASIC: `id, name, email, avatar_url`,
    // Trip member joins
    TRIP_MEMBER_WITH_USER: `
    id,
    role,
    created_at,
    joined_at,
    user:users!${FOREIGN_KEYS.TRIP_MEMBERS_USER_ID}(
      id,
      name,
      email,
      avatar_url
    ),
    inviter:users!${FOREIGN_KEYS.TRIP_MEMBERS_INVITED_BY}(
      id,
      name,
      email,
      avatar_url
    )
  `,
    // Trip notes joins
    TRIP_NOTE_WITH_USER: `
    *,
    updated_by_user:users!${FOREIGN_KEYS.TRIP_NOTES_UPDATED_BY}(
      id, 
      name, 
      email, 
      avatar_url
    )
  `,
    // Trip with creator join
    TRIP_WITH_CREATOR: `
    *,
    creator:users!${FOREIGN_KEYS.TRIPS_USER_ID}(
      id,
      name,
      email,
      avatar_url
    )
  `,
    // Itinerary item with creator
    ITINERARY_ITEM_WITH_CREATOR: `
    *,
    creator:users!${FOREIGN_KEYS.ITINERARY_ITEMS_CREATED_BY}(
      id,
      name,
      email,
      avatar_url
    )
  `,
};
// Unsplash API Configuration
export const UNSPLASH_CONFIG = {
    API_URL: 'https://api.unsplash.com',
    ACCESS_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
    SECRET_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_SECRET || '',
    ENDPOINTS: {
        SEARCH: '/search/photos',
        RANDOM: '/photos/random',
    },
    DEFAULT_QUERY_PARAMS: {
        orientation: 'landscape',
        content_filter: 'high',
    },
};
// Image types
export const IMAGE_TYPES = {
    DESTINATION: 'destination',
    TRIP_COVER: 'trip_cover',
    USER_AVATAR: 'user_avatar',
    TEMPLATE_COVER: 'template_cover',
};
// Invitation statuses
export const INVITATION_STATUSES = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    EXPIRED: 'expired',
};
// Add other constants as needed 
// Add Vote Type enum
export const VOTE_TYPES = {
    UP: 'up',
    DOWN: 'down',
};
