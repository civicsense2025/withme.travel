import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-utils';
import type { Database } from '@/types/database.types';

// Define TripRole type since it's not exported from constants
export type TripRole = 'admin' | 'editor' | 'contributor' | 'viewer';

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
  allowedRoles: TripRole[] = ['admin', 'editor', 'contributor']
): Promise<TripAccessResult> {
  if (!supabaseAdmin) {
    console.error('[checkTripAccess] Supabase client not initialized.');
    return { allowed: false, error: { message: 'Server configuration error', status: 500 } };
  }

  // First check member role
  const { data: member, error: memberError } = await supabaseAdmin
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .maybeSingle();

  if (memberError) {
    return {
      allowed: false,
      error: { message: `Error checking membership: ${memberError.message}`, status: 500 },
    };
  }

  // Define the expected member type
  type MemberData = { role: string };

  if (
    member &&
    'role' in member &&
    allowedRoles.includes((member as MemberData).role as TripRole)
  ) {
    return { allowed: true, role: (member as MemberData).role as TripRole };
  }

  // If not a member or doesn't have required role, check if trip is public
  // (only relevant if viewer role is allowed)
  if (allowedRoles.includes('viewer')) {
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('is_public, privacy_setting')
      .eq('id', tripId)
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
      return { allowed: true, role: 'viewer' };
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
    .from('trips')
    .select('id, created_by, is_public, privacy_setting')
    .eq('id', tripId)
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
    .from('trip_members')
    .select('role')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
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

  // Define the expected member type
  type MemberData = { role: string };

  const role = member && 'role' in member ? ((member as MemberData).role as TripRole) : null;
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
  if (role === 'admin') {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canManage = true;
    permissions.canAddMembers = true;
    permissions.canDeleteTrip = isCreator; // Only creator can delete
  } else if (role === 'editor') {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canAddMembers = true;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  } else if (role === 'contributor') {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canAddMembers = false;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  } else if (role === 'viewer') {
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
 * @param allowedRoles Array of roles that are allowed to perform the action
 * @returns NextResponse with error or null if access is allowed
 */
export async function ensureTripAccess(
  userId: string,
  tripId: string,
  allowedRoles: TripRole[] = ['admin', 'editor']
): Promise<NextResponse | null> {
  try {
    const accessResult = await checkTripAccess(userId, tripId, allowedRoles);

    if (!accessResult.allowed) {
      const { message, status } = accessResult.error || {
        message: 'Access denied',
        status: 403,
      };
      return NextResponse.json({ error: message }, { status });
    }

    return null; // No error, access is allowed
  } catch (error) {
    console.error(
      `[ensureTripAccess] Error checking access: ${error instanceof Error ? error.message : String(error)}`
    );
    return NextResponse.json({ error: 'An error occurred while checking access' }, { status: 500 });
  }
}

/**
 * Get the role of a user in a specific trip.
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @returns The role of the user in the trip, or null if the user is not a member
 */
export async function getUserTripRole(userId: string, tripId: string): Promise<TripRole | null> {
  if (!supabaseAdmin) {
    console.error('[getUserTripRole] Supabase client not initialized.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('trip_members')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[getUserTripRole] Error:', error);
      return null;
    }

    // Define the expected data type
    type MemberData = { role: string };

    return data && 'role' in data ? ((data as MemberData).role as TripRole) : null;
  } catch (error) {
    console.error('[getUserTripRole] Unexpected error:', error);
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
  const role = await getUserTripRole(userId, tripId);

  if (!role) {
    return false;
  }

  // Users with these roles can edit the trip
  return ['admin', 'editor', 'contributor'].includes(role);
}
