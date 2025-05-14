'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  items?: { id: string }[]; // Optional: Pass items if needed for data transfer
}

export function DroppableContainer({
  id,
  children,
  className,
  disabled = false,
  items,
}: DroppableContainerProps) {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    disabled,
    data: {
      type: id === 'unscheduled' ? 'unscheduled-section' : 'container',
      id,
      disabled,
      accepts: ['item', 'form', 'accommodation', 'transportation'],
      items,
    },
  });

  const isDayContainer = id.startsWith('day-');
  const isUnscheduled = id === 'unscheduled';
  const isEmpty = React.Children.count(children) === 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative rounded-md border transition-all duration-200 ease-in-out',
        isOver && active && 'ring-2 ring-primary/50 border-primary/20 bg-primary/5',
        isDayContainer && isOver && active && 'border-primary/30',
        isUnscheduled &&
          isOver &&
          active &&
          'border-orange-400/30 bg-orange-50/20 dark:bg-orange-950/10',
        isEmpty && 'min-h-[100px] flex items-center justify-center border-dashed',
        disabled ? 'cursor-default' : 'cursor-auto',
        className
      )}
      data-droppable-id={id}
      data-is-over={isOver || undefined}
      data-disabled={disabled || undefined}
    >
      {/* Visual indicator for drop target */}
      {isOver && active && (
        <div className="absolute inset-0 rounded-md bg-gradient-to-b from-transparent to-primary/5 pointer-events-none animate-pulse" />
      )}
      {children}
    </div>
  );
}
