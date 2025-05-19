/**
 * Trip Members API Client
 *
 * Client-side wrapper for the Trip Members API providing type-safe access to member operations
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_ROUTES } from '@/utils/constants/routes';
import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Trip Member type definition
 */
export interface TripMember {
  trip_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'invited' | 'removed';
  joined_at?: string;
  invited_at?: string;
  invited_by?: string;
  display_name?: string;
  avatar_url?: string;
  email?: string;
}

/**
 * Data for adding a new trip member
 */
export interface AddTripMemberData {
  email: string;
  role?: 'admin' | 'editor' | 'viewer';
  display_name?: string;
}

/**
 * Data for updating a trip member
 */
export interface UpdateTripMemberData {
  role?: 'admin' | 'editor' | 'viewer';
  status?: 'active' | 'invited' | 'removed';
  display_name?: string;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * List members for a trip
 */
export async function listTripMembers(tripId: string): Promise<Result<TripMember[]>> {
  if (!tripId) {
    return {
      success: false,
      error: new Error('Trip ID is required'),
    };
  }

  return tryCatch(
    fetch(API_ROUTES.TRIP_MEMBERS(tripId), {
      method: 'GET',
    }).then((response) => handleApiResponse<TripMember[]>(response))
  );
}

/**
 * Get a specific trip member
 */
export async function getTripMember(tripId: string, userId: string): Promise<Result<TripMember>> {
  if (!tripId || !userId) {
    return {
      success: false,
      error: new Error('Trip ID and User ID are required'),
    };
  }

  return tryCatch(
    fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/${userId}`, {
      method: 'GET',
    }).then((response) => handleApiResponse<TripMember>(response))
  );
}

/**
 * Add a new member to a trip
 */
export async function addTripMember(
  tripId: string,
  data: AddTripMemberData
): Promise<Result<TripMember>> {
  if (!tripId || !data.email) {
    return {
      success: false,
      error: new Error('Trip ID and email are required'),
    };
  }

  return tryCatch(
    fetch(API_ROUTES.TRIP_MEMBER_INVITE(tripId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<TripMember>(response))
  );
}

/**
 * Update an existing trip member
 */
export async function updateTripMember(
  tripId: string,
  userId: string,
  data: UpdateTripMemberData
): Promise<Result<TripMember>> {
  if (!tripId || !userId) {
    return {
      success: false,
      error: new Error('Trip ID and User ID are required'),
    };
  }

  return tryCatch(
    fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<TripMember>(response))
  );
}

/**
 * Remove a member from a trip
 */
export async function removeTripMember(
  tripId: string,
  userId: string
): Promise<Result<{ success: boolean }>> {
  if (!tripId || !userId) {
    return {
      success: false,
      error: new Error('Trip ID and User ID are required'),
    };
  }

  return tryCatch(
    fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/${userId}`, {
      method: 'DELETE',
    }).then((response) => handleApiResponse<{ success: boolean }>(response))
  );
}

/**
 * Import multiple members to a trip
 */
export async function importTripMembers(
  tripId: string,
  members: AddTripMemberData[]
): Promise<Result<{ added: number; invited: number }>> {
  if (!tripId || !members.length) {
    return {
      success: false,
      error: new Error('Trip ID and at least one member are required'),
    };
  }

  return tryCatch(
    fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ members }),
    }).then((response) => handleApiResponse<{ added: number; invited: number }>(response))
  );
}

/**
 * Check if a user has access to a trip
 */
export async function checkTripMemberAccess(
  tripId: string,
  userId: string,
  email?: string
): Promise<Result<{ isMember: boolean; isInvited: boolean }>> {
  if (!tripId || (!userId && !email)) {
    return {
      success: false,
      error: new Error('Trip ID and either User ID or email are required'),
    };
  }

  const queryParams = new URLSearchParams();
  if (userId) queryParams.append('userId', userId);
  if (email) queryParams.append('email', email);

  return tryCatch(
    fetch(`${API_ROUTES.TRIP_MEMBERS(tripId)}/check-access?${queryParams.toString()}`, {
      method: 'GET',
    }).then((response) => handleApiResponse<{ isMember: boolean; isInvited: boolean }>(response))
  );
}

export type { Result } from '@/lib/client/result';
