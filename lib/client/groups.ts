/**
 * Groups API client functions
 *
 * Client-side wrappers for group-related API calls
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { Result, tryCatch } from '@/lib/client/result';

// ============================================================================
// TYPES
// ============================================================================

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  visibility: 'public' | 'private' | 'unlisted';
  created_by: string;
  image_url?: string;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  visibility?: 'public' | 'private' | 'unlisted';
  image_url?: string;
}

export interface GroupsListResponse {
  groups: Group[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * List all groups the user is a member of
 */
export async function listGroups(guestToken?: string): Promise<Result<GroupsListResponse>> {
  const queryString = guestToken ? `?guestToken=${guestToken}` : '';

  return tryCatch(
    fetch(`/api/groups${queryString}`, {
      method: 'GET',
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch groups');
      }
      return response.json();
    })
  );
}

/**
 * Get a specific group by ID
 */
export async function getGroup(id: string, guestToken?: string): Promise<Result<Group>> {
  const queryString = guestToken ? `?guestToken=${guestToken}` : '';

  return tryCatch(
    fetch(`/api/groups/${id}${queryString}`, {
      method: 'GET',
      cache: 'no-store',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch group');
      }
      return response.json();
    })
  );
}

/**
 * Create a new group
 */
export async function createGroup(data: CreateGroupData): Promise<Result<Group>> {
  return tryCatch(
    fetch('/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create group');
      }
      return response.json();
    })
  );
}

/**
 * Update an existing group
 */
export async function updateGroup(id: string, data: UpdateGroupData): Promise<Result<Group>> {
  return tryCatch(
    fetch(`/api/groups/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update group');
      }
      return response.json();
    })
  );
}

/**
 * Delete a group
 */
export async function deleteGroup(id: string): Promise<Result<void>> {
  return tryCatch(
    fetch(`/api/groups/${id}`, {
      method: 'DELETE',
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete group');
      }
    })
  );
}

/**
 * Type guard to check if an object is a Group
 */
export function isGroup(obj: any): obj is Group {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}
