/**
 * Focus Session Hook
 *
 * Provides functionality for managing collaborative focus sessions.
 */

import { useState, useEffect, useCallback } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { trackEvent } from '@/lib/analytics';

export interface FocusSessionParticipant {
  userId: string;
  name: string;
  avatarUrl?: string;
  joinedAt: string;
}

export interface FocusSession {
  id: string;
  status: 'active' | 'paused' | 'completed' | 'idle';
  startedAt: string;
  endedAt?: string;
  focusTime: number; // seconds
  createdBy: string;
  activeParticipants: FocusSessionParticipant[];
}

export interface UseFocusSessionResult {
  session: FocusSession | null;
  isLoading: boolean;
  error: Error | null;
  startSession: (options?: { tripId?: string }) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: () => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
}

/**
 * Hook for managing collaborative focus sessions
 */
export function useFocusSession(): UseFocusSessionResult {
  const [session, setSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getBrowserClient();

  // Subscribe to focus session changes
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase
      .channel(`focus-session-${session.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        
        // Update the session with presence information
        setSession(prevSession => {
          if (!prevSession) return null;
          
          const participants = Object.values(state)
            .flat()
            .map((p: any) => ({
              userId: p.user_id,
              name: p.name || 'Anonymous',
              avatarUrl: p.avatar_url,
              joinedAt: p.joined_at
            }));
          
          return {
            ...prevSession,
            activeParticipants: participants as FocusSessionParticipant[]
          };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, supabase]);

  // Load the current active session if it exists
  useEffect(() => {
    const loadActiveSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('focus_sessions')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (sessionError && sessionError.code !== 'PGRST116') {
          console.error('Error loading focus session:', sessionError);
          setError(new Error('Failed to load active focus session'));
          return;
        }

        if (sessionData) {
          setSession({
            id: sessionData.id,
            status: sessionData.status,
            startedAt: sessionData.started_at,
            endedAt: sessionData.ended_at,
            focusTime: calculateFocusTime(
              sessionData.started_at, 
              sessionData.paused_at,
              sessionData.status
            ),
            createdBy: sessionData.created_by,
            activeParticipants: []
          });
        }
      } catch (err) {
        console.error('Error in loadActiveSession:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      }
    };

    loadActiveSession();
  }, [supabase]);

  // Calculate focus time based on session state
  const calculateFocusTime = (
    startedAt: string,
    pausedAt: string | null,
    status: string
  ): number => {
    if (status === 'paused' && pausedAt) {
      return Math.floor((new Date(pausedAt).getTime() - new Date(startedAt).getTime()) / 1000);
    }
    
    if (status === 'active') {
      return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    }
    
    return 0;
  };

  // Timer to update focus time
  useEffect(() => {
    if (!session || session.status !== 'active') return;
    
    const timer = setInterval(() => {
      setSession(prevSession => {
        if (!prevSession) return null;
        return {
          ...prevSession,
          focusTime: calculateFocusTime(
            prevSession.startedAt,
            null,
            'active'
          )
        };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [session]);

  // Start a new focus session
  const startSession = useCallback(async (options?: { tripId?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('You must be logged in to start a focus session');
      }
      
      const { data: newSession, error: sessionError } = await supabase
        .from('focus_sessions')
        .insert({
          status: 'active',
          started_at: new Date().toISOString(),
          created_by: userData.user.id,
          trip_id: options?.tripId || null
        })
        .select()
        .single();
      
      if (sessionError) {
        throw sessionError;
      }
      
      setSession({
        id: newSession.id,
        status: 'active',
        startedAt: newSession.started_at,
        focusTime: 0,
        createdBy: newSession.created_by,
        activeParticipants: []
      });
      
      trackEvent('focus_session_started', 'Focus session started', {
        session_id: newSession.id,
        trip_id: options?.tripId
      });
    } catch (err) {
      console.error('Error starting focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to start focus session'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Pause the current focus session
  const pauseSession = useCallback(async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const currentTime = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('focus_sessions')
        .update({
          status: 'paused',
          paused_at: currentTime
        })
        .eq('id', session.id);
      
      if (updateError) {
        throw updateError;
      }
      
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'paused',
          focusTime: calculateFocusTime(prev.startedAt, currentTime, 'paused')
        };
      });
      
      trackEvent('focus_session_paused', 'Focus session paused', {
        session_id: session.id,
        duration: session.focusTime
      });
    } catch (err) {
      console.error('Error pausing focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to pause focus session'));
    } finally {
      setIsLoading(false);
    }
  }, [session, supabase]);

  // Resume a paused focus session
  const resumeSession = useCallback(async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: updateError } = await supabase
        .from('focus_sessions')
        .update({
          status: 'active',
          resumed_at: new Date().toISOString()
        })
        .eq('id', session.id);
      
      if (updateError) {
        throw updateError;
      }
      
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'active'
        };
      });
      
      trackEvent('focus_session_resumed', 'Focus session resumed', {
        session_id: session.id
      });
    } catch (err) {
      console.error('Error resuming focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to resume focus session'));
    } finally {
      setIsLoading(false);
    }
  }, [session, supabase]);

  // End the current focus session
  const endSession = useCallback(async () => {
    if (!session) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const currentTime = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('focus_sessions')
        .update({
          status: 'completed',
          ended_at: currentTime
        })
        .eq('id', session.id);
      
      if (updateError) {
        throw updateError;
      }
      
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'completed',
          endedAt: currentTime
        };
      });
      
      trackEvent('focus_session_ended', 'Focus session ended', {
        session_id: session.id,
        duration: session.focusTime
      });
    } catch (err) {
      console.error('Error ending focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to end focus session'));
    } finally {
      setIsLoading(false);
    }
  }, [session, supabase]);

  // Join an existing focus session
  const joinSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('You must be logged in to join a focus session');
      }
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) {
        throw sessionError;
      }
      
      // Join the session's presence channel
      const channel = supabase
        .channel(`focus-session-${sessionId}`)
        .subscribe(async (status: string) => {
          if (status !== 'SUBSCRIBED') return;
          
          await channel.track({
            user_id: userData.user.id,
            name: userData.user.user_metadata?.name || 'Anonymous',
            avatar_url: userData.user.user_metadata?.avatar_url,
            joined_at: new Date().toISOString()
          });
        });
      
      setSession({
        id: sessionData.id,
        status: sessionData.status,
        startedAt: sessionData.started_at,
        endedAt: sessionData.ended_at,
        focusTime: calculateFocusTime(
          sessionData.started_at, 
          sessionData.paused_at,
          sessionData.status
        ),
        createdBy: sessionData.created_by,
        activeParticipants: []
      });
      
      trackEvent('focus_session_joined', 'Focus session joined', {
        session_id: sessionId
      });
    } catch (err) {
      console.error('Error joining focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to join focus session'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Leave the current focus session
  const leaveSession = useCallback(async () => {
    if (!session) return;
    
    try {
      // Remove from presence channel
      const channel = supabase.getChannels().find(
        (ch: any) => ch.topic === `realtime:presence:focus-session-${session.id}`
      );
      
      if (channel) {
        await supabase.removeChannel(channel);
      }
      
      setSession(null);
      
      trackEvent('focus_session_left', 'Focus session left', {
        session_id: session.id
      });
    } catch (err) {
      console.error('Error leaving focus session:', err);
      setError(err instanceof Error ? err : new Error('Failed to leave focus session'));
    }
  }, [session, supabase]);

  return {
    session,
    isLoading,
    error,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    joinSession,
    leaveSession
  };
} 