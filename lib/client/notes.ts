/**
 * Notes API Client
 *
 * Client-side wrapper for Notes API endpoints
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
 * Note structure returned from API
 */
export interface Note {
  id?: string;
  trip_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  version?: number;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * Get collaborative notes for a trip
 */
export async function getTripNotes(tripId: string): Promise<Result<{ content: string }>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS}/${tripId}/notes`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<{ content: string }>(response))
  );
}

/**
 * Update collaborative notes for a trip
 */
export async function updateTripNotes(
  tripId: string,
  content: string
): Promise<Result<{ content: string }>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS}/${tripId}/notes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    }).then((response) => handleApiResponse<{ content: string }>(response))
  );
}

/**
 * Create collaborative notes for a trip
 */
export async function createTripNotes(tripId: string): Promise<Result<{ content: string }>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS}/${tripId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: '' }),
    }).then((response) => handleApiResponse<{ content: string }>(response))
  );
}

/**
 * Get collaboration session for a trip
 */
export async function getCollaborativeSession(tripId: string): Promise<
  Result<{
    sessionId: string;
    accessToken: string;
  }>
> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS}/${tripId}/notes/session`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) =>
      handleApiResponse<{
        sessionId: string;
        accessToken: string;
      }>(response)
    )
  );
}

/**
 * Get all personal notes for a trip
 */
export async function listPersonalNotes(tripId: string): Promise<
  Result<
    Array<{
      id: string;
      title: string;
      content: string;
      createdAt: string;
      updatedAt: string;
    }>
  >
> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS}/${tripId}/personal-notes`, {
      method: 'GET',
      cache: 'no-store',
    }).then((response) =>
      handleApiResponse<
        Array<{
          id: string;
          title: string;
          content: string;
          createdAt: string;
          updatedAt: string;
        }>
      >(response)
    )
  );
}

/**
 * Create a personal note for a trip
 */
export async function createPersonalNote(
  tripId: string,
  title: string,
  content: string = ''
): Promise<
  Result<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>
> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS}/${tripId}/personal-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    }).then((response) =>
      handleApiResponse<{
        id: string;
        title: string;
        content: string;
        createdAt: string;
        updatedAt: string;
      }>(response)
    )
  );
}

/**
 * Update a personal note
 */
export async function updatePersonalNote(
  tripId: string,
  noteId: string,
  title: string,
  content: string
): Promise<
  Result<{
    id: string;
    title: string;
    content: string;
    updatedAt: string;
  }>
> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS}/${tripId}/personal-notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    }).then((response) =>
      handleApiResponse<{
        id: string;
        title: string;
        content: string;
        updatedAt: string;
      }>(response)
    )
  );
}

/**
 * Delete a personal note
 */
export async function deletePersonalNote(
  tripId: string,
  noteId: string
): Promise<Result<{ success: boolean }>> {
  return tryCatch(
    fetch(`${API_ROUTES.TRIPS}/${tripId}/personal-notes/${noteId}`, {
      method: 'DELETE',
    }).then((response) => handleApiResponse<{ success: boolean }>(response))
  );
}
