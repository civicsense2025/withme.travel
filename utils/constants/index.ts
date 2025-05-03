import { TABLES } from '@/utils/constants/database';
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

// Re-export database constants
export { TABLES } from './database';

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
