'use client';
import { ItineraryTab } from '@/components/itinerary/itinerary-tab';
import { useAuth } from '@/lib/hooks/use-auth';
import { DisplayItineraryItem } from '@/types/itinerary';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/hooks/use-toast';
import { Suspense, useRef, useEffect } from 'react';
import { type ItemStatus, ITINERARY_CATEGORIES } from '@/utils/constants/status';
import { useRouter } from 'next/navigation';
import { ItineraryItemForm } from '@/components/itinerary/itinerary-item-form';
import { VerticalStepper } from '@/components/itinerary/VerticalStepper';
import { PlusCircle, MapPin, CalendarPlus, ChevronDown, Palmtree } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TripsFeedbackButton } from '@/app/trips/TripsFeedbackButton';
import { SimplifiedItemForm } from '@/components/trips';
import { QuickAddItemDialog } from '@/components/itinerary/QuickAddItemDialog';
import { AddViatorButton } from '@/components/viator/AddViatorButton';

import React, { useCallback, useMemo, useState } from 'react';

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
  refetchItinerary?: () => Promise<void>;
}

// Helper function to format category display names
const formatCategoryName = (category: string): string => {
  if (!category) return '';

  // Check if it matches an itinerary category constant
  const matchedCategory = Object.values(ITINERARY_CATEGORIES).find(
    (cat) => cat.toLowerCase() === category.toLowerCase()
  );

  if (matchedCategory) {
    // Convert snake_case to Title Case
    return matchedCategory
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Otherwise, just return the original with first letter capitalized
  return category.charAt(0).toUpperCase() + category.slice(1);
};

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
  refetchItinerary,
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

  // Ref for importMapButton to avoid nesting buttons
  const importMapButtonRef = useRef<HTMLDivElement>(null);

  // Generate sections for vertical stepper
  const sections = useMemo(() => {
    const result = [];

    // Add unscheduled items section if there are any
    const unscheduledItems = itineraryItems.filter((item) => item.day_number === null);
    if (unscheduledItems.length > 0) {
      result.push({
        id: 'unscheduled',
        title: 'Unscheduled Items',
      });
    }

    // Add a section for each day
    for (let day = 1; day <= durationDays; day++) {
      result.push({
        id: `day-${day}`,
        title: `Day ${day}`,
      });
    }

    return result;
  }, [itineraryItems, durationDays]);

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
      setIsAddItemDialogOpen(true);
    },
    [tripId]
  );

  // Handle geocoder result
  const handleGeocoderResult = useCallback((result: GeocoderResult | null) => {
    setSelectedPlace(result);
    if (result) {
      setTitle(result.text || result.place_name || '');
    }
  }, []);

  // Handle map import button click
  const handleMapImportClick = useCallback(() => {
    toast({
      title: 'Coming Soon',
      description: 'The ability to import locations from maps will be available soon!',
      duration: 3000,
    });
  }, [toast]);

  // --- Optimistic Add Item ---
  const handleAddItemSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Defensive: Ensure all required state and types are present
      if (!itemCategory || typeof itemCategory !== 'string') {
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

      // Defensive: Generate a unique tempId
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Defensive: Build optimistic item with type safety
      const optimisticItem: DisplayItineraryItem = {
        id: tempId,
        trip_id: tripId ?? '',
        title: typeof title === 'string' && title.trim() ? title : 'Untitled Itinerary Item',
        created_at: new Date().toISOString(),
        section_id: null,
        type: null,
        item_type: itemCategory,
        date: null,
        start_time: null,
        end_time: null,
        location: null,
        address: selectedPlace?.properties?.address ?? selectedPlace?.place_name ?? '',
        place_id: null,
        latitude:
          Array.isArray(selectedPlace?.geometry?.coordinates) &&
          typeof selectedPlace.geometry.coordinates[1] === 'number'
            ? selectedPlace.geometry.coordinates[1]
            : null,
        longitude:
          Array.isArray(selectedPlace?.geometry?.coordinates) &&
          typeof selectedPlace.geometry.coordinates[0] === 'number'
            ? selectedPlace.geometry.coordinates[0]
            : null,
        estimated_cost: null,
        currency: null,
        notes: typeof notes === 'string' ? notes : '',
        description: null,
        updated_at: new Date().toISOString(),
        created_by: null,
        is_custom: null,
        day_number: typeof selectedDayNumber === 'number' ? selectedDayNumber : null,
        category: itemCategory,
        status: 'suggested',
        position: 0,
        duration_minutes: null,
        cover_image_url: null,
        votes: { up: 0, down: 0, upVoters: [], downVoters: [], userVote: null },
        creatorProfile: null,
        user_vote: null,
        place: null,
        formattedCategory: undefined,
      };

      setAllItineraryItems([...allItineraryItems, optimisticItem]);

      try {
        // Defensive: Build payload with only valid fields
        const newItemPayload: Record<string, unknown> = {
          title: optimisticItem.title,
          item_type: itemCategory,
          notes: optimisticItem.notes,
          day_number: optimisticItem.day_number,
        };

        if (selectedPlace && typeof selectedPlace === 'object') {
          if (
            typeof selectedPlace.properties?.address === 'string' &&
            selectedPlace.properties.address
          ) {
            newItemPayload.address = selectedPlace.properties.address;
          } else if (typeof selectedPlace.place_name === 'string' && selectedPlace.place_name) {
            newItemPayload.address = selectedPlace.place_name;
          }
          if (
            Array.isArray(selectedPlace.geometry?.coordinates) &&
            typeof selectedPlace.geometry.coordinates[1] === 'number' &&
            typeof selectedPlace.geometry.coordinates[0] === 'number'
          ) {
            newItemPayload.latitude = selectedPlace.geometry.coordinates[1];
            newItemPayload.longitude = selectedPlace.geometry.coordinates[0];
          }
        }

        const requestBody = { type: 'item', ...newItemPayload };

        // Defensive: Validate tripId
        if (!tripId || typeof tripId !== 'string') {
          throw new Error('Invalid trip ID');
        }

        const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        // Defensive: Check for network errors
        if (!response) throw new Error('No response from server');

        let result: any = null;
        try {
          result = await response.json();
        } catch (err) {
          throw new Error('Invalid server response');
        }

        if (!response.ok) throw new Error(result?.error || 'Failed to add item.');

        // Defensive: Validate result.data
        const data = result?.data;
        if (!data || typeof data !== 'object' || !data.id) {
          throw new Error('Invalid item data returned from server');
        }

        // 2. Replace optimistic item with real item, only using valid fields
        setAllItineraryItems(
          allItineraryItems.map((item) =>
            item.id === tempId
              ? {
                  ...item,
                  ...data,
                  id: typeof data.id === 'string' ? data.id : item.id,
                  trip_id: tripId,
                  title: typeof data.title === 'string' ? data.title : optimisticItem.title,
                  created_at:
                    typeof data.created_at === 'string' ? data.created_at : item.created_at,
                  section_id: data.section_id ?? null,
                  type: data.type ?? null,
                  item_type: typeof data.item_type === 'string' ? data.item_type : itemCategory,
                  date: data.date ?? null,
                  start_time: data.start_time ?? null,
                  end_time: data.end_time ?? null,
                  location: data.location ?? null,
                  address: typeof data.address === 'string' ? data.address : optimisticItem.address,
                  place_id: data.place_id ?? null,
                  latitude:
                    typeof data.latitude === 'number' ? data.latitude : optimisticItem.latitude,
                  longitude:
                    typeof data.longitude === 'number' ? data.longitude : optimisticItem.longitude,
                  estimated_cost: data.estimated_cost ?? null,
                  currency: data.currency ?? null,
                  notes: typeof data.notes === 'string' ? data.notes : optimisticItem.notes,
                  description: data.description ?? null,
                  updated_at:
                    typeof data.updated_at === 'string'
                      ? data.updated_at
                      : new Date().toISOString(),
                  created_by: data.created_by ?? null,
                  is_custom: data.is_custom ?? null,
                  day_number:
                    typeof data.day_number === 'number'
                      ? data.day_number
                      : optimisticItem.day_number,
                  category: typeof data.category === 'string' ? data.category : itemCategory,
                  status: typeof data.status === 'string' ? data.status : 'suggested',
                  position: typeof data.position === 'number' ? data.position : 0,
                  duration_minutes:
                    typeof data.duration_minutes === 'number' ? data.duration_minutes : null,
                  cover_image_url:
                    typeof data.cover_image_url === 'string' ? data.cover_image_url : null,
                  votes:
                    typeof data.votes === 'object' && data.votes !== null
                      ? {
                          up: typeof data.votes.up === 'number' ? data.votes.up : 0,
                          down: typeof data.votes.down === 'number' ? data.votes.down : 0,
                          upVoters: Array.isArray(data.votes.upVoters) ? data.votes.upVoters : [],
                          downVoters: Array.isArray(data.votes.downVoters)
                            ? data.votes.downVoters
                            : [],
                          userVote: data.votes.userVote ?? null,
                        }
                      : { up: 0, down: 0, upVoters: [], downVoters: [], userVote: null },
                  creatorProfile: null,
                  user_vote: data.user_vote ?? null,
                  place: data.place ?? null,
                  formattedCategory: undefined,
                }
              : item
          )
        );

        toast({
          title: 'Item Added!',
          description: `${optimisticItem.title} added to ${selectedDayNumber !== null && typeof selectedDayNumber === 'number' ? `day ${selectedDayNumber}` : 'unscheduled items'}.${!selectedPlace ? ` Remember to set a location later.` : ''}`,
        });
        setIsAddItemDialogOpen(false);
        resetAddItemForm();
      } catch (error: unknown) {
        // 3. Rollback on error
        setAllItineraryItems(allItineraryItems.filter((item) => item.id !== tempId));
        const errorMsg =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : 'An error occurred';
        setError(errorMsg);
        toast({
          title: 'Failed to Add',
          description: errorMsg,
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
      setIsAddItemDialogOpen,
      allItineraryItems,
    ]
  );

  // --- Optimistic Edit Item ---
  const handleSaveEditedItem = useCallback(
    async (updatedItem: DisplayItineraryItem) => {
      // Defensive: Find original item for rollback, ensure types
      const originalItem = allItineraryItems.find((item) => item.id === updatedItem.id);

      setAllItineraryItems(
        allItineraryItems.map((item) =>
          item.id === updatedItem.id ? { ...item, ...updatedItem } : item
        )
      );

      try {
        setIsLoading(true);

        // Defensive: Validate tripId and updatedItem.id
        if (!tripId || typeof tripId !== 'string' || !updatedItem.id) {
          throw new Error('Invalid trip or item ID');
        }

        const response = await fetch(`${API_ROUTES.TRIP_ITINERARY(tripId)}/${updatedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem),
        });

        if (!response) throw new Error('No response from server');

        let result: any = null;
        if (response.ok) {
          try {
            result = await response.json();
          } catch {
            throw new Error('Invalid server response');
          }
        } else {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch {
            // ignore
          }
          throw new Error(errorData?.error || 'Failed to update item');
        }

        // Defensive: Validate result.data
        if (!result?.data || typeof result.data !== 'object' || !result.data.id) {
          throw new Error('Invalid item data returned from server');
        }

        setAllItineraryItems(
          allItineraryItems.map((item) =>
            item.id === updatedItem.id ? { ...item, ...result.data } : item
          )
        );
        toast({ title: 'Item updated successfully' });
        setIsEditSheetOpen(false);
        setCurrentEditItem(null);
      } catch (error: unknown) {
        // Rollback on error
        setAllItineraryItems(
          allItineraryItems.map((item) =>
            item.id === updatedItem.id && originalItem ? originalItem : item
          )
        );
        const errorMsg =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : 'An unknown error occurred';
        toast({
          title: 'Error updating item',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [tripId, toast, setAllItineraryItems, allItineraryItems]
  );

  // Modified render function inside ItineraryTab
  const renderAddItemButton = useCallback(
    (dayNumber: number | null) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Add Item
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAddItem(dayNumber)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Item
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (typeof tripId === 'string' && tripId) {
                  router.push(
                    `/trips/${tripId}/add-item?day=${typeof dayNumber === 'number' ? dayNumber : 'unscheduled'}`
                  );
                }
              }}
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Detailed Item Editor
            </DropdownMenuItem>
            {/* Fix the nested button issue by using a div with onClick instead */}
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              onClick={handleMapImportClick}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleMapImportClick();
              }}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Import from Map
            </div>
            <DropdownMenuItem asChild>
              <AddViatorButton
                tripId={tripId}
                onAddActivity={(itemData: Record<string, unknown>) => {
                  if (!tripId || typeof tripId !== 'string') {
                    toast({
                      title: 'Failed to add experience',
                      description: 'Invalid trip ID.',
                      variant: 'destructive',
                    });
                    return;
                  }
                  const newItem = {
                    ...itemData,
                    day_number: typeof dayNumber === 'number' ? dayNumber : null,
                  };
                  fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'item', ...newItem }),
                  })
                    .then(async (response) => {
                      let result: any = null;
                      try {
                        result = await response.json();
                      } catch {
                        throw new Error('Invalid server response');
                      }
                      if (response.ok && result?.data) {
                        if (result.data && typeof result.data === 'object') {
                          setAllItineraryItems([
                            ...allItineraryItems,
                            result.data as DisplayItineraryItem,
                          ]);
                        }
                        toast({
                          title: 'Experience Added',
                          description:
                            typeof itemData.title === 'string'
                              ? `${itemData.title} added to your itinerary.`
                              : 'Experience added to your itinerary.',
                        });
                      } else {
                        throw new Error(result?.error || 'Failed to add experience');
                      }
                    })
                    .catch((err) => {
                      const errorMsg =
                        typeof err === 'string'
                          ? err
                          : err instanceof Error
                            ? err.message
                            : 'Something went wrong. Please try again.';
                      toast({
                        title: 'Failed to add experience',
                        description: errorMsg,
                        variant: 'destructive',
                      });
                    });
                }}
                variant="ghost"
                className="w-full justify-start p-0 font-normal h-auto"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    [
      handleAddItem,
      router,
      tripId,
      userRole,
      handleMapImportClick,
      setAllItineraryItems,
      toast,
      allItineraryItems,
    ]
  );

  // Custom tooltip with proper styling
  const CustomTooltip = ({
    children,
    content,
  }: {
    children: React.ReactNode;
    content: React.ReactNode;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="bg-popover border border-border shadow-md">
        {content}
      </TooltipContent>
    </Tooltip>
  );

  // Apply the formatCategoryName function to itinerary items
  const formattedItems = useMemo(() => {
    return itineraryItems.map((item) => {
      if (item && typeof item === 'object' && 'category' in item && item.category) {
        return {
          ...item,
          formattedCategory: formatCategoryName(item.category),
        };
      }
      return item;
    });
  }, [itineraryItems]);

  // Handle successful item addition
  const handleItemAdded = useCallback(() => {
    setIsAddItemDialogOpen(false);
    resetAddItemForm();
    if (typeof refetchItinerary === 'function') {
      refetchItinerary();
    }
  }, [refetchItinerary, resetAddItemForm]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-0 py-6">
      {/* Only render these forms if user has appropriate permissions */}
      {userRole &&
        (userRole === 'admin' || userRole === 'editor' || userRole === 'contributor') && (
          <div className="mb-6 space-y-3">
            {/* 
            Remove duplicated add item forms - these are already rendered 
            in the UnscheduledItemsSection component inside ItineraryTab 
          */}
          </div>
        )}

      <ItineraryTab
        tripId={tripId}
        itineraryItems={itineraryItems}
        setItineraryItems={setItemsWrapper}
        userId={userId}
        user={null}
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
        refetchItinerary={refetchItinerary}
      />

      {/* Vertical Stepper Component with improved styling */}
      <VerticalStepper sections={sections} />

      {/* Improved Trip Feedback section */}
      <div className="mt-16 pt-8 border-t border-muted">
        <TripsFeedbackButton />
      </div>

      {/* Edit item sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Edit Item</SheetTitle>
          </SheetHeader>
          {currentEditItem && (
            <ItineraryItemForm
              tripId={tripId}
              initialData={currentEditItem}
              dayNumber={currentEditItem.day_number}
              onSave={() => {
                setIsEditSheetOpen(false);
                if (typeof refetchItinerary === 'function') {
                  refetchItinerary();
                }
              }}
              onClose={() => setIsEditSheetOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Use the improved QuickAddItemDialog */}
      <QuickAddItemDialog
        tripId={tripId}
        isOpen={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
        onItemAdded={handleItemAdded}
        defaultCategory={itemCategory}
        title={
          selectedDayNumber !== null && typeof selectedDayNumber === 'number'
            ? `Add Item to Day ${selectedDayNumber}`
            : 'Add Unscheduled Item'
        }
        description={
          selectedDayNumber !== null && typeof selectedDayNumber === 'number'
            ? `Add a new item to day ${selectedDayNumber} of your trip.`
            : 'Add a new item to your unscheduled items list.'
        }
        dayNumber={selectedDayNumber}
      />
    </div>
  );
}
