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
  VIEWER: 'viewer',
} as const;

export type TripRole = (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES];

// ======= ITEM STATUSES =======
export const ITEM_STATUSES = {
  SUGGESTED: 'suggested',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  ACTIVE: 'active',
} as const;

export type ItemStatus = (typeof ITEM_STATUSES)[keyof typeof ITEM_STATUSES];

// ======= ITINERARY CATEGORIES =======
export const ITINERARY_CATEGORIES = {
  ICONIC_LANDMARKS: 'Iconic Landmarks',
  LOCAL_SECRETS: 'Local Secrets',
  CULTURAL_EXPERIENCES: 'Cultural Experiences',
  OUTDOOR_ADVENTURES: 'Outdoor Adventures',
  FOOD_AND_DRINK: 'Food & Drink',
  ACCOMMODATIONS: 'Accommodations',
  TRANSPORTATION: 'Transportation',
  SHOPPING: 'Shopping',
  ENTERTAINMENT: 'Entertainment',
  HEALTH_AND_WELLNESS: 'Health & Wellness',
  EDUCATIONAL: 'Educational',
  RELAXATION: 'Relaxation',
  NIGHTLIFE: 'Nightlife',
  PHOTOGRAPHY: 'Photography',
  OTHER: 'Other',
  FLEXIBLE_OPTIONS: 'Flexible Options',
  // Backward compatibility aliases
  ACCOMMODATION: 'Accommodations', // Alias for ACCOMMODATIONS
  ATTRACTION: 'Attractions', // Alias for general attractions
} as const;

export type ItineraryCategory = (typeof ITINERARY_CATEGORIES)[keyof typeof ITINERARY_CATEGORIES];

// ======= TRIP STATUSES =======
export const TRIP_STATUSES = {
  PLANNING: 'planning',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TripStatus = (typeof TRIP_STATUSES)[keyof typeof TRIP_STATUSES];

// ======= PERMISSION STATUSES =======
export const PERMISSION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type PermissionStatus = (typeof PERMISSION_STATUSES)[keyof typeof PERMISSION_STATUSES];

// ======= PRESENCE STATUSES =======
export const PRESENCE_STATUSES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
} as const;

export type PresenceStatus = (typeof PRESENCE_STATUSES)[keyof typeof PRESENCE_STATUSES];

// ======= NOTIFICATION TYPES =======
export const NOTIFICATION_TYPES = {
  TRIP_INVITATION: 'trip_invitation',
  TRIP_UPDATE: 'trip_update',
  NEW_COMMENT: 'new_comment',
  MENTION: 'mention',
  ACCESS_REQUEST: 'access_request',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

// ======= SPLIT TYPES =======
export const SPLIT_TYPES = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  CUSTOM: 'custom',
} as const;

export type SplitType = (typeof SPLIT_TYPES)[keyof typeof SPLIT_TYPES];

// ======= TRIP TYPES =======
export const TRIP_TYPES = {
  LEISURE: 'leisure',
  BUSINESS: 'business',
  FAMILY: 'family',
  SOLO: 'solo',
  GROUP: 'group',
  OTHER: 'other',
} as const;

export type TripType = (typeof TRIP_TYPES)[keyof typeof TRIP_TYPES];

// ======= BUDGET CATEGORIES =======
export const BUDGET_CATEGORIES = {
  ACCOMMODATION: 'accommodation',
  TRANSPORTATION: 'transportation',
  FOOD: 'food',
  ACTIVITIES: 'activities',
  SHOPPING: 'shopping',
  OTHER: 'other',
} as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[keyof typeof BUDGET_CATEGORIES];

// ======= PRIVACY SETTINGS =======
export const PRIVACY_SETTINGS = {
  PRIVATE: 'private',
  SHARED_WITH_LINK: 'shared_with_link',
  PUBLIC: 'public',
} as const;

export type PrivacySetting = (typeof PRIVACY_SETTINGS)[keyof typeof PRIVACY_SETTINGS];

// ======= TRIP PRIVACY SETTINGS =======
export const TRIP_PRIVACY_SETTINGS = {
  PRIVATE: 'private',
  SHARED_WITH_LINK: 'shared_with_link',
  PUBLIC: 'public',
} as const;

export type TripPrivacySetting = (typeof TRIP_PRIVACY_SETTINGS)[keyof typeof TRIP_PRIVACY_SETTINGS];

// ======= PLACE CATEGORIES =======
export const PLACE_CATEGORIES = {
  ATTRACTION: 'attraction',
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  HOTEL: 'hotel',
  LANDMARK: 'landmark',
  SHOPPING: 'shopping',
  TRANSPORT: 'transport',
  OTHER: 'other',
} as const;

export type PlaceCategory = (typeof PLACE_CATEGORIES)[keyof typeof PLACE_CATEGORIES];

// ======= TRAVEL PACE =======
export const TRAVEL_PACES = {
  VERY_SLOW: 'very_slow',
  SLOW: 'slow',
  MODERATE: 'moderate',
  FAST: 'fast',
  VERY_FAST: 'very_fast',
} as const;

export type TravelPace = (typeof TRAVEL_PACES)[keyof typeof TRAVEL_PACES];

// ======= TRAVEL PERSONALITY TYPES =======
export const TRAVEL_PERSONALITY_TYPES = {
  PLANNER: 'planner',
  ADVENTURER: 'adventurer',
  FOODIE: 'foodie',
  SIGHTSEER: 'sightseer',
  RELAXER: 'relaxer',
  CULTURE: 'culture',
} as const;

export type TravelPersonalityType = (typeof TRAVEL_PERSONALITY_TYPES)[keyof typeof TRAVEL_PERSONALITY_TYPES];

// ======= TRAVEL SQUAD TYPES =======
export const TRAVEL_SQUAD_TYPES = {
  FRIENDS: 'friends',
  FAMILY: 'family',
  PARTNER: 'partner',
  SOLO: 'solo',
  COWORKERS: 'coworkers',
  MIXED: 'mixed',
} as const;

export type TravelSquadType = (typeof TRAVEL_SQUAD_TYPES)[keyof typeof TRAVEL_SQUAD_TYPES];

// ======= TRAVEL STYLES =======
export const TRAVEL_STYLES = {
  ADVENTUROUS: 'adventurous',
  RELAXED: 'relaxed',
  CULTURAL: 'cultural',
  LUXURY: 'luxury',
  BUDGET: 'budget',
  FAMILY: 'family',
  SOLO: 'solo',
  NIGHTLIFE: 'nightlife',
  NATURE: 'nature',
  FOOD_FOCUSED: 'food_focused',
} as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[keyof typeof TRAVEL_STYLES];

// ======= INVITATION STATUSES =======
export const INVITATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
} as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[keyof typeof INVITATION_STATUSES];

// ======= TAG STATUSES =======
export const TAG_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type TagStatus = (typeof TAG_STATUSES)[keyof typeof TAG_STATUSES];

// ======= TEMPLATE CATEGORIES =======
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

// ======= TEMPLATE TYPES =======
export const TEMPLATE_TYPES = {
  USER: 'user',
  OFFICIAL: 'official',
  PARTNER: 'partner',
} as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[keyof typeof TEMPLATE_TYPES];

// ======= USER STATUSES =======
export const USER_STATUSES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  EDITING: 'editing',
} as const;

export type UserStatus = 'online' | 'offline' | 'away' | 'editing';

// ======= VOTE TYPES =======
export const VOTE_TYPES = {
  UP: 'up',
  DOWN: 'down',
} as const;

export type VoteType = (typeof VOTE_TYPES)[keyof typeof VOTE_TYPES];

// ======= INTERACTION TYPES =======
export const INTERACTION_TYPES = {
  LIKE: 'like',
  VISIT: 'visit',
  BOOKMARK: 'bookmark',
  TAG: 'tag',
} as const;

export type InteractionType = (typeof INTERACTION_TYPES)[keyof typeof INTERACTION_TYPES];

// ======= URL FORMATS =======
export const URL_FORMATS = {
  CANONICAL: 'canonical',
  SHORT: 'short',
  SOCIAL: 'social',
  TRACKING: 'tracking',
} as const;

export type UrlFormat = (typeof URL_FORMATS)[keyof typeof URL_FORMATS];
