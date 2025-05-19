/**
 * Shared API Types & Helpers
 *
 * Contains common types, error/result helpers, and utilities for API modules.
 * Used across all feature API modules for consistent error/result handling.
 *
 * @module lib/api/_shared
 *
 * TODO: These are temporary type definitions until we have proper database.types.ts integration.
 * When database.types.ts is updated with all the needed types, these can be replaced with imports.
 */

// NOTE: This is the canonical Result type for API modules. Do not use utils/result.ts (deprecated).

// ============================================================================
// IMPORTS
// ============================================================================

import type { Trip, Profile } from '@/utils/constants/database.types';
import { z } from 'zod';

// ============================================================================
// RESULT TYPE
// ============================================================================

/**
 * Discriminated union result type for API functions.
 * Used to standardize success/error responses from API modules.
 *
 * @template T - The type of data returned on success
 */
export type Result<T> = { success: true; data: T } | { success: false; error: string };

// ============================================================================
// TEMPORARY TYPE DEFINITIONS
// ============================================================================

/**
 * Temporary type definition for Destination
 * TODO: Replace with proper import from database.types.ts when available
 */
export type TempDestination = {
  id: string;
  name: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: any; // Allow additional properties
};

/**
 * Temporary type definition for Group
 * TODO: Replace with proper import from database.types.ts when available
 */
export type TempGroup = {
  id: string;
  name: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  visibility: string;
  [key: string]: any; // Allow additional properties
};

/**
 * Temporary type definition for Comment
 * TODO: Replace with proper import from database.types.ts when available
 */
export type TempComment = {
  id: string;
  entity_id: string;
  entity_type: string;
  user_id: string | null;
  content: string;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: any; // Allow additional properties
};

/**
 * Temporary type definition for ItineraryItem
 * TODO: Replace with proper import from database.types.ts when available
 */
export type TempItineraryItem = {
  id: string;
  trip_id: string;
  title: string | null;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: any; // Allow additional properties
};

/**
 * Temporary type definition for Place
 * TODO: Replace with proper import from database.types.ts when available
 */
export type TempPlace = {
  id: string;
  name: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: any; // Allow additional properties
};

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Group entity type for collaborative planning.
 */
export interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by?: string;
  cover_image_url?: string;
  [key: string]: any;
}

/**
 * Destination entity type for location-based planning.
 */
export interface Destination {
  id: string;
  name: string;
  description?: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  created_at: string;
  popularity?: number;
  [key: string]: any;
}

/**
 * Tag entity type for content categorization.
 */
export interface Tag {
  id: string;
  name: string;
  entity_id: string;
  entity_type: string;
  color?: string;
  created_at: string;
  created_by?: string;
}

/**
 * Expense entity type for trip budget tracking.
 */
export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  amount: number;
  category?: string;
  date?: string;
  currency: string;
  is_paid?: boolean;
  created_at: string;
  created_by: string;
  updated_at?: string;
  notes?: string | null;
  paid_by: string;
  paid_at: string;
}

/**
 * Comment entity type for collaborative discussions.
 */
export interface Comment {
  id: string;
  entity_id: string;
  entity_type: string;
  content: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
}

/**
 * Itinerary Item entity type for trip planning.
 */
export interface ItineraryItem {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  status?: string;
  order?: number;
}

/**
 * Place entity type for points of interest.
 */
export interface Place {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  image_url?: string;
  created_at: string;
  created_by?: string;
}

/**
 * Permission Request entity type for trip access.
 */
export interface PermissionRequest {
  id: string;
  trip_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_role: string;
  requested_at: string;
  resolved_at?: string;
  resolved_by?: string;
  message?: string | null;
  updated_at?: string | null;
}

/**
 * Activity entity type for suggested/planned activities.
 */
export interface Activity {
  id: string;
  entity_id: string;
  entity_type: string;
  action_type: string;
  user_id: string;
  name: string;
  description?: string;
  location?: string;
  duration?: number;
  category?: string;
  image_url?: string;
  created_at: string;
  metadata?: any;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Helper to handle errors and return a Result<T>.
 * Standardizes error handling across API modules.
 *
 * @param error - The error to handle
 * @param fallbackMsg - Fallback error message if error is not an Error object
 * @returns A Result object with success: false and the error message
 */
export function handleError(error: unknown, fallbackMsg: string): Result<never> {
  console.error(fallbackMsg, error);

  if (error instanceof Error) {
    return { success: false, error: error.message };
  }

  return { success: false, error: fallbackMsg };
}

// ============================================================================
// COMMON ENTITY TYPES
// ============================================================================

/**
 * Re-export database types
 */
export { Trip, Profile };

/**
 * Comment entity type with enhanced fields
 */
export interface CommentV2 {
  id: string;
  content: string;
  user_id: string;
  entity_id: string;
  entity_type: string;
  created_at: string;
  updated_at?: string;
  is_edited: boolean;
  is_deleted: boolean;
  parent_id?: string;
  attachment_url?: string;
  attachment_type?: string;
}

/**
 * Place entity type with enhanced fields
 */
export interface PlaceV2 {
  id: string;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  external_id?: string;
  external_source?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  category?: string;
  tags?: string[];
  cover_image_url?: string;
}

/**
 * Destination entity type with enhanced fields
 */
export interface DestinationV2 {
  id: string;
  name: string;
  description?: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at?: string;
  cover_image_url?: string;
  popularity?: number;
  slug?: string;
}

/**
 * Itinerary Item entity type with enhanced fields
 */
export interface ItineraryItemV2 {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  place_id?: string;
  day?: number;
  position?: number;
  status?: string;
  category?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

/**
 * Tag entity type with consistent properties
 */
export interface TagV2 {
  id: string;
  name: string;
  entity_id: string;
  entity_type: string;
  color?: string;
  created_at: string;
  created_by?: string;
}

/**
 * Permission Request entity type with consistent properties
 */
export interface PermissionRequestV2 {
  id: string;
  trip_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_role: string;
  created_at: string;
  updated_at?: string;
  message?: string;
}

/**
 * Expense entity type with consistent properties
 */
export interface ExpenseV2 {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category?: string;
  paid_by: string;
  paid_at: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
  notes?: string;
}

/**
 * Activity entity type with consistent properties
 */
export interface ActivityV2 {
  id: string;
  entity_id: string;
  entity_type: string;
  action_type: string;
  user_id: string;
  created_at: string;
  metadata?: any;
  name: string;
  description?: string;
  location?: string;
  duration?: number;
  category?: string;
  image_url?: string;
}

/**
 * Trip Member entity type
 */
export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  invited_by?: string;
  status: string;
}

// ============================================================================
// (Add more shared helpers as needed)
// ============================================================================

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(['suggested', 'confirmed', 'rejected', 'active', 'cancelled']),
  due_date: z.string().datetime().nullable().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  created_at: z.string(),
  updated_at: z.string(),
  owner_id: z.string().uuid(),
  assignee_id: z.string().uuid().nullable().optional(),
  trip_id: z.string().uuid().nullable().optional(),
  position: z.number(),
  tags: z.array(z.string()).optional(),
  up_votes: z.number().optional(),
  down_votes: z.number().optional(),
});

export type Task = z.infer<typeof taskSchema>;

export const taskVoteSchema = z.object({
  id: z.string().uuid(),
  task_id: z.string().uuid(),
  user_id: z.string().uuid(),
  vote_type: z.enum(['up', 'down']),
  created_at: z.string(),
});
export type TaskVote = z.infer<typeof taskVoteSchema>;

export const tagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.string(),
});
export type TagType = z.infer<typeof tagSchema>;

export const taskTagSchema = z.object({
  task_id: z.string().uuid(),
  tag_id: z.string().uuid(),
  created_at: z.string(),
});
export type TaskTag = z.infer<typeof taskTagSchema>;

/**
 * Type guard to check if an object is a Group
 */
export function isGroup(obj: any): obj is Group {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

/**
 * Type guard to check if an object is a Destination
 */
export function isDestination(obj: any): obj is Destination {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Pagination metadata type
 */
export type PaginationMeta = {
  /** Total number of items available */
  totalItems: number;
  /** Number of items in the current page */
  itemCount: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Current page number */
  currentPage: number;
};

/**
 * Paginated result type
 *
 * @template T - The type of data returned in the paginated result
 */
export type PaginatedResult<T> = {
  /** Array of items of type T */
  items: T[];
  /** Pagination metadata */
  meta: PaginationMeta;
};

// Export types
export { PaginationMeta, PaginatedResult };
