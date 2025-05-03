'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePresenceContext } from './presence-context';
import { CursorPosition, ExtendedUserPresence } from '@/types/presence';
import { PresenceIndicator } from './presence-indicator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Cursor } from './cursor';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { MousePointer, MousePointerClick } from 'lucide-react';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { createClient } from '@/utils/supabase/client';
import { debounce } from 'lodash';

interface FocusSessionProps {
  /**
   * Session ID for this collaborative session
   */
  sessionId: string;
  /**
   * Title of the focus session
   */
  title: string;
  /**
   * Description of the focus session
   */
  description?: string;
  /**
   * Optional className for the container
   */
  className?: string;
}

export function FocusSession({ sessionId, title, description, className }: FocusSessionProps) {
  const { activeUsers, startEditing, stopEditing, myPresence } = usePresenceContext();
  const [notes, setNotes] = useState<string>('');
  const [showCursors, setShowCursors] = useLocalStorage<boolean>('withme-show-cursors', true);
  const [localCursors, setLocalCursors] = useState<Record<string, CursorPosition>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Set focus when the component mounts
  useEffect(() => {
    const focusId = `focus-session-${sessionId}`;
    startEditing(focusId);

    return () => {
      // Clear focus when component unmounts
      stopEditing();
    };
  }, [sessionId, startEditing, stopEditing]);

  // Handle mouse movement for cursor tracking
  useEffect(() => {
    if (!containerRef.current || !showCursors || !myPresence) return;

    const container = containerRef.current;

    // Debounce cursor updates to reduce network traffic
    const debouncedUpdateCursor = debounce(async (x: number, y: number) => {
      try {
        const cursorPosition = { x, y, timestamp: Date.now() };

        // Update cursor position in Supabase Realtime Presence
        // This is a simplified version - in a real implementation,
        // this would be done through a dedicated presence channel
        const channel = supabase.channel(`focus-session-${sessionId}`);
        await channel.track({
          user_id: myPresence.user_id,
          cursor_position: cursorPosition,
        });
      } catch (error) {
        console.error('Failed to update cursor position:', error);
      }
    }, 50);

    const handleMouseMove = (e: MouseEvent) => {
      // Get position relative to the container
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only update if the mouse is inside the container
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        debouncedUpdateCursor(x, y);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      debouncedUpdateCursor.cancel();
    };
  }, [sessionId, showCursors, myPresence, supabase]);

  // Subscribe to cursor updates from other users
  useEffect(() => {
    if (!sessionId || !showCursors) return;

    const channel = supabase.channel(`focus-session-${sessionId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const cursors: Record<string, CursorPosition> = {};

        // Extract cursor positions from presence state
        Object.entries(state).forEach(([userId, userStates]) => {
          // Type assertion for userStates
          const userState = (userStates as any[])[0];
          if (userState?.cursor_position) {
            cursors[userId] = userState.cursor_position as CursorPosition;
          }
        });

        setLocalCursors(cursors);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId, showCursors, supabase]);

  // Filter users in this focus session
  const sessionUsers = activeUsers.filter(
    (user) =>
      user.editing_item_id === `focus-session-${sessionId}` &&
      (user.status === 'online' || user.status === 'editing')
  ) as ExtendedUserPresence[];

  // Transform session users for AvatarGroup
  const avatarItems = sessionUsers.map((user) => ({
    src: user.avatar_url ?? undefined,
    fallback: user.name
      ? user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : '??',
    alt: user.name ?? 'Unknown user',
  }));

  // Toggle cursor visibility
  const toggleCursorVisibility = () => {
    setShowCursors(!showCursors);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <AvatarGroup items={avatarItems} max={3} avatarSize="h-8 w-8" />
        </div>
      </CardHeader>

      <CardContent>
        <div
          ref={containerRef}
          className="relative min-h-[200px] border rounded-md p-4 focus-within:ring-1 focus-within:ring-ring"
        >
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[150px] border-0 focus-visible:ring-0 p-0 resize-none"
            placeholder="Start typing to collaborate..."
          />

          {/* Render other users' cursors */}
          {showCursors &&
            sessionUsers
              .filter(
                (user) =>
                  myPresence &&
                  user.user_id !== myPresence.user_id &&
                  user.cursor_position &&
                  user.status !== 'offline' &&
                  user.status !== 'away'
              )
              .map(
                (user: ExtendedUserPresence) =>
                  user.cursor_position && (
                    <Cursor key={user.user_id} user={user} position={user.cursor_position} />
                  )
              )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <PresenceIndicator
          users={sessionUsers}
          showStatus={true}
          showEditingItem={true}
          itemLabels={{ [`focus-session-${sessionId}`]: `this document` }}
        />

        <Button variant="ghost" size="sm" onClick={toggleCursorVisibility}>
          {showCursors ? (
            <>
              <MousePointerClick className="h-4 w-4 mr-2" />
              Hide Cursors
            </>
          ) : (
            <>
              <MousePointer className="h-4 w-4 mr-2" />
              Show Cursors
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
