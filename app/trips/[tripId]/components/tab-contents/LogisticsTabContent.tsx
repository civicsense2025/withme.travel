'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DroppableContainer } from '@/components/itinerary/DroppableContainer';
import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragOverlay,
  useSensor, 
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { API_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LogisticsTabContentProps {
  tripId: string;
  canEdit: boolean;
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
    description: 'Collect dietary preferences and restrictions from trip participants'
  },
  {
    type: 'form',
    title: 'Emergency Contact Information',
    description: 'Collect emergency contact details from trip participants'
  },
  {
    type: 'form',
    title: 'Travel Insurance',
    description: 'Collect information about travel insurance policies'
  }
];

export default function LogisticsTabContent({ tripId, canEdit }: LogisticsTabContentProps) {
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [activeItem, setActiveItem] = useState<LogisticsItem | null>(null);
  const [isFormTemplatesOpen, setIsFormTemplatesOpen] = useState(false);
  const [isAccommodationDialogOpen, setIsAccommodationDialogOpen] = useState(false);
  const [isTransportationDialogOpen, setIsTransportationDialogOpen] = useState(false);
  const { toast } = useToast();

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

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggingItem = items.find(item => item.id === active.id);
    
    if (draggingItem) {
      setActiveItem(draggingItem);
    } else if (active.data?.current?.type === 'template') {
      // Handle template items being dragged
      setActiveItem({
        id: `temp-${active.id}`,
        ...active.data.current.template
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
        const newItem: LogisticsItem = {
          id: `${template.type}-${Date.now()}`, // Temporary ID until API creates one
          ...template
        };
        
        // Add item to the state
        setItems(prevItems => [...prevItems, newItem]);
        
        // This would be an API call in production
        // const response = await fetch(`${API_ROUTES.TRIPS}/${tripId}/logistics`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newItem)
        // });
        
        toast({
          title: 'Item added',
          description: `${template.title} has been added.`,
        });
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

  // Function to render form templates selection
  const renderFormTemplates = () => {
    if (!isFormTemplatesOpen) return null;
    
    return (
      <Card className="mt-2">
        <CardHeader>
          <CardTitle className="text-lg">Select a Form Template</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {formTemplates.map((template, index) => (
            <div
              key={index}
              draggable={canEdit}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'template',
                  template: template
                }));
              }}
              className="p-3 border rounded cursor-pointer hover:bg-accent transition-colors"
              data-type="template"
              data-template={JSON.stringify(template)}
            >
              <h4 className="font-medium">{template.title}</h4>
              <p className="text-sm text-muted-foreground">{template.description}</p>
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
        {item.startDate && <p className="text-sm">From: {new Date(item.startDate).toLocaleDateString()}</p>}
        {item.endDate && <p className="text-sm">To: {new Date(item.endDate).toLocaleDateString()}</p>}
      </CardContent>
    </Card>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Trip Forms Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold">Trip Forms</h3>
            {canEdit && (
              <Button 
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
          
          <DroppableContainer 
            id="form-container" 
            className="min-h-[150px]"
            disabled={!canEdit}
          >
            {items.filter(item => item.type === 'form').map(renderItem)}
            {items.filter(item => item.type === 'form').length === 0 && (
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
                <PlusCircle className="h-4 w-4" />
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
            {items.filter(item => item.type === 'accommodation').map(renderItem)}
            {items.filter(item => item.type === 'accommodation').length === 0 && (
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
                <PlusCircle className="h-4 w-4" />
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
            {items.filter(item => item.type === 'transportation').map(renderItem)}
            {items.filter(item => item.type === 'transportation').length === 0 && (
              <EmptyTransportationPlaceholder canEdit={canEdit} />
            )}
          </DroppableContainer>
        </section>
        
        {/* Drag overlay */}
        <DragOverlay>
          {activeItem ? renderItem(activeItem) : null}
        </DragOverlay>
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
              <Textarea id="accommodation-notes" placeholder="Additional details like confirmation number, contact information, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                // Add accommodation item
                const newItem: LogisticsItem = {
                  id: `accommodation-${Date.now()}`,
                  type: 'accommodation',
                  title: (document.getElementById('accommodation-name') as HTMLInputElement)?.value || 'New Accommodation',
                  location: (document.getElementById('accommodation-location') as HTMLInputElement)?.value,
                  startDate: (document.getElementById('check-in') as HTMLInputElement)?.value,
                  endDate: (document.getElementById('check-out') as HTMLInputElement)?.value,
                  description: (document.getElementById('accommodation-notes') as HTMLTextAreaElement)?.value,
                };
                
                setItems(prev => [...prev, newItem]);
                setIsAccommodationDialogOpen(false);
                
                toast({
                  title: 'Accommodation added',
                  description: 'Your accommodation has been added to the trip.',
                });
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
              <Textarea id="transportation-notes" placeholder="Additional details like confirmation number, seats, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                // Add transportation item
                const newItem: LogisticsItem = {
                  id: `transportation-${Date.now()}`,
                  type: 'transportation',
                  title: (document.getElementById('transportation-type') as HTMLInputElement)?.value || 'New Transportation',
                  description: (document.getElementById('transportation-notes') as HTMLTextAreaElement)?.value,
                  location: `${(document.getElementById('departure-location') as HTMLInputElement)?.value || ''} to ${(document.getElementById('arrival-location') as HTMLInputElement)?.value || ''}`,
                  startDate: (document.getElementById('departure-date') as HTMLInputElement)?.value,
                  endDate: (document.getElementById('arrival-date') as HTMLInputElement)?.value,
                };
                
                setItems(prev => [...prev, newItem]);
                setIsTransportationDialogOpen(false);
                
                toast({
                  title: 'Transportation added',
                  description: 'Your transportation has been added to the trip.',
                });
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
        <p className="text-muted-foreground mb-4">No forms have been added to this trip yet.</p>
        {canEdit && (
          <p className="text-sm text-muted-foreground">
            Forms help you collect information from trip participants, such as dietary restrictions,
            emergency contacts, or travel preferences.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyAccommodationPlaceholder({ canEdit }: { canEdit: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">No accommodations have been added to this trip yet.</p>
        {canEdit && (
          <p className="text-sm text-muted-foreground">
            Add hotels, Airbnbs, or other places where you'll be staying during your trip.
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
        <p className="text-muted-foreground mb-4">No transportation options have been added to this trip yet.</p>
        {canEdit && (
          <p className="text-sm text-muted-foreground">
            Add flights, train tickets, rental cars, or other transportation details for your trip.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 