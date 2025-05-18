import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ItineraryItemAction
 * 
 * Provides edit and delete actions for itinerary items
 * 
 * @module itinerary/atoms
 */

export interface ItineraryItemActionProps {
  /** Callback when edit button is clicked */
  onEdit: () => void;
  /** Callback when delete button is clicked */
  onDelete: () => void;
  /** Optional className for styling customization */
  className?: string;
  /** Whether to show button labels */
  showLabels?: boolean;
}

export function ItineraryItemAction({ 
  onEdit, 
  onDelete, 
  className = '',
  showLabels = true
}: ItineraryItemActionProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onEdit}
        className="flex items-center gap-1"
      >
        <Edit className="h-3.5 w-3.5" />
        {showLabels && <span>Edit</span>}
      </Button>
      <Button 
        size="sm" 
        variant="destructive" 
        onClick={onDelete}
        className="flex items-center gap-1"
      >
        <Trash className="h-3.5 w-3.5" />
        {showLabels && <span>Delete</span>}
      </Button>
    </div>
  );
} 