'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface FocusSessionParticipant {
  id: string;
  name: string;
  avatar_url: string | null;
  joined_at: string;
}

interface FocusSession {
  id: string;
  trip_id: string;
  initiated_by: string;
  section_id: string | null;
  section_path: string | null;
  section_name: string | null;
  active: boolean;
  message: string;
  created_at: string;
  expires_at: string | null;
  participants: FocusSessionParticipant[];
  has_joined: boolean;
}

interface FocusSessionOptions {
  tripId: string;
  sectionId?: string;
  sectionPath?: string;
  sectionName?: string;
  message?: string;
  expiresIn?: number;
}

export interface FocusSessionContextType {
  loading: boolean;
  activeFocusSession: FocusSession | null;
  isLoading: boolean;
  error: Error | null;
  initializeFocusSession: (tripId: string) => void;
  startFocusSession: (options: FocusSessionOptions) => Promise<void>;
  endFocusSession: (sessionId: string) => Promise<void>;
  joinFocusSession: (sessionId: string) => Promise<void>;
  leaveFocusSession: (sessionId: string) => Promise<void>;
}

const FocusSessionContext = createContext<FocusSessionContextType>({
  activeFocusSession: null,
  isLoading: false,
  error: null,
  initializeFocusSession: () => {},
  startFocusSession: async () => {},
  endFocusSession: async () => {},
  joinFocusSession: async () => {},
  leaveFocusSession: async () => {},
  loading: false,
});

export function FocusSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeFocusSession, setActiveFocusSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize focus session for a trip
  const initializeFocusSession = useCallback((tripId: string) => {
    setIsLoading(true);

    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      // Comment out for stub implementation
      // setActiveFocusSession(mockFocusSession);
    }, 500);

    // Return cleanup function
    return () => {
      // Cleanup subscription
    };
  }, []);

  // Start a new focus session
  const startFocusSession = useCallback(async (options: FocusSessionOptions) => {
    setIsLoading(true);
    try {
      // Implementation stub
      console.log('Starting focus session with options:', options);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  // End an active focus session
  const endFocusSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Implementation stub
      console.log('Ending focus session:', sessionId);
      setActiveFocusSession(null);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  // Join a focus session
  const joinFocusSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Implementation stub
      console.log('Joining focus session:', sessionId);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  // Leave a focus session
  const leaveFocusSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Implementation stub
      console.log('Leaving focus session:', sessionId);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      activeFocusSession,
      isLoading,
      error,
      initializeFocusSession,
      startFocusSession,
      endFocusSession,
      joinFocusSession,
      leaveFocusSession,
      loading: isLoading,
    }),
    [
      activeFocusSession,
      isLoading,
      error,
      initializeFocusSession,
      startFocusSession,
      endFocusSession,
      joinFocusSession,
      leaveFocusSession,
    ]
  );

  return <FocusSessionContext.Provider value={value}>{children}</FocusSessionContext.Provider>;
}

export function useFocusSession() {
  return useContext(FocusSessionContext);
}
