'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Focus session types
export type FocusSessionStatus = 'idle' | 'active' | 'paused' | 'completed';

interface FocusSession {
  id: string;
  tripId: string;
  status: FocusSessionStatus;
  startedAt: Date | null;
  endedAt: Date | null;
  focusTime: number; // in seconds
  activeParticipants: string[];
}

interface FocusSessionContextType {
  session: FocusSession | null;
  isLoading: boolean;
  error: Error | null;
  startSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: () => Promise<void>;
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
}

const FocusSessionContext = createContext<FocusSessionContextType | null>(null);

interface FocusSessionProviderProps {
  children: ReactNode;
  tripId: string;
}

export function FocusSessionProvider({ children, tripId }: FocusSessionProviderProps) {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startSession = async () => {
    setIsLoading(true);
    try {
      // Stub: In real implementation, call an API to start a focus session
      setSession({
        id: `focus-${Date.now()}`,
        tripId,
        status: 'active',
        startedAt: new Date(),
        endedAt: null,
        focusTime: 0,
        activeParticipants: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to start session'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const pauseSession = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      // Stub: Update session status
      setSession({
        ...session,
        status: 'paused',
  });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to pause session'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const resumeSession = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      // Stub: Update session status
      setSession({
        ...session,
        status: 'active',
  });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to resume session'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const endSession = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      // Stub: End the session
      setSession({
        ...session,
        status: 'completed',
        endedAt: new Date()
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to end session'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const joinSession = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      // Stub: Join an existing session
      // In real implementation, would add user to activeParticipants
      setSession({
        ...session,
        activeParticipants: [...session.activeParticipants, 'current-user-id']
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to join session'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const leaveSession = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      // Stub: Leave a session
      // In real implementation, would remove user from activeParticipants
      setSession({
        ...session,
        activeParticipants: session.activeParticipants.filter(id => id !== 'current-user-id')
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to leave session'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create context value
  const value: FocusSessionContextType = {
    session,
    isLoading,
    error,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    joinSession,
    leaveSession,
  };
  
  return (
    <FocusSessionContext.Provider value={value}>
      {children}
    </FocusSessionContext.Provider>
  );
}

export function useFocusSession() {
  const context = useContext(FocusSessionContext);
  if (!context) {
    throw new Error('useFocusSession must be used within a FocusSessionProvider');
  }
  
  return context;
}