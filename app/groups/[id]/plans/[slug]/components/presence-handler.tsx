'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CursorLayer } from './cursor-layer';

interface CursorPosition {
  x: number;
  y: number;
}

interface Presence {
  id: string;
  name: string;
  position: CursorPosition;
  lastActive: number;
  color: string;
}

// Mock user data until we have proper auth integration
const MOCK_USER = {
  id: 'userU1',
  name: 'You',
  email: 'user@example.com',
};

// Simple throttle function to avoid lodash dependency
function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

export function PresenceHandler() {
  const params = useParams();
  const groupId = params?.id as string;
  const user = MOCK_USER; // Replace with proper use-ser() hook when available

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Track local cursor position
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  // Track all users' presence
  const [presences, setPresences] = useState<Presence[]>([]);
  // Reference to the channel for cleanup
  const channelRef = useRef<any>(null);

  // Generate a color for the user based on their ID
  const generate-serColor = useCallback((userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  }, []);

  // -pdate cursor position, throttled to reduce network traffic
  const updateCursorPosition = useCallback(
    throttle((e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    }, 50),
    []
  );

  // Set up Supabase Realtime presence for cursor tracking
  useEffect(() => {
    if (!user || !groupId) return;

    const channel = supabase.channel(`group-${groupId}-presence`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track all presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();

      // Convert to array of presences
      const presenceArray: Presence[] = Object.entries(state).map(([userId, presenceList]) => {
        // Type assertion since we know the structure
        const userPresence = (presenceList as unknown[])[0] as Record<string, any>;
        return {
          id: userId,
          name: userPresence.name || 'Anonymous',
          position: userPresence.position || { x: 0, y: 0 },
          lastActive: userPresence.lastActive || Date.now(),
          color: userPresence.color || generate-serColor(userId),
        };
      });

      setPresences(presenceArray);
    });

    // Handle mouse movement to update local cursor position
    const handleMouseMove = (e: MouseEvent) => {
      updateCursorPosition(e);
    };

    // -pdate presence with own cursor position when it changes
    // and on regular intervals to maintain "heartbeat"
    const presenceInterval = setInterval(() => {
      if (cursorPosition) {
        channel.track({
          name: user.name || user.email?.split('@')[0] || 'Anonymous',
          position: cursorPosition,
          lastActive: Date.now(),
          color: generate-serColor(user.id),
        });
      }
    }, 1000);

    // Subscribe to the channel
    channel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        // Initial presence update
        channel.track({
          name: user.name || user.email?.split('@')[0] || 'Anonymous',
          position: cursorPosition,
          lastActive: Date.now(),
          color: generate-serColor(user.id),
        });
      }
    });

    // Set up event listeners
    window.addEventListener('mousemove', handleMouseMove);

    // Store channel reference for cleanup
    channelRef.current = channel;

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(presenceInterval);

      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [user, groupId, cursorPosition, generate-serColor, supabase, updateCursorPosition]);

  if (!user) return null;

  return <CursorLayer cursors={presences} ownCursor={cursorPosition} ownId={user.id} />;
}
