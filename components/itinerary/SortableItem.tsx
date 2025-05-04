import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

  // Improved style for transform/transition during drag with hardware acceleration
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto', // Higher z-index during drag
    opacity: isDragging ? 0.5 : 1,
    position: isDragging ? 'relative' as const : undefined,
    pointerEvents: isDragging ? 'none' as const : undefined,
    transformOrigin: '0 0',
    willChange: isDragging ? 'transform' : undefined,
  };

  // Create conditional classes for hover/active states
  const hoverClasses = !disabled
    ? 'group-hover:bg-muted/10 hover:shadow-md hover:scale-[1.01] transition-all duration-150 ease-out active:bg-muted/20 cursor-grab active:cursor-grabbing'
    : 'cursor-default';

  return (
    // Root div for positioning and attributes
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} // Apply attributes here (like role, aria-properties)
      className={cn(
        'relative touch-none select-none', // Base styles
        isDragging && 'z-10 shadow-lg', // Dragging styles
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
