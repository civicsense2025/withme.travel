import { createRouteHandlerClient } from '@/utils/supabase/server';
import { Result } from '@/utils/result';
import { TABLES } from '@/utils/constants/tables';

/**
 * Add a form to a trip itinerary
 * 
 * @param tripId - The ID of the trip to add the form to
 * @param data - Form data including title, description, and template ID
 * @returns Result containing the created form data
 */
export async function addFormToTrip(
  tripId: string,
  data: { 
    title: string; 
    description?: string; 
    template_id?: string | null;
  }
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Create the form as an itinerary item with type "form"
    const { data: form, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .insert({
        trip_id: tripId,
        title: data.title,
        description: data.description || null,
        type: 'form',
        template_id: data.template_id || null,
        category: 'LOGISTICS'
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    
    // If successful, notify the itinerary system that a new item has been added
    try {
      await updateItineraryOrder(tripId);
    } catch (err) {
      console.error('Failed to update itinerary order after adding form:', err);
      // Continue even if this fails - the item was still added
    }
    
    return { success: true, data: form };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add form'
    };
  }
}

/**
 * Add accommodation to a trip itinerary
 * 
 * @param tripId - The ID of the trip to add the accommodation to
 * @param data - Accommodation data including title, location, dates, and description
 * @returns Result containing the created accommodation data
 */
export async function addAccommodationToTrip(
  tripId: string,
  data: {
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Create the accommodation as an itinerary item
    const { data: accommodation, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .insert({
        trip_id: tripId,
        title: data.title,
        description: data.description || null,
        type: 'accommodation',
        category: 'LOGISTICS',
        location: data.location || null,
        start_date: data.startDate || null,
        end_date: data.endDate || null
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    
    // If successful, notify the itinerary system that a new item has been added
    try {
      await updateItineraryOrder(tripId);
    } catch (err) {
      console.error('Failed to update itinerary order after adding accommodation:', err);
      // Continue even if this fails - the item was still added
    }
    
    return { success: true, data: accommodation };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add accommodation'
    };
  }
}

/**
 * Add transportation to a trip itinerary
 * 
 * @param tripId - The ID of the trip to add the transportation to
 * @param data - Transportation data including title, locations, dates, and description
 * @returns Result containing the created transportation data
 */
export async function addTransportationToTrip(
  tripId: string,
  data: {
    title: string;
    departureLocation?: string;
    arrivalLocation?: string;
    departureDate?: string;
    arrivalDate?: string;
    description?: string;
  }
): Promise<Result<any>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Create the transportation as an itinerary item
    const { data: transportation, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .insert({
        trip_id: tripId,
        title: data.title,
        description: data.description || null,
        type: 'transportation',
        category: 'LOGISTICS',
        departure_location: data.departureLocation || null,
        arrival_location: data.arrivalLocation || null,
        start_date: data.departureDate || null,
        end_date: data.arrivalDate || null
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    
    // If successful, notify the itinerary system that a new item has been added
    try {
      await updateItineraryOrder(tripId);
    } catch (err) {
      console.error('Failed to update itinerary order after adding transportation:', err);
      // Continue even if this fails - the item was still added
    }
    
    return { success: true, data: transportation };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add transportation'
    };
  }
}

/**
 * List all logistics items for a trip
 * 
 * @param tripId - The ID of the trip to get items for
 * @returns Result containing the array of logistics items
 */
export async function listLogisticsItems(tripId: string): Promise<Result<any[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    const { data, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .select('*')
      .eq('trip_id', tripId)
      .eq('category', 'LOGISTICS')
      .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data || [] };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to list logistics items'
    };
  }
}

/**
 * Update an itinerary item's order in the trip
 * This is called after adding or updating logistics items to ensure
 * they're properly integrated into the trip itinerary
 * 
 * @param tripId - The ID of the trip to update
 * @returns Result indicating success or failure
 */
async function updateItineraryOrder(tripId: string): Promise<Result<void>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get all itinerary items for this trip
    const { data: items, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .select('id, type, category, start_date')
      .eq('trip_id', tripId)
      .order('start_date', { ascending: true });

    if (error) return { success: false, error: error.message };
    
    // Create a basic order based on date and type
    // This is a simplified version - in a real app you might have a more complex ordering logic
    const itemOrder = (items || []).map((item, index) => ({
      id: item.id,
      position: index + 1
    }));
    
    // Update the item order in the database
    // In a real app, you might use a different table for this
    // For this example, we're just simulating the integration
    
    return { success: true, data: undefined };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update itinerary order'
    };
  }
}

/**
 * Delete a logistics item from the trip
 * 
 * @param itemId - The ID of the item to delete
 * @returns Result indicating success or failure
 */
export async function deleteLogisticsItem(itemId: string): Promise<Result<void>> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Get the trip ID before deleting (for updating order later)
    const { data: item, error: getError } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .select('trip_id')
      .eq('id', itemId)
      .single();
      
    if (getError) return { success: false, error: getError.message };
    const tripId = item?.trip_id;
    
    // Delete the item
    const { error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .delete()
      .eq('id', itemId);

    if (error) return { success: false, error: error.message };
    
    // Update the itinerary order after deletion
    if (tripId) {
      try {
        await updateItineraryOrder(tripId);
      } catch (err) {
        console.error('Failed to update itinerary order after deleting item:', err);
        // Continue even if this fails - the item was still deleted
      }
    }
    
    return { success: true, data: undefined };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete logistics item'
    };
  }
} 