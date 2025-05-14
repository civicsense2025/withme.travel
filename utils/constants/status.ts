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

import type { Database } from './database';

// Export common status enums, types and values from this file

// ======= TRIP ROLES (from DB) =======
export const TRIP_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
} as const; // DB: trip_role

export type TripRole = Database['public']['Enums']['trip_role'];

// ======= GROUP MEMBER ROLES =======
export const GROUP_MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type GroupMemberRole = (typeof GROUP_MEMBER_ROLES)[keyof typeof GROUP_MEMBER_ROLES];

// ======= GROUP MEMBER STATUSES =======
export const GROUP_MEMBER_STATUSES = {
  INVITED: 'invited',
  ACTIVE: 'active',
  LEFT: 'left',
  REMOVED: 'removed',
} as const;

export type GroupMemberStatus = (typeof GROUP_MEMBER_STATUSES)[keyof typeof GROUP_MEMBER_STATUSES];

// ======= GROUP VISIBILITY =======
export const GROUP_VISIBILITY = {
  PRIVATE: 'private',
  SHARED_WITH_LINK: 'shared_with_link',
  PUBLIC: 'public',
} as const;

export type GroupVisibility = (typeof GROUP_VISIBILITY)[keyof typeof GROUP_VISIBILITY];

// ======= ITEM STATUSES (from DB) =======
export const ITEM_STATUSES = {
  SUGGESTED: 'suggested',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  ACTIVE: 'active',
} as const;

export type ItemStatus = Database['public']['Enums']['item_status'];

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

// ======= TRIP STATUSES (from DB) =======
export const TRIP_STATUSES = {
  PLANNING: 'planning',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TripStatus = Database['public']['Enums']['trip_status'];

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

// ======= SPLIT TYPES =======
export const SPLIT_TYPES = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  CUSTOM: 'custom',
} as const;

export type SplitType = (typeof SPLIT_TYPES)[keyof typeof SPLIT_TYPES];

// ======= TRIP TYPES (from DB) =======
export const TRIP_TYPES = {
  LEISURE: 'leisure',
  BUSINESS: 'business',
  FAMILY: 'family',
  SOLO: 'solo',
  GROUP: 'group',
  OTHER: 'other',
} as const;

export type TripType = Database['public']['Enums']['trip_type'];

// ======= BUDGET CATEGORIES (from DB) =======
export const BUDGET_CATEGORIES = {
  ACCOMMODATION: 'accommodation',
  TRANSPORTATION: 'transportation',
  FOOD: 'food',
  ACTIVITIES: 'activities',
  SHOPPING: 'shopping',
  OTHER: 'other',
} as const;

export type BudgetCategory = Database['public']['Enums']['budget_category'];

// ======= PRIVACY SETTINGS (from DB) =======
export const PRIVACY_SETTINGS = {
  PRIVATE: 'private',
  SHARED_WITH_LINK: 'shared_with_link',
  PUBLIC: 'public',
} as const;

export type PrivacySetting = Database['public']['Enums']['privacy_setting'];

// ======= TRIP PRIVACY SETTINGS (from DB) =======
export const TRIP_PRIVACY_SETTINGS = {
  PRIVATE: 'private',
  SHARED_WITH_LINK: 'shared_with_link',
  PUBLIC: 'public',
} as const;

export type TripPrivacySetting = Database['public']['Enums']['trip_privacy_setting'];

// ======= PLACE CATEGORIES (from DB) =======
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

export type PlaceCategory = Database['public']['Enums']['place_category'];

// ======= TRAVEL PACE (from DB) =======
export const TRAVEL_PACES = {
  VERY_SLOW: 'very_slow',
  SLOW: 'slow',
  MODERATE: 'moderate',
  FAST: 'fast',
  VERY_FAST: 'very_fast',
} as const;

export type TravelPace = Database['public']['Enums']['travel_pace'];

// ======= TRAVEL PERSONALITY TYPES (from DB) =======
export const TRAVEL_PERSONALITY_TYPES = {
  PLANNER: 'planner',
  ADVENTURER: 'adventurer',
  FOODIE: 'foodie',
  SIGHTSEER: 'sightseer',
  RELAXER: 'relaxer',
  CULTURE: 'culture',
} as const;

export type TravelPersonalityType = Database['public']['Enums']['travel_personality_type'];

// ======= TRAVEL SQUAD TYPES (from DB) =======
export const TRAVEL_SQUAD_TYPES = {
  FRIENDS: 'friends',
  FAMILY: 'family',
  PARTNER: 'partner',
  SOLO: 'solo',
  COWORKERS: 'coworkers',
  MIXED: 'mixed',
} as const;

export type TravelSquadType = Database['public']['Enums']['travel_squad_type'];

// ======= TRAVEL STYLES (from DB) =======
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

export type TravelStyle = Database['public']['Enums']['travel_style'];

// ======= INVITATION STATUSES (from DB) =======
export const INVITATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
} as const;

export type InvitationStatus = Database['public']['Enums']['invitation_status'];

// ======= TAG STATUSES (from DB) =======
export const TAG_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type TagStatus = Database['public']['Enums']['tag_status'];

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

// ======= VOTE TYPES (from DB) =======
export const VOTE_TYPES = {
  UP: 'up',
  DOWN: 'down',
} as const;

export type VoteType = Database['public']['Enums']['vote_type'];

// ======= INTERACTION TYPES (from DB) =======
export const INTERACTION_TYPES = {
  LIKE: 'like',
  VISIT: 'visit',
  BOOKMARK: 'bookmark',
  TAG: 'tag',
} as const;

export type InteractionType = Database['public']['Enums']['interaction_type'];

// ======= URL FORMATS (from DB) =======
export const URL_FORMATS = {
  CANONICAL: 'canonical',
  SHORT: 'short',
  SOCIAL: 'social',
  TRACKING: 'tracking',
} as const;

export type UrlFormat = Database['public']['Enums']['url_format'];

// ======= GROUP IDEA TYPES =======
export const GROUP_PLAN_IDEA_TYPE = {
  DESTINATION: 'destination',
  DATE: 'date',
  ACTIVITY: 'activity',
  BUDGET: 'budget',
  OTHER: 'other',
  QUESTION: 'question',
  NOTE: 'note',
  PLACE: 'place',
} as const;

export type GroupPlanIdeaType = (typeof GROUP_PLAN_IDEA_TYPE)[keyof typeof GROUP_PLAN_IDEA_TYPE];

// Remove duplicate GroupMemberRole and GroupMemberStatus type definitions
