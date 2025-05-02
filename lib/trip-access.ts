import { createClient } from '@supabase/supabase-js';
import { TABLES, DB_FIELDS, DB_ENUMS, type TripRole } from '@/utils/constants/database';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';
import { errorResponse } from '@/lib/api-utils';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    '[lib/trip-access] Supabase URL or Service Role Key is missing from environment variables.'
  );
}

// Create a single instance of the Supabase admin client for this module
// This uses the service role key for privileged access - ONLY use this on the server!
const supabaseAdmin =
  supabaseUrl && serviceKey ? createClient<Database>(supabaseUrl, serviceKey) : null;

export interface TripAccessResult {
  allowed: boolean;
  role?: TripRole | null;
  error?: { message: string; status: number };
}

/**
 * Check if a user has the required role for a trip
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @param allowedRoles Array of roles that are allowed to perform the action
 * @returns Result object with access details
 */
export async function checkTripAccess(
  userId: string,
  tripId: string,
  allowedRoles: TripRole[] = [
    DB_ENUMS.TRIP_ROLES.ADMIN,
    DB_ENUMS.TRIP_ROLES.EDITOR,
    DB_ENUMS.TRIP_ROLES.CONTRIBUTOR,
  ]
): Promise<TripAccessResult> {
  if (!supabaseAdmin) {
    console.error('[checkTripAccess] Supabase client not initialized.');
    return { allowed: false, error: { message: 'Server configuration error', status: 500 } };
  }

  // First check member role
  const { data: member, error: memberError } = await supabaseAdmin
    .from(Tables.TRIP_MEMBERS)
    .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
    .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
    .maybeSingle();

  if (memberError) {
    return {
      allowed: false,
      error: { message: `Error checking membership: ${memberError.message}`, status: 500 },
    };
  }

  if (member?.role && allowedRoles.includes(member.role as TripRole)) {
    return { allowed: true, role: member.role as TripRole };
  }

  // If not a member or doesn't have required role, check if trip is public
  // (only relevant if viewer role is allowed)
  if (allowedRoles.includes(DB_ENUMS.TRIP_ROLES.VIEWER)) {
    const { data: trip, error: tripError } = await supabaseAdmin
      .from(Tables.TRIPS)
      .select('is_public, privacy_setting')
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .single();

    if (tripError) {
      if (tripError.code === 'PGRST116') {
        return { allowed: false, error: { message: 'Trip not found', status: 404 } };
      }
      return {
        allowed: false,
        error: { message: `Error checking trip privacy: ${tripError.message}`, status: 500 },
      };
    }

    const isPublic =
      trip.is_public ||
      trip.privacy_setting === 'public' ||
      trip.privacy_setting === 'shared_with_link';

    if (isPublic) {
      return { allowed: true, role: DB_ENUMS.TRIP_ROLES.VIEWER };
    }
  }

  return {
    allowed: false,
    error: { message: "You don't have sufficient permissions for this action", status: 403 },
  };
}

/**
 * Get detailed permissions for a user on a trip
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @returns Detailed permission object
 */
export async function getTripPermissions(userId: string, tripId: string) {
  if (!supabaseAdmin) {
    console.error('[getTripPermissions] Supabase client not initialized.');
    // Return a structure indicating failure due to missing client
    return {
      canView: false,
      canEdit: false,
      canManage: false,
      canAddMembers: false,
      canDeleteTrip: false,
      isCreator: false,
      role: null,
      error: 'Server configuration error',
      status: 500,
    };
  }

  // Check if trip exists and get basic info
  const { data: trip, error: tripError } = await supabaseAdmin
    .from(Tables.TRIPS)
    .select('id, created_by, is_public, privacy_setting')
    .eq(DB_FIELDS.TRIPS.ID, tripId)
    .single();

  if (tripError) {
    if (tripError.code === 'PGRST116') {
      return {
        canView: false,
        canEdit: false,
        canManage: false,
        canAddMembers: false,
        canDeleteTrip: false,
        isCreator: false,
        role: null,
        error: 'Trip not found',
        status: 404,
      };
    }
    return {
      canView: false,
      canEdit: false,
      canManage: false,
      canAddMembers: false,
      canDeleteTrip: false,
      isCreator: false,
      role: null,
      error: `Error checking trip: ${tripError.message}`,
      status: 500,
    };
  }

  // Check if user is a member of this trip
  const { data: member, error: memberError } = await supabaseAdmin
    .from(Tables.TRIP_MEMBERS)
    .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
    .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
    .maybeSingle();

  if (memberError) {
    return {
      canView: false,
      canEdit: false,
      canManage: false,
      canAddMembers: false,
      canDeleteTrip: false,
      isCreator: false,
      role: null,
      error: `Error checking membership: ${memberError.message}`,
      status: 500,
    };
  }

  const role = member?.role as TripRole | null;
  const isCreator = trip.created_by === userId;
  const isPublic =
    trip.is_public ||
    trip.privacy_setting === 'public' ||
    trip.privacy_setting === 'shared_with_link';

  // Default permissions
  const permissions = {
    canView: false,
    canEdit: false,
    canManage: false,
    canAddMembers: false,
    canDeleteTrip: false,
    isCreator,
    role,
    isPublic,
  };

  // Set permissions based on role
  if (role === DB_ENUMS.TRIP_ROLES.ADMIN) {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canManage = true;
    permissions.canAddMembers = true;
    permissions.canDeleteTrip = isCreator; // Only creator can delete
  } else if (role === DB_ENUMS.TRIP_ROLES.EDITOR) {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canAddMembers = true;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  } else if (role === DB_ENUMS.TRIP_ROLES.CONTRIBUTOR) {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canAddMembers = false;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  } else if (role === DB_ENUMS.TRIP_ROLES.VIEWER) {
    permissions.canView = true;
    permissions.canEdit = false;
    permissions.canAddMembers = false;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  } else if (isPublic) {
    // Public trip, non-member
    permissions.canView = true;
    permissions.canEdit = false;
    permissions.canAddMembers = false;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  }

  return permissions;
}

/**
 * Wrapper function to check trip access and return appropriate response
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @param allowedRoles Roles allowed to perform the action
 * @returns NextResponse error or null if allowed
 */
export async function ensureTripAccess(
  userId: string,
  tripId: string,
  allowedRoles: TripRole[] = [DB_ENUMS.TRIP_ROLES.ADMIN, DB_ENUMS.TRIP_ROLES.EDITOR]
): Promise<NextResponse | null> {
  const accessResult = await checkTripAccess(userId, tripId, allowedRoles);

  if (!accessResult.allowed) {
    return errorResponse(
      accessResult.error?.message || 'Access denied',
      accessResult.error?.status || 403
    );
  }

  return null;
}

/**
 * Checks if a user is a member of a specific trip.
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @returns True if the user is a member of the trip, false otherwise
 */
export async function checkTripMembership(userId: string, tripId: string): Promise<boolean> {
  if (!userId || !tripId) return false;
  if (!supabaseAdmin) {
    console.error('[checkTripMembership] Supabase client not initialized.');
    return false; // Cannot check membership without client
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
      .maybeSingle();

    return !!data?.role;
  } catch (error) {
    console.error('[checkTripMembership] Error checking trip membership:', error);
    return false;
  }
}

/**
 * Get the role of a user in a specific trip.
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @returns The role of the user in the trip, or null if the user is not a member
 */
export async function getUserTripRole(userId: string, tripId: string): Promise<string | null> {
  if (!userId || !tripId) return null;
  if (!supabaseAdmin) {
    console.error('[getUserTripRole] Supabase client not initialized.');
    return null; // Cannot get role without client
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
      .maybeSingle();

    return data?.role || null;
  } catch (error) {
    console.error('[getUserTripRole] Error getting user trip role:', error);
    return null;
  }
}

/**
 * Check if a user can edit a specific trip.
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @returns True if the user can edit the trip, false otherwise
 */
export async function canUserEditTrip(userId: string, tripId: string): Promise<boolean> {
  if (!userId || !tripId) return false;
  if (!supabaseAdmin) {
    console.error('[canUserEditTrip] Supabase client not initialized.');
    return false; // Cannot check permission without client
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(Tables.TRIP_MEMBERS)
      .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
      .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
      .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
      .maybeSingle();

    return !!data?.role && data.role === DB_ENUMS.TRIP_ROLES.EDITOR;
  } catch (error) {
    console.error('[canUserEditTrip] Error checking user edit permission:', error);
    return false;
  }
}
