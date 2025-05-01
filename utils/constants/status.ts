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

// Trip member roles
export const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
} as const;

export type TripRole = (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES];

// Permission request statuses
export const PERMISSION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type PermissionStatus = (typeof PERMISSION_STATUSES)[keyof typeof PERMISSION_STATUSES];

// Itinerary categories
export const ITINERARY_CATEGORIES = {
  ICONIC_LANDMARKS: 'Iconic Landmarks',
  LOCAL_SECRETS: 'Local Secrets',
  CULTURAL_EXPERIENCES: 'Cultural Experiences',
  OUTDOOR_ADVENTURES: 'Outdoor Adventures',
  FOOD_DRINK: 'Food & Drink',
  NIGHTLIFE: 'Nightlife',
  RELAXATION: 'Relaxation',
  SHOPPING: 'Shopping',
  GROUP_ACTIVITIES: 'Group Activities',
  DAY_EXCURSIONS: 'Day Excursions',
  ACCOMMODATIONS: 'Accommodations',
  TRANSPORTATION: 'Transportation',
  FLEXIBLE_OPTIONS: 'Flexible Options',
  SPECIAL_OCCASIONS: 'Special Occasions',
} as const;

export type ItineraryCategory = (typeof ITINERARY_CATEGORIES)[keyof typeof ITINERARY_CATEGORIES];

// Item statuses
export const ITEM_STATUSES = {
  CONFIRMED: 'confirmed',
  BOOKED: 'booked',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type ItemStatus = (typeof ITEM_STATUSES)[keyof typeof ITEM_STATUSES];

// Trip statuses
export const TRIP_STATUSES = {
  PLANNING: 'planning',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TripStatus = (typeof TRIP_STATUSES)[keyof typeof TRIP_STATUSES];

// Split types
export const SPLIT_TYPES = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  CUSTOM: 'custom',
} as const;

export type SplitType = (typeof SPLIT_TYPES)[keyof typeof SPLIT_TYPES];

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
