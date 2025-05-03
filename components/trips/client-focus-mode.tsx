'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFocusSession } from '@/components/focus/focus-session-provider';
import { Clock, Play, Pause, StopCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PresenceIndicator } from '@/components/presence/presence-indicator';

export interface ClientFocusModeProps {
  tripId: string;
  children?: React.ReactNode;
}

export function ClientFocusMode({ tripId, children }: ClientFocusModeProps) {
  // Create a default mock implementation if the hook is not available
  const defaultFocusSession = {
    session: null,
    isLoading: false,
    error: null,
    startSession: async () => {},
    pauseSession: async () => {},
    resumeSession: async () => {},
    endSession: async () => {},
    joinSession: async () => {},
    leaveSession: async () => {},
  };

  // Use the real hook or fall back to the mock implementation
  const { session, isLoading, startSession, pauseSession, resumeSession, endSession } =
    useFocusSession() || defaultFocusSession;

  const renderControls = () => {
    if (!session) {
      return (
        <Button onClick={() => startSession()} disabled={isLoading} size="sm" className="gap-2">
          <Play size={16} />
          Start Focus Session
        </Button>
      );
    }

    switch (session.status) {
      case 'active':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pauseSession()}
              disabled={isLoading}
              className="gap-1"
            >
              <Pause size={14} />
              Pause
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => endSession()}
              disabled={isLoading}
              className="gap-1"
            >
              <StopCircle size={14} />
              End
            </Button>
          </div>
        );

      case 'paused':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => resumeSession()}
              disabled={isLoading}
              className="gap-1"
            >
              <Play size={14} />
              Resume
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => endSession()}
              disabled={isLoading}
              className="gap-1"
            >
              <StopCircle size={14} />
              End
            </Button>
          </div>
        );

      case 'completed':
        return (
          <Button onClick={() => startSession()} disabled={isLoading} size="sm" className="gap-1">
            <Play size={14} />
            Start New Session
          </Button>
        );

      default:
        return null;
    }
  };

  // Format the focus time in hours:minutes:seconds
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours > 0 ? hours.toString().padStart(2, '0') : null,
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  return (
    <div className="flex flex-col w-full border rounded-md p-4 space-y-4 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Focus Mode</h3>
          {session && session.status !== 'completed' && (
            <Badge variant={session.status === 'active' ? 'default' : 'outline'}>
              {session.status === 'active' ? 'Active' : 'Paused'}
            </Badge>
          )}
        </div>

        {session && session.status !== 'idle' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} />
            <span>{formatFocusTime(session.focusTime)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span className="text-sm text-muted-foreground">
            {session?.activeParticipants.length || 0} participants
          </span>

          <PresenceIndicator size="sm" className="ml-2" />
        </div>

        <div className="flex justify-end">{renderControls()}</div>
      </div>

      {children}
    </div>
  );
}

export default ClientFocusMode;
