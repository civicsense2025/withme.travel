/**
 * LogisticsSection
 * 
 * Logistics section organism for trip logistics management
 * 
 * @module trips/organisms
 */

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DroppableContainer } from '@/components/itinerary/DroppableContainer';
import { LogisticsItemCard } from '@/components/trips/molecules/LogisticsItemCard';
import { EmptyLogisticsState } from '@/components/trips/molecules/EmptyLogisticsState';
import { LogisticsDialog } from '@/components/trips/molecules/LogisticsDialog';
import { BedDouble, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLogistics } from '@/hooks/use-logistics';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface LogisticsSectionProps {
  /** ID of the trip */
  tripId: string;
  /** Whether the user can edit */
  canEdit?: boolean;
  /** Function to refresh the itinerary */
  refetchItinerary?: () => Promise<void>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LogisticsSection({
  tripId,
  canEdit = false,
  refetchItinerary,
}: LogisticsSectionProps) {
  // Access the logistics hook
  const {
    accommodations,
    transportation,
    isLoading,
    error,
    addAccommodation,
    addTransportation,
    refresh,
  } = useLogistics(tripId);

  // Local state
  const [isAccommodationDialogOpen, setIsAccommodationDialogOpen] = useState(false);
  const [isTransportationDialogOpen, setIsTransportationDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch logistics data on mount
  React.useEffect(() => {
    refresh();
  }, [refresh, tripId]);

  // Handle accommodations form submission
  const handleAccommodationSubmit = useCallback(async (data: {
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }) => {
    const success = await addAccommodation(data);
    
    if (success) {
      setIsAccommodationDialogOpen(false);
      
      // Offer to view in itinerary
      toast({
        title: 'Accommodation added to itinerary',
        description: 'Would you like to view it in the itinerary?',
        action: (
          <Button variant="outline" size="sm" onClick={navigateToItinerary}>
            View Itinerary
          </Button>
        ),
      });
      
      // Refresh itinerary if needed
      if (refetchItinerary) {
        await refetchItinerary();
      }
    }
  }, [addAccommodation, toast, refetchItinerary]);

  // Handle transportation form submission
  const handleTransportationSubmit = useCallback(async (data: {
    title: string;
    transportMode?: string;
    departureLocation?: string;
    arrivalLocation?: string;
    departureDate?: string;
    arrivalDate?: string;
    description?: string;
  }) => {
    // Map from dialog data to API expected structure
    const transportData = {
      title: data.title,
      departureLocation: data.departureLocation,
      arrivalLocation: data.arrivalLocation,
      departureDate: data.departureDate,
      arrivalDate: data.arrivalDate,
      description: data.description,
    };
    
    const success = await addTransportation(transportData);
    
    if (success) {
      setIsTransportationDialogOpen(false);
      
      // Offer to view in itinerary
      toast({
        title: 'Transportation added to itinerary',
        description: 'Would you like to view it in the itinerary?',
        action: (
          <Button variant="outline" size="sm" onClick={navigateToItinerary}>
            View Itinerary
          </Button>
        ),
      });
      
      // Refresh itinerary if needed
      if (refetchItinerary) {
        await refetchItinerary();
      }
    }
  }, [addTransportation, toast, refetchItinerary]);

  // Handle navigation to the itinerary tab
  const navigateToItinerary = () => {
    // Navigate to the itinerary tab using the window location
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', 'itinerary');
    router.push(currentUrl.toString());
  };

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading logistics information. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Accommodation Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold">Accommodation</h3>
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setIsAccommodationDialogOpen(true)}
              disabled={isLoading}
            >
              <BedDouble className="h-4 w-4" />
              <span>Add Accommodation</span>
            </Button>
          )}
        </div>
        <Separator />
        <DroppableContainer
          id="accommodation-container"
          className="min-h-[150px]"
          disabled={!canEdit}
        >
          {accommodations.length > 0 ? (
            accommodations.map((item) => (
              <LogisticsItemCard
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.title}
                location={item.location}
                startDate={item.startDate}
                endDate={item.endDate}
                description={item.description}
                draggable={canEdit}
                canEdit={canEdit}
              />
            ))
          ) : (
            <EmptyLogisticsState
              type="accommodation"
              canEdit={canEdit}
              onAdd={() => setIsAccommodationDialogOpen(true)}
            />
          )}
        </DroppableContainer>
      </section>

      {/* Transportation Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold">Transportation</h3>
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setIsTransportationDialogOpen(true)}
              disabled={isLoading}
            >
              <Car className="h-4 w-4" />
              <span>Add Transportation</span>
            </Button>
          )}
        </div>
        <Separator />
        <DroppableContainer
          id="transportation-container"
          className="min-h-[150px]"
          disabled={!canEdit}
        >
          {transportation.length > 0 ? (
            transportation.map((item) => (
              <LogisticsItemCard
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.title}
                location={item.location}
                startDate={item.startDate}
                endDate={item.endDate}
                description={item.description}
                draggable={canEdit}
                canEdit={canEdit}
              />
            ))
          ) : (
            <EmptyLogisticsState
              type="transportation"
              canEdit={canEdit}
              onAdd={() => setIsTransportationDialogOpen(true)}
            />
          )}
        </DroppableContainer>
      </section>

      {/* Dialogs */}
      <LogisticsDialog
        type="accommodation"
        open={isAccommodationDialogOpen}
        onOpenChange={setIsAccommodationDialogOpen}
        onSubmit={handleAccommodationSubmit}
        isLoading={isLoading}
      />
      
      <LogisticsDialog
        type="transportation"
        open={isTransportationDialogOpen}
        onOpenChange={setIsTransportationDialogOpen}
        onSubmit={handleTransportationSubmit}
        isLoading={isLoading}
      />
    </div>
  );
} 