/**
 * Destination Note Prompt
 * 
 * Prompt to add destination information as a note
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface DestinationNotePromptProps {
  /** Destination name */
  destinationName: string;
  /** Function to handle click on the add button */
  onAddClick: () => void;
  /** Whether the button is in loading state */
  isLoading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Prompt to add destination information as a note
 */
export function DestinationNotePrompt({ 
  destinationName, 
  onAddClick, 
  isLoading = false 
}: DestinationNotePromptProps) {
  return (
    <div className="mt-4 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-medium mb-2">Add Destination Information</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add a default note with information about {destinationName} to help your group learn
        about your destination.
      </p>
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={onAddClick}
        disabled={isLoading}
      >
        <PlusCircle className="h-4 w-4" />
        {isLoading ? 'Adding...' : 'Add Destination Note'}
      </Button>
    </div>
  );
} 