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
  type Note
} from '@/lib/client/notes';
import { isSuccess } from '@/utils/result';

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

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing trip notes
 */
export function useNotes(tripId: string, options: UseNotesOptions = {}): UseNotesReturn {
  const { fetchOnMount = true } = options;
  const { toast } = useToast();

  // State
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  /**
   * Fetch trip notes
   */
  const fetchNotes = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    const result = await getTripNotes(tripId);

    if (isSuccess(result)) {
      setContent(result.data.content || '');
    } else {
      // If notes don't exist yet, create empty notes
      const errorMessage = result.error.toString();
      if (errorMessage.toLowerCase().includes('not found')) {
        const createResult = await createTripNotes(tripId);
        if (isSuccess(createResult)) {
          setContent(createResult.data.content || '');
        } else {
          const createErrorMsg = createResult.error.toString();
          setError(createErrorMsg);
          toast({
            title: 'Error loading notes',
            description: createErrorMsg,
            variant: 'destructive',
          });
        }
      } else {
        setError(errorMessage);
        toast({
          title: 'Error loading notes',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }

    setIsLoading(false);
  }, [tripId, toast]);

  /**
   * Fetch collaboration session info
   */
  const fetchCollaborationSession = useCallback(async () => {
    if (!tripId) return;

    setIsSessionLoading(true);
    setSessionError(null);

    const result = await getCollaborativeSession(tripId);

    if (isSuccess(result)) {
      setSessionId(result.data.sessionId);
      setAccessToken(result.data.accessToken);
    } else {
      const errorMessage = result.error.toString();
      setSessionError(errorMessage);
      toast({
        title: 'Collaborative editing unavailable',
        description: 'Using offline mode for notes',
        variant: 'default',
      });
    }

    setIsSessionLoading(false);
  }, [tripId, toast]);

  /**
   * Update notes content
   */
  const updateContent = useCallback(async (newContent: string) => {
    if (!tripId) return;

    setIsSaving(true);
    setError(null);

    // Optimistically update local state
    setContent(newContent);

    const result = await updateTripNotes(tripId, newContent);

    if (!isSuccess(result)) {
      const errorMessage = result.error.toString();
      setError(errorMessage);
      toast({
        title: 'Error saving notes',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    setIsSaving(false);
  }, [tripId, toast]);

  // Load notes on mount if requested
  useEffect(() => {
    if (fetchOnMount) {
      fetchNotes();
      fetchCollaborationSession();
    }
  }, [fetchOnMount, fetchNotes, fetchCollaborationSession]);

  return {
    content,
    isLoading,
    isSaving,
    error,
    updateContent,
    refresh: fetchNotes,
    collaborationSession: {
      sessionId,
      accessToken,
      isLoading: isSessionLoading,
      error: sessionError,
    }
  };
} 