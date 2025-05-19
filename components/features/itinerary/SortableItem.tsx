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
  // Determine if this item is in the unscheduled section
  const isInUnscheduledSection = containerId === 'unscheduled';

  // Items should be disabled if:
  // 1. They're explicitly disabled via props
  // 2. They're in the unscheduled section (which should never be draggable)
  const isDisabled = disabled || isInUnscheduledSection;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isDisabled,
    data: {
      type: 'item',
      id,
      containerId,
      sortable: {
        containerId,
      },
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    zIndex: isDragging ? 50 : 'auto',
  };

  // When dragging, add the dragging class to body for global cursor control
  React.useEffect(() => {
    if (isDragging) {
      document.body.classList.add('dragging-active');
    }

    // Clean up effect on unmount or when isDragging changes
    return () => {
      if (isDragging) {
        document.body.classList.remove('dragging-active');
      }
    };
  }, [isDragging]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...(isDisabled ? {} : listeners)}
      style={style}
      className={cn(
        'sortable-item focus:outline-none',
        isDragging ? 'z-50 opacity-70 scale-[1.02] shadow-xl' : 'opacity-100 scale-100',
        !isDisabled && 'relative',
        !isDisabled && !isDragging && 'hover:shadow-md transition-shadow duration-200'
      )}
      data-draggable={!isDisabled}
      data-dragging={isDragging || undefined}
    >
      {/* Add a visual indicator for draggable items when not disabled */}
      {!isDisabled && (
        <div
          className={cn(
            'absolute -left-1 top-0 bottom-0 w-1 bg-primary rounded-l-md opacity-0 transition-opacity duration-200',
            !isDragging && 'group-hover:opacity-50',
            isDragging && 'opacity-100'
          )}
        />
      )}
      {children}
    </div>
  );
};
