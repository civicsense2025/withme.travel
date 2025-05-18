/**
 * PlaceManager Component
 * 
 * A comprehensive UI for managing places, including listing, adding, and editing
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlaceList } from './PlaceList';
import { PlaceForm } from '../molecules';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { usePlaces } from '@/hooks/use-places';
import { Loader2, X } from 'lucide-react';
import type { Place, CreatePlaceData } from '@/lib/client/places';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface PlaceManagerProps {
  /** Destination ID for filtering places */
  destinationId: string;
  /** Whether to allow adding new places */
  allowAdd?: boolean;
  /** Whether to allow editing places */
  allowEdit?: boolean;
  /** Whether to allow selecting places */
  allowSelect?: boolean;
  /** Handler when a place is selected */
  onSelectPlace?: (place: Place) => void;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * A comprehensive UI for managing places, including listing, adding, and editing
 */
export function PlaceManager({
  destinationId,
  allowAdd = true,
  allowEdit = true,
  allowSelect = false,
  onSelectPlace,
  className,
}: PlaceManagerProps) {
  // State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks
  const { toast } = useToast();
  const { createPlace, updatePlace, fetchPlaces } = usePlaces();
  
  // Handlers
  const handleAddPlace = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditPlace = (place: Place) => {
    setSelectedPlace(place);
    setIsEditDialogOpen(true);
  };
  
  const handlePlaceClick = (place: Place) => {
    if (allowSelect && onSelectPlace) {
      onSelectPlace(place);
    } else if (allowEdit) {
      handleEditPlace(place);
    }
  };
  
  const handleAddSubmit = async (data: CreatePlaceData) => {
    try {
      setIsSubmitting(true);
      await createPlace(data);
      toast({
        title: 'Place added',
        description: `"${data.name}" has been successfully added.`,
      });
      setIsAddDialogOpen(false);
      // Refresh the list after adding
      fetchPlaces({ destination_id: destinationId });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add place',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditSubmit = async (data: CreatePlaceData) => {
    if (!selectedPlace) return;
    
    try {
      setIsSubmitting(true);
      await updatePlace(selectedPlace.id, data);
      toast({
        title: 'Place updated',
        description: `"${data.name}" has been successfully updated.`,
      });
      setIsEditDialogOpen(false);
      setSelectedPlace(null);
      // Refresh the list after editing
      fetchPlaces({ destination_id: destinationId });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update place',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Places list */}
      <PlaceList
        destinationId={destinationId}
        allowAdd={allowAdd}
        onAddPlace={allowAdd ? handleAddPlace : undefined}
        onSelectPlace={handlePlaceClick}
      />
      
      {/* Add Place Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add New Place</DialogTitle>
          </DialogHeader>
          <PlaceForm
            destinationId={destinationId}
            onSubmit={handleAddSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Place Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
          </DialogHeader>
          {selectedPlace && (
            <PlaceForm
              destinationId={destinationId}
              initialData={selectedPlace}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 