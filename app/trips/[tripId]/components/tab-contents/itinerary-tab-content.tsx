'use client';
import { ItineraryTab } from '@/components/itinerary/itinerary-tab';
import { useAuth } from '@/lib/hooks/use-auth';
import { DisplayItineraryItem } from '@/types/itinerary';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/hooks/use-toast';
import { Suspense } from 'react';
import { type ItemStatus } from '@/utils/constants/status';
import { useRouter } from 'next/navigation';
import { ItineraryItemForm } from '@/components/itinerary/itinerary-item-form';
import { ImportPlacesButton } from '../TripItinerary/ImportPlacesButton';

import React, { useCallback, useMemo, useState, useEffect } from 'react';

import dynamic from 'next/dynamic';
import type { GeocoderOptions } from '@mapbox/mapbox-gl-geocoder';

// Dynamically import MapboxGeocoderComponent to avoid SSR issues
const MapboxGeocoderComponent = dynamic(() => import('@/components/maps/mapbox-geocoder'), {
  ssr: false,
  loading: () => (
    <div className="p-2 border rounded text-sm text-muted-foreground">
      Loading location search...
    </div>
  ),
});

// Define GeocoderResult interface
interface GeocoderResult {
  geometry: { coordinates: [number, number]; type: string };
  place_name: string;
  text: string;
  id?: string; // Mapbox ID
  properties?: { address?: string };
  context?: any;
  [key: string]: any;
}

// Explicitly define TripRole type here to avoid import issues
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

interface ItineraryTabContentProps {
  tripId: string;
  allItineraryItems: DisplayItineraryItem[];
  setAllItineraryItems: (items: DisplayItineraryItem[]) => void;
  userRole: TripRole | null;
  startDate: string | null;
  durationDays: number;
  handleReorder: (info: {
    itemId: string;
    newDayNumber: number | null;
    newPosition: number;
  }) => Promise<void>;
  handleDeleteItem: (id: string) => Promise<void>;
  handleItemStatusChange: (id: string, status: ItemStatus | null) => Promise<void>;
  handleVote: (itemId: string, dayNumber: number | null, voteType: 'up' | 'down') => Promise<void>;
  handleSectionReorder: (orderedDayNumbers: (number | null)[]) => Promise<void>;
}

export function ItineraryTabContent({
  tripId,
  allItineraryItems,
  setAllItineraryItems,
  userRole,
  startDate,
  durationDays,
  handleReorder,
  handleDeleteItem,
  handleItemStatusChange,
  handleVote,
  handleSectionReorder,
}: ItineraryTabContentProps) {
  // State for tab's filtered items
  const [itineraryItems, setItineraryItems] = useState<DisplayItineraryItem[]>(allItineraryItems);
  const router = useRouter();
  const { toast } = useToast();

  // Get user data from auth context
  const { user: authUser } = useAuth();

  // State for edit sheet
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<DisplayItineraryItem | null>(null);

  // State for add item dialog
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<GeocoderResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wrapper for setting items
  const setItemsWrapper = useCallback(
    (value: React.SetStateAction<DisplayItineraryItem[]>) => {
      if (typeof value === 'function') {
        const newState = value(itineraryItems);
        setItineraryItems(newState);
        setAllItineraryItems(newState);
      } else {
        setItineraryItems(value);
        setAllItineraryItems(value);
      }
    },
    [itineraryItems, setAllItineraryItems]
  );

  // Sync local items with parent
  useEffect(() => {
    if (
      allItineraryItems.length !== itineraryItems.length ||
      !allItineraryItems.every((item, index) => item.id === itineraryItems[index]?.id)
    ) {
      setItineraryItems(allItineraryItems);
    }
  }, [allItineraryItems, itineraryItems]);

  // Prepare user data
  const userId = authUser?.id || '';

  // Handle edit item (Open sheet instead of navigating)
  const handleEditItem = useCallback(async (item: DisplayItineraryItem) => {
    setCurrentEditItem(item);
    setIsEditSheetOpen(true);
  }, []);

  // Reset add item form
  const resetAddItemForm = useCallback(() => {
    setTitle('');
    setItemCategory('');
    setNotes('');
    setSelectedPlace(null);
    setError(null);
  }, []);

  // Handle add item - open dialog instead of navigating
  const handleAddItem = useCallback(
    (dayNumber: number | null) => {
      setSelectedDayNumber(dayNumber);
      resetAddItemForm();
      setIsAddItemDialogOpen(true);
    },
    [resetAddItemForm]
  );

  // Handle geocoder result
  const handleGeocoderResult = useCallback((result: GeocoderResult | null) => {
    setSelectedPlace(result);
    if (result) {
      setTitle(result.text || result.place_name || '');
    }
  }, []);

  // Handle add item form submission
  const handleAddItemSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!itemCategory) {
        setError('Category is required.');
        toast({
          title: 'Missing Info',
          description: 'Please select an item category.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      const newItemPayload = {
        title: title || 'Untitled Itinerary Item',
        item_type: itemCategory,
        notes: notes,
        day_number: selectedDayNumber,
        // Location details - only include if a place was selected
        ...(selectedPlace
          ? {
              place_name: selectedPlace.text,
              address: selectedPlace.properties?.address || selectedPlace.place_name,
              mapbox_id: selectedPlace.id,
              latitude: selectedPlace.geometry?.coordinates[1],
              longitude: selectedPlace.geometry?.coordinates[0],
            }
          : {}),
      };

      // Add the type field expected by the API handler
      const requestBody = {
        type: 'item',
        ...newItemPayload,
      };

      try {
        const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to add item.');
        }

        // Add the new item to our local state - fix by creating a new array explicitly
        const newItem: DisplayItineraryItem = {
          ...result.data,
          id: result.data.id,
          title: newItemPayload.title,
          category: newItemPayload.item_type,
          notes: newItemPayload.notes || '',
          day_number: selectedDayNumber,
          position: 0, // Will be normalized by the backend
          // Add other required fields
          status: result.data.status || 'active',
          place_name: result.data.place_name || '',
          votes: result.data.votes || 0,
        };

        // Instead of using the callback form, get the current items first
        const currentItems = Array.isArray(allItineraryItems) ? [...allItineraryItems] : [];
        currentItems.push(newItem);
        setAllItineraryItems(currentItems);

        // Item was successfully added
        const dayDescription =
          selectedDayNumber !== null ? `day ${selectedDayNumber}` : `unscheduled items`;

        toast({
          title: 'Item Added!',
          description: `${newItemPayload.title} added to ${dayDescription}.${!selectedPlace ? ` Remember to set a location later.` : ''}`,
        });

        // Close dialog and reset form
        setIsAddItemDialogOpen(false);
        resetAddItemForm();
      } catch (error: any) {
        console.error('Failed to add itinerary item:', error);
        setError(typeof error === 'string' ? error : error.message || 'An error occurred');
        toast({
          title: 'Failed to Add',
          description: typeof error === 'string' ? error : error.message || 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      title,
      itemCategory,
      notes,
      selectedPlace,
      selectedDayNumber,
      tripId,
      toast,
      setAllItineraryItems,
      resetAddItemForm,
      allItineraryItems,
    ]
  );

  // Handle save edited item
  const handleSaveEditedItem = useCallback(
    async (updatedItem: DisplayItineraryItem) => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}/${updatedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update item');
        }

        const result = await response.json();

        // Update local state with the updated item
        const updatedItems = allItineraryItems.map((item: DisplayItineraryItem) =>
          item.id === updatedItem.id ? result.data : item
        );
        setAllItineraryItems(updatedItems);

        toast({ title: 'Item updated successfully' });
        setIsEditSheetOpen(false); // Close the edit sheet
        setCurrentEditItem(null); // Clear the current edit item
      } catch (error) {
        console.error('Failed to update item:', error);
        toast({
          title: 'Error updating item',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, toast, setAllItineraryItems, allItineraryItems]
  );

  return (
    <div className="w-full space-y-6">
      {/* Add action buttons row above the itinerary */}
      {userRole && (userRole === 'admin' || userRole === 'editor') && (
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAddItem(null)}
          >
            Add Unscheduled Item
          </Button>
          <ImportPlacesButton />
        </div>
      )}
      
      <ItineraryTab
        tripId={tripId}
        itineraryItems={itineraryItems}
        setItineraryItems={setItemsWrapper}
        userId={userId}
        userRole={userRole}
        durationDays={durationDays}
        startDate={startDate}
        onDeleteItem={handleDeleteItem}
        onVote={handleVote}
        onEditItem={handleEditItem}
        onItemStatusChange={handleItemStatusChange}
        onAddItem={handleAddItem}
        onReorder={handleReorder}
        onSectionReorder={handleSectionReorder}
      />

      {/* Edit Item Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>Edit Itinerary Item</SheetTitle>
          </SheetHeader>
          {currentEditItem && (
            <div className="py-4">
              <ItineraryItemForm
                tripId={tripId}
                initialData={currentEditItem}
                dayNumber={currentEditItem.day_number}
                onSave={handleSaveEditedItem}
                onClose={() => {
                  setIsEditSheetOpen(false);
                  setCurrentEditItem(null);
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDayNumber !== null
                ? `Add Item to Day ${selectedDayNumber}`
                : 'Add Unscheduled Item'}
            </DialogTitle>
            <DialogDescription>
              {selectedDayNumber !== null
                ? `Add a new item to day ${selectedDayNumber} of your trip.`
                : 'Add a new item to your unscheduled items list.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddItemSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Visit Museum"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemCategory">Category*</Label>
              <Select value={itemCategory} onValueChange={setItemCategory}>
                <SelectTrigger id="itemCategory">
                  <SelectValue>Select category</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iconic Landmarks">Iconic Landmarks</SelectItem>
                  <SelectItem value="Local Secrets">Local Secrets</SelectItem>
                  <SelectItem value="Cultural Experiences">Cultural Experiences</SelectItem>
                  <SelectItem value="Outdoor Adventures">Outdoor Adventures</SelectItem>
                  <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                  <SelectItem value="Nightlife">Nightlife</SelectItem>
                  <SelectItem value="Relaxation">Relaxation</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Group Activities">Group Activities</SelectItem>
                  <SelectItem value="Day Excursions">Day Excursions</SelectItem>
                  <SelectItem value="Accommodations">Accommodations</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Flexible Options">Flexible Options</SelectItem>
                  <SelectItem value="Special Occasions">Special Occasions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="location">Location</Label>
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </div>
              <Suspense
                fallback={
                  <div className="p-2 border rounded text-sm text-muted-foreground">
                    Loading location search...
                  </div>
                }
              >
                <div className="p-4 border rounded bg-muted/20">
                  Location search is available in the full form
                </div>
              </Suspense>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="notes">Notes</Label>
                <span className="text-xs text-muted-foreground">(Optional)</span>
              </div>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
              />
            </div>

            {error && <div className="text-destructive text-sm">{error}</div>}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddItemDialogOpen(false);
                  resetAddItemForm();
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}