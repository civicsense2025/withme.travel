/**
 * Constants Entry Point
 *
 * This file serves as the central export hub for all application constants.
 * For better code organization and tree-shaking, prefer importing directly from specific modules.
 *
 * Example:
 *   import { TABLES } from '@/utils/constants/tables';
 *   import { API_ROUTES } from '@/utils/constants/routes';
 *   import { TRIP_ROLES } from '@/utils/constants/status';
 *   import { THEME } from '@/utils/constants/ui';
 *
 * This file is maintained for backward compatibility and convenience.
 */

// ============================================================================
// DATABASE CONSTANTS
// ============================================================================

/**
 * Database schema constants
 */
export * from './database';

/**
 * Database tables, fields, and enum constants
 */
export {
  TABLES,
  FIELDS,
  ENUMS,

  // Domain-specific table groups
  ITINERARY_TABLES,
  TEMPLATE_TABLES,
  DESTINATION_TABLES,
  CONTENT_TABLES,
  SOCIAL_TABLES,
  FINANCE_TABLES,
  NOTIFICATION_TABLES,
  PREFERENCE_TABLES,
  RESEARCH_TABLES,
  FORM_TABLES,
  USER_TESTING_TABLES,
  SPATIAL_TABLES,
} from './tables';

/**
 * Table field constants for referencing specific fields
 */
export { TABLE_FIELDS } from './table-fields';

export type { CommentableContentType, ItineraryTemplateMetadata } from './tables';

// ============================================================================
// ROUTING CONSTANTS
// ============================================================================

/**
 * Application routes for API endpoints and pages
 */
export { API_ROUTES, PAGE_ROUTES } from './routes';

// ============================================================================
// STATUS & ENUM CONSTANTS
// ============================================================================

/**
 * Status enums and constants used throughout the application
 */
export {
  TRIP_ROLES,
  PERMISSION_STATUSES,
  ITINERARY_CATEGORIES,
  ITEM_STATUSES,
  TRIP_STATUSES,
  SPLIT_TYPES,
  TRIP_TYPES,
  BUDGET_CATEGORIES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_TYPES,
  PRIVACY_SETTINGS,
  TRIP_PRIVACY_SETTINGS,
  PLACE_CATEGORIES,
  TRAVEL_PACES,
  TRAVEL_PERSONALITY_TYPES,
  TRAVEL_SQUAD_TYPES,
  TRAVEL_STYLES,
  INVITATION_STATUSES,
  TAG_STATUSES,
  USER_STATUSES,
  VOTE_TYPES,
  INTERACTION_TYPES,
  URL_FORMATS,
  PRESENCE_STATUSES,
} from './status';

export type {
  PermissionStatus,
  ItineraryCategory,
  ItemStatus,
  TripStatus,
  SplitType,
  TripType,
  BudgetCategory,
  TemplateCategory,
  TemplateType,
  InvitationStatus,
  VoteType,
} from './status';

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * UI-related constants including theme, limits, and formats
 */
export { THEME, LIMITS, TIME_FORMATS } from './ui';

/**
 * Color constants for the application
 */
export * from './colors';

// ============================================================================
// VALIDATION & API CONSTANTS
// ============================================================================

/**
 * Validation rules and schemas
 */
export * from './validation';

/**
 * API-related constants
 */
export * from './api';

// ============================================================================
// PLACES & LOCATION CONSTANTS
// ============================================================================

/**
 * Places and location-related constants
 */
export * from './places';

// ============================================================================
// UI SECTION DEFINITIONS
// ============================================================================

/**
 * Common UI section definitions for trips
 */
export const TRIP_SECTIONS = [
  { id: 'itinerary', name: 'Itinerary' },
  { id: 'notes', name: 'Notes' },
  { id: 'expenses', name: 'Expenses' },
  { id: 'manage', name: 'Manage' },
];

/**
 * @deprecated - Legacy constants that should be imported from their specific modules
 * These are included for backward compatibility only and will be removed in future versions
 */
export { GROUP_TABLES } from './groups';
export { TRIP_TABLES } from './trips';
export { USER_TABLES } from './users';

// Don't re-export tables to avoid ambiguity with the more specific exports above
