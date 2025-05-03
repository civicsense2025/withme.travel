'use client';

import React from 'react';
import { usePresenceContext } from '@/components/presence/presence-context';
import { PresenceIndicator } from '@/components/presence/presence-indicator';
import { CursorTracker } from '@/components/presence/cursor-tracker';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
// Define ConnectionState inline instead of importing from a file that might not exist
type ConnectionState = 'connected' | 'connecting' | 'disconnected';

interface TripPresenceProps {
  className?: string;
  showActivityLabel?: boolean;
}

/**
 * TripPresence component that displays online users, their status,
 * and manages cursor tracking in the trip
 */
export function TripPresence({ className = '', showActivityLabel = true }: TripPresenceProps) {
  const context = usePresenceContext();

  // Early return if context is null
  if (!context) {
    return <div className={className}>Presence not available</div>;
  }

  const { activeUsers, connectionState, error, recoverPresence } = context;
  
  // Ensure recoverPresence is safe to call, providing a no-op function if it doesn't exist
  const handleRecover = () => {
    if (typeof recoverPresence === 'function') {
      recoverPresence();
    }
  };

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
          onClick={handleRecover}
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

      {/* User avatars with status - implemented directly to avoid prop issues */}
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map((user) => (
          <div key={user.user_id} className="relative">
            <div className={`h-6 w-6 rounded-full bg-muted flex items-center justify-center border-2 border-background ${
              user.status === 'editing' ? 'ring-2 ring-primary' : ''
            }`}>
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name || 'User'} 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs">
                  {(user.name || user.email || 'U').substring(0, 2)}
                </span>
              )}
            </div>
            
            {/* Status indicator */}
            <div className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
              user.status === 'online' ? 'bg-green-500' : 
              user.status === 'away' ? 'bg-yellow-500' : 
              user.status === 'editing' ? 'bg-blue-500' : 'bg-gray-500'
            }`} />
          </div>
        ))}
        
        {onlineUsers.length > 5 && (
          <div className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
