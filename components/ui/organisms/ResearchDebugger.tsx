// components/research/ResearchDebugger.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useResearch } from './ResearchProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RESEARCH_EVENT_TYPES } from '@/types/research';

interface EventLogItem {
  type: string;
  details?: Record<string, any>;
  timestamp: string;
  milestone?: string;
}

export interface ResearchDebuggerProps {
  initialOpen?: boolean;
}

export function ResearchDebugger({ initialOpen = false }: ResearchDebuggerProps) {
  const { session, trackEvent } = useResearch();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [eventLog, setEventLog] = useState<EventLogItem[]>([]);

  // Track a test event
  const trackTestEvent = () => {
    trackEvent('debug_event', { source: 'debugger', test: true }, 'debug');
  };

  // Listen for research events
  useEffect(() => {
    const eventHandler = (event: CustomEvent<EventLogItem>) => {
      setEventLog(prev => [event.detail, ...prev]);
    };
    
    // Listen for the custom event
    window.addEventListener('research_event', eventHandler as EventListener);
    
    return () => {
      window.removeEventListener('research_event', eventHandler as EventListener);
    };
  }, []);

  // Format timestamp for display
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString();
    } catch (e) {
      return isoString;
    }
  };

  // Get appropriate badge color based on event type
  const getEventColor = (type: string) => {
    if (type.includes('start') || type.includes('begin')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (type.includes('complete') || type.includes('finish')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (type.includes('error')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (type.includes('view')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    if (type.includes('click') || type.includes('select')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    if (type.includes('submit')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="bg-background border-solid border-muted flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          Research Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 shadow-lg">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Research Debugger</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              ✕
            </Button>
          </div>
          <CardDescription>
            Session ID: {session?.id || 'No active session'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 py-2 bg-muted/50">
            <div className="flex flex-wrap gap-1 text-xs">
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Start Events</Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Completion Events</Badge>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">View Events</Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Interaction Events</Badge>
              <Badge variant="outline" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">Submit Events</Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Error Events</Badge>
            </div>
          </div>
          <ScrollArea className="h-60 border-t">
            {eventLog.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No events tracked yet. Try interacting with a survey or use the Test Event button.
              </div>
            ) : (
              <ul className="divide-y">
                {eventLog.map((event, i) => (
                  <li key={i} className="p-2 text-xs hover:bg-muted/20">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className={getEventColor(event.type)}>
                        {event.type}
                      </Badge>
                      <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                    </div>
                    {event.milestone && (
                      <div className="mt-1 text-muted-foreground">
                        Milestone: {event.milestone}
                      </div>
                    )}
                    {event.details && Object.keys(event.details).length > 0 && (
                      <div className="mt-1 font-mono text-xs bg-muted/20 p-1 rounded overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={trackTestEvent}
          >
            Test Event
          </Button>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigator.clipboard.writeText(JSON.stringify(eventLog))}
            >
              Copy
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setEventLog([])}
            >
              Clear
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}