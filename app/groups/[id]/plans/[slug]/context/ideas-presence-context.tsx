'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { useAuth } from '@/components/features/auth/auth-provider';
import { UserPresenceStatus } from '@/types/presence';

// Define types for the presence system
export interface UserPresenceInfo {
  id: string;
  name: string;
  avatar_url?: string;
  status: UserPresenceStatus;
  editing_idea_id: string | null;
  lastSeen: Date;
  cursor?: {
    x: number;
    y: number;
  };
}

export interface IdeasPresenceContextType {
  activeUsers: UserPresenceInfo[];
  isLoading: boolean;
  error: Error | null;
  startEditingIdea: (ideaId: string) => void;
  stopEditingIdea: () => void;
  isEditingIdea: boolean;
  currentEditingIdeaId: string | null;
}

// Create a default value for the context
const defaultContext: IdeasPresenceContextType = {
  activeUsers: [],
  isLoading: false,
  error: null,
  startEditingIdea: () => {},
  stopEditingIdea: () => {},
  isEditingIdea: false,
  currentEditingIdeaId: null,
};

// Create the context
export const IdeasPresenceContext = createContext<IdeasPresenceContextType>(defaultContext);

// Custom hook to access the context
export function useIdeasPresenceContext() {
  return useContext(IdeasPresenceContext);
}

/**
 * Custom hook to handle presence for the ideas board
 */
export function useIdeasPresence(groupId: string): IdeasPresenceContextType {
  const [activeUsers, setActiveUsers] = useState<UserPresenceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isEditingIdea, setIsEditingIdea] = useState(false);
  const [currentEditingIdeaId, setCurrentEditingIdeaId] = useState<string | null>(null);

  const { user } = useAuth();
  // Reference to the Supabase presence channel
  const channelRef = useRef<any>(null);
  const isBrowser = typeof window !== 'undefined';
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize the Supabase client on the client side
  useEffect(() => {
    console.log('[ideas-presence] Running in browser environment:', isBrowser);

    // Only initialize the client in the browser
    if (isBrowser) {
      try {
        console.log('[ideas-presence] Initializing Supabase client');
        const client = getBrowserClient();
        setSupabase(client);
      } catch (err) {
        console.error('[ideas-presence] Failed to initialize Supabase client:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize Supabase client'));
      }
    }
  }, [isBrowser]);

  // Function to start editing an idea
  const startEditingIdea = (ideaId: string) => {
    if (!isBrowser) return;

    console.log('[ideas-presence] Start editing idea:', ideaId);
    setIsEditingIdea(true);
    setCurrentEditingIdeaId(ideaId);

    // Broadcast editing status to other users
    if (channelRef.current) {
      try {
        channelRef.current.track({
          user_id: user?.id || 'guest',
          editing_idea_id: ideaId,
          last_active: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[ideas-presence] Failed to broadcast editing status:', err);
      }
    }
  };

  // Function to stop editing an idea
  const stopEditingIdea = () => {
    if (!isBrowser) return;

    console.log('[ideas-presence] Stop editing idea');
    setIsEditingIdea(false);
    setCurrentEditingIdeaId(null);

    // Broadcast that editing stopped
    if (channelRef.current) {
      try {
        channelRef.current.track({
          user_id: user?.id || 'guest',
          editing_idea_id: null,
          last_active: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[ideas-presence] Failed to broadcast editing stopped:', err);
      }
    }
  };

  // Initialize presence tracking
  useEffect(() => {
    // Only run in the browser and when we have both groupId and supabase client
    if (!isBrowser || !groupId || !supabase) {
      return;
    }

    console.log('[ideas-presence] Setting up presence channel for group:', groupId);
    setIsLoading(true);

    try {
      const channel = supabase.channel(`ideas-presence-${groupId}`, {
        config: {
          presence: {
            key: user?.id || `guest-${Math.random().toString(36).substring(2, 10)}`,
          },
        },
      });

      channelRef.current = channel;

      // Subscribe to presence events
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          console.log('[ideas-presence] Presence state synced:', state);

          // Transform presence state into our format
          const users = Object.values(state).flatMap((presences: any) => {
            return presences.map((presence: any) => ({
              id: presence.user_id || 'guest',
              name: presence.name || 'Anonymous',
              avatar_url: presence.avatar_url,
              status: presence.status || 'online',
              editing_idea_id: presence.editing_idea_id,
              lastSeen: new Date(presence.last_active || Date.now()),
              cursor: presence.cursor || null,
            }));
          });

          console.log('[ideas-presence] Active users:', users);
          setActiveUsers(users);
        })
        .on(
          'presence',
          { event: 'join' },
          ({ key, newPresences }: { key: string; newPresences: any[] }) => {
            console.log('[ideas-presence] User joined:', key, newPresences);
          }
        )
        .on(
          'presence',
          { event: 'leave' },
          ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
            console.log('[ideas-presence] User left:', key, leftPresences);
          }
        );

      // Subscribe to the channel
      channel.subscribe(async (status: string) => {
        console.log('[ideas-presence] Channel subscription status:', status);

        if (status === 'SUBSCRIBED') {
          // Initial broadcast will happen in the useEffect below that watches for profile changes
          setIsLoading(false);
          console.log('[ideas-presence] Presence tracking started');
        }
      });

      // Clean up subscription on unmount
      return () => {
        console.log('[ideas-presence] Cleaning up presence channel');
        channel.unsubscribe();
      };
    } catch (err) {
      console.error('[ideas-presence] Error setting up presence channel:', err);
      setError(err instanceof Error ? err : new Error('Failed to set up presence channel'));
      setIsLoading(false);
    }
  }, [groupId, user, supabase, isBrowser]);

  // Separate useEffect to broadcast presence when profile changes
  useEffect(() => {
    if (!user?.id || !supabase || !channelRef.current) return;

    // Broadcast presence with available profile info
    const displayName = user.profile?.name || user.email || 'User';
    const avatarUrl = user.profile?.avatar_url || undefined;

    console.log('[ideas-presence] Broadcasting presence with profile:', displayName);

    channelRef.current.track({
      user_id: user.id,
      name: displayName,
      avatar_url: avatarUrl,
      status: 'online',
      last_active: new Date().toISOString(),
      editing_idea_id: currentEditingIdeaId,
    });
  }, [user?.id, user?.profile, supabase, currentEditingIdeaId]);

  // Handle cursor position updates
  const updateCursorPosition = (x: number, y: number) => {
    if (!isBrowser || !channelRef.current) return;

    try {
      channelRef.current.track({
        user_id: user?.id || 'guest',
        cursor: { x, y },
        last_active: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[ideas-presence] Failed to update cursor position:', err);
    }
  };

  // Add mouse movement listener with throttling for cursor tracking
  useEffect(() => {
    if (!isBrowser) return;

    console.log('[ideas-presence] Setting up cursor tracking');

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      updateCursorPosition(x, y);
    };

    // Throttle mouse move events to avoid too many updates
    const throttledHandleMouseMove = throttle(handleMouseMove, 50);

    // Add event listener
    window.addEventListener('mousemove', throttledHandleMouseMove);

    // Clean up
    return () => {
      console.log('[ideas-presence] Cleaning up cursor tracking');
      window.removeEventListener('mousemove', throttledHandleMouseMove);
    };
  }, [isBrowser, supabase]);

  // Return the context value
  return {
    activeUsers,
    isLoading,
    error,
    startEditingIdea,
    stopEditingIdea,
    isEditingIdea,
    currentEditingIdeaId,
  };
}

// Helper function to throttle events
function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
