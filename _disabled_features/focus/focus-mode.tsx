'use client';

import { useState, useEffect } from 'react';
import { useFocusSession } from '@/contexts/focus-session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { Target, Clock, AlertCircle, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define TRIP_SECTIONS directly in the component
const TRIP_SECTIONS = [
  { id: 'itinerary', name: 'Itinerary' },
  { id: 'notes', name: 'Notes' },
  { id: 'expenses', name: 'Expenses' },
  { id: 'manage', name: 'Manage' },
];

interface FocusModeProps {
  tripId: string;
}

export function FocusMode({ tripId }: FocusModeProps) {
  const router = useRouter();
  const [section, setSection] = useState<string>('itinerary');
  const {
    activeFocusSession,
    loading,
    error,
    startFocusSession,
    endFocusSession,
    joinFocusSession,
  } = useFocusSession(tripId);

  const handleStartSession = async () => {
    await startFocusSession(section);
  };

  const handleEndSession = async () => {
    await endFocusSession();
  };

  const handleJoinSession = async () => {
    if (activeFocusSession) {
      await joinFocusSession(activeFocusSession);
    }
  };

  // Time remaining countdown
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!activeFocusSession) {
      setTimeRemaining('');
      return;
    }

    const updateTimeRemaining = () => {
      const endTime = new Date(activeFocusSession.expires_at);
      const now = new Date();

      // If session has expired
      if (endTime <= now) {
        setTimeRemaining('Expired');
        return;
      }

      const diffMs = endTime.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);

      setTimeRemaining(`${diffMins}:${diffSecs.toString().padStart(2, '0')}`);
    };

    // Update immediately
    updateTimeRemaining();

    // Then update every second
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [activeFocusSession]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4 flex items-center justify-center h-16">
          <div className="h-4 w-32 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-4 flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load focus session</span>
        </CardContent>
      </Card>
    );
  }

  if (activeFocusSession) {
    const isCreator = activeFocusSession.created_by_id === activeFocusSession.current_user_id;
    const sectionName =
      TRIP_SECTIONS.find((s) => s.id === activeFocusSession.section_path)?.name ||
      'Unknown Section';

    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">Focus Session: {sectionName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-amber-100/50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
              >
                <Clock className="h-3 w-3 mr-1" />
                <span>{timeRemaining}</span>
              </Badge>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Users className="h-3.5 w-3.5" />
                          <span className="sr-only">Participants</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-60 p-2" align="end">
                        <p className="text-xs font-medium mb-2">
                          Participants ({activeFocusSession.participants.length})
                        </p>
                        <div className="space-y-2">
                          {activeFocusSession.participants.map((participant) => (
                            <div key={participant.id} className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                {participant.avatar_url ? (
                                  <AvatarImage
                                    src={participant.avatar_url}
                                    alt={participant.name}
                                  />
                                ) : null}
                                <AvatarFallback className="text-[10px]">
                                  {participant.name?.substring(0, 2).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs flex-1 truncate">
                                {participant.name}
                                {participant.id === activeFocusSession.created_by_id && (
                                  <span className="ml-1 text-muted-foreground">(Host)</span>
                                )}
                              </span>
                              {participant.joined_at && (
                                <span className="text-[10px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(participant.joined_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Participants</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Only show join button if user hasn't joined yet */}
              {!activeFocusSession.has_joined ? (
                <Button variant="default" size="sm" className="h-7" onClick={handleJoinSession}>
                  Join
                </Button>
              ) : isCreator ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                        onClick={handleEndSession}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">End Session</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>End Focus Session</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger className="h-7">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {TRIP_SECTIONS.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="default" size="sm" className="h-7" onClick={handleStartSession}>
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Start Focus Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
