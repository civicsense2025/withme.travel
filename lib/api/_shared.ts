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
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ============================================================================
// TEMPORARY TYPE DEFINITIONS
// ============================================================================

/**
 * Temporary type definition for Destination
 * TODO: Replace with proper import from database.types.ts when available
 */
export type Destination = {
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
export type Group = {
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
export type Comment = {
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
export type ItineraryItem = {
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
export type Place = {
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
  created_at?: string;
  created_by?: string;
  cover_image_url?: string;
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
  created_at?: string;
  popularity?: number;
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
  created_at?: string;
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
  currency?: string;
  is_paid?: boolean;
  created_at?: string;
  created_by?: string;
}

/**
 * Comment entity type for collaborative discussions.
 */
export interface Comment {
  id: string;
  entity_id: string;
  entity_type: string;
  content: string;
  created_at?: string;
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
  created_at?: string;
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
  created_at?: string;
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
  requested_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

/**
 * Activity entity type for suggested/planned activities.
 */
export interface Activity {
  id: string;
  name: string;
  description?: string;
  location?: string;
  duration?: number;
  category?: string;
  image_url?: string;
  created_at?: string;
  created_by?: string;
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
 * Comment entity type
 */
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  entity_id: string;
  entity_type: string;
  created_at: string;
  updated_at?: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  parent_id?: string | null;
  attachment_url?: string | null;
  attachment_type?: string | null;
}

/**
 * Place entity type
 */
export interface Place {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  external_id?: string | null;
  external_source?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
  category?: string | null;
  tags?: string[] | null;
  cover_image_url?: string | null;
}

/**
 * Destination entity type
 */
export interface Destination {
  id: string;
  name: string;
  description?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at?: string | null;
  cover_image_url?: string | null;
  popularity?: number | null;
  slug?: string;
}

/**
 * Itinerary Item entity type
 */
export interface ItineraryItem {
  id: string;
  trip_id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  place_id?: string | null;
  day?: number | null;
  position?: number | null;
  status?: string;
  category?: string;
  created_at: string;
  updated_at?: string | null;
  created_by: string;
}

/**
 * Tag entity type
 */
export interface Tag {
  id: string;
  name: string;
  entity_id: string;
  entity_type: string;
  color?: string;
  created_at?: string;
  created_by?: string;
}

/**
 * Permission Request entity type
 */
export interface PermissionRequest {
  id: string;
  trip_id: string;
  user_id: string;
  status: string;
  requested_role: string;
  created_at: string;
  updated_at?: string | null;
  message?: string | null;
}

/**
 * Expense entity type
 */
export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category?: string | null;
  paid_by: string;
  paid_at: string;
  created_at: string;
  updated_at?: string | null;
  created_by: string;
  notes?: string | null;
}

/**
 * Activity entity type
 */
export interface Activity {
  id: string;
  entity_id: string;
  entity_type: string;
  action_type: string;
  user_id: string;
  created_at: string;
  metadata?: any;
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
  invited_by?: string | null;
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
export type Tag = z.infer<typeof tagSchema>;

export const taskTagSchema = z.object({
  task_id: z.string().uuid(),
  tag_id: z.string().uuid(),
  created_at: z.string(),
});
export type TaskTag = z.infer<typeof taskTagSchema>; 