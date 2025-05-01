'use client';

import React from 'react';
import { usePresenceContext } from '@/components/presence/presence-context';
import { PresenceIndicator } from '@/components/presence/presence-indicator';
import { CursorTracker } from '@/components/presence/cursor-tracker';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { ConnectionState } from '@/types/presence';

interface TripPresenceProps {
  className?: string;
  showActivityLabel?: boolean;
}

/**
 * TripPresence component that displays online users, their status,
 * and manages cursor tracking in the trip
 */
export function TripPresence({ className = '', showActivityLabel = true }: TripPresenceProps) {
  const { activeUsers, connectionState, error, recoverPresence } = usePresenceContext();

  // Only show users who are online or away
  const onlineUsers = activeUsers.filter((user) =>
    ['online', 'away', 'editing'].includes(user.status)
  );

  // Show error state
  if (error) {
    return (
      <div className={`flex items-center text-xs text-red-500 ${className}`}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        <span>Connection error</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 ml-2 px-2"
          onClick={() => recoverPresence()}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reconnect
        </Button>
      </div>
    );
  }

  // If no users are online, don't render anything
  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showActivityLabel && (
          <div className="flex items-center text-xs">
            <Users className="h-3 w-3 mr-1" />
            <span>{onlineUsers.length} active</span>

            {/* Connection status indicator */}
            <div className="ml-2 flex items-center">
              {connectionState === 'connected' ? (
                <Wifi className="h-3 w-3 text-green-500 mr-1" />
              ) : connectionState === 'connecting' ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500 mr-1" />
              )}
            </div>
          </div>
        )}

        {/* Cursor visibility toggle - only show if users have cursor positions */}
        <CursorTracker className="ml-auto" />
      </div>

      {/* User avatars with status */}
      <PresenceIndicator users={onlineUsers} showStatus showEditingItem />
    </div>
  );
}
