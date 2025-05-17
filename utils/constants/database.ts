/**
 * Database Types and Constants
 *
 * This file provides TypeScript types for the database schema and re-exports
 * table constants from tables.ts. It serves as the central type definition
 * for all database interactions.
 *
 * IMPORTANT:
 * - Import types from this file for database operations
 * - Use these typed constants for table and field references
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Generic JSON type for Supabase
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================================================
// RE-EXPORTS FROM OTHER CONSTANT FILES
// ============================================================================

/**
 * Re-export table constants and types
 */
export { TABLES } from './tables';
export type { CommentableContentType, ItineraryTemplateMetadata } from './tables';

/**
 * Re-export table field constants
 */
export { TABLE_FIELDS } from './table-fields';
export type { TableFieldKey } from './table-fields';

/**
 * Re-export enum constants and types
 */
export { ENUMS } from './status';
export type {
  BudgetCategory,
  ContentType,
  GroupIdeaType,
  GroupMemberRole,
  GroupMemberStatus,
  GroupVisibility,
  ImageType,
  InvitationStatus,
  InvitationType,
  ItemStatus,
  ItineraryCategory,
  PermissionStatus,
  StateProvinceType,
  TravelPace,
  TripActionType,
  TripPrivacySetting,
  TripRole,
  TripStatus,
  TripType,
  UserRole,
  VoteType
} from './status';

// ============================================================================
// NOTIFICATION CONSTANTS
// ============================================================================

/**
 * Notification types for the system
 * Used for categorizing and routing notifications
 */
export const NOTIFICATION_TYPES = {
  /** Friend request received */
  FRIEND_REQUEST: 'friend_request',
  /** Friend request accepted */
  FRIEND_ACCEPTED: 'friend_accepted',
  /** Invitation to join a trip */
  TRIP_INVITE: 'trip_invite',
  /** Updates to a trip you're part of */
  TRIP_UPDATE: 'trip_update',
  /** New comment on an itinerary item */
  ITINERARY_COMMENT: 'itinerary_comment',
  /** New reaction on an itinerary item */
  ITINERARY_REACTION: 'itinerary_reaction',
  /** Request to access a trip */
  ACCESS_REQUEST: 'access_request',
  /** Access granted to a trip */
  ACCESS_GRANTED: 'access_granted',
  /** User mentioned in comment */
  MENTION: 'mention',
  /** Invitation to join a group */
  GROUP_INVITE: 'group_invite',
  /** Updates to a group you're part of */
  GROUP_UPDATE: 'group_update',
  /** New idea added to a group */
  GROUP_IDEA: 'group_idea',
  /** New comment on a group idea */
  GROUP_COMMENT: 'group_comment',
  /** New reaction on a group comment */
  GROUP_REACTION: 'group_reaction',
} as const;

// ============================================================================
// SOCIAL RELATIONSHIP CONSTANTS
// ============================================================================

/**
 * Friend request status values
 * Used to track the state of friend requests
 */
export const FRIEND_REQUEST_STATUS = {
  /** Request sent but not yet acted upon */
  PENDING: 'pending',
  /** Request was accepted by the recipient */
  ACCEPTED: 'accepted',
  /** Request was declined by the recipient */
  DECLINED: 'declined',
  /** User was blocked (extended functionality) */
  BLOCKED: 'blocked',
} as const;
