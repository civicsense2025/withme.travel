import { createClient } from "@/utils/supabase/server";
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from "@/utils/constants/database";
import type { TripRole } from "@/utils/constants/database";
import { errorResponse } from "./api-utils";
import { NextResponse } from "next/server";

export interface TripAccessResult {
  allowed: boolean;
  role?: TripRole;
  error?: string;
  status?: number;
  isPublic?: boolean;
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
    DB_ENUMS.TRIP_ROLES.CONTRIBUTOR
  ]
): Promise<TripAccessResult> {
  const supabase = createClient();
  
  // First check member role
  const { data: member, error: memberError } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
    .select(DB_FIELDS.TRIP_MEMBERS.ROLE)
    .eq(DB_FIELDS.TRIP_MEMBERS.TRIP_ID, tripId)
    .eq(DB_FIELDS.TRIP_MEMBERS.USER_ID, userId)
    .maybeSingle();

  if (memberError) {
    return { 
      allowed: false, 
      error: `Error checking membership: ${memberError.message}`, 
      status: 500 
    };
  }

  if (member?.role && allowedRoles.includes(member.role as TripRole)) {
    return { allowed: true, role: member.role as TripRole };
  }

  // If not a member or doesn't have required role, check if trip is public
  // (only relevant if viewer role is allowed)
  if (allowedRoles.includes(DB_ENUMS.TRIP_ROLES.VIEWER)) {
    const { data: trip, error: tripError } = await supabase
      .from(DB_TABLES.TRIPS)
      .select('is_public, privacy_setting')
      .eq(DB_FIELDS.TRIPS.ID, tripId)
      .single();

    if (tripError) {
      if (tripError.code === 'PGRST116') {
        return { allowed: false, error: "Trip not found", status: 404 };
      }
      return { 
        allowed: false, 
        error: `Error checking trip privacy: ${tripError.message}`, 
        status: 500 
      };
    }

    const isPublic = trip.is_public || 
                     trip.privacy_setting === 'public' || 
                     trip.privacy_setting === 'shared_with_link';
    
    if (isPublic) {
      return { allowed: true, role: DB_ENUMS.TRIP_ROLES.VIEWER, isPublic };
    }
  }

  return { 
    allowed: false, 
    error: "You don't have sufficient permissions for this action", 
    status: 403 
  };
}

/**
 * Get detailed permissions for a user on a trip
 * @param userId User ID to check
 * @param tripId Trip ID to check
 * @returns Detailed permission object
 */
export async function getTripPermissions(userId: string, tripId: string) {
  const supabase = createClient();
  
  // Check if trip exists and get basic info
  const { data: trip, error: tripError } = await supabase
    .from(DB_TABLES.TRIPS)
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
        error: "Trip not found",
        status: 404
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
      status: 500
    };
  }

  // Check if user is a member of this trip
  const { data: member, error: memberError } = await supabase
    .from(DB_TABLES.TRIP_MEMBERS)
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
      status: 500
    };
  }

  const role = member?.role as TripRole | null;
  const isCreator = trip.created_by === userId;
  const isPublic = trip.is_public || 
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
    isPublic
  };

  // Set permissions based on role
  if (role === DB_ENUMS.TRIP_ROLES.ADMIN) {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canManage = true;
    permissions.canAddMembers = true;
    permissions.canDeleteTrip = isCreator; // Only creator can delete
  } 
  else if (role === DB_ENUMS.TRIP_ROLES.EDITOR) {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canAddMembers = true;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  } 
  else if (role === DB_ENUMS.TRIP_ROLES.CONTRIBUTOR) {
    permissions.canView = true;
    permissions.canEdit = true;
    permissions.canAddMembers = false;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  } 
  else if (role === DB_ENUMS.TRIP_ROLES.VIEWER) {
    permissions.canView = true;
    permissions.canEdit = false;
    permissions.canAddMembers = false;
    permissions.canManage = false;
    permissions.canDeleteTrip = false;
  } 
  else if (isPublic) {
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
      accessResult.error || "Access denied", 
      accessResult.status || 403
    );
  }
  
  return null;
} 