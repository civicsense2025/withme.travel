'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth-provider';

// Types
export interface FocusSessionParticipant {
  id: string;
  name: string;
  avatar_url: string | null;
  joined_at: string;
}

export interface FocusSession {
  id: string;
  trip_id: string;
  created_by_id: string;
  current_user_id: string;
  section_path: string;
  created_at: string;
  expires_at: string;
  has_joined: boolean;
  participants: FocusSessionParticipant[];
}

interface FocusSessionContextType {
  activeFocusSession: FocusSession | null;
  loading: boolean;
  error: Error | null;
  startFocusSession: (sectionPath: string) => Promise<void>;
  endFocusSession: () => Promise<void>;
  joinFocusSession: (session: FocusSession) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const FocusSessionContext = createContext<FocusSessionContextType | undefined>(undefined);

interface FocusSessionProviderProps {
  children: ReactNode;
  tripId: string;
}

export function FocusSessionProvider({ children, tripId }: FocusSessionProviderProps) {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [activeFocusSession, setActiveFocusSession] = useState<FocusSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch active focus session
  const refreshSession = useCallback(async () => {
    if (!tripId || !user) {
      setActiveFocusSession(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.from('focus_sessions')
        .select(`
          id,
          trip_id,
          created_by_id,
          section_path,
          created_at,
          expires_at,
          participants:focus_session_participants(
            id,
            user_id,
            joined_at,
            profiles(
              id,
              name,
              avatar_url
            )
          )
        `)
        .eq('trip_id', tripId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;

      if (data) {
        // Format participants
        const participants = data.participants.map((p: any) => ({
          id: p.user_id,
          name: p.profiles.name,
          avatar_url: p.profiles.avatar_url,
          joined_at: p.joined_at
        }));

        // Check if current user has joined
        const hasJoined = participants.some((p: any) => p.id === user.id);

        // Set current user ID for easy comparisons
        setActiveFocusSession({
          ...data,
          has_joined: hasJoined,
          current_user_id: user.id,
          participants
        });
      } else {
        setActiveFocusSession(null);
      }
    } catch (err) {
      console.error('Error fetching focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch focus session'));
    } finally {
      setLoading(false);
    }
  }, [tripId, user, supabase]);

  // Start a new focus session
  const startFocusSession = useCallback(async (sectionPath: string) => {
    if (!tripId || !user) {
      throw new Error('User must be authenticated to start a focus session');
    }

    try {
      setLoading(true);
      
      // Session duration - 30 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      
      // Create the focus session
      const { data: sessionData, error: sessionError } = await supabase
        .from('focus_sessions')
        .insert({
          trip_id: tripId,
          created_by_id: user.id,
          section_path: sectionPath,
          expires_at: expiresAt.toISOString()
        })
        .select('id')
        .single();

      if (sessionError) throw sessionError;
      
      // Add creator as first participant
      const { error: participantError } = await supabase
        .from('focus_session_participants')
        .insert({
          focus_session_id: sessionData.id,
          user_id: user.id
        });
        
      if (participantError) throw participantError;
      
      // Refresh to get the complete session data
      await refreshSession();
    } catch (err) {
      console.error('Error starting focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to start focus session'));
    } finally {
      setLoading(false);
    }
  }, [tripId, user, supabase, refreshSession]);

  // Join an existing focus session
  const joinFocusSession = useCallback(async (session: FocusSession) => {
    if (!user) {
      throw new Error('User must be authenticated to join a focus session');
    }

    try {
      setLoading(true);
      
      // Add user as a participant
      const { error: participantError } = await supabase
        .from('focus_session_participants')
        .insert({
          focus_session_id: session.id,
          user_id: user.id
        });
        
      if (participantError) throw participantError;
      
      // Refresh to get the updated session data
      await refreshSession();
    } catch (err) {
      console.error('Error joining focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to join focus session'));
    } finally {
      setLoading(false);
    }
  }, [user, supabase, refreshSession]);

  // End a focus session (only creator can do this)
  const endFocusSession = useCallback(async () => {
    if (!activeFocusSession || !user) {
      return;
    }

    if (activeFocusSession.created_by_id !== user.id) {
      throw new Error('Only the session creator can end the focus session');
    }

    try {
      setLoading(true);
      
      // Set expires_at to now to end the session
      const { error } = await supabase
        .from('focus_sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', activeFocusSession.id);
        
      if (error) throw error;
      
      // Refresh to clear the active session
      setActiveFocusSession(null);
    } catch (err) {
      console.error('Error ending focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to end focus session'));
    } finally {
      setLoading(false);
    }
  }, [activeFocusSession, user, supabase]);

  // Set up real-time subscription
  useEffect(() => {
    if (!supabase || !tripId) return;

    // Subscribe to focus session changes
    const subscription = supabase
      .channel('focus_session_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'focus_sessions',
          filter: `trip_id=eq.${tripId}`
        },
        () => {
          refreshSession();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'focus_session_participants'
        },
        () => {
          refreshSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase, tripId, refreshSession]);

  // Initial fetch
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value = {
    activeFocusSession,
    loading,
    error,
    startFocusSession,
    endFocusSession,
    joinFocusSession,
    refreshSession
  };

  return (
    <FocusSessionContext.Provider value={value}>
      {children}
    </FocusSessionContext.Provider>
  );
}

export function useFocusSession(tripId?: string) {
  const context = useContext(FocusSessionContext);
  
  // If tripId is provided but we're not inside a provider, create a new instance
  if (!context && tripId) {
    throw new Error('useFocusSession must be used with a tripId or within a FocusSessionProvider');
  }
  
  if (!context) {
    throw new Error('useFocusSession must be used within a FocusSessionProvider');
  }
  
  return context;
} 