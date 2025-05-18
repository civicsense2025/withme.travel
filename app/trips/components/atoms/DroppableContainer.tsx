import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableContainerProps {
  id: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function DroppableContainer({
  id,
  className = '',
  disabled = false,
  children,
}: DroppableContainerProps) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className={
        `transition-colors border-2 border-dashed rounded-md min-h-[48px] ` +
        (isOver ? 'border-primary bg-primary/10' : 'border-muted') +
        (className ? ` ${className}` : '')
      }
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}

export default DroppableContainer;
