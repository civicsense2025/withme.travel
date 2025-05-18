/**
 * ItineraryTabTemplate
 *
 * Container component that organizes the complete itinerary view with days and unscheduled items
 *
 * @module itinerary/organisms
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ItineraryDaySection, ItineraryItem } from '../molecules/ItineraryDaySection';
import { UnscheduledItemsSection } from '../molecules/UnscheduledItemsSection';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface DayItems {
  dayNumber: number;
  date?: string | Date;
  items: ItineraryItem[];
}

export interface ItineraryTabTemplateProps {
  /** Array of day sections with their items */
  days: DayItems[];
  /** Unscheduled items */
  unscheduledItems?: ItineraryItem[];
  /** Callback for when an item is edited */
  onEditItem?: (id: string) => void;
  /** Callback for when an item is deleted */
  onDeleteItem?: (id: string) => void;
  /** Callback for when an item is voted on */
  onVoteItem?: (id: string) => void;
  /** Handler for add item button click */
  onAddItem?: () => void;
  /** Whether the user can edit items */
  canEdit?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ItineraryTabTemplate({
  days = [],
  unscheduledItems = [],
  onEditItem,
  onDeleteItem,
  onVoteItem,
  onAddItem,
  canEdit = false,
  isLoading = false,
  className,
}: ItineraryTabTemplateProps) {
  const hasItems = days.some(day => day.items.length > 0) || unscheduledItems.length > 0;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col w-full max-w-2xl space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded w-full"></div>
          <div className="h-32 bg-muted rounded w-full"></div>
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-lg font-medium mb-2">No Itinerary Items</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start building your trip itinerary by adding activities, accommodations, transportation, and other items.
        </p>
        {canEdit && onAddItem && (
          <Button onClick={onAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Item
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Add Item Button */}
      {canEdit && onAddItem && (
        <div className="flex justify-end">
          <Button onClick={onAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      )}
      
      {/* Unscheduled Items */}
      {unscheduledItems.length > 0 && (
        <UnscheduledItemsSection
          items={unscheduledItems}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
          onVoteItem={onVoteItem}
          canEdit={canEdit}
        />
      )}
      
      {/* Day Sections */}
      {days.map((day) => (
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
    </div>
  );
} 