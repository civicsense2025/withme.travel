'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface UnscheduledItemsSectionProps {
  items: DisplayItineraryItem[];
  canEdit: boolean;
  onAddItem: () => void;
  onEditItem: (item: DisplayItineraryItem) => void;
}

export const UnscheduledItemsSection: React.FC<UnscheduledItemsSectionProps> = ({
  items,
  canEdit,
  onAddItem,
  onEditItem,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unscheduled',
    data: {
      type: 'unscheduled-section',
      accepts: ['item'],
  },
  });

  // Get all item IDs for sortable context
  const itemIds = items.map((item) => item.id);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-1 transition-colors duration-200 ${isOver ? 'bg-primary/10' : ''}`}
    >
      <Card className="mb-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Unscheduled Items</CardTitle>
          {canEdit && (
            <Button onClick={onAddItem} variant="secondary" size="sm" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>Add Item</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <p>No unscheduled items yet.</p>
              <p className="text-sm mt-1">Add items here that you're considering for your trip.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    containerId="unscheduled"
                    disabled={!canEdit}
                  >
                    <ItineraryItemCard item={item} onEdit={() => onEditItem(item)} />
                  </SortableItem>
                ))}
              </SortableContext>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};