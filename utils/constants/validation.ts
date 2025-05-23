import { z } from 'zod';
import type { Database } from './database';
/**
 * Validation-related constants
 *
 * This file contains all validation-related constants including form limits,
 * status enums, and validation rules.
 */

// Form field limits
export const LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 500,
  MEMBERS_MAX: 20,
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  PASSWORD_MIN: 8,
  NAME_MAX: 50,
  EMAIL_MAX: 255,
  TAGS_MAX: 10,
  TAG_LENGTH_MAX: 30,
} as const;

// Status enums (from DB)
export const ITEM_STATUSES = {
  SUGGESTED: 'suggested',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
} as const;
export type ItemStatus = Database['public']['Enums']['item_status'];

export const TRIP_STATUSES = {
  PLANNING: 'planning',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type TripStatus = Database['public']['Enums']['trip_status'];

export const VOTE_TYPES = {
  UP: 'up',
  DOWN: 'down',
} as const;
export type VoteType = Database['public']['Enums']['vote_type'];

// Split Types for Budget Items (app only)
export const SPLIT_TYPES = {
  EQUAL: 'equal',
  CUSTOM: 'custom',
  INDIVIDUAL: 'individual',
} as const;
export type SplitType = (typeof SPLIT_TYPES)[keyof typeof SPLIT_TYPES];

// Trip Types
export const TRIP_TYPES = {
  LEISURE: 'leisure',
  BUSINESS: 'business',
  FAMILY: 'family',
  SOLO: 'solo',
  GROUP: 'group',
  OTHER: 'other',
} as const;
export type TripType = Database['public']['Enums']['trip_type'];

// Invitation statuses
export const INVITATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
} as const;
export type InvitationStatus = Database['public']['Enums']['invitation_status'];

// Template Categories
export const TEMPLATE_CATEGORIES = {
  WEEKEND_GETAWAY: 'weekend_getaway',
  FAMILY_VACATION: 'family_vacation',
  BUSINESS_TRIP: 'business_trip',
  ADVENTURE: 'adventure',
  ROMANTIC: 'romantic',
  CULTURAL: 'cultural',
  EDUCATIONAL: 'educational',
  OTHER: 'other',
} as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[keyof typeof TEMPLATE_CATEGORIES];

// Budget Categories
export const BUDGET_CATEGORIES = {
  ACCOMMODATION: 'accommodation',
  TRANSPORTATION: 'transportation',
  FOOD: 'food',
  ACTIVITIES: 'activities',
  SHOPPING: 'shopping',
  OTHER: 'other',
} as const;
export type BudgetCategory = Database['public']['Enums']['budget_category'];

// Regular expressions for validation
export const VALIDATION_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  SLUG: /^[a-z0-9-]+$/,
  EMAIL: /^[^@]+@[^@]+\.[^@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  URL: /^https?:\/\/.+/,
} as const;

// Extract values from ItemStatus for Zod enum
export const ITEM_STATUS_VALUES = Object.values(ITEM_STATUSES) as [string, ...string[]];

// Zod schemas for reuse across the application
export const ZOD_SCHEMAS = {
  // Item status schema
  ITEM_STATUS: z.enum(ITEM_STATUS_VALUES),

  // Nullable item status schema
  NULLABLE_ITEM_STATUS: z.enum(ITEM_STATUS_VALUES).nullable(),
} as const;
