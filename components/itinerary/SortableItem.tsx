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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
    transition,
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
        isDragging && 'z-10 opacity-50',
        !isDisabled && 'relative'
      )}
      data-draggable={!isDisabled}
    >
      {children}
    </div>
  );
};
