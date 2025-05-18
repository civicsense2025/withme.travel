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
 * Get notes for a trip
 */
export async function getTripNotes(tripId: string): Promise<Result<Note>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_NOTES(tripId), {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<Note>(response))
  );
}

/**
 * Update notes for a trip
 */
export async function updateTripNotes(tripId: string, content: string): Promise<Result<Note>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_NOTES(tripId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    }).then((response) => handleApiResponse<Note>(response))
  );
}

/**
 * Create initial notes for a trip
 */
export async function createTripNotes(tripId: string, content: string = ""): Promise<Result<Note>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_NOTES(tripId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    }).then((response) => handleApiResponse<Note>(response))
  );
}

/**
 * Get collaborative note session information
 */
export async function getCollaborativeSession(tripId: string): Promise<Result<{sessionId: string, accessToken: string}>> {
  return tryCatch(
    fetch(API_ROUTES.TRIP_NOTES_COLLABORATION(tripId), {
      method: 'GET',
      cache: 'no-store',
    }).then((response) => handleApiResponse<{sessionId: string, accessToken: string}>(response))
  );
} 