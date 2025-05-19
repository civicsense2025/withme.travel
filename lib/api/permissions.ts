/**
 * Permissions API
 *
 * Provides CRUD operations and custom actions for permission requests, access, and status updates.
 * Used for managing user permissions and access control for trips.
 *
 * @module lib/api/permissions
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, PermissionRequest } from './_shared';
import { PermissionCheck } from '@/app/api/trips/[tripId]/permissions/route';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all permission requests for a trip.
 * @param tripId - The trip's unique identifier
 * @returns Result containing an array of permission requests
 */
export async function listPermissionRequests(tripId: string): Promise<Result<PermissionRequest[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .select('*')
      .eq('trip_id', tripId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch permission requests');
  }
}

/**
 * Get a single permission request by trip and request ID.
 * @param tripId - The trip's unique identifier
 * @param requestId - The permission request's unique identifier
 * @returns Result containing the permission request
 */
export async function getPermissionRequest(
  tripId: string,
  requestId: string
): Promise<Result<PermissionRequest>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', requestId)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch permission request');
  }
}

/**
 * Create a new permission request for a trip.
 * @param tripId - The trip's unique identifier
 * @param data - The permission request data
 * @returns Result containing the created permission request
 */
export async function createPermissionRequest(
  tripId: string,
  data: Partial<PermissionRequest>
): Promise<Result<PermissionRequest>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Ensure trip_id is set
    const requestData = {
      ...data,
      trip_id: tripId,
      status: 'pending', // Default status
      created_at: new Date().toISOString(),
    };

    const { data: newRequest, error } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .insert(requestData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newRequest };
  } catch (error) {
    return handleError(error, 'Failed to create permission request');
  }
}

/**
 * Update an existing permission request.
 * @param tripId - The trip's unique identifier
 * @param requestId - The permission request's unique identifier
 * @param data - Partial permission request data to update
 * @returns Result containing the updated permission request
 */
export async function updatePermissionRequest(
  tripId: string,
  requestId: string,
  data: Partial<PermissionRequest>
): Promise<Result<PermissionRequest>> {
  try {
    const supabase = await createRouteHandlerClient();

    // Update timestamp
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedRequest, error } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .update(updateData)
      .eq('trip_id', tripId)
      .eq('id', requestId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedRequest };
  } catch (error) {
    return handleError(error, 'Failed to update permission request');
  }
}

/**
 * Delete a permission request from a trip.
 * @param tripId - The trip's unique identifier
 * @param requestId - The permission request's unique identifier
 * @returns Result indicating success or failure
 */
export async function deletePermissionRequest(
  tripId: string,
  requestId: string
): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .delete()
      .eq('trip_id', tripId)
      .eq('id', requestId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete permission request');
  }
}

// ============================================================================
// CUSTOM ACTIONS
// ============================================================================

/**
 * Approve a permission request for a trip.
 * @param tripId - The trip's unique identifier
 * @param requestId - The permission request's unique identifier
 * @param resolvedBy - ID of the user who approved the request
 * @returns Result indicating success or failure
 */
export async function approvePermissionRequest(
  tripId: string,
  requestId: string,
  resolvedBy: string
): Promise<Result<PermissionRequest>> {
  try {
    const supabase = await createRouteHandlerClient();

    // First, get the request to check if it exists and is pending
    const { data: request, error: fetchError } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', requestId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (!request) {
      return { success: false, error: 'Permission request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: `Request is already ${request.status}` };
    }

    // Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .update({
        status: 'approved',
        resolved_by: resolvedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Add the user to trip members with the requested role
    const { error: memberError } = await supabase.from(TABLES.TRIP_MEMBERS).insert({
      trip_id: tripId,
      user_id: request.user_id,
      role: request.requested_role,
      joined_at: new Date().toISOString(),
      invited_by: resolvedBy,
      status: 'active',
    });

    if (memberError) {
      // Revert the approval if member creation fails
      await supabase
        .from(TABLES.ACCESS_REQUESTS)
        .update({
          status: 'pending',
          resolved_by: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      return { success: false, error: memberError.message };
    }

    return { success: true, data: updatedRequest };
  } catch (error) {
    return handleError(error, 'Failed to approve permission request');
  }
}

/**
 * Reject a permission request for a trip.
 * @param tripId - The trip's unique identifier
 * @param requestId - The permission request's unique identifier
 * @param resolvedBy - ID of the user who rejected the request
 * @param reason - Optional reason for rejection
 * @returns Result indicating success or failure
 */
export async function rejectPermissionRequest(
  tripId: string,
  requestId: string,
  resolvedBy: string,
  reason?: string
): Promise<Result<PermissionRequest>> {
  try {
    const supabase = await createRouteHandlerClient();

    // First, check if the request exists and is pending
    const { data: request, error: fetchError } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', requestId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (!request) {
      return { success: false, error: 'Permission request not found' };
    }

    if (request.status !== 'pending') {
      return { success: false, error: `Request is already ${request.status}` };
    }

    // Update the request status
    const { data: updatedRequest, error: updateError } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .update({
        status: 'rejected',
        resolved_by: resolvedBy,
        message: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select('*')
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, data: updatedRequest };
  } catch (error) {
    return handleError(error, 'Failed to reject permission request');
  }
}

/**
 * Check a user's permission status for a trip.
 * @param tripId - The trip's unique identifier
 * @param userId - The user's unique identifier
 * @returns Result indicating the user's permission status
 */
export async function checkPermissionStatus(
  tripId: string,
  userId: string
): Promise<
  Result<{
    hasAccess: boolean;
    role?: string;
    pendingRequest?: boolean;
    isOwner?: boolean;
  }>
> {
  try {
    const supabase = await createRouteHandlerClient();

    // Check if user is a trip member
    const { data: memberData, error: memberError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select('role, status')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single();

    if (memberData) {
      // User is a member
      const hasAccess = memberData.status === 'active';
      return {
        success: true,
        data: {
          hasAccess,
          role: memberData.role,
          isOwner: memberData.role === 'admin',
        },
      };
    }

    // Check if the user is the trip owner/creator
    const { data: tripData, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('created_by')
      .eq('id', tripId)
      .single();

    if (tripData && tripData.created_by === userId) {
      // User is the trip creator
      return {
        success: true,
        data: {
          hasAccess: true,
          role: 'admin',
          isOwner: true,
        },
      };
    }

    // Check if user has a pending request
    const { data: requestData, error: requestError } = await supabase
      .from(TABLES.ACCESS_REQUESTS)
      .select('status')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    const pendingRequest =
      requestData && requestData.length > 0 && requestData[0].status === 'pending';

    // User has no access
    return {
      success: true,
      data: {
        hasAccess: false,
        pendingRequest: !!pendingRequest,
      },
    };
  } catch (error) {
    return handleError(error, 'Failed to check permission status');
  }
}

/**
 * Get users with access to a trip.
 *
 * @param tripId - The trip's unique identifier
 * @returns Result containing users with their roles
 */
export async function getTripAccessList(tripId: string): Promise<
  Result<
    Array<{
      user_id: string;
      role: string;
      joined_at: string;
      invited_by?: string;
      status: string;
      profile?: any;
    }>
  >
> {
  try {
    const supabase = await createRouteHandlerClient();

    const { data, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select(
        `
        user_id,
        role,
        joined_at,
        invited_by,
        status,
        profiles:user_id(name, avatar_url, email)
      `
      )
      .eq('trip_id', tripId);

    if (error) return { success: false, error: error.message };

    // Transform the data to have profile info nested
    const formattedData = data.map((item) => ({
      ...item,
      profile: item.profiles,
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    return handleError(error, 'Failed to get trip access list');
  }
}

/**
 * Change a user's role for a trip.
 *
 * @param tripId - The trip's unique identifier
 * @param userId - The user's unique identifier
 * @param newRole - The new role to assign
 * @param actorId - ID of the user making the change
 * @returns Result indicating success or failure
 *
 * TODO: Implement role permission verification logic
 * - Check if actor has permission to change roles
 * - Prevent role escalation (e.g., viewer changing someone to admin)
 * - Add audit trail for role changes
 */
export async function changeTripUserRole(
  tripId: string,
  userId: string,
  newRole: string,
  actorId: string
): Promise<
  Result<{
    user_id: string;
    role: string;
  }>
> {
  try {
    const supabase = await createRouteHandlerClient();

    // TODO: Add permission checks here

    const { data, error } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .select('user_id, role')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to change user role');
  }
}

/**
 * Transfer trip ownership to another user.
 *
 * TODO: Implement trip ownership transfer logic
 * - Verify current user is the owner
 * - Update trip's created_by field
 * - Update member roles accordingly
 * - Add confirmation workflow
 * - Send notifications to both users
 */
export async function transferTripOwnership(
  tripId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<Result<null>> {
  // TODO: Implement transfer ownership logic
  return { success: false, error: 'Not implemented yet' };
}

/**
 * Type guard to check if an object is a PermissionRequest
 */
export function isPermissionRequest(obj: any): obj is PermissionRequest {
  return obj && typeof obj.id === 'string' && typeof obj.trip_id === 'string';
}

/**
 * Type guard to check if an object is a PermissionCheck
 */
export function isPermissionCheck(obj: any): obj is PermissionCheck {
  return obj && typeof obj.canView === 'boolean' && typeof obj.role === 'string';
}
