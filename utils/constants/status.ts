/**
 * Status-related constants for the withme.travel application
 *
 * This file contains status, state, and enum constants:
 * - TRIP_ROLES: User roles within a trip
 * - PERMISSION_STATUSES: Statuses for permission requests
 * - ITINERARY_CATEGORIES: Categories for itinerary items
 * - ITEM_STATUSES: Statuses for itinerary items
 * - TRIP_STATUSES: Trip statuses
 */

// Export common status enums, types and values from this file

// ======= TRIP ROLES =======
export const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer'
} as const;

export type TripRole = typeof TRIP_ROLES[keyof typeof TRIP_ROLES];

// ======= ITEM STATUSES =======
export const ITEM_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SUGGESTED: 'suggested',
  CONFIRMED: 'confirmed'
} as const;

export type ItemStatus = typeof ITEM_STATUSES[keyof typeof ITEM_STATUSES];

// ======= ITINERARY CATEGORIES =======
export const ITINERARY_CATEGORIES = {
  FLIGHT: 'flight',
  ACCOMMODATION: 'accommodation',
  ATTRACTION: 'attraction',
  RESTAURANT: 'restaurant',
  TRANSPORTATION: 'transportation',
  ACTIVITY: 'activity',
  CUSTOM: 'custom',
  FLEXIBLE_OPTIONS: 'flexible_options',
  OTHER: 'other'
} as const;

export type ItineraryCategory = typeof ITINERARY_CATEGORIES[keyof typeof ITINERARY_CATEGORIES];

// ======= TRIP STATUSES =======
export const TRIP_STATUSES = {
  PLANNING: 'planning',
  BOOKED: 'booked',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type TripStatus = typeof TRIP_STATUSES[keyof typeof TRIP_STATUSES];

// ======= PERMISSION STATUSES =======
export const PERMISSION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export type PermissionStatus = typeof PERMISSION_STATUSES[keyof typeof PERMISSION_STATUSES];

// ======= PRESENCE STATUSES =======
export const PRESENCE_STATUSES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away'
} as const;

export type PresenceStatus = typeof PRESENCE_STATUSES[keyof typeof PRESENCE_STATUSES];

// ======= NOTIFICATION TYPES =======
export const NOTIFICATION_TYPES = {
  TRIP_INVITATION: 'trip_invitation',
  TRIP_UPDATE: 'trip_update',
  NEW_COMMENT: 'new_comment',
  MENTION: 'mention',
  ACCESS_REQUEST: 'access_request'
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// ======= SPLIT TYPES =======
export const SPLIT_TYPES = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  CUSTOM: 'custom'
} as const;

export type SplitType = typeof SPLIT_TYPES[keyof typeof SPLIT_TYPES];

// Trip types
export const TRIP_TYPES = {
  PERSONAL: 'personal',
  BUSINESS: 'business',
  FAMILY: 'family',
  GROUP: 'group',
} as const;

export type TripType = (typeof TRIP_TYPES)[keyof typeof TRIP_TYPES];

// Budget categories
export const BUDGET_CATEGORIES = {
  ACCOMMODATION: 'accommodation',
  TRANSPORTATION: 'transportation',
  FOOD: 'food',
  ACTIVITIES: 'activities',
  SHOPPING: 'shopping',
  OTHER: 'other',
} as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[keyof typeof BUDGET_CATEGORIES];

// Template categories
export const TEMPLATE_CATEGORIES = {
  ADVENTURE: 'adventure',
  RELAXATION: 'relaxation',
  CITY: 'city',
  BEACH: 'beach',
  MOUNTAIN: 'mountain',
  CULTURAL: 'cultural',
  FAMILY: 'family',
  ROMANTIC: 'romantic',
  OTHER: 'other',
} as const;

export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[keyof typeof TEMPLATE_CATEGORIES];

// Template types
export const TEMPLATE_TYPES = {
  USER: 'user',
  OFFICIAL: 'official',
  PARTNER: 'partner',
} as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[keyof typeof TEMPLATE_TYPES];

// User statuses
export const USER_STATUSES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  EDITING: 'editing',
} as const;

export type UserStatus = 'online' | 'offline' | 'away' | 'editing';
