'use client';

import { useState, useEffect } from 'react';
import { useFocusSession } from '@/contexts/focus-session-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * This component demonstrates how to use the FocusSession context
 *
 * Notes:
 * - Wrap components that need focus session access in FocusSessionProvider
 * - Use useFocusSession() hook to access the focus session state and methods
 * - Only start a focus session when a user is actively working on something
 * - End sessions when work is complete
 */

/**
 * Example component showing how to implement focus sessions in a trip section
 */
export default function FocusSessionExample({
  sectionPath = 'itinerary',
}: {
  sectionPath?: string;
}) {
  const {
    activeFocusSession,
    loading,
    error,
    startFocusSession,
    joinFocusSession,
    endFocusSession,
  } = useFocusSession();

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate time remaining for active session
  useEffect(() => {
    if (!activeFocusSession) return;

    const calculateTimeRemaining = () => {
      const expiresAt = new Date(activeFocusSession.expires_at).getTime();
      const now = Date.now();
      const diff = expiresAt - now;

      if (diff <= 0) {
        return 'Expired';
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    setTimeRemaining(calculateTimeRemaining());
    const intervalId = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeFocusSession]);

  const handleStartSession = async () => {
    try {
      await startFocusSession(sectionPath);
    } catch (err) {
      console.error('Failed to start focus session:', err);
    }
  };

  const handleJoinSession = async () => {
    if (!activeFocusSession) return;

    try {
      await joinFocusSession(activeFocusSession);
    } catch (err) {
      console.error('Failed to join focus session:', err);
    }
  };

  const handleEndSession = async () => {
    try {
      await endFocusSession();
    } catch (err) {
      console.error('Failed to end focus session:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'An error occurred with focus session'}
        </AlertDescription>
      </Alert>
    );
  }

  // No active session - show start button
  if (!activeFocusSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaborate on {sectionPath}</CardTitle>
          <CardDescription>
            Start a focus session to collaborate with others in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleStartSession} className="w-full">
            Start Focus Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Session exists but user hasn't joined
  if (activeFocusSession && !activeFocusSession.has_joined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Focus Session</CardTitle>
          <CardDescription>
            Join the ongoing focus session for {activeFocusSession.section_path}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{activeFocusSession.participants.length} participants</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{timeRemaining}</span>
            </div>
          </div>
          <AvatarGroup>
            {activeFocusSession.participants.map((participant) => (
              <Avatar key={participant.id} title={participant.name}>
                <AvatarImage src={participant.avatar_url || undefined} alt={participant.name} />
                <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </CardContent>
        <CardFooter>
          <Button onClick={handleJoinSession} className="w-full">
            Join Session
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Active session that user has joined
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Focus Session Active</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeRemaining}
          </Badge>
        </div>
        <CardDescription>
          You and {activeFocusSession.participants.length - 1} others are focusing on{' '}
          {activeFocusSession.section_path}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Current participants:</p>
          <AvatarGroup max={5}>
            {activeFocusSession.participants.map((participant) => (
              <Avatar key={participant.id} title={participant.name}>
                <AvatarImage src={participant.avatar_url || undefined} alt={participant.name} />
                <AvatarFallback>{participant.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleEndSession}>
          End Session
        </Button>
        <p className="text-xs text-muted-foreground">
          Session will automatically expire in {timeRemaining}
        </p>
      </CardFooter>
    </Card>
  );
}
