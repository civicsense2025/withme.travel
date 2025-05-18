import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ItineraryTabTemplate
 * 
 * Template component for the itinerary tab that arranges all sections and provides an "Add Item" button
 * 
 * @module itinerary/templates
 */

export interface ItineraryTabTemplateProps {
  /** The itinerary sections to display */
  sections: React.ReactNode;
  /** Callback when the add item button is clicked */
  onAddItem: () => void;
  /** Optional className for styling customization */
  className?: string;
  /** Text for the add button */
  addButtonText?: string;
}

export function ItineraryTabTemplate({ 
  sections, 
  onAddItem,
  className = '',
  addButtonText = 'Add Item'
}: ItineraryTabTemplateProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {sections}
      <Button onClick={onAddItem} className="mt-4">
        <PlusCircle className="mr-2 h-4 w-4" /> {addButtonText}
      </Button>
    </div>
  );
} 