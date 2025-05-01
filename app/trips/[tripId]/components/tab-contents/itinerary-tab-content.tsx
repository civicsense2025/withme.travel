'use client'
import { useCallback, useMemo, useState, useEffect } from 'react';
import { ItineraryTab } from '@/components/itinerary/itinerary-tab';
import { useAuth } from '@/lib/hooks/use-auth';
import { DisplayItineraryItem, ItemStatus } from '@/types/itinerary';

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
}: ItineraryTabContentProps) {
  // State for tab's filtered items
  const [itineraryItems, setItineraryItems] = useState<DisplayItineraryItem[]>(allItineraryItems);
  
  // Get user data from auth context
  const { user: authUser } = useAuth();
  
  // Handle edit item - make it async to match the expected type
  const handleEditItem = useCallback(async (item: DisplayItineraryItem) => {
    // Navigate to edit page
    window.location.href = `/trips/${tripId}/itinerary/${item.id}/edit`;
  }, [tripId]);
  
  // Add item handler 
  const handleAddItem = useCallback((dayNumber: number | null) => {
    window.location.href = `/trips/${tripId}/add-item?day=${dayNumber ?? ''}`;
  }, [tripId]);
  
  // Create a wrapper for setItineraryItems to properly handle React.SetStateAction
  const setItemsWrapper = useCallback((value: React.SetStateAction<DisplayItineraryItem[]>) => {
    // Handle both function and direct value updates properly
    if (typeof value === 'function') {
      const newState = value(itineraryItems);
      setItineraryItems(newState);
      setAllItineraryItems(newState);
    } else {
      setItineraryItems(value);
      setAllItineraryItems(value);
    }
  }, [itineraryItems, setAllItineraryItems]);
  
  // Update local items when all items change
  useEffect(() => {
    setItineraryItems(allItineraryItems);
  }, [allItineraryItems]);
  
  // Prepare the user data needed by ItineraryTab
  const userId = authUser?.id || '';
  
  return (
    <ItineraryTab
      tripId={tripId}
      itineraryItems={itineraryItems}
      setItineraryItems={setItemsWrapper}
      userId={userId}
      user={null} // Profile is optional in ItineraryTab
      userRole={userRole}
      durationDays={durationDays}
      startDate={startDate}
      onDeleteItem={handleDeleteItem}
      onVote={handleVote}
      onEditItem={handleEditItem}
      onItemStatusChange={handleItemStatusChange}
      onAddItem={handleAddItem}
      onReorder={handleReorder}
    />
  );
}
