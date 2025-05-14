'use client';

import React, { useState, useMemo, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, CalendarPlus, X } from 'lucide-react';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { useDroppable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { SimplifiedItemForm, BulkItemForm } from '@/components/trips/SimplifiedItemForm';
import { ItemStatus } from '@/utils/constants/status';

// Simple error boundary component that can be used as a wrapper
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Caught error in ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface UnscheduledItemsSectionProps {
  items: DisplayItineraryItem[];
  onVote?: (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => void;
  onStatusChange?: (id: string, status: ItemStatus | null) => Promise<void>;
  onDelete?: (id: string) => void;
  canEdit: boolean;
  onEditItem: (item: DisplayItineraryItem) => void | Promise<void>;
  onAddItem: () => void;
  onMoveItem?: (itemId: string, targetDay: number | null) => void;
  tripId: string;
  containerId: string;
  refetchItinerary?: () => Promise<void>;
}

// Memoize the entire component
export const UnscheduledItemsSection = memo(
  ({
    items,
    onVote,
    onStatusChange,
    onDelete,
    canEdit,
    onEditItem,
    onAddItem,
    onMoveItem,
    tripId,
    containerId,
    refetchItinerary,
  }: UnscheduledItemsSectionProps) => {
    const router = useRouter();
    const { toast } = useToast();

    // Setup droppable area for unscheduled items
    const { setNodeRef, isOver } = useDroppable({
      id: 'unscheduled',
      data: {
        type: 'day-section',
        dayNumber: null,
        id: 'unscheduled',
      },
    });

    // Memoize the sorted items to prevent unnecessary recalculations
    const sortedItems = useMemo(() => {
      // Create a new array to avoid mutating the original
      return [...items].sort((a, b) => {
        // Sort by position
        const posA = a.position ?? 0;
        const posB = b.position ?? 0;
        return posA - posB;
      });
    }, [items]);

    // Memoize the item IDs for SortableContext
    const itemIds = useMemo(() => sortedItems.map((item) => item.id), [sortedItems]);

    // Handle Maps import button click
    const handleMapImportClick = () => {
      toast({
        title: 'Coming Soon',
        description: 'The ability to import locations from maps will be available soon!',
        duration: 3000,
      });
    };

    // Filter empty component renders by combining conditions
    const hasItems = items.length > 0;

    return (
      <motion.div
        ref={setNodeRef}
        className={cn(
          'rounded-md transition-all duration-300 border-dashed border-2',
          'bg-muted/30 dark:bg-muted/10 border-muted-foreground/30',
          isOver ? 'ring-2 ring-primary p-4' : 'p-4'
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h2
            className="text-2xl font-bold tracking-tight"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Unscheduled Items
          </motion.h2>
        </div>

        {/* Add simplified forms if user can edit */}
        {canEdit && (
          <motion.div
            className="mb-6 space-y-3"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <SimplifiedItemForm tripId={tripId} dayNumber={null} onItemAdded={() => {}} />
            <BulkItemForm tripId={tripId} dayNumber={null} onItemAdded={() => {}} />
          </motion.div>
        )}

        <div className="space-y-4 min-h-[80px]">
          {!hasItems ? (
            <motion.div
              className="bg-muted/20 dark:bg-muted/5 standard-border-dashed p-4 text-center text-muted-foreground rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              No unscheduled items yet. Add some to your trip!
            </motion.div>
          ) : (
            <SortableContext
              items={itemIds}
              strategy={verticalListSortingStrategy}
              id="unscheduled"
            >
              <AnimatePresence initial={false}>
                {sortedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <ErrorBoundary
                      fallback={
                        <Card className="p-2 bg-red-50 dark:bg-red-900/20 standard-border">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Error displaying item
                          </p>
                        </Card>
                      }
                    >
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        disabled={!canEdit}
                        containerId="unscheduled"
                      >
                        <ItineraryItemCard
                          key={item.id}
                          item={item}
                          onDelete={onDelete ? () => onDelete(item.id) : undefined}
                          onEdit={() => onEditItem(item)}
                          onVote={
                            onVote
                              ? (type: 'up' | 'down') => onVote(item.id, null, type)
                              : undefined
                          }
                          onStatusChange={
                            onStatusChange
                              ? (status: ItemStatus | null) => onStatusChange(item.id, status)
                              : undefined
                          }
                          editable={canEdit}
                        />
                      </SortableItem>
                    </ErrorBoundary>
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
          )}
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    if (prevProps.canEdit !== nextProps.canEdit) return false;
    if (prevProps.items.length !== nextProps.items.length) return false;

    // Check if any relevant item properties have changed
    for (let i = 0; i < prevProps.items.length; i++) {
      const prevItem = prevProps.items[i];
      const nextItem = nextProps.items[i];

      if (!nextItem) return false;
      if (prevItem.id !== nextItem.id) return false;
      if (prevItem.position !== nextItem.position) return false;
      if (prevItem.status !== nextItem.status) return false;
    }

    return true;
  }
);

// Add display name for debugging purposes
UnscheduledItemsSection.displayName = 'UnscheduledItemsSection';
