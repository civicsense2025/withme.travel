/**
 * Trip Management API Client
 * 
 * Client-side wrapper for Trip Management API endpoints
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import { handleApiResponse } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Trip member types
 */
export type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

/**
 * Trip member structure
 */
export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  created_at: string;
  user?: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  };
}

/**
 * Trip access request structure
 */
export interface TripAccessRequest {
  id: string;
  trip_id: string;
  user_id: string;
  requested_role: TripRole;
  status: 'pending' | 'approved' | 'rejected';
  resolved_by?: string | null;
  created_at: string;
  updated_at: string | null;
  user?: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
  };
}

/**
 * Trip invitation structure
 */
export interface TripInvitation {
  id: string;
  trip_id: string;
  email: string;
  role: TripRole;
  status: 'pending' | 'accepted' | 'rejected';
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * Get trip members
 */
export async function getTripMembers(tripId: string): Promise<Result<TripMember[]>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_MEMBERS(tripId), {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<TripMember[]>(response))
  );
}

/**
 * Add a trip member
 */
export async function addTripMember(
  tripId: string,
  userId: string,
  role: TripRole
): Promise<Result<TripMember>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_MEMBERS(tripId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, role }),
    }).then((response) => handleApiResponse<TripMember>(response))
  );
}

/**
 * Update a trip member's role
 */
export async function updateTripMember(
  tripId: string,
  userId: string,
  role: TripRole
): Promise<Result<TripMember>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    }).then((response) => handleApiResponse<TripMember>(response))
  );
}

/**
 * Remove a trip member
 */
export async function removeTripMember(
  tripId: string,
  userId: string
): Promise<Result<{ success: boolean }>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/${userId}`, {
      method: 'DELETE',
    }).then((response) => handleApiResponse<{ success: boolean }>(response))
  );
}

/**
 * Send trip invitation
 */
export async function sendTripInvitation(
  tripId: string,
  email: string,
  role: TripRole
): Promise<Result<TripInvitation>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_MEMBER_INVITE(tripId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, role }),
    }).then((response) => handleApiResponse<TripInvitation>(response))
  );
}

/**
 * Get trip access requests
 */
export async function getTripAccessRequests(tripId: string): Promise<Result<TripAccessRequest[]>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_ACCESS_REQUEST(tripId), {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<TripAccessRequest[]>(response))
  );
}

/**
 * Respond to trip access request
 */
export async function respondToAccessRequest(
  tripId: string,
  requestId: string,
  approved: boolean,
  reason?: string
): Promise<Result<TripAccessRequest>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIP_ACCESS_REQUEST(tripId)}/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: approved ? 'approved' : 'rejected',
        reason 
      }),
    }).then((response) => handleApiResponse<TripAccessRequest>(response))
  );
}

/**
 * Transfer trip ownership
 */
export async function transferTripOwnership(
  tripId: string,
  newOwnerId: string
): Promise<Result<{ success: boolean }>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIP_DETAILS(tripId)}/transfer-ownership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_owner_id: newOwnerId }),
    }).then((response) => handleApiResponse<{ success: boolean }>(response))
  );
} 