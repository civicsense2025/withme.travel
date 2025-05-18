'use client';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useItinerary } from '@/hooks/use-itinerary';
import { Suspense, useState } from 'react';
import {
  ItineraryDaySection,
  UnscheduledItemsSection,
  ItineraryTabTemplate,
} from '@/components/itinerary';
import { QuickAddItemDialog } from '@/components/itinerary/QuickAddItemDialog';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TripsFeedbackButton } from '@/app/trips/TripsFeedbackButton';
import { AddViatorButton } from '@/components/viator/AddViatorButton';
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
  const [currentEditItem, setCurrentEditItem] = useState(null);

  // Check if user can edit
  const canEdit = userRole === 'admin' || userRole === 'editor' || userRole === 'contributor';

  // Handle opening the add item dialog for a specific day
  const handleAddItemForDay = (dayNumber: number | null) => {
    setSelectedDayNumber(dayNumber);
    setIsAddItemDialogOpen(true);
  };

  // Handle editing an item
  const handleEditItem = (item: DisplayItineraryItem) => {
    setCurrentEditItem(item);
    // Implement edit item functionality here
    // You could open an edit dialog or navigate to an edit page
    toast({
      title: 'Edit functionality',
      description: 'Edit functionality will be implemented soon.',
    });
  };

  // Handle deleting an item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      toast({
        title: 'Item removed',
        description: 'The item has been removed from your itinerary',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove the item. Please try again.',
        variant: 'destructive',
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
      votes: item.votes || 0,
      creatorProfile: null,
      notes: item.notes || '',
      created_at: item.created_at || '',
      created_by: item.created_by || null,
      trip_id: item.trip_id || tripId,
      updated_at: item.updated_at || '',
      status: item.status || 'pending',
    }));
  };

  // Group items by day
  const displayItems = transformToDisplayItems(items);
  const unscheduledItems = displayItems.filter((item) => item.day_number === null);
  const itemsByDay = Array.from({ length: durationDays }, (_, index) => {
    const dayNumber = index + 1;
    return displayItems.filter((item) => item.day_number === dayNumber);
  });

  return (
    <TooltipProvider>
      <div className="relative">
        <ItineraryTabTemplate
          canEdit={canEdit}
          isLoading={isLoading}
          error={error}
          onAddItem={() => setIsAddItemDialogOpen(true)}
          onAddItemForDay={handleAddItemForDay}
          totalDays={durationDays}
        >
          {/* Unscheduled items section */}
          {unscheduledItems.length > 0 && (
            <UnscheduledItemsSection
              items={unscheduledItems}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              showActions={canEdit}
            />
          )}

          {/* Day sections */}
          {itemsByDay.map((dayItems, index) => (
            <ItineraryDaySection
              key={`day-${index + 1}`}
              dayNumber={index + 1}
              items={dayItems}
              tripStartDate={startDate}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              showActions={canEdit}
            />
          ))}
        </ItineraryTabTemplate>

        {/* Add Item Dialog */}
        <QuickAddItemDialog
          isOpen={isAddItemDialogOpen}
          onClose={() => setIsAddItemDialogOpen(false)}
          tripId={tripId}
          defaultDayNumber={selectedDayNumber}
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
