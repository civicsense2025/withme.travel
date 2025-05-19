/**
 * Permissions API Client
 *
 * Client-side wrapper for the Permissions API providing type-safe access to permission operations
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { API_SETTINGS } from '@/utils/constants/api';
import { tryCatch } from '@/utils/result';
import type { Result } from '@/utils/result';
import { handleApiResponse } from './index';

// ============================================================================
// TYPES
// ============================================================================

export interface PermissionRequest {
  id: string;
  trip_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_role: string;
  created_at: string;
  updated_at?: string | null;
  message?: string | null;
}

export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canManage: boolean;
  canAddMembers: boolean;
  canDeleteTrip: boolean;
  isCreator: boolean;
  role: string | null;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * List permission requests for a trip
 */
export async function listPermissionRequests(tripId: string): Promise<Result<PermissionRequest[]>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/access-requests`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => handleApiResponse<PermissionRequest[]>(response))
  );
}

/**
 * Get a specific permission request
 */
export async function getPermissionRequest(
  tripId: string,
  requestId: string
): Promise<Result<PermissionRequest>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/access-requests/${requestId}`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => handleApiResponse<PermissionRequest>(response))
  );
}

/**
 * Create a permission request for a trip
 */
export async function createPermissionRequest(
  tripId: string,
  data: { message?: string; requestedRole?: string }
): Promise<Result<PermissionRequest>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/permissions/request`, {
      method: 'POST',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify(data),
    }).then((response) => handleApiResponse<PermissionRequest>(response))
  );
}

/**
 * Approve a permission request
 */
export async function approvePermissionRequest(
  tripId: string,
  requestId: string
): Promise<Result<PermissionRequest>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/access-requests/${requestId}`, {
      method: 'PATCH',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({ status: 'approved' }),
    }).then((response) => handleApiResponse<PermissionRequest>(response))
  );
}

/**
 * Reject a permission request
 */
export async function rejectPermissionRequest(
  tripId: string,
  requestId: string,
  reason?: string
): Promise<Result<PermissionRequest>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/access-requests/${requestId}`, {
      method: 'PATCH',
      ...API_SETTINGS.DEFAULT_OPTIONS,
      body: JSON.stringify({ status: 'rejected', reason }),
    }).then((response) => handleApiResponse<PermissionRequest>(response))
  );
}

/**
 * Check permissions for the current user on a trip
 */
export async function checkPermissions(tripId: string): Promise<Result<PermissionCheck>> {
  return tryCatch(
    fetch(`/api/trips/${tripId}/get-permissions`, {
      method: 'GET',
      ...API_SETTINGS.DEFAULT_OPTIONS,
    }).then((response) => handleApiResponse<PermissionCheck>(response))
  );
} 