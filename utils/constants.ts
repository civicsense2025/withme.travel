// =======================================================================
// DEPRECATED: This file is being gradually migrated to more specific modules.
//
// PLEASE USE THE FOLLOWING IMPORTS INSTEAD:
//  - Database tables/fields:

//  - Route constants:          import { API_ROUTES, PAGE_ROUTES } from '@/utils/constants/routes';
//  - Status/enums:             import { TRIP_ROLES, ITEM_STATUSES } from '@/utils/constants/status';
//  - UI/theme constants:       import { THEME, LIMITS } from '@/utils/constants/ui';
//
// For migration guidance, see docs/constants-migration.md
// =======================================================================

// DO NOT IMPORT FROM THIS FILE - Use the specific module imports shown above

// API endpoints that haven't been migrated yet
export const API_ENDPOINTS = {
  TRIPS: '/api/trips',
  TRIP_BY_ID: (id: string) => `/api/trips/${id}`,
  TRIP_MEMBERS: (tripId: string) => `/api/trips/${tripId}/members`,
  ITINERARY: (tripId: string) => `/api/trips/${tripId}/itinerary`,
  ITINERARY_ITEM: (tripId: string, itemId: string) => `/api/trips/${tripId}/itinerary/${itemId}`,
  DESTINATIONS: '/api/destinations',
  DESTINATION_SEARCH: (query: string) =>
    `/api/destinations/search?query=${encodeURIComponent(query)}`,
  TRENDING_DESTINATIONS: '/api/destinations?trending=true',
  DESTINATION_BY_ID: (id: string) => `/api/destinations/${id}`,
  TEMPLATES: '/api/templates',
  TEMPLATE_BY_ID: (id: string) => `/api/templates/${id}`,
  PERMISSIONS: '/api/permissions',
  PERMISSION_BY_ID: (id: string) => `/api/permissions/${id}`,
  ADMIN_USERS_DETAIL: (id: string) => `/api/admin/users/${id}`,
  PUBLIC_TRIP_DETAILS: (slug: string) => `/api/trips/public/${slug}`,
  TRIP_TRAVEL_TIMES: (id: string) => `/api/trips/${id}/travel-times`,
  USER_PROFILE: '/api/user/profile',
};

// Form Field Limits
export const FORM_LIMITS = {
  TITLE_MIN: 3,
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 500,
  MEMBERS_MAX: 20,
} as const;

// Supabase foreign key relationship names
// @deprecated - Not typically needed directly in frontend code
export const FOREIGN_KEYS = {
  TRIP_MEMBERS_USER_ID: 'trip_members_user_id_fkey',
  TRIP_MEMBERS_INVITED_BY: 'trip_members_invited_by_fkey',
  TRIP_NOTES_UPDATED_BY: 'trip_notes_updated_by_fkey',
  TRIP_NOTES_USER_ID: 'trip_notes_user_id_fkey',
  TRIPS_USER_ID: 'trips_user_id_fkey',
  ITINERARY_ITEMS_CREATED_BY: 'itinerary_items_created_by_fkey',
  BUDGET_ITEMS_CREATED_BY: 'budget_items_created_by_fkey',
  BUDGET_ITEMS_PAID_BY: 'budget_items_paid_by_fkey',
} as const;

// Supabase query snippets for commonly used joins
// @deprecated - Build joins directly in queries for clarity
export const QUERY_SNIPPETS = {
  USER_BASIC: 'id, name, email, avatar_url',

  TRIP_MEMBER_WITH_USER: `
    id,
    role,
    created_at,
    joined_at,
    user:users!${FOREIGN_KEYS.TRIP_MEMBERS_USER_ID}(
      id,
      name,
      email,
      avatar_url
    ),
    inviter:users!${FOREIGN_KEYS.TRIP_MEMBERS_INVITED_BY}(
      id,
      name,
      email,
      avatar_url
    )
  `,

  TRIP_NOTE_WITH_USER: `
    *,
    updated_by_user:users!${FOREIGN_KEYS.TRIP_NOTES_UPDATED_BY}(
      id, 
      name, 
      email, 
      avatar_url
    )
  `,

  TRIP_WITH_CREATOR: `
    *,
    creator:users!${FOREIGN_KEYS.TRIPS_USER_ID}(
      id,
      name,
      email,
      avatar_url
    )
  `,

  ITINERARY_ITEM_WITH_CREATOR: `
    *,
    creator:users!${FOREIGN_KEYS.ITINERARY_ITEMS_CREATED_BY}(
      id,
      name,
      email,
      avatar_url
    )
  `,
} as const;

// Unsplash API Configuration
export const UNSPLASH_CONFIG = {
  API_URL: 'https://api.unsplash.com',
  ACCESS_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
  SECRET_KEY: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_SECRET || '',
  ENDPOINTS: {
    SEARCH: '/search/photos',
    RANDOM: '/photos/random',
  },
  DEFAULT_QUERY_PARAMS: {
    orientation: 'landscape',
    content_filter: 'high',
  },
} as const;

// Image types
export const IMAGE_TYPES = {
  DESTINATION: 'destination',
  TRIP_COVER: 'trip_cover',
  USER_AVATAR: 'user_avatar',
  TEMPLATE_COVER: 'template_cover',
} as const;

export type ImageType = (typeof IMAGE_TYPES)[keyof typeof IMAGE_TYPES];

// Invitation statuses (from image)
export const INVITATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
} as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[keyof typeof INVITATION_STATUSES];

// Add Vote Type enum (from image)
export const VOTE_TYPES = {
  UP: 'up',
  DOWN: 'down',
} as const;

export type VoteType = (typeof VOTE_TYPES)[keyof typeof VOTE_TYPES];
