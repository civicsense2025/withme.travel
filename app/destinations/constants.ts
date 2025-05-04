/**
 * Shared constants and types for the destinations page components
 * Centralizes all configuration to ensure consistency across
 * page.tsx, destinations-client.tsx, loading.tsx and error.tsx
 */

// ==============================
// State Management Types
// ==============================

/**
 * Application states for the destinations page lifecycle
 */
export const STATES = {
  LOADING: 'loading', // Initial load or refreshing data
  ERROR: 'error',     // Failed to load destinations
  SUCCESS: 'success', // Successfully loaded destinations
  IDLE: 'idle'        // Initial state before any loading
} as const;

export type LoadingState = typeof STATES[keyof typeof STATES];

/**
 * Structured error information with type discrimination
 * for better error handling and user messaging
 */
export interface FetchError {
  type: 'api' | 'network' | 'unknown'; // Categorized error types
  message: string;                     // User-friendly error message
  details?: unknown;                   // Technical details (for logging)
}

// ==============================
// Data Types
// ==============================

/**
 * Destination data structure matching database schema
 * Used for type safety when working with destination data
 */
export interface Destination {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  image_url: string | null;
  description: string | null;
}

/**
 * Type for event handlers used with destinations
 */
export type DestinationClickHandler = () => void;
export type DestinationKeyboardHandler = (e: React.KeyboardEvent<HTMLDivElement>) => void;

/**
 * Type guard to validate if an object is a Destination
 * 
 * Used to ensure type safety when working with data from external sources
 * like API responses or database queries. Performs runtime checks to confirm
 * the object has the required properties of a Destination.
 * 
 * @param obj - The object to check
 * @returns boolean indicating if the object conforms to Destination interface
 */
export function isDestination(obj: unknown): obj is Destination {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Destination).id === 'string' &&
    'name' in obj &&
    typeof (obj as Destination).name === 'string'
  );
}

/**
 * Helper types for validation results
 */
export type ValidationResult = {
  valid: boolean;
  errors?: string[];
}

// ==============================
// Layout & Styling Constants
// ==============================

/**
 * Consistent layout values used across all components
 */
export const LAYOUT = {
  CONTAINER_CLASS: "container max-w-screen-2xl mx-auto px-4 sm:px-6 py-12",
  GRID_CLASS: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12",
  SKELETON_COUNT: 8,
  ITEM_HEIGHT: "h-48",
  CARD_CLASSES: "rounded-3xl overflow-hidden bg-muted relative transition-all duration-200"
};

// ==============================
// SEO & Metadata Constants
// ==============================

/**
 * Consistent SEO values used for metadata
 */
export const SEO = {
  TITLE: "Discover Your Next Travel Adventure | withme.travel",
  DESCRIPTION: "Explore authentic local experiences and hidden gems in cities around the world, curated by fellow travelers.",
  KEYWORDS: "travel destinations, city guides, adventure travel, local experiences, travel planning",
};

