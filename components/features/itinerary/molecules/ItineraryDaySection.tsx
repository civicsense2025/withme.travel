/**
 * ItineraryDaySection
 *
 * Container component for displaying a single day in the itinerary with header and items
 *
 * @module itinerary/molecules
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { ItineraryDayHeader } from '../atoms/ItineraryDayHeader';
import { ItineraryItemCard } from '../atoms/ItineraryItemCard';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ItineraryItem {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  status?: string;
  category?: string;
  voteCount?: number;
  userVoted?: boolean;
}

export interface ItineraryDaySectionProps {
  /** The day number in the itinerary (starting from 1) */
  dayNumber: number;
  /** Date for this day */
  date?: string | Date;
  /** Array of itinerary items for this day */
  items: ItineraryItem[];
  /** Callback for when an item is edited */
  onEditItem?: (id: string) => void;
  /** Callback for when an item is deleted */
  onDeleteItem?: (id: string) => void;
  /** Callback for when an item is voted on */
  onVoteItem?: (id: string) => void;
  /** Whether the user can edit items */
  canEdit?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a date for display in the header
 */
const formatHeaderDate = (date?: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return isValid(dateObj) 
    ? format(dateObj, 'EEEE, MMMM d, yyyy')
    : '';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ItineraryDaySection({
  dayNumber,
  date,
  items = [],
  onEditItem,
  onDeleteItem,
  onVoteItem,
  canEdit = false,
  className,
}: ItineraryDaySectionProps) {
  const formattedDate = formatHeaderDate(date);
  const title = `Day ${dayNumber}`;
  
  return (
    <div className={cn('mb-8', className)}>
      <ItineraryDayHeader
        title={title}
        date={formattedDate}
      />
      
      {items.length === 0 ? (
        <div className="p-4 bg-muted rounded-md text-center text-muted-foreground text-sm">
          No items scheduled for this day
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ItineraryItemCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              location={item.location}
              startTime={item.startTime}
              endTime={item.endTime}
              status={item.status}
              category={item.category}
              voteCount={item.voteCount}
              userVoted={item.userVoted}
              canEdit={canEdit}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onVote={onVoteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
} 