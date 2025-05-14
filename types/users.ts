/**
 * Types for users, profiles, and roles
 */

/**
 * User role enum values matching database enum type
 */
export type UserRole = 'user' | 'admin' | 'moderator' | 'support' | 'guest';

/**
 * Role permissions object defining what each role can do
 */
export interface RolePermissions {
  canManageUsers: boolean;
  canManageContent: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canDeleteContent: boolean;
  canVerifyContent: boolean;
  canModerateComments: boolean;
}

/**
 * Mapping of roles to their permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManageContent: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canDeleteContent: true,
    canVerifyContent: true,
    canModerateComments: true,
  },
  moderator: {
    canManageUsers: false,
    canManageContent: true,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteContent: true,
    canVerifyContent: true,
    canModerateComments: true,
  },
  support: {
    canManageUsers: false,
    canManageContent: false,
    canViewAnalytics: true,
    canManageSettings: false,
    canDeleteContent: false,
    canVerifyContent: false,
    canModerateComments: true,
  },
  user: {
    canManageUsers: false,
    canManageContent: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteContent: false,
    canVerifyContent: false,
    canModerateComments: false,
  },
  guest: {
    canManageUsers: false,
    canManageContent: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canDeleteContent: false,
    canVerifyContent: false,
    canModerateComments: false,
  },
};

/**
 * Type for profile object from database
 */
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  social_links: Record<string, string> | null;
  preferences: Record<string, any> | null;
  role: UserRole;
}

/**
 * Check if a user has specific permission
 * @param userRole - Role of the user
 * @param permission - Permission to check
 * @returns Whether the user has the permission
 */
export function hasPermission(
  userRole: UserRole | null | undefined,
  permission: keyof RolePermissions
): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole][permission];
}

/**
 * Get role display name for UI
 * @param role - Role ID
 * @returns Display name for the role
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    admin: 'Administrator',
    moderator: 'Moderator',
    support: 'Support Agent',
    user: 'User',
    guest: 'Guest',
  };

  return displayNames[role] || 'Unknown Role';
}
