/**
 * Trip Notes Hook
 *
 * React hook for managing trip notes with state management and collaborative editing support
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getTripNotes,
  updateTripNotes,
  createTripNotes,
  getCollaborativeSession,
  type Note,
} from '@/lib/client/notes';
import { isSuccess } from '@/utils/result';
import { tryCatch } from '@/utils/result';
import { API_ROUTES } from '@/utils/constants/routes';
import { Result } from '@/utils/result';

// ============================================================================
// TYPES
// ============================================================================

interface UseNotesOptions {
  /** Whether to fetch notes data when hook mounts */
  fetchOnMount?: boolean;
}

interface UseNotesReturn {
  /** The current notes content */
  content: string;
  /** Whether notes are currently being loaded */
  isLoading: boolean;
  /** Whether notes are currently being saved */
  isSaving: boolean;
  /** Error message if any */
  error: string | null;
  /** Function to update notes content */
  updateContent: (content: string) => Promise<void>;
  /** Function to manually refresh notes data */
  refresh: () => Promise<void>;
  /** Collaboration session info for real-time editing */
  collaborationSession: {
    sessionId: string | null;
    accessToken: string | null;
    isLoading: boolean;
    error: string | null;
  };
}

interface NotesState {
  content: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  collaborationSession: {
    sessionId: string | null;
    accessToken: string | null;
    error: string | null;
  };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing trip notes with collaborative editing support
 */
export function useNotes(tripId: string) {
  const { toast } = useToast();
  const [state, setState] = useState<NotesState>({
    content: '',
    isLoading: true,
    isSaving: false,
    error: null,
    collaborationSession: {
      sessionId: null,
      accessToken: null,
      error: null,
    },
  });

  // Fetch notes content when tripId changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!tripId) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`${API_ROUTES.TRIPS}/${tripId}/notes`);

        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }

        const data = await response.json();
        setState((prev) => ({
          ...prev,
          content: data.content || '',
          isLoading: false,
          collaborationSession: {
            sessionId: data.collaborationSession?.sessionId || null,
            accessToken: data.collaborationSession?.accessToken || null,
            error: null,
          },
        }));
      } catch (error) {
        console.error('Error fetching notes:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch notes',
          collaborationSession: {
            ...prev.collaborationSession,
            error: 'Failed to establish collaborative session',
          },
        }));
      }
    };

    fetchNotes();
  }, [tripId]);

  // Update notes content
  const updateContent = useCallback(
    async (newContent: string) => {
      if (!tripId) return;

      setState((prev) => ({ ...prev, isSaving: true }));

      try {
        const response = await fetch(`${API_ROUTES.TRIPS}/${tripId}/notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newContent }),
        });

        if (!response.ok) {
          throw new Error('Failed to update notes');
        }

        setState((prev) => ({
          ...prev,
          content: newContent,
          isSaving: false,
        }));

        return { success: true };
      } catch (error) {
        console.error('Error updating notes:', error);
        setState((prev) => ({
          ...prev,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Failed to update notes',
        }));

        toast({
          title: 'Failed to save notes',
          description: "Your changes couldn't be saved. Please try again.",
          variant: 'destructive',
        });

        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
    [tripId, toast]
  );

  // Function to create a new personal note
  const createPersonalNote = useCallback(
    async (title: string, content: string = ''): Promise<Result<any>> => {
      if (!tripId) {
        return { success: false, error: 'No trip ID provided' };
      }

      return tryCatch(
        fetch(`${API_ROUTES.TRIPS}/${tripId}/personal-notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content }),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create personal note');
          }
          return response.json();
        })
      );
    },
    [tripId]
  );

  // Function to update a personal note
  const updatePersonalNote = useCallback(
    async (noteId: string, title: string, content: string): Promise<Result<any>> => {
      if (!tripId) {
        return { success: false, error: 'No trip ID provided' };
      }

      return tryCatch(
        fetch(`${API_ROUTES.TRIPS}/${tripId}/personal-notes/${noteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, content }),
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update personal note');
          }
          return response.json();
        })
      );
    },
    [tripId]
  );

  // Function to delete a personal note
  const deletePersonalNote = useCallback(
    async (noteId: string): Promise<Result<any>> => {
      if (!tripId) {
        return { success: false, error: 'No trip ID provided' };
      }

      return tryCatch(
        fetch(`${API_ROUTES.TRIPS}/${tripId}/personal-notes/${noteId}`, {
          method: 'DELETE',
        }).then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete personal note');
          }
          return response.json();
        })
      );
    },
    [tripId]
  );

  return {
    content: state.content,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    collaborationSession: state.collaborationSession,
    updateContent,
    createPersonalNote,
    updatePersonalNote,
    deletePersonalNote,
  };
}
