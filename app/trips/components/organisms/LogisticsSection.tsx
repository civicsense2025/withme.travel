// ============================================================================
// LOGISTICS SECTION COMPONENT
// ============================================================================

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BedDouble, Car } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DroppableContainer } from '../atoms/DroppableContainer';
import {
  DragOverlay,
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { LogisticsItem } from '@/hooks/use-logistics';

/**
 * Props for the LogisticsSection component
 */
export interface LogisticsSectionProps {
  tripId: string;
  canEdit: boolean;
  refetchItinerary?: () => Promise<void>;
}

function EmptyAccommodationPlaceholder({ canEdit }: { canEdit: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">
          No accommodations have been added to this trip yet.
        </p>
        {canEdit && (
          <p className="text-sm text-muted-foreground">
            Add hotels, Airbnbs, or other places where you'll be staying during your trip. These
            will also appear in your trip itinerary.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyTransportationPlaceholder({ canEdit }: { canEdit: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">
          No transportation options have been added to this trip yet.
        </p>
        {canEdit && (
          <p className="text-sm text-muted-foreground">
            Add flights, train tickets, rental cars, or other transportation details for your trip.
            These will also appear in your trip itinerary.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function LogisticsItemCard({ item }: { item: LogisticsItem }) {
  return (
    <Card key={item.id} className="mb-2" draggable={true}>
      <CardContent className="p-4">
        <h4 className="font-medium">{item.title}</h4>
        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
        {item.location && <p className="text-sm mt-1">Location: {item.location}</p>}
        {item.startDate && (
          <p className="text-sm">From: {new Date(item.startDate).toLocaleDateString()}</p>
        )}
        {item.endDate && (
          <p className="text-sm">To: {new Date(item.endDate).toLocaleDateString()}</p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Displays the logistics section for a trip, including accommodations and transportation
 */
export function LogisticsSection({ tripId, canEdit, refetchItinerary }: LogisticsSectionProps) {
  // For now, use local state for demo; in real use, fetch logistics items from API/hook
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [activeItem, setActiveItem] = useState<LogisticsItem | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Drag handlers (stubbed for now)
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggingItem = active.data?.current;
    if (draggingItem) setActiveItem(draggingItem as LogisticsItem);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        {/* Accommodation Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Accommodation</h3>
            {canEdit && (
              <Button size="sm" variant="outline" className="gap-1">
                <BedDouble className="h-4 w-4" />
                <span>Add Accommodation</span>
              </Button>
            )}
          </div>
          <Separator />
          <DroppableContainer
            id="accommodation-container"
            className="min-h-[150px]"
            disabled={!canEdit}
          >
            {items
              .filter((item) => item.type === 'accommodation')
              .map((item) => (
                <LogisticsItemCard key={item.id} item={item} />
              ))}
            {items.filter((item) => item.type === 'accommodation').length === 0 && (
              <EmptyAccommodationPlaceholder canEdit={canEdit} />
            )}
          </DroppableContainer>
        </section>

        {/* Transportation Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Transportation</h3>
            {canEdit && (
              <Button size="sm" variant="outline" className="gap-1">
                <Car className="h-4 w-4" />
                <span>Add Transportation</span>
              </Button>
            )}
          </div>
          <Separator />
          <DroppableContainer
            id="transportation-container"
            className="min-h-[150px]"
            disabled={!canEdit}
          >
            {items
              .filter((item) => item.type === 'transportation')
              .map((item) => (
                <LogisticsItemCard key={item.id} item={item} />
              ))}
            {items.filter((item) => item.type === 'transportation').length === 0 && (
              <EmptyTransportationPlaceholder canEdit={canEdit} />
            )}
          </DroppableContainer>
        </section>

        {/* Drag overlay */}
        <DragOverlay>{activeItem ? <LogisticsItemCard item={activeItem} /> : null}</DragOverlay>
      </div>
    </DndContext>
  );
}

export default LogisticsSection;
