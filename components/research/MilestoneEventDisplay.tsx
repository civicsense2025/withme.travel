import React from 'react';
import { MILESTONE_EVENT_TYPES } from '@/utils/constants/status';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export interface MilestoneEvent {
  id: string;
  type: string;
  timestamp: string;
  details?: Record<string, any>;
  userId?: string;
}

export interface MilestoneEventDisplayProps {
  milestone: string;
  events?: MilestoneEvent[];
  className?: string;
}

/**
 * Displays events connected to a specific milestone
 */
export function MilestoneEventDisplay({ milestone, events = [], className = '' }: MilestoneEventDisplayProps) {
  // Get a friendly display name for the milestone
  const getMilestoneName = (milestoneType: string): string => {
    const entries = Object.entries(MILESTONE_EVENT_TYPES);
    const entry = entries.find(([_, value]) => value === milestoneType);
    if (!entry) return milestoneType;
    
    // Convert SNAKE_CASE to Title Case
    return entry[0].split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const hasEvents = events.length > 0;

  return (
    <div className={`milestone-event-display ${className}`}>
      <div className="flex items-center mb-2">
        <Badge variant="outline" className="mr-2 capitalize">
          {getMilestoneName(milestone)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {hasEvents ? `${events.length} event${events.length === 1 ? '' : 's'}` : 'No events'}
        </span>
      </div>
      
      {hasEvents && (
        <div className="space-y-2 mt-2">
          {events.map(event => (
            <Card key={event.id} className="p-3 text-sm">
              <div className="flex justify-between">
                <div>
                  <span className="font-medium">{event.type}</span>
                  {event.userId && (
                    <span className="ml-2 text-muted-foreground">by {event.userId}</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
              {event.details && Object.keys(event.details).length > 0 && (
                <div className="mt-2 text-xs overflow-hidden text-ellipsis">
                  {JSON.stringify(event.details)}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 