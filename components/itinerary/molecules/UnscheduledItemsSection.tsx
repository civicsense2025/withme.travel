/**
 * UnscheduledItemsSection
 *
 * Container component for displaying unscheduled itinerary items
 *
 * @module itinerary/molecules
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ItineraryDayHeader } from '../atoms/ItineraryDayHeader';
import { ItineraryItemCard } from '../atoms/ItineraryItemCard';
import { ItineraryItem } from './ItineraryDaySection';
import { CalendarX2 } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface UnscheduledItemsSectionProps {
  /** Array of unscheduled itinerary items */
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
// MAIN COMPONENT
// ============================================================================

export function UnscheduledItemsSection({
  items = [],
  onEditItem,
  onDeleteItem,
  onVoteItem,
  canEdit = false,
  className,
}: UnscheduledItemsSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('mb-8', className)}>
      <ItineraryDayHeader
        title="Unscheduled Items"
      />
      
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
    </div>
  );
} 