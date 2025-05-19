'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast'
import { useTripData } from '../context/trip-data-provider';
import type { Tables } from '@/types/database.types';

type Trip = Tables<'trips'>;
type ItineraryItem = Tables<'itinerary_items'>;
type ItinerarySection = Tables<'itinerary_sections'>;

// Define mutation result type
interface MutationResult<T = unknown> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useTripMutations(tripId: string) {
  const { tripData, optimisticUpdate, refetchTrip, refetchItinerary } = useTripData();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Helper to check if supabase client is available
  const getSupabase = () => {
    if (!supabase) {
      throw new Error('Supabase client is not available');
    }
    return supabase;
  };

  /**
   * Update trip details with optimistic update
   */
  const updateTripDetails = async (updates: Partial<Trip>): Promise<MutationResult<Trip>> => {
    if (!tripData?.trip) {
      return {
        data: null,
        error: new Error('No trip data available'),
        isLoading: false,
      };
    }

    setIsUpdating(true);

    try {
      // Optimistic update
      await optimisticUpdate('trip', (prevTrip) => {
        if (!prevTrip) {
          console.error('Optimistic update called with null prevTrip');
          return null;
        }
        // Ensure required fields like 'id' are preserved and the result is of type Trip
        return {
          ...prevTrip,
          ...updates,
          id: prevTrip.id, // Explicitly preserve the non-nullable ID
        } as Trip;
      });

      // Actual API call
      const supabaseClient = getSupabase();
      const { data, error } = await supabaseClient
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;

      // Revalidate after success
      await refetchTrip();

      toast({
        title: 'Success',
        description: 'Trip details updated successfully',
      });

      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error updating trip:', error);

      // Revert optimistic update
      await refetchTrip();

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update trip details',
        variant: 'destructive',
      });

      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Create a new itinerary section
   */
  const createSection = async (
    section: Partial<ItinerarySection>
  ): Promise<MutationResult<ItinerarySection>> => {
    if (!tripId) {
      return {
        data: null,
        error: new Error('No trip ID provided'),
        isLoading: false,
      };
    }

    setIsUpdating(true);

    try {
      // Prepare section data
      const sectionData = {
        trip_id: tripId,
        position: section.position || 0,
        ...section,
        day_number: section.day_number ?? 0, // Ensure day_number is always present
      };

      // Actual API call first (no optimistic update for creation)
      const supabaseClient = getSupabase();
      const { data, error } = await supabaseClient
        .from('itinerary_sections')
        .insert(sectionData)
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await refetchItinerary();

      toast({
        title: 'Success',
        description: `Section "${section.title || 'New Section'}" created`,
      });

      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error creating section:', error);

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create section',
        variant: 'destructive',
      });

      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update an itinerary section
   */
  const updateSection = async (
    sectionId: string,
    updates: Partial<ItinerarySection>
  ): Promise<MutationResult<ItinerarySection>> => {
    if (!tripId || !sectionId) {
      return {
        data: null,
        error: new Error('Section ID is required'),
        isLoading: false,
      };
    }

    setIsUpdating(true);

    try {
      // Find the section to update for optimistic update
      if (!tripData?.sections) {
        throw new Error('Trip sections data is not available');
      }

      const sectionIndex = tripData.sections.findIndex((s) => s.id === sectionId);
      if (sectionIndex === -1) {
        throw new Error('Section not found');
      }

      // Optimistic update
      await optimisticUpdate('sections', (currentSections) => {
        if (!currentSections) return [];
        const updatedSections = [...currentSections];
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          ...updates,
        };
        return updatedSections;
      });

      // Actual API call
      const supabaseClient = getSupabase();
      const { data, error } = await supabaseClient
        .from('itinerary_sections')
        .update(updates)
        .eq('id', sectionId)
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await refetchItinerary();

      toast({
        title: 'Success',
        description: 'Section updated successfully',
      });

      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error updating section:', error);

      // Revert optimistic update
      await refetchItinerary();

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update section',
        variant: 'destructive',
      });

      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete an itinerary section
   */
  const deleteSection = async (sectionId: string): Promise<MutationResult<void>> => {
    if (!tripId || !sectionId) {
      return {
        data: null,
        error: new Error('Section ID is required'),
        isLoading: false,
      };
    }

    setIsUpdating(true);

    try {
      // Find the section to delete for optimistic update
      if (!tripData?.sections) {
        throw new Error('Trip sections data is not available');
      }

      const sectionIndex = tripData.sections.findIndex((s) => s.id === sectionId);
      if (sectionIndex === -1) {
        throw new Error('Section not found');
      }

      // Optimistic update - remove section from the list
      await optimisticUpdate('sections', (currentSections) => {
        if (!currentSections) return [];
        return currentSections.filter((s) => s.id !== sectionId);
      });

      // Also filter out items associated with this section
      await optimisticUpdate('items', (currentItems) => {
        if (!currentItems) return [];
        return currentItems.filter((item) => item.section_id !== sectionId);
      });

      // Actual API call - delete will cascade to items due to DB constraints
      const supabaseClient = getSupabase();
      const { error } = await supabaseClient
        .from('itinerary_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;

      // Refresh data
      await refetchItinerary();

      toast({
        title: 'Success',
        description: 'Section deleted successfully',
      });

      return { data: null, error: null, isLoading: false };
    } catch (error) {
      console.error('Error deleting section:', error);

      // Revert optimistic update
      await refetchItinerary();

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete section',
        variant: 'destructive',
      });

      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Create a new itinerary item
   */
  const createItem = async (
    item: Partial<ItineraryItem>
  ): Promise<MutationResult<ItineraryItem>> => {
    if (!tripId) {
      return {
        data: null,
        error: new Error('No trip ID provided'),
        isLoading: false,
      };
    }

    setIsUpdating(true);

    try {
      // Prepare item data
      const itemData = {
        trip_id: tripId,
        ...item,
        title: item.title ?? '', // Ensure title is always present
      };

      // Actual API call first (no optimistic update for creation)
      const supabaseClient = getSupabase();
      const { data, error } = await supabaseClient
        .from('itinerary_items')
        .insert(itemData)
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await refetchItinerary();

      toast({
        title: 'Success',
        description: `Item "${item.title || 'New Item'}" created`,
      });

      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error creating item:', error);

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create item',
        variant: 'destructive',
      });

      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update an itinerary item
   */
  const updateItem = async (
    itemId: string,
    updates: Partial<ItineraryItem>
  ): Promise<MutationResult<ItineraryItem>> => {
    if (!tripId || !itemId) {
      return {
        data: null,
        error: new Error('Item ID is required'),
        isLoading: false,
      };
    }

    setIsUpdating(true);

    try {
      // Find the item to update for optimistic update
      if (!tripData) {
        throw new Error('Trip data not available');
      }

      const itemIndex = tripData.items.findIndex((i) => i.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }

      // Optimistic update
      await optimisticUpdate('items', (currentItems) => {
        if (!currentItems) {
          return [];
        }
        const updatedItems = [...currentItems];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          ...updates,
        };
        return updatedItems;
      });

      // Actual API call
      const supabaseClient = getSupabase();
      const { data, error } = await supabaseClient
        .from('itinerary_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await refetchItinerary();

      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });

      return { data, error: null, isLoading: false };
    } catch (error) {
      console.error('Error updating item:', error);

      // Revert optimistic update
      await refetchItinerary();

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update item',
        variant: 'destructive',
      });

      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete an itinerary item
   */
  const deleteItem = async (itemId: string): Promise<MutationResult<void>> => {
    if (!tripId || !itemId) {
      return {
        data: null,
        error: new Error('Item ID is required'),
        isLoading: false,
      };
    }

    setIsUpdating(true);

    try {
      // Find the item to delete for optimistic update
      if (!tripData) {
        throw new Error('Trip data not available');
      }

      const itemIndex = tripData.items.findIndex((i) => i.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }

      // Optimistic update - remove item from the list
      await optimisticUpdate('items', (currentItems) => {
        if (!currentItems) {
          return [];
        }
        return currentItems.filter((i) => i.id !== itemId);
      });

      // Actual API call
      const supabaseClient = getSupabase();
      const { error } = await supabaseClient.from('itinerary_items').delete().eq('id', itemId);

      if (error) throw error;

      // Refresh data
      await refetchItinerary();

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });

      return { data: null, error: null, isLoading: false };
    } catch (error) {
      console.error('Error deleting item:', error);

      // Revert optimistic update
      await refetchItinerary();

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete item',
        variant: 'destructive',
      });

      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateTripDetails,
    createSection,
    updateSection,
    deleteSection,
    createItem,
    updateItem,
    deleteItem,
    isUpdating,
  };
}
