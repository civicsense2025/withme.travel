/**
 * Itinerary API
 *
 * CRUD and custom actions for itinerary items, comments, reactions, and votes.
 *
 * @module lib/api/itinerary
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { handleError, Result, ItineraryItem } from './_shared';

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

/**
 * List all itinerary items for a trip.
 * @param tripId - The trip's unique identifier
 * @returns Result containing an array of itinerary items
 */
export async function listItineraryItems(tripId: string): Promise<Result<ItineraryItem[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .select('*')
      .eq('trip_id', tripId);
    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to fetch itinerary items');
  }
}

/**
 * Get a single itinerary item by ID.
 * @param tripId - The trip's unique identifier
 * @param itemId - The itinerary item's unique identifier
 * @returns Result containing the itinerary item
 */
export async function getItineraryItem(
  tripId: string,
  itemId: string
): Promise<Result<ItineraryItem>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', itemId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: 'Itinerary item not found' };
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to fetch itinerary item');
  }
}

/**
 * Create a new itinerary item.
 * @param tripId - The trip's unique identifier
 * @param data - The itinerary item data
 * @returns Result containing the created itinerary item
 */
export async function createItineraryItem(
  tripId: string,
  data: Partial<ItineraryItem>
): Promise<Result<ItineraryItem>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Ensure tripId is included in the data
    const itemData = { ...data, trip_id: tripId };

    const { data: newItem, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .insert(itemData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: newItem };
  } catch (error) {
    return handleError(error, 'Failed to create itinerary item');
  }
}

/**
 * Update an itinerary item.
 * @param tripId - The trip's unique identifier
 * @param itemId - The itinerary item's unique identifier
 * @param data - Partial itinerary item data to update
 * @returns Result containing the updated itinerary item
 */
export async function updateItineraryItem(
  tripId: string,
  itemId: string,
  data: Partial<ItineraryItem>
): Promise<Result<ItineraryItem>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: updatedItem, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .update(data)
      .eq('id', itemId)
      .eq('trip_id', tripId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: updatedItem };
  } catch (error) {
    return handleError(error, 'Failed to update itinerary item');
  }
}

/**
 * Delete an itinerary item.
 * @param tripId - The trip's unique identifier
 * @param itemId - The itinerary item's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteItineraryItem(tripId: string, itemId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .delete()
      .eq('trip_id', tripId)
      .eq('id', itemId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete itinerary item');
  }
}

// ============================================================================
// CUSTOM ACTIONS
// ============================================================================

/**
 * Reorder itinerary items.
 * @param tripId - The trip's unique identifier
 * @param itemIds - Array of item IDs in their new order
 * @returns Result containing the reordered items
 */
export async function reorderItineraryItems(
  tripId: string,
  itemIds: string[]
): Promise<Result<ItineraryItem[]>> {
  try {
    // This would typically involve a transaction to update the 'position' or 'order' field of each item
    // For now, we'll just implement a simple approach

    const supabase = await createRouteHandlerClient();

    // Create an array of updates, one for each item with its new position
    const updates = itemIds.map((id, index) => ({
      id,
      position: index + 1, // Use 1-based indexing for position
    }));

    // Update each item in a single batch operation
    const { data, error } = await supabase
      .from(TABLES.ITINERARY_ITEMS)
      .upsert(updates)
      .eq('trip_id', tripId)
      .select('*');

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (error) {
    return handleError(error, 'Failed to reorder itinerary items');
  }
}

export async function voteOnItineraryItem(tripId: string, itemId: string, voteType: string) {}
export async function addItineraryItemComment(tripId: string, itemId: string, comment: any) {}
export async function addItineraryItemReaction(tripId: string, itemId: string, reaction: any) {}
// (Add more as needed)
