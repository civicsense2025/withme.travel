'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BedDouble, Car } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DroppableContainer } from '@/components/itinerary/DroppableContainer';
import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { API_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { DisplayItineraryItem } from '@/types/itinerary';
import { useRouter } from 'next/navigation';
import { 
  addFormToTrip, 
  addAccommodationToTrip, 
  addTransportationToTrip 
} from '@/lib/client/itinerary';
import { isSuccess } from '@/lib/client/result';
import { useTripContext } from '../../context/trip-context';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LogisticsTabContentProps {
  tripId: string;
  canEdit: boolean;
  refetchItinerary?: () => Promise<void>;
}

// Define types for the logistics items
interface LogisticsItem {
  id: string;
  type: 'form' | 'accommodation' | 'transportation';
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

// Placeholder components - used when containers are empty
function EmptyAccommodationPlaceholder({ canEdit }: { canEdit: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">
          No accommodations have been added to this trip yet.
        </p>
        {canEdit && (
          <p className="text-sm text-muted-foreground">
            Add hotels, Airbnbs, or other places where you'll be staying during your trip. These
            will also appear in your trip itinerary.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyTransportationPlaceholder({ canEdit }: { canEdit: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">
          No transportation options have been added to this trip yet.
        </p>
        {canEdit && (
          <p className="text-sm text-muted-foreground">
            Add flights, train tickets, rental cars, or other transportation details for your trip.
            These will also appear in your trip itinerary.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Individual logistics item component
function LogisticsItemCard({ item }: { item: LogisticsItem }) {
  return (
    <Card key={item.id} className="mb-2" draggable={true}>
      <CardContent className="p-4">
        <h4 className="font-medium">{item.title}</h4>
        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
        {item.location && <p className="text-sm mt-1">Location: {item.location}</p>}
        {item.startDate && (
          <p className="text-sm">From: {new Date(item.startDate).toLocaleDateString()}</p>
        )}
        {item.endDate && (
          <p className="text-sm">To: {new Date(item.endDate).toLocaleDateString()}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Accommodation dialog component
function AccommodationDialog({
  isOpen,
  onOpenChange,
  onSubmit
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Accommodation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="accommodation-name">Name</Label>
            <Input id="accommodation-name" placeholder="Hotel, Airbnb, etc." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accommodation-location">Location</Label>
            <Input id="accommodation-location" placeholder="Address or location" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="check-in">Check-in</Label>
              <Input id="check-in" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="check-out">Check-out</Label>
              <Input id="check-out" type="date" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accommodation-notes">Notes</Label>
            <Textarea
              id="accommodation-notes"
              placeholder="Additional details like confirmation number, contact information, etc."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Accommodation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Transportation dialog component
function TransportationDialog({
  isOpen,
  onOpenChange,
  onSubmit
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transportation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="transportation-type">Type</Label>
            <Input id="transportation-type" placeholder="Flight, Train, Car Rental, etc." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="departure-location">From</Label>
              <Input id="departure-location" placeholder="Departure location" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="arrival-location">To</Label>
              <Input id="arrival-location" placeholder="Arrival location" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="departure-date">Departure Date</Label>
              <Input id="departure-date" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="arrival-date">Arrival Date</Label>
              <Input id="arrival-date" type="date" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="transportation-notes">Notes</Label>
            <Textarea
              id="transportation-notes"
              placeholder="Additional details like confirmation number, seats, etc."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Transportation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LogisticsTabContent({
  tripId,
  canEdit,
  refetchItinerary,
}: LogisticsTabContentProps) {
  const { trip } = useTripContext();
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [activeItem, setActiveItem] = useState<LogisticsItem | null>(null);
  const [isAccommodationDialogOpen, setIsAccommodationDialogOpen] = useState(false);
  const [isTransportationDialogOpen, setIsTransportationDialogOpen] = useState(false);
  const { toast: useToastToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'forms' | 'accommodations' | 'transportation'>('forms');
  const [isLoading, setIsLoading] = useState(false);

  // Form for adding a form
  const formForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      templateId: '',
    },
  });

  // Form for adding accommodation
  const accommodationForm = useForm({
    defaultValues: {
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  });

  // Form for adding transportation
  const transportationForm = useForm({
    defaultValues: {
      title: '',
      departureLocation: '',
      arrivalLocation: '',
      departureDate: '',
      arrivalDate: '',
      description: '',
    },
  });

  // Add the missing function
  const handleFormTemplateSelect = useCallback(async (template: any) => {
    try {
      const result = await addFormToTrip(tripId, {
        title: template.title,
        description: template.description || '',
        template_id: template.id || null,
      });

      if (isSuccess(result)) {
        // Show success message
        useToastToast({
          title: 'Form added',
          description: 'A new form has been added to the trip.',
        });

        // Refresh if needed
        if (refetchItinerary) {
          await refetchItinerary();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding form to trip:', error);
      useToastToast({
        title: 'Error adding form',
        description: 'There was a problem adding the form. Please try again.',
        variant: 'destructive',
      });
    }
  }, [tripId, useToastToast, refetchItinerary]);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggingItem = items.find((item) => item.id === active.id);

    if (draggingItem) {
      setActiveItem(draggingItem);
    } else if (active.data?.current?.type === 'template') {
      // Handle template items being dragged
      setActiveItem({
        id: `temp-${active.id}`,
        ...active.data.current.template,
      });
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const itemType = over.id.toString().split('-')[0]; // form, accommodation, transportation

    // Handle template being dragged
    if (active.data?.current?.type === 'template' && active.data.current.template) {
      try {
        const template = active.data.current.template;

        if (template.type === 'form') {
          // Handle form template differently - add through API
          await handleFormTemplateSelect(template);
        } else {
          // For other templates, use the existing logic
          const newItem: LogisticsItem = {
            id: `${template.type}-${Date.now()}`, // Temporary ID until API creates one
            ...template,
          };

          // Add item to the state
          setItems((prevItems) => [...prevItems, newItem]);

          useToastToast({
            title: 'Item added',
            description: `${template.title} has been added.`,
          });
        }
      } catch (error) {
        console.error('Failed to add item:', error);
        useToastToast({
          title: 'Error adding item',
          description: 'Could not add the item. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Helper function to add accommodation to trip itinerary
  const handleAddAccommodation = useCallback(
    async (accommodationData: {
      title: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }) => {
      try {
        const result = await addAccommodationToTrip(tripId, accommodationData);

        if (isSuccess(result)) {
          // Show success message
          useToastToast({
            title: 'Accommodation added',
            description: 'Your accommodation has been added to the trip itinerary.',
          });

          // Refresh itinerary
          if (refetchItinerary) {
            await refetchItinerary();
          }

          return true;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error adding accommodation to itinerary:', error);
        useToastToast({
          title: 'Error adding accommodation',
          description: 'There was a problem adding your accommodation. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [tripId, useToastToast, refetchItinerary]
  );

  // Helper function to add transportation to trip itinerary
  const handleAddTransportation = useCallback(
    async (transportationData: {
      title: string;
      departureLocation?: string;
      arrivalLocation?: string;
      departureDate?: string;
      arrivalDate?: string;
      description?: string;
    }) => {
      try {
        const result = await addTransportationToTrip(tripId, transportationData);

        if (isSuccess(result)) {
          // Show success message
          useToastToast({
            title: 'Transportation added',
            description: 'Your transportation has been added to the trip itinerary.',
          });

          // Refresh itinerary
          if (refetchItinerary) {
            await refetchItinerary();
          }

          return true;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error adding transportation to itinerary:', error);
        useToastToast({
          title: 'Error adding transportation',
          description: 'There was a problem adding your transportation. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [tripId, useToastToast, refetchItinerary]
  );

  // Handle accommodation form submission
  const handleAccommodationSubmit = async () => {
    // Get form values
    const title =
      (document.getElementById('accommodation-name') as HTMLInputElement)?.value ||
      'New Accommodation';
    const location = (
      document.getElementById('accommodation-location') as HTMLInputElement
    )?.value;
    const startDate = (document.getElementById('check-in') as HTMLInputElement)?.value;
    const endDate = (document.getElementById('check-out') as HTMLInputElement)?.value;
    const description = (
      document.getElementById('accommodation-notes') as HTMLTextAreaElement
    )?.value;

    // Add to local state
    const newItem: LogisticsItem = {
      id: `accommodation-${Date.now()}`,
      type: 'accommodation',
      title,
      location,
      startDate,
      endDate,
      description,
    };

    setItems((prev) => [...prev, newItem]);

    // Add to itinerary using our helper function
    const success = await handleAddAccommodation({
      title,
      location,
      startDate,
      endDate,
      description,
    });

    setIsAccommodationDialogOpen(false);

    if (success) {
      // Ask if the user wants to go to the itinerary to see the item
      useToastToast({
        title: 'Accommodation added to itinerary',
        description: 'Would you like to view it in the itinerary?',
        action: (
          <Button variant="outline" size="sm" onClick={navigateToItinerary}>
            View Itinerary
          </Button>
        ),
      });
    }
  };

  // Handle transportation form submission
  const handleTransportationSubmit = async () => {
    // Get form values
    const title =
      (document.getElementById('transportation-type') as HTMLInputElement)?.value ||
      'New Transportation';
    const departureLocation = (
      document.getElementById('departure-location') as HTMLInputElement
    )?.value;
    const arrivalLocation = (
      document.getElementById('arrival-location') as HTMLInputElement
    )?.value;
    const departureDate = (
      document.getElementById('departure-date') as HTMLInputElement
    )?.value;
    const arrivalDate = (document.getElementById('arrival-date') as HTMLInputElement)
      ?.value;
    const description = (
      document.getElementById('transportation-notes') as HTMLTextAreaElement
    )?.value;

    // Add to local state
    const newItem: LogisticsItem = {
      id: `transportation-${Date.now()}`,
      type: 'transportation',
      title,
      location: `${departureLocation || ''} to ${arrivalLocation || ''}`,
      startDate: departureDate,
      endDate: arrivalDate,
      description,
    };

    setItems((prev) => [...prev, newItem]);

    // Add to itinerary using our helper function
    const success = await handleAddTransportation({
      title,
      departureLocation,
      arrivalLocation,
      departureDate,
      arrivalDate,
      description,
    });

    setIsTransportationDialogOpen(false);

    if (success) {
      // Ask if the user wants to go to the itinerary to see the item
      useToastToast({
        title: 'Transportation added to itinerary',
        description: 'Would you like to view it in the itinerary?',
        action: (
          <Button variant="outline" size="sm" onClick={navigateToItinerary}>
            View Itinerary
          </Button>
        ),
      });
    }
  };

  // Handle navigation to the itinerary tab
  const navigateToItinerary = () => {
    // Navigate to the itinerary tab using the window location
    // Since we know the tab is accessed via URL parameter ?tab=itinerary
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', 'itinerary');
    router.push(currentUrl.toString());
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
            {items.filter((item) => item.type === 'accommodation').map((item) => (
              <LogisticsItemCard key={item.id} item={item} />
            ))}
            {items.filter((item) => item.type === 'accommodation').length === 0 && (
              <EmptyAccommodationPlaceholder canEdit={canEdit} />
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
            {items.filter((item) => item.type === 'transportation').map((item) => (
              <LogisticsItemCard key={item.id} item={item} />
            ))}
            {items.filter((item) => item.type === 'transportation').length === 0 && (
              <EmptyTransportationPlaceholder canEdit={canEdit} />
            )}
          </DroppableContainer>
        </section>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem ? <LogisticsItemCard item={activeItem} /> : null}
        </DragOverlay>
      </div>

      <AccommodationDialog 
        isOpen={isAccommodationDialogOpen}
        onOpenChange={setIsAccommodationDialogOpen}
        onSubmit={handleAccommodationSubmit}
      />
      
      <TransportationDialog
        isOpen={isTransportationDialogOpen}
        onOpenChange={setIsTransportationDialogOpen}
        onSubmit={handleTransportationSubmit}
      />
    </DndContext>
  );
} 