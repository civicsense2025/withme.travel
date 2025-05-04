import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
  // Pass containerId to identify the list in drag events
  containerId: string | number;
  layoutId?: string; // Only set on overlay
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  disabled,
  containerId,
  layoutId,
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
    // Hide the original item when dragging (so only overlay is visible)
    visibility: isDragging ? 'hidden' : undefined,
  };

  // Always show grab cursor on the whole card
  const rootCursor = !disabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes} // Apply attributes here (like role, aria-properties)
      className={cn(
        'relative touch-none select-none', // Base styles
        isDragging && 'z-10', // Dragging styles
        isSorting && 'transition-transform', // Sorting transition
        rootCursor // Apply conditional classes
      )}
      layout
      // Only set layoutId if provided (for overlay)
      {...(layoutId ? { layoutId } : {})}
      animate={{
        scale: isDragging ? 1.04 : 1,
        boxShadow: isDragging
          ? '0 8px 32px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.10)'
          : '0 1px 3px rgba(0,0,0,0.08)',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
    >
      {/* Inner div for attaching drag listeners with tooltip */}
      {!disabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...listeners} // Apply listeners HERE
                // Remove cursor classes here, handled by root
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
    </motion.div>
  );
};
