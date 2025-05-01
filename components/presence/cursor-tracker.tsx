'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserPresence, ExtendedUserPresence } from '@/types/presence';
import { usePresenceContext } from '@/components/presence/presence-context';
import { Button } from '@/components/ui/button';
import { MousePointer, Edit, MousePointerClick } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface CursorTrackerProps {
  /**
   * Optional className for the container
   */
  className?: string;
}

/**
 * CursorTracker component displays the cursor positions of users in real-time
 * and provides a toggle to control cursor visibility.
 */
export function CursorTracker({ className }: CursorTrackerProps) {
  const { activeUsers } = usePresenceContext();
  const [showCursors, setShowCursors] = useLocalStorage<boolean>('withme-show-cursors', true);
  const cursorContainerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<() => void>(() => {});

  // Toggle cursor visibility
  const toggleCursorVisibility = () => {
    setShowCursors(!showCursors);
  };

  // Format time ago from ISO string
  const formatTimeAgo = (isoString: string): string => {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  // Cleanup cursor elements
  const cleanupCursorElements = () => {
    document.querySelectorAll('.user-cursor').forEach((el) => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };

  // Effect for cursor rendering and cleanup
  useEffect(() => {
    // Store the current cleanup function
    const cleanup = cleanupRef.current;

    // Cleanup on unmount or when visibility changes
    return () => {
      cleanupCursorElements();

      if (cleanup) {
        cleanup();
      }
    };
  }, [showCursors]);

  // Render cursor elements
  const renderCursorElements = () => {
    if (!showCursors || typeof document === 'undefined') return null;

    // Type activeUsers explicitly if context doesn't guarantee it
    const extendedActiveUsers = activeUsers as ExtendedUserPresence[];

    return extendedActiveUsers
      .filter((user) => user.cursor_position && user.status !== 'offline' && user.status !== 'away')
      .map((user: ExtendedUserPresence) => {
        try {
          const { x, y } = user.cursor_position || { x: 0, y: 0 };

          // Generate a deterministic color based on the user's ID
          const generateUserColor = (userId: string) => {
            // Simple hash function
            const hash = userId.split('').reduce((acc, char) => {
              return char.charCodeAt(0) + ((acc << 5) - acc);
            }, 0);

            const h = Math.abs(hash) % 360;
            return `hsl(${h}, 70%, 50%)`;
          };

          const userColor = generateUserColor(user.user_id);
          const statusClassName = user.status === 'editing' ? 'animate-pulse' : '';
          const tooltipClassName = `absolute left-5 top-0 px-2 py-1 rounded-md text-xs font-medium 
            whitespace-nowrap opacity-0 group-hover:opacity-100 hover:
            transition-opacity duration-200 z-50 pointer-events-none`;

          return createPortal(
            <div
              key={user.user_id}
              className="absolute pointer-events-none z-50 transition-all duration-300 ease-out user-cursor group"
              data-presence-tooltip={`user-${user.user_id}`}
              data-presence-portal="true"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="relative">
                <MousePointerClick
                  className={`h-4 w-4 ${statusClassName}`}
                  style={{ color: userColor }}
                />
                <div
                  className={tooltipClassName}
                  style={{
                    backgroundColor: `${userColor}30`,
                    color: userColor,
                    border: `1px solid ${userColor}40`,
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{user.name ?? 'Unknown user'}</span>
                    {user.editing_item_id && (
                      <span className="ml-1 flex items-center text-[10px]">
                        <Edit className="h-2.5 w-2.5 mr-0.5" /> Editing
                      </span>
                    )}
                  </div>
                  {user.last_active && (
                    <span className="text-[10px] opacity-80">
                      Active {formatTimeAgo(user.last_active)}
                    </span>
                  )}
                </div>
              </div>
            </div>,
            document.body
          );
        } catch (error) {
          console.warn(`Error rendering cursor for user ${user.user_id}:`, error);
          return null;
        }
      })
      .filter(Boolean);
  };

  // Only render the toggle button if there are users with cursor positions
  const hasCursorPositions = activeUsers.some((user) => user.cursor_position);

  if (!hasCursorPositions) {
    return null;
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs px-2 py-0"
        onClick={toggleCursorVisibility}
      >
        <MousePointer className="h-3 w-3 mr-1" />
        {showCursors ? 'Hide Cursors' : 'Show Cursors'}
      </Button>
      {renderCursorElements()}
    </div>
  );
}
