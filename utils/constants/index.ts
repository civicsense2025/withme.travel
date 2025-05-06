import { API_ROUTES } from '@/utils/constants/routes';
import { TRIP_ROLES } from '@/utils/constants/status';
import { THEME } from '@/utils/constants/ui';

/**
 * Constants entry point for the withme.travel application
 *
 * This file re-exports all constants from specific modules:
 * - Database constants (tables, fields, etc.)
 * - Routes (API endpoints, page routes)
 * - Status constants (roles, statuses, etc.)
 * - UI constants (theme colors, limits, etc.)
 *
 * For better code organization, import directly from specific modules:
 *   import { TABLES } from '@/utils/constants/database';
 *   import { API_ROUTES } from '@/utils/constants/routes';
 *   import { TRIP_ROLES } from '@/utils/constants/status';
 *   import { THEME } from '@/utils/constants/ui';
 *
 * For backward compatibility, you can also import from here.
 */

// Central re-export of all database constants
// This file is the recommended entry point for all database constants

// Export database model types from database.ts
export * from './database';

// Export constants from tables.ts
export { TABLES, FIELDS, ENUMS } from './tables';
export type { CommentableContentType } from './tables';

// Deprecated: TABLES is now replaced by Database['public']['Tables'] keys. Import types directly from database.ts

// Re-export route constants
export { API_ROUTES, PAGE_ROUTES } from './routes';

// Re-export status constants
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
  NOTIFICATION_TYPES,
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
} from './status';

// Re-export UI constants
export { THEME, LIMITS, TIME_FORMATS } from './ui';

// Common UI section definitions
export const TRIP_SECTIONS = [
  { id: 'itinerary', name: 'Itinerary' },
  { id: 'notes', name: 'Notes' },
  { id: 'expenses', name: 'Expenses' },
  { id: 'manage', name: 'Manage' },
];
