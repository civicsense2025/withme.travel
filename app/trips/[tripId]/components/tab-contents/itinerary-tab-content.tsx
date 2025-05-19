'use client';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/use-toast';
import { useItinerary } from '@/lib/hooks';
import { useState } from 'react';
import {
  ItineraryTabTemplate,
  ItineraryDaySection,
  UnscheduledItemsSection,
  ItineraryItem as ComponentItineraryItem,
} from '@/components/features/itinerary';
import { QuickAddItemDialog } from '@/components/features/itinerary/QuickAddItemDialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TripsFeedbackButton } from '@/app/trips/TripsFeedbackButton';
import { DisplayItineraryItem } from '@/types/itinerary';

// Explicitly define TripRole type here to avoid import issues
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

interface ItineraryTabContentProps {
  tripId: string;
  userRole: TripRole | null;
  startDate: string | null;
  durationDays: number;
}

export function ItineraryTabContent({
  tripId,
  userRole,
  startDate,
  durationDays,
}: ItineraryTabContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { items, isLoading, error, addItem, updateItem, deleteItem } = useItinerary(tripId);
  const { user: authUser } = useAuth();

  // State for edit/add item dialogs
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<DisplayItineraryItem | null>(null);

  // Check if user can edit
  const canEdit = userRole === 'admin' || userRole === 'editor' || userRole === 'contributor';

  // Handle opening the add item dialog for a specific day
  const handleAddItemForDay = (dayNumber: number | null) => {
    setSelectedDayNumber(dayNumber);
    setIsAddItemDialogOpen(true);
  };

  // Handle editing an item
  const handleEditItem = (id: string) => {
    const itemToEdit = displayItems.find(item => item.id === id) || null;
    setCurrentEditItem(itemToEdit);
    // Implement edit item functionality here
    // You could open an edit dialog or navigate to an edit page
    toast({
      children: (
        <div>
          <div className="font-semibold">Edit functionality</div>
          <div>Edit functionality will be implemented soon.</div>
        </div>
      )
    });
  };

  // Handle deleting an item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      toast({
        children: (
          <div>
            <div className="font-semibold">Item removed</div>
            <div>The item has been removed from your itinerary</div>
          </div>
        )
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        children: (
          <div>
            <div className="font-semibold">Error</div>
            <div>Failed to remove the item. Please try again.</div>
          </div>
        )
      });
    }
  };

  // Convert items to DisplayItineraryItem format
  const transformToDisplayItems = (items: any[]): DisplayItineraryItem[] => {
    return items.map((item) => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      day_number: item.day_number,
      category: item.category || 'other',
      start_time: item.start_time,
      end_time: item.end_time,
      votes: item.votes || [],
      creatorProfile: null,
      notes: item.notes || '',
      created_at: item.created_at || '',
      created_by: item.created_by || null,
      trip_id: item.trip_id || tripId,
      updated_at: item.updated_at || '',
      status: item.status || 'pending',
      section_id: item.section_id || '',
      type: item.type || 'item',
      position: item.position || 0,
      place_id: item.place_id || null,
      details: {}
    }));
  };

  // Group items by day
  const displayItems = transformToDisplayItems(items);
  const unscheduledItems = displayItems.filter((item) => item.day_number === null);
  
  // Convert to ComponentItineraryItem format for the components
  const convertToComponentFormat = (items: DisplayItineraryItem[]): ComponentItineraryItem[] => {
    return items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || undefined,
      location: item.location,
      startTime: item.start_time,
      endTime: item.end_time,
      status: item.status,
      category: item.category || undefined,
      voteCount: item.votes.length,
      userVoted: false
    }));
  };

  // Prepare days array for ItineraryTabTemplate
  const days = Array.from({ length: durationDays }, (_, index) => {
    const dayNumber = index + 1;
    const dayItems = displayItems.filter((item) => item.day_number === dayNumber);
    return {
      dayNumber,
      date: startDate ? new Date(startDate) : undefined,
      items: convertToComponentFormat(dayItems)
    };
  });

  return (
    <TooltipProvider>
      <div className="relative">
        <ItineraryTabTemplate
          days={days}
          unscheduledItems={convertToComponentFormat(unscheduledItems)}
          canEdit={canEdit}
          isLoading={isLoading}
          onAddItem={() => setIsAddItemDialogOpen(true)}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />

        {/* Add Item Dialog */}
        <QuickAddItemDialog
          isOpen={isAddItemDialogOpen}
          onClose={() => setIsAddItemDialogOpen(false)}
          tripId={tripId}
          dayNumber={selectedDayNumber}
          onItemAdded={() => {
            setIsAddItemDialogOpen(false);
            setSelectedDayNumber(null);
          }}
        />

        {/* Feedback button */}
        <div className="fixed bottom-4 right-4">
          <TripsFeedbackButton size="sm" className="shadow-md">
            Give Feedback
          </TripsFeedbackButton>
        </div>
      </div>
    </TooltipProvider>
  );
}
