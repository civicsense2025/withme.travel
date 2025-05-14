/**
 * Common role types for the application
 * This file ensures consistency between different components using role types
 */

// Define the common role values that can be used in both trips and groups
export type CommonRole = 'admin' | 'editor' | 'viewer' | 'contributor';

// Trip-specific roles (with the same values as CommonRole for now, but may diverge in the future)
export type TripRole = CommonRole;

// Group-specific roles (with the same values as CommonRole for now, but may diverge in the future)
export type GroupMemberRole = CommonRole;

// Role constants for use throughout the application
export const ROLES = {
  ADMIN: 'admin' as const,
  EDITOR: 'editor' as const,
  VIEWER: 'viewer' as const,
  CONTRIBUTOR: 'contributor' as const,
} as const;

// Constants for trip roles (for backward compatibility)
export const TRIP_ROLES = ROLES;

// Constants for group member roles (for backward compatibility)
export const GROUP_MEMBER_ROLES = ROLES;
