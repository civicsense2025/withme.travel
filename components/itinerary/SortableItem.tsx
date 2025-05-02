import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
// Removed CSS import as it might not be exported or needed
// import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Create conditional classes for hover/active states
  const hoverClasses = !disabled
    ? 'group-hover:bg-muted/10 hover:shadow-md hover:scale-[1.01] transition-all duration-150 ease-out active:bg-muted/20'
    : 'cursor-default';

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
        hoverClasses // Apply conditional classes
      )}
    >
      {/* Inner div for attaching drag listeners with tooltip */}
      {!disabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...listeners} // Apply listeners HERE
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Render children directly inside the listener div */}
                {children}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Drag to reorder</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="cursor-default">{children}</div>
      )}
    </div>
  );
};
