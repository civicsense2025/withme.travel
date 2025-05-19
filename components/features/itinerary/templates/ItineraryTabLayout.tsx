/**
 * ItineraryTabTemplate
 *
 * Main template component for the itinerary tab that displays scheduled and unscheduled items
 *
 * @module itinerary/templates
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ItineraryDaySection, ItineraryItem } from '../molecules/ItineraryDaySection';
import { UnscheduledItemsSection } from '../molecules/UnscheduledItemsSection';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DaySchedule {
  dayNumber: number;
  date: string | Date;
  items: ItineraryItem[];
}

export interface ItineraryTabLayoutProps {
  /** Array of scheduled days with their items */
  scheduledDays: DaySchedule[];
  /** Array of unscheduled items */
  unscheduledItems: ItineraryItem[];
  /** Callback for when an item is edited */
  onEditItem?: (id: string) => void;
  /** Callback for when an item is deleted */
  onDeleteItem?: (id: string) => void;
  /** Callback for when an item is voted on */
  onVoteItem?: (id: string) => void;
  /** Callback for when the add item button is clicked */
  onAddItem?: () => void;
  /** Whether the user can edit items */
  canEdit?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ItineraryTabLayout({
  scheduledDays = [],
  unscheduledItems = [],
  onEditItem,
  onDeleteItem,
  onVoteItem,
  onAddItem,
  canEdit = false,
  className,
}: ItineraryTabLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {canEdit && onAddItem && (
        <div className="flex justify-end mb-4">
          <Button 
            onClick={onAddItem}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      )}
      
      {scheduledDays.map((day) => (
        <ItineraryDaySection
          key={`day-${day.dayNumber}`}
          dayNumber={day.dayNumber}
          date={day.date}
          items={day.items}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onVoteItem={onVoteItem}
          canEdit={canEdit}
        />
      ))}
      
      <UnscheduledItemsSection
        items={unscheduledItems}
        onEditItem={onEditItem}
        onDeleteItem={onDeleteItem}
        onVoteItem={onVoteItem}
        canEdit={canEdit}
      />
    </div>
  );
} 