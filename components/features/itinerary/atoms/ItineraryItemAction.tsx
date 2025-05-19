/**
 * ItineraryItemAction
 *
 * Action button for itinerary items with icon and tooltip
 *
 * @module itinerary/atoms
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from '@/components/ui/tooltip';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ItineraryItemActionProps {
  /** Handler for edit action */
  onEdit?: () => void;
  /** Handler for delete action */
  onDelete?: () => void;
  /** Whether the actions should be shown */
  showActions?: boolean;
  /** Additional class names */
  className?: string;
  /** Size of the action buttons: 'sm' or 'default' */
  size?: 'sm' | 'default';
  /** If true, will show labels next to icons */
  showLabels?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ItineraryItemAction({
  onEdit,
  onDelete,
  showActions = true,
  className,
  size = 'default',
  showLabels = false,
}: ItineraryItemActionProps) {
  if (!showActions) {
    return null;
  }

  const iconSize = size === 'sm' ? 14 : 16;
  const buttonSize = size === 'sm' ? 'sm' : 'default';
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={buttonSize}
              className="text-muted-foreground hover:text-primary"
              onClick={onEdit}
            >
              <Pencil size={iconSize} className="mr-1" />
              {showLabels && <span>Edit</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit item</TooltipContent>
        </Tooltip>
      )}
      
      {onDelete && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={buttonSize}
              className="text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 size={iconSize} className="mr-1" />
              {showLabels && <span>Delete</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete item</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
} 