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
 *   import { THEME } from '@/components/ui/ui';
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
 * Database tables constants
 */
export { 
  TABLES,
  TRIP_TABLES,
  GROUP_TABLES,
  USER_TABLES,
  DESTINATION_TABLES,
  CONTENT_TABLES,
  ITINERARY_TABLES,
  TEMPLATE_TABLES,
  SOCIAL_TABLES,
  FINANCE_TABLES,
  FORM_TABLES,
  SPATIAL_TABLES,
  NOTIFICATION_TABLES,
  PREFERENCE_TABLES,
  RESEARCH_TABLES,
  USER_TESTING_TABLES,
  MULTI_CITY_TABLES,
  MULTI_CITY_QUERY_SNIPPETS,
} from './tables';
export type { CommentableContentType, ItineraryTemplateMetadata } from './tables';

/**
 * Database table field names
 */
export { TABLE_FIELDS } from './table-fields';
export type { TableFieldKey } from './table-fields';

/**
 * Database enum values and types
 */
export { 
  // Main ENUMS object containing all enum values
  ENUMS,
  
  // Individual enum objects for backward compatibility
  TRIP_ROLES,
  ITEM_STATUSES,
  ITINERARY_CATEGORIES,
  GROUP_MEMBER_ROLES,
  GROUP_VISIBILITY,
  VOTE_TYPES,
  TRIP_PRIVACY_SETTINGS,
  TRIP_STATUSES,
  TRIP_TYPES,
  BUDGET_CATEGORIES,
  PERMISSION_STATUSES,
  TRAVEL_PACES,
  INVITATION_STATUSES,
  GROUP_PLAN_IDEA_TYPE,
  GROUP_MEMBER_STATUSES,
  IMAGE_TYPES,
  CONTENT_TYPES,
} from './status';

// Export types from status.ts
export type {
  BudgetCategory,
  ContentType,
  GroupIdeaType as GroupPlanIdeaType,
  GroupMemberRole,
  GroupMemberStatus,
  GroupVisibility,
  ImageType,
  ItemStatus,
  TripPrivacySetting,
  TripRole,
  TripStatus,
  TripType,
  VoteType,
} from './status';

// ============================================================================
// APPLICATION CONSTANTS
// ============================================================================

/**
 * API route constants
 */
export { API_ROUTES, PAGE_ROUTES } from './routes';

/**
 * User interface constants
 */
export * from './ui/ui';

/**
 * API response constants 
 */
export * from './api';

/**
 * Form validation constants
 */
export * from './validation';

/**
 * Color constants
 */
export * from './ui/colors';

/**
 * Places/locations constants
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
