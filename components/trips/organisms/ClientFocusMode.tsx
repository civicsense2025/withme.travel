/**
 * Client Focus Mode
 * 
 * A collaborative focus session component for trip participants to work together
 * 
 * @module trips/organisms
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFocusSession } from '@/components/focus/focus-session-provider';
import { Clock, Play, Pause, StopCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ClientFocusModeProps {
  /** Trip ID to associate with the focus session */
  tripId: string;
  /** Optional additional content to render */
  children?: React.ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

// Define focus session status type
type FocusSessionStatus = 'idle' | 'active' | 'paused' | 'completed';

// Define focus session participant type
interface FocusSessionParticipant {
  id: string;
  name?: string;
  avatarUrl?: string;
}

// Define focus session data type
interface FocusSession {
  id: string;
  status: FocusSessionStatus;
  focusTime: number;
  startedAt?: Date;
  pausedAt?: Date;
  completedAt?: Date;
  activeParticipants: FocusSessionParticipant[];
}

// Define mock focus session provider interface
interface FocusSessionContext {
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ClientFocusMode component for collaborative trip focus sessions
 */
export function ClientFocusMode({ tripId, children, className }: ClientFocusModeProps) {
  // Create a default mock implementation if the hook is not available
  const defaultFocusSession: FocusSessionContext = {
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

  /**
   * Renders the appropriate controls based on session status
   */
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

  /**
   * Format the focus time in hours:minutes:seconds
   */
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
    <div className={cn("flex flex-col w-full border rounded-md p-4 space-y-4 bg-background", className)}>
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
        </div>

        <div className="flex justify-end">{renderControls()}</div>
      </div>

      {children}
    </div>
  );
}

export default ClientFocusMode; 