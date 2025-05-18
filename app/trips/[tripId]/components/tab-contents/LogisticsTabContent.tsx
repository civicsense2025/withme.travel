/**
 * LogisticsTabContent
 * 
 * Tab content for trip logistics management
 */

'use client';

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { LogisticsSection } from '@/components/trips/organisms/LogisticsSection';
import type { LogisticsItem } from '@/hooks/use-logistics';

interface LogisticsTabContentProps {
  tripId: string;
  canEdit: boolean;
  refetchItinerary?: () => Promise<void>;
}

export function LogisticsTabContent({
  tripId,
  canEdit,
  refetchItinerary,
}: LogisticsTabContentProps) {
  // State for drag-and-drop functionality
  const [activeItem, setActiveItem] = useState<LogisticsItem | null>(null);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggingItem = active.data?.current;

    if (draggingItem) {
      setActiveItem(draggingItem as LogisticsItem);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    // Handle any drop logic here if needed
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <LogisticsSection
        tripId={tripId}
        canEdit={canEdit}
        refetchItinerary={refetchItinerary}
      />
      
      {/* DragOverlay for drag-and-drop visualization */}
      <DragOverlay>
        {activeItem ? (
          <div className="w-full max-w-md opacity-80">
            {/* Placeholder for dragged item */}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
