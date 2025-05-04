'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MapPin, CalendarPlus, X } from 'lucide-react';
import { DisplayItineraryItem } from '@/types/itinerary';
import { ItineraryItemCard } from './ItineraryItemCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { DroppableContainer } from './DroppableContainer';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DndContext, DragEndEvent, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import ImportMapButton from '@/app/trips/[tripId]/import-map-button';
import { QuickAddItemForm } from '@/app/trips/components/QuickAddItemForm';
import GoogleMapsUrlImport from '@/app/trips/[tripId]/google-maps-url-import';

// Simple error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

const ErrorBoundary = ({ children, fallback }: ErrorBoundaryProps) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Error in component:', error);
    return <>{fallback}</>;
  }
};

interface UnscheduledItemsSectionProps {
  items: DisplayItineraryItem[];
  canEdit: boolean;
  onAddItem: () => void;
  onEditItem: (item: DisplayItineraryItem) => void;
  tripId: string;
  containerId?: string; // Make containerId optional to maintain backward compatibility
}

export const UnscheduledItemsSection: React.FC<UnscheduledItemsSectionProps> = ({
  items,
  canEdit,
  onAddItem,
  onEditItem,
  tripId,
  containerId = 'unscheduled', // Default value for backward compatibility
}: UnscheduledItemsSectionProps) => {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Set up sensors for drag detection
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  // Use sensors
  const sensors = useSensors(mouseSensor, touchSensor);

  // Setup droppable area for items
  const { setNodeRef, isOver } = useDroppable({
    id: containerId,
    data: {
      type: 'unscheduled-section',
      id: containerId,
    },
  });

  // Get all item IDs for sortable context
  const itemIds = items.map((item) => item.id);

  // Callback handler for item added
  const handleItemAdded = () => {
    setAddDialogOpen(false);
    // Refresh the page to show new items
    router.refresh();
  };

  // Handle drag end for reordering within the unscheduled section
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Handle reordering logic here
      console.log(`Moved item ${active.id} to position near ${over.id}`);
      // You would typically call a function to update the order in your data
      // This function would be passed down from a parent component
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'pt-4 rounded-md transition-all',
        isOver ? 'bg-muted/50 ring-2 ring-primary p-2' : ''
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Unscheduled Items</h2>
        {canEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAddDialogOpen(true)} 
            className="gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      <div className="space-y-4 pl-4 min-h-[80px]">
        {items.length === 0 ? (
          <Card className="bg-muted/50 border-dashed p-4 text-center text-muted-foreground">
            No unscheduled items yet. Add some to your trip!
          </Card>
        ) : (
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
            id={containerId}
          >
            {items.map((item) => (
              <ErrorBoundary
                key={item.id}
                fallback={
                  <Card className="p-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
                    <p className="text-sm text-red-600 dark:text-red-400">Error displaying item</p>
                  </Card>
                }
              >
                <SortableItem key={item.id} id={item.id} disabled={!canEdit} containerId={containerId}>
                  <ItineraryItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => onEditItem(item)}
                    editable={canEdit}
                  />
                </SortableItem>
              </ErrorBoundary>
            ))}
          </SortableContext>
        )}
      </div>

      {/* Add Item Dialog with Tabs */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add to Your Trip</DialogTitle>
            <DialogDescription>
              Add a new item to your unscheduled items or import places.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="quick-add" className="mt-4">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="quick-add">Quick Add</TabsTrigger>
              <TabsTrigger value="import-map">Map</TabsTrigger>
              <TabsTrigger value="import-url">Google Maps URL</TabsTrigger>
              <TabsTrigger
                value="detailed"
                onClick={() => {
                  setAddDialogOpen(false);
                  router.push(`/trips/${tripId}/add-item?day=unscheduled`);
                }}
              >
                Detailed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quick-add" className="py-4">
              <ErrorBoundary
                fallback={
                  <div className="p-4 text-center text-red-600 border border-red-200 rounded-md">
                    Sorry, there was an error loading the form. Try the detailed editor.
                  </div>
                }
              >
                <QuickAddItemForm 
                  tripId={tripId}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="import-map" className="py-4">
              <div className="flex flex-col space-y-4">
                <ImportMapButton tripId={tripId} canEdit={canEdit} />
                <p className="text-muted-foreground text-sm">
                  Import places of interest from the map to add to your itinerary.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="import-url" className="py-4">
              <ErrorBoundary
                fallback={
                  <div className="p-4 text-center text-red-600 border border-red-200 rounded-md">
                    Sorry, there was an error loading the Google Maps import tool.
                  </div>
                }
              >
                <GoogleMapsUrlImport 
                  tripId={tripId} 
                  onSuccess={handleItemAdded}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="detailed">
              <div className="py-4 text-center text-muted-foreground">
                Redirecting to detailed editor...
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" /> Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
