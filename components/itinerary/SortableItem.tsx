import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
// Removed CSS import as it might not be exported or needed
// import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  // Pass containerId to identify the list in drag events
  containerId: string | number;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  disabled,
  containerId,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } =
    useSortable({
      id,
      disabled,
      data: {
        // Include data for context if needed in drag handlers
        containerId,
        type: 'item',
      },
    });

  // DEBUGGING: Log applied props and listeners
  console.log(
    `[SortableItem ${id}] Disabled: ${disabled}, Listeners: ${!!listeners}, Attrs: ${!!attributes}`
  );

  // Style for transform/transition during drag
  const style = {
    // Use transform object directly to create translate3d string
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: transition || undefined,
  };

  return (
    // Root div for positioning and attributes
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} // Apply attributes here (like role, aria-properties)
      className={cn(
        'relative touch-none select-none', // Base styles
        isDragging && 'opacity-50 z-50 shadow-lg', // Dragging styles
        isSorting && 'transition-transform', // Sorting transition
        // Common hover/active styles (apply visually, not functionally interfering)
        !disabled && [
          'group-hover:bg-muted/10',
          'hover:shadow-md',
          'hover:scale-[1.01]',
          'transition-all duration-150 ease-out',
          'active:bg-muted/20',
        ],
        disabled && 'cursor-default'
      )}
    >
      {/* Inner div for attaching drag listeners */}
      <div
        {...listeners} // Apply listeners HERE
        className={cn(
          // Apply cursor styles based on disabled state to this listener div
          !disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        )}
      >
        {/* Render children directly inside the listener div */}
        {children}
      </div>
    </div>
  );
};
