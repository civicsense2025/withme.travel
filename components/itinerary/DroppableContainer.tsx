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
  disabled,
  items = [], // Default to empty array
}: DroppableContainerProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    disabled: disabled,
    data: {
      // Pass data about the container
      type: 'container',
      accepts: ['item'], // Example: Define what type of items it accepts
      items: items, // Pass items currently in this container if needed
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'p-4 border rounded-lg transition-colors duration-200',
        isOver ? 'border-primary bg-primary/10' : 'border-border',
        className
      )}
      aria-label={`Drop zone ${id}`}
    >
      {children}
    </div>
  );
}
