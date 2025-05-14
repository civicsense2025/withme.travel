import type { Tables } from '@/types/database.types';
type ItineraryItem = Tables<'itinerary_items'>;

const addItem = async (item: Partial<ItineraryItem>, items: ItineraryItem[], tripId: string) => {
  // ... existing code to add the item

  // After successfully adding the item, emit the event with the updated count
  if (typeof window !== 'undefined' && items.length >= 2) {
    // We're adding 1 item and checking if it's the 3rd+ item
    // ... existing code ...
  }

  // ... rest of the function
};
