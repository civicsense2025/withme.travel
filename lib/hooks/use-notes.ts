/**
 * useNotes Hook
 *
 * Custom React hook for managing trip notes with full CRUD capabilities,
 * collaborative editing, and loading states.
 *
 * @module hooks/use-notes
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getTripNotes,
  updateTripNotes,
  createTripNotes,
  getCollaborativeSession,
  listPersonalNotes,
  createPersonalNote,
  updatePersonalNote,
  deletePersonalNote,
} from '@/lib/client/notes';
import type { Result } from '@/lib/client/result';
import type { Note } from '@/lib/client/notes';

/**
 * Parameters for using the notes hook
 */
export interface UseNotesParams {
  /** The trip ID the notes are for */
  tripId: string;
  /** Whether to fetch shared notes on component mount */
  fetchOnMount?: boolean;
  /** Whether to include personal notes */
  includePersonalNotes?: boolean;
}

/**
 * useNotes hook for managing trip notes
 * @param params - Hook parameters
 * @returns Object with notes, loading states, error handling, and CRUD operations
 */
export function useNotes({
  tripId,
  fetchOnMount = true,
  includePersonalNotes = false,
}: UseNotesParams) {
  // State
  const [sharedNotes, setSharedNotes] = useState<{ content: string } | null>(null);
  const [personalNotes, setPersonalNotes] = useState<Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [collaborativeSession, setCollaborativeSession] = useState<{
    sessionId: string;
    accessToken: string;
  } | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPersonalNotes, setIsLoadingPersonalNotes] = useState(false);
  const [isCreatingPersonalNote, setIsCreatingPersonalNote] = useState(false);
  const [isUpdatingPersonalNote, setIsUpdatingPersonalNote] = useState(false);
  const [isDeletingPersonalNote, setIsDeletingPersonalNote] = useState(false);

  const { toast } = useToast();

  // Fetch shared notes for the trip
  const fetchSharedNotes = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getTripNotes(tripId);
      
      if (result.success) {
        setSharedNotes(result.data);
      } else {
        // If notes don't exist yet, create them
        if (result.error === 'Notes not found') {
          const createResult = await createTripNotes(tripId);
          if (createResult.success) {
            setSharedNotes(createResult.data);
          } else {
            setError(createResult.error);
            toast({
              title: 'Failed to create notes',
              description: createResult.error,
              variant: 'destructive',
            });
          }
        } else {
          setError(result.error);
          toast({
            title: 'Failed to load notes',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({
        title: 'Failed to load notes',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  // Fetch personal notes for the trip
  const fetchPersonalNotes = useCallback(async () => {
    if (!tripId || !includePersonalNotes) return;

    setIsLoadingPersonalNotes(true);
    setError(null);

    try {
      const result = await listPersonalNotes(tripId);
      
      if (result.success) {
        setPersonalNotes(result.data);
      } else {
        setError(result.error);
        toast({
          title: 'Failed to load personal notes',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({
        title: 'Failed to load personal notes',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPersonalNotes(false);
    }
  }, [tripId, includePersonalNotes, toast]);

  // Setup collaborative editing session
  const setupCollaborativeSession = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCollaborativeSession(tripId);
      
      if (result.success) {
        setCollaborativeSession(result.data);
      } else {
        setError(result.error);
        toast({
          title: 'Failed to setup collaborative editing',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({
        title: 'Failed to setup collaborative editing',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, toast]);

  // Save shared notes
  const saveSharedNotes = useCallback(
    async (content: string) => {
      if (!tripId) return;

      setIsSaving(true);
      setError(null);

      try {
        const result = await updateTripNotes(tripId, content);
        
        if (result.success) {
          setSharedNotes(result.data);
          toast({
            title: 'Notes saved',
            description: 'Your changes have been saved successfully.',
          });
          return result;
        } else {
          setError(result.error);
          toast({
            title: 'Failed to save notes',
            description: result.error,
            variant: 'destructive',
          });
          return { success: false as const, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to save notes',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsSaving(false);
      }
    },
    [tripId, toast]
  );

  // Create a personal note
  const addPersonalNote = useCallback(
    async (title: string, content: string = '') => {
      if (!tripId) return;

      setIsCreatingPersonalNote(true);
      setError(null);

      try {
        const result = await createPersonalNote(tripId, title, content);
        
        if (result.success) {
          setPersonalNotes((prev) => [...prev, result.data]);
          toast({
            title: 'Note created',
            description: 'Your personal note has been created.',
          });
          return result;
        } else {
          setError(result.error);
          toast({
            title: 'Failed to create note',
            description: result.error,
            variant: 'destructive',
          });
          return { success: false as const, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to create note',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsCreatingPersonalNote(false);
      }
    },
    [tripId, toast]
  );

  // Update a personal note
  const editPersonalNote = useCallback(
    async (noteId: string, title: string, content: string) => {
      if (!tripId) return;

      setIsUpdatingPersonalNote(true);
      setError(null);

      try {
        const result = await updatePersonalNote(tripId, noteId, title, content);
        
        if (result.success) {
          setPersonalNotes((prev) =>
            prev.map((note) => (note.id === noteId ? {
              ...result.data,
              createdAt: note.createdAt // Preserve the createdAt field from the previous note
            } : note))
          );
          toast({
            title: 'Note updated',
            description: 'Your personal note has been updated.',
          });
          return result;
        } else {
          setError(result.error);
          toast({
            title: 'Failed to update note',
            description: result.error,
            variant: 'destructive',
          });
          return { success: false as const, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to update note',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsUpdatingPersonalNote(false);
      }
    },
    [tripId, toast]
  );

  // Delete a personal note
  const removePersonalNote = useCallback(
    async (noteId: string) => {
      if (!tripId) return;

      setIsDeletingPersonalNote(true);
      setError(null);

      try {
        const result = await deletePersonalNote(tripId, noteId);
        
        if (result.success) {
          setPersonalNotes((prev) => prev.filter((note) => note.id !== noteId));
          toast({
            title: 'Note deleted',
            description: 'Your personal note has been deleted.',
          });
          return result;
        } else {
          setError(result.error);
          toast({
            title: 'Failed to delete note',
            description: result.error,
            variant: 'destructive',
          });
          return { success: false as const, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to delete note',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false as const, error: errorMessage };
      } finally {
        setIsDeletingPersonalNote(false);
      }
    },
    [tripId, toast]
  );

  // Fetch notes on mount if enabled
  useEffect(() => {
    if (fetchOnMount && tripId) {
      fetchSharedNotes();
      if (includePersonalNotes) {
        fetchPersonalNotes();
      }
    }
  }, [fetchOnMount, tripId, includePersonalNotes, fetchSharedNotes, fetchPersonalNotes]);

  return {
    // Data
    sharedNotes,
    personalNotes,
    error,
    collaborativeSession,

    // Loading states
    isLoading,
    isSaving,
    isLoadingPersonalNotes,
    isCreatingPersonalNote,
    isUpdatingPersonalNote,
    isDeletingPersonalNote,

    // Actions
    fetchSharedNotes,
    fetchPersonalNotes,
    setupCollaborativeSession,
    saveSharedNotes,
    addPersonalNote,
    editPersonalNote,
    removePersonalNote,
  };
} 