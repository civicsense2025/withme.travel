/**
 * ItineraryItemCard
 *
 * Card component that displays a single itinerary item with time, title, details, and actions
 *
 * @module itinerary/atoms
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, MapPin, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ItineraryItemStatus } from './ItineraryItemStatus';
import { ItineraryItemAction } from './ItineraryItemAction';
import { format, isValid } from 'date-fns';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ItineraryItemCardProps {
  /** Unique identifier for the item */
  id: string;
  /** Title of the itinerary item */
  title: string;
  /** Description or notes about the item */
  description?: string;
  /** Location name */
  location?: string;
  /** Start time (ISO string or Date object) */
  startTime?: string | Date;
  /** End time (ISO string or Date object) */
  endTime?: string | Date;
  /** Status of the item (confirmed, suggested, etc.) */
  status?: string;
  /** Type or category of the item */
  category?: string;
  /** Optional vote count to display */
  voteCount?: number;
  /** User's vote status */
  userVoted?: boolean;
  /** Flag indicating if the current user can edit this item */
  canEdit?: boolean;
  /** Handler for edit button click */
  onEdit?: (id: string) => void;
  /** Handler for delete button click */
  onDelete?: (id: string) => void;
  /** Handler for vote button click */
  onVote?: (id: string) => void;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a time for display
 */
const formatTime = (time: string | Date | undefined): string => {
  if (!time) return '';
  
  const dateObj = typeof time === 'string' ? new Date(time) : time;
  
  return isValid(dateObj) ? format(dateObj, 'h:mm a') : '';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ItineraryItemCard({
  id,
  title,
  description,
  location,
  startTime,
  endTime,
  status = 'suggested',
  category,
  voteCount = 0,
  userVoted = false,
  canEdit = false,
  onEdit,
  onDelete,
  onVote,
  className,
}: ItineraryItemCardProps) {
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);
  
  const timeDisplay = formattedStartTime && formattedEndTime
    ? `${formattedStartTime} - ${formattedEndTime}`
    : formattedStartTime || '';

  return (
    <Card className={cn('w-full overflow-hidden border rounded-lg', className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {timeDisplay && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{timeDisplay}</span>
                </div>
              )}
              {category && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3 mr-1" />
                  <span className="capitalize">{category}</span>
                </div>
              )}
            </div>
            
            <h3 className="text-base font-medium truncate">{title}</h3>
            
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
            
            {location && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <ItineraryItemStatus status={status} />
            
            {canEdit && (
              <div className="flex gap-1">
                <ItineraryItemAction
                  onEdit={() => onEdit?.(id)}
                  size="sm"
                />
                <ItineraryItemAction
                  onDelete={() => onDelete?.(id)}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
        
        {onVote && (
          <div className="flex items-center justify-end mt-3">
            <button
              onClick={() => onVote(id)}
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                userVoted 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-primary/10"
              )}
            >
              <span>{userVoted ? "Voted" : "Vote"}</span>
              {voteCount > 0 && (
                <span className="rounded-full bg-background px-1.5 py-0.5 text-xs font-semibold">
                  {voteCount}
                </span>
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 