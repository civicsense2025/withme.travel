/**
 * LogisticsItemCard
 * 
 * Card component for displaying logistics items like accommodations and transportation
 * 
 * @module trips/molecules
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { LogisticsItemIcon } from '@/components/trips/atoms/LogisticsItemIcon';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface LogisticsItemCardProps {
  /** Unique ID of the logistics item */
  id: string;
  /** Type of logistics item */
  type: 'accommodation' | 'transportation' | string;
  /** Title/name of the item */
  title: string;
  /** Optional location information */
  location?: string;
  /** Optional start date for the item */
  startDate?: string;
  /** Optional end date for the item */
  endDate?: string;
  /** Optional additional description */
  description?: string;
  /** Transportation mode (if type is transportation) */
  transportMode?: string;
  /** Whether the card is draggable */
  draggable?: boolean;
  /** Whether editing is allowed */
  canEdit?: boolean;
  /** Optional CSS class name */
  className?: string;
  /** Callback for edit action */
  onEdit?: () => void;
  /** Callback for delete action */
  onDelete?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a date string for display
 */
function formatDateString(dateString?: string): string {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'PPP');
  } catch (error) {
    return dateString;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LogisticsItemCard({
  id,
  type,
  title,
  location,
  startDate,
  endDate,
  description,
  transportMode,
  draggable = false,
  canEdit = false,
  className = '',
  onEdit,
  onDelete,
}: LogisticsItemCardProps) {
  return (
    <Card 
      key={id} 
      className={cn("mb-2 overflow-hidden", className)}
      draggable={draggable}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <LogisticsItemIcon 
              type={type} 
              transportMode={transportMode}
              className="text-muted-foreground"
            />
            <h4 className="font-medium">{title}</h4>
          </div>

          {canEdit && (
            <div className="flex gap-1">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-destructive">
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {type === 'accommodation' && (
          <div className="mt-2 space-y-1 text-sm">
            {location && <p className="text-muted-foreground">📍 {location}</p>}
            {startDate && endDate && (
              <p className="text-muted-foreground">
                🗓️ {formatDateString(startDate)} - {formatDateString(endDate)}
              </p>
            )}
          </div>
        )}

        {type === 'transportation' && (
          <div className="mt-2 space-y-1 text-sm">
            {location && <p className="text-muted-foreground">🚩 {location}</p>}
            {startDate && (
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">🛫 {formatDateString(startDate)}</p>
                {transportMode && <Badge variant="outline">{transportMode}</Badge>}
              </div>
            )}
            {endDate && <p className="text-muted-foreground">🛬 {formatDateString(endDate)}</p>}
          </div>
        )}

        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
} 