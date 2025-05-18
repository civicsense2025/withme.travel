/**
 * API-related constants
 *
 * This file contains all API-related constants including routes,
 * endpoints, and external API configurations.
 */

// No enums or types in this file should be duplicated from database.ts. Use Database["public"]["Enums"] for any DB enums.

/**
 * API Integration Constants
 *
 * This file contains configurations and settings for API integrations.
 * Route paths are defined in routes.ts - do not duplicate them here.
 */

/**
 * API Integration Settings
 */
export const API_SETTINGS = {
  /**
   * Default request options for fetch calls
   */
  DEFAULT_OPTIONS: {
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store' as RequestCache
  },
  
  /**
   * Timeouts for various API operations (in ms)
   */
  TIMEOUTS: {
    DEFAULT: 10000,
    LONG: 30000,
    SHORT: 5000
  },

  /**
   * Common error messages
   */
  ERROR_MESSAGES: {
    NETWORK: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER: 'Something went wrong on our end. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    UNKNOWN: 'An unknown error occurred. Please try again.'
  },

  /**
   * API response status codes
   */
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
  },

  /**
   * Common query parameters
   */
  QUERY_PARAMS: {
    PAGINATION: {
      LIMIT: 'limit',
      OFFSET: 'offset',
      PAGE: 'page',
      PER_PAGE: 'per_page'
    },
    SORTING: {
      SORT_BY: 'sort_by',
      SORT_ORDER: 'sort_order',
      SORT_DIRECTION: 'sort_direction'
    },
    FILTERING: {
      SEARCH: 'q',
      FILTER: 'filter',
      STATUS: 'status'
    }
  }
};

/**
 * External API Integration Configurations
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
 * Mapbox API configuration
 */
export const MAPBOX_CONFIG = {
  API_URL: 'https://api.mapbox.com',
  ENDPOINTS: {
    GEOCODING: '/geocoding/v5/mapbox.places',
    DIRECTIONS: '/directions/v5/mapbox',
  },
  DEFAULT_QUERY_PARAMS: {
    limit: 5,
    language: 'en',
  },
};

/**
 * API Client Configuration
 */
export const API_CLIENT_CONFIG = {
  /**
   * Default retry configuration
   */
  RETRY: {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 500, // ms
    BACKOFF_FACTOR: 1.5
  },
  
  /**
   * Batch request settings
   */
  BATCH: {
    MAX_BATCH_SIZE: 20,
    DELAY_BETWEEN_BATCHES: 200 // ms
  },

  /**
   * Cache settings
   */
  CACHE: {
    DEFAULT_TTL: 60 * 1000, // 1 minute
    DESTINATIONS_TTL: 24 * 60 * 60 * 1000, // 24 hours
    PUBLIC_CONTENT_TTL: 12 * 60 * 60 * 1000 // 12 hours
  }
};

/**
 * Request priority levels for scheduling API calls
 */
export enum RequestPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * API module statuses for integration tracking
 */
export enum ApiModuleStatus {
  COMPLETE = 'complete',
  IN_PROGRESS = 'in-progress',
  PENDING = 'pending'
}

/**
 * API module integration map - used to track completion status
 */
export const API_MODULE_INTEGRATION = {
  // Completed modules
  TAGS: {
    API_IMPL: ApiModuleStatus.COMPLETE,
    CLIENT_WRAPPER: ApiModuleStatus.COMPLETE,
    REACT_HOOK: ApiModuleStatus.COMPLETE
  },
  COMMENTS: {
    API_IMPL: ApiModuleStatus.COMPLETE,
    CLIENT_WRAPPER: ApiModuleStatus.COMPLETE,
    REACT_HOOK: ApiModuleStatus.COMPLETE
  },
  TRIPS: {
    API_IMPL: ApiModuleStatus.COMPLETE,
    CLIENT_WRAPPER: ApiModuleStatus.IN_PROGRESS,
    REACT_HOOK: ApiModuleStatus.IN_PROGRESS
  },
  
  // Modules in progress
  ACTIVITIES: {
    API_IMPL: ApiModuleStatus.COMPLETE,
    CLIENT_WRAPPER: ApiModuleStatus.PENDING,
    REACT_HOOK: ApiModuleStatus.PENDING
  },
  PLACES: {
    API_IMPL: ApiModuleStatus.COMPLETE,
    CLIENT_WRAPPER: ApiModuleStatus.PENDING,
    REACT_HOOK: ApiModuleStatus.PENDING
  },
  
  // Modules to implement next
  DESTINATIONS: {
    API_IMPL: ApiModuleStatus.COMPLETE,
    CLIENT_WRAPPER: ApiModuleStatus.PENDING,
    REACT_HOOK: ApiModuleStatus.PENDING
  },
  GROUPS: {
    API_IMPL: ApiModuleStatus.COMPLETE,
    CLIENT_WRAPPER: ApiModuleStatus.PENDING,
    REACT_HOOK: ApiModuleStatus.PENDING
  },
  ITINERARIES: {
    API_IMPL: ApiModuleStatus.COMPLETE,
    CLIENT_WRAPPER: ApiModuleStatus.PENDING,
    REACT_HOOK: ApiModuleStatus.PENDING
  }
};
