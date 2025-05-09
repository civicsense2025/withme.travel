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
import { PlusCircle, MapPin, CalendarPlus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TripsFeedbackButton } from '@/app/trips/TripsFeedbackButton';
import { SimplifiedItemForm, BulkItemForm } from '@/components/trips/SimplifiedItemForm';
import { QuickAddItemDialog } from '@/components/itinerary/QuickAddItemDialog';

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
    cat => cat.toLowerCase() === category.toLowerCase()
  );
  
  if (matchedCategory) {
    // Convert snake_case to Title Case
    return matchedCategory
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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
    const unscheduledItems = itineraryItems.filter(item => item.day_number === null);
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
      title: "Coming Soon",
      description: "The ability to import locations from maps will be available soon!",
      duration: 3000,
    });
  }, [toast]);

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
            <DropdownMenuItem onClick={() => router.push(`/trips/${tripId}/add-item?day=${dayNumber || 'unscheduled'}`)}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Detailed Item Editor
            </DropdownMenuItem>
            {/* Fix the nested button issue by using a div with onClick instead */}
            <div 
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              onClick={handleMapImportClick}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Import from Map
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    [handleAddItem, router, tripId, userRole, handleMapImportClick]
  );

  // Custom tooltip with proper styling
  const CustomTooltip = ({ children, content }: { children: React.ReactNode, content: React.ReactNode }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent className="bg-popover border border-border shadow-md">
        {content}
      </TooltipContent>
    </Tooltip>
  );

  // Apply the formatCategoryName function to itinerary items
  const formattedItems = useMemo(() => {
    return itineraryItems.map(item => {
      if (item.category) {
        return {
          ...item,
          formattedCategory: formatCategoryName(item.category)
        };
      }
      return item;
    });
  }, [itineraryItems]);

  // Handle successful item addition
  const handleItemAdded = useCallback(() => {
    // Close the dialog
    setIsAddItemDialogOpen(false);
    // Reset form state
    resetAddItemForm();
    // Refresh itinerary data
    if (refetchItinerary) {
      refetchItinerary();
    }
  }, [refetchItinerary, resetAddItemForm]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 md:px-0 py-6">
      {/* Only render these forms if user has appropriate permissions */}
      {userRole && (userRole === 'admin' || userRole === 'editor' || userRole === 'contributor') && (
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
                if (refetchItinerary) {
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
        title={selectedDayNumber !== null ? `Add Item to Day ${selectedDayNumber}` : 'Add Unscheduled Item'}
        description={selectedDayNumber !== null ? `Add a new item to day ${selectedDayNumber} of your trip.` : 'Add a new item to your unscheduled items list.'}
        dayNumber={selectedDayNumber}
      />
    </div>
  );
}
