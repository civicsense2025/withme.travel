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

// Template items for forms
const formTemplates: Omit<LogisticsItem, 'id'>[] = [
  {
    type: 'form',
    title: 'Dietary Restrictions',
    description: 'Collect dietary preferences and restrictions from trip participants',
  },
  {
    type: 'form',
    title: 'Emergency Contact Information',
    description: 'Collect emergency contact details from trip participants',
  },
  {
    type: 'form',
    title: 'Travel Insurance',
    description: 'Collect information about travel insurance policies',
  },
];

export default function LogisticsTabContent({
  tripId,
  canEdit,
  refetchItinerary,
}: LogisticsTabContentProps) {
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [activeItem, setActiveItem] = useState<LogisticsItem | null>(null);
  const [isFormTemplatesOpen, setIsFormTemplatesOpen] = useState(false);
  const [isAccommodationDialogOpen, setIsAccommodationDialogOpen] = useState(false);
  const [isTransportationDialogOpen, setIsTransportationDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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

  // Function to fetch forms from the API
  const fetchForms = useCallback(async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}/forms`);
      if (!response.ok) {
        throw new Error('Failed to load trip forms');
      }

      const data = await response.json();
      setItems((prevItems) => [
        ...prevItems,
        ...data.forms.map((form: any) => ({
          id: form.id,
          type: 'form',
          title: form.title,
          description: form.description,
          form_type: form.form_type,
        })),
      ]);
    } catch (error) {
      console.error('Failed to load trip forms:', error);
      toast({
        title: 'Error loading trip forms',
        description: 'Could not load forms. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [tripId, toast]);

  // Load items on mount
  useEffect(() => {
    // This would be replaced with an actual fetch call in production
    const fetchItems = async () => {
      try {
        // Example fetch call - replace with actual API integration
        // const response = await fetch(`${API_ROUTES.TRIPS}/${tripId}/logistics`);
        // const data = await response.json();
        // setItems(data);

        // For now, just use empty array
        setItems([]);
      } catch (error) {
        console.error('Failed to load logistics items:', error);
        toast({
          title: 'Error loading trip logistics',
          description: 'Could not load logistics items. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    fetchItems();
  }, [tripId, toast]);

  // Load forms on mount
  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

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

          toast({
            title: 'Item added',
            description: `${template.title} has been added.`,
          });
        }
      } catch (error) {
        console.error('Failed to add item:', error);
        toast({
          title: 'Error adding item',
          description: 'Could not add the item. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Helper function to add accommodation to trip itinerary
  const addAccommodationToItinerary = useCallback(
    async (accommodationData: {
      title: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }) => {
      try {
        // Create itinerary item
        const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: accommodationData.title,
            description: accommodationData.description || '',
            location: accommodationData.location,
            category: ITINERARY_CATEGORIES.ACCOMMODATIONS,
            day_number: null, // Unscheduled initially
            start_time: accommodationData.startDate
              ? new Date(accommodationData.startDate).toISOString()
              : null,
            end_time: accommodationData.endDate
              ? new Date(accommodationData.endDate).toISOString()
              : null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add accommodation to itinerary');
        }

        // Show success message
        toast({
          title: 'Accommodation added',
          description: 'Your accommodation has been added to the trip itinerary.',
        });

        // Refresh itinerary
        if (refetchItinerary) {
          await refetchItinerary();
        }

        return true;
      } catch (error) {
        console.error('Error adding accommodation to itinerary:', error);
        toast({
          title: 'Error adding accommodation',
          description: 'There was a problem adding your accommodation. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [tripId, toast, refetchItinerary]
  );

  // Helper function to add transportation to trip itinerary
  const addTransportationToItinerary = useCallback(
    async (transportationData: {
      title: string;
      departureLocation?: string;
      arrivalLocation?: string;
      departureDate?: string;
      arrivalDate?: string;
      description?: string;
    }) => {
      try {
        // Format location as departure to arrival
        const location =
          transportationData.departureLocation && transportationData.arrivalLocation
            ? `${transportationData.departureLocation} to ${transportationData.arrivalLocation}`
            : transportationData.departureLocation || transportationData.arrivalLocation;

        // Create itinerary item
        const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: transportationData.title,
            description: transportationData.description || '',
            location: location,
            category: ITINERARY_CATEGORIES.TRANSPORTATION,
            day_number: null, // Unscheduled initially
            start_time: transportationData.departureDate
              ? new Date(transportationData.departureDate).toISOString()
              : null,
            end_time: transportationData.arrivalDate
              ? new Date(transportationData.arrivalDate).toISOString()
              : null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add transportation to itinerary');
        }

        // Show success message
        toast({
          title: 'Transportation added',
          description: 'Your transportation has been added to the trip itinerary.',
        });

        // Refresh itinerary
        if (refetchItinerary) {
          await refetchItinerary();
        }

        return true;
      } catch (error) {
        console.error('Error adding transportation to itinerary:', error);
        toast({
          title: 'Error adding transportation',
          description: 'There was a problem adding your transportation. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [tripId, toast, refetchItinerary]
  );

  // Helper function to add a form to the trip
  const addFormToTrip = useCallback(
    async (formData: { title: string; description?: string; form_type: string }) => {
      try {
        // Create form
        const response = await fetch(`/api/trips/${tripId}/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || '',
            status: 'published',
            visibility: 'members',
            form_type: formData.form_type || 'general',
            allow_anonymous: false,
            settings: {},
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to add form');
        }

        const result = await response.json();

        // Show success message
        toast({
          title: 'Form added',
          description: 'Your form has been added to the trip.',
        });

        // Refresh the form list
        fetchForms();

        return result.form;
      } catch (error) {
        console.error('Error adding form to trip:', error);
        toast({
          title: 'Error adding form',
          description: 'There was a problem adding your form. Please try again.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [tripId, toast]
  );

  // Handle form template selection
  const handleFormTemplateSelect = async (template: Omit<LogisticsItem, 'id'>) => {
    try {
      // Add loading state
      toast({
        title: 'Adding form...',
        description: `Creating ${template.title} form.`,
      });

      await addFormToTrip({
        title: template.title,
        description: template.description,
        form_type: template.type === 'form' ? 'general' : template.type,
      });

      // Close the template selection
      setIsFormTemplatesOpen(false);
    } catch (error) {
      console.error('Failed to add form template:', error);
      toast({
        title: 'Error',
        description: 'Failed to add form template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to render form templates selection
  const renderFormTemplates = () => {
    if (!isFormTemplatesOpen) return null;

    return (
      <Card className="mt-2 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Select a Form Template</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {formTemplates.map((template, index) => (
            <div
              key={index}
              draggable={canEdit}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData(
                  'application/json',
                  JSON.stringify({
                    type: 'template',
                    template: template,
                  })
                );
              }}
              onClick={() => handleFormTemplateSelect(template)}
              className="p-3 border rounded cursor-pointer hover:bg-accent hover:shadow-sm transition-all flex items-start gap-3"
              data-type="template"
              data-template={JSON.stringify(template)}
            >
              <div className="p-2 bg-primary/10 rounded-full">
                <PlusCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">{template.title}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Render individual item
  const renderItem = (item: LogisticsItem) => (
    <Card key={item.id} className="mb-2" draggable={canEdit}>
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
        {/* Trip Forms Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Trip Forms</h3>
            {canEdit && (
              <Button
                id="add-form-button"
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => setIsFormTemplatesOpen(!isFormTemplatesOpen)}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Form</span>
              </Button>
            )}
          </div>
          <Separator />

          {/* Form templates dropdown */}
          {renderFormTemplates()}

          <DroppableContainer id="form-container" className="min-h-[150px]" disabled={!canEdit}>
            {forms.length > 0 ? (
              <div className="space-y-2">
                {forms.map((form) => (
                  <Card
                    key={form.id}
                    className="mb-2 hover:border-primary/50 transition-colors duration-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{form.title}</h4>
                          {form.description && (
                            <p className="text-sm text-muted-foreground">{form.description}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // In a real implementation, this would navigate to the form editor or viewer
                            toast({
                              title: 'Coming Soon',
                              description: 'Form editing and responses will be available soon!',
                            });
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyFormsPlaceholder canEdit={canEdit} />
            )}
          </DroppableContainer>
        </section>

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
            {items.filter((item) => item.type === 'accommodation').map(renderItem)}
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
            {items.filter((item) => item.type === 'transportation').map(renderItem)}
            {items.filter((item) => item.type === 'transportation').length === 0 && (
              <EmptyTransportationPlaceholder canEdit={canEdit} />
            )}
          </DroppableContainer>
        </section>

        {/* Drag overlay */}
        <DragOverlay>{activeItem ? renderItem(activeItem) : null}</DragOverlay>
      </div>

      {/* Dialog for adding accommodation */}
      <Dialog open={isAccommodationDialogOpen} onOpenChange={setIsAccommodationDialogOpen}>
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
              onClick={() => setIsAccommodationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
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

                // Add to itinerary
                const success = await addAccommodationToItinerary({
                  title,
                  location,
                  startDate,
                  endDate,
                  description,
                });

                setIsAccommodationDialogOpen(false);

                if (success) {
                  // Ask if the user wants to go to the itinerary to see the item
                  toast({
                    title: 'Accommodation added to itinerary',
                    description: 'Would you like to view it in the itinerary?',
                    action: (
                      <Button variant="outline" size="sm" onClick={navigateToItinerary}>
                        View Itinerary
                      </Button>
                    ),
                  });
                }
              }}
            >
              Add Accommodation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding transportation */}
      <Dialog open={isTransportationDialogOpen} onOpenChange={setIsTransportationDialogOpen}>
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
              onClick={() => setIsTransportationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
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

                // Add to itinerary
                const success = await addTransportationToItinerary({
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
                  toast({
                    title: 'Transportation added to itinerary',
                    description: 'Would you like to view it in the itinerary?',
                    action: (
                      <Button variant="outline" size="sm" onClick={navigateToItinerary}>
                        View Itinerary
                      </Button>
                    ),
                  });
                }
              }}
            >
              Add Transportation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}

// Placeholder components - used when containers are empty
function EmptyFormsPlaceholder({ canEdit }: { canEdit: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 p-3 rounded-full bg-primary/10">
          <PlusCircle className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground mb-4">No forms have been added to this trip yet.</p>
        {canEdit && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Forms help you collect information from trip participants, such as dietary
              restrictions, emergency contacts, or travel preferences.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => document.getElementById('add-form-button')?.click()}
            >
              Add your first form
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
