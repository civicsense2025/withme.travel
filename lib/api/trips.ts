/**
 * Trips API
 *
 * Provides CRUD operations and custom actions for trips.
 * Used for managing trip creation, updates, invitations, and collaborative features.
 *
 * @module lib/api/trips
 */

// ============================================================================
// IMPORTS & SCHEMAS
// ============================================================================

import { createRouteHandlerClient } from '@/utils/supabase/server';
import { handleError, Result } from './_shared';
import ical from 'ical-generator';

// ============================================================================
// TYPES
// ============================================================================

export interface Trip {
  id: string;
  name: string;
  title: string; // Required to resolve type errors
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
  destination_name?: string | null;
  cover_image_url?: string | null;
  is_public: boolean;
  status?: 'planning' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | null;
  // Include other fields that might be in the database schema
  city_id?: string | null;
  color_scheme?: string | null;
  budget?: string | null;
  cover_image_position_y?: number | null;
  comments_count?: number | null;
  view_count?: number | null;
  destination_id?: string | null; // Added for compatibility with hooks/use-trips.ts
}

// ============================================================================
// CRUD FUNCTIONS
// ============================================================================

export const TABLES = {
  TRIPS: 'trips',
  TRIP_MEMBERS: 'trip_members',
  // ...other tables
} as const;

/**
 * List all trips for a user.
 * @param userId - The user's unique identifier
 * @returns Result containing an array of trips
 */
export async function listTrips(userId: string): Promise<Result<Trip[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase.from('trips').select('*').eq('created_by', userId);

    if (error) return { success: false, error: error.message };
    // Add title field for type compatibility (can be same as name)
    const tripsWithTitle =
      data?.map((trip) => ({
        ...trip,
        title: trip.name || 'Untitled Trip',
        destination_id: trip.city_id, // Map city_id to destination_id for compatibility
      })) || [];
    return { success: true, data: tripsWithTitle };
  } catch (error) {
    return handleError(error, 'Failed to fetch trips');
  }
}

/**
 * Get a single trip by ID.
 * @param tripId - The trip's unique identifier
 * @returns Result containing the trip
 */
export async function getTrip(tripId: string): Promise<Result<Trip>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data: trip, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!trip) return { success: false, error: 'Trip not found' };
    // Add title field for type compatibility
    const tripWithTitle: Trip = {
      ...trip,
      title: trip.name || 'Untitled Trip',
      destination_id: trip.city_id, // Map city_id to destination_id for compatibility
    };
    return { success: true, data: tripWithTitle };
  } catch (error) {
    return handleError(error, 'Failed to fetch trip');
  }
}

/**
 * Create a new trip.
 * @param data - The trip data
 * @returns Result containing the created trip
 */
export async function createTrip(data: Partial<Trip>): Promise<Result<Trip>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Ensure name field exists for database requirements
    if (!data.name && data.title) {
      data.name = data.title;
    }

    // Ensure created_by is never undefined
    const createTripData: any = { ...data };
    if (data.destination_id && !data.city_id) {
      createTripData.city_id = data.destination_id;
    }

    // Convert status to valid enum if needed
    if (
      data.status &&
      !['planning', 'upcoming', 'in_progress', 'completed', 'cancelled'].includes(data.status)
    ) {
      delete createTripData.status;
    }

    const { data: newTrip, error } = await supabase
      .from('trips')
      .insert(createTripData)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    // Add title field for type compatibility
    const tripWithTitle: Trip = {
      ...newTrip,
      title: newTrip.name || 'Untitled Trip',
      destination_id: newTrip.city_id, // Map city_id to destination_id for compatibility
    };
    return { success: true, data: tripWithTitle };
  } catch (error) {
    return handleError(error, 'Failed to create trip');
  }
}

/**
 * Update an existing trip.
 * @param tripId - The trip's unique identifier
 * @param data - Partial trip data to update
 * @returns Result containing the updated trip
 */
export async function updateTrip(tripId: string, data: Partial<Trip>): Promise<Result<Trip>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Ensure name field is updated if title is provided
    const updateData: any = { ...data };
    if (!updateData.name && updateData.title) {
      updateData.name = updateData.title;
    }

    // Map destination_id to city_id if provided
    if (updateData.destination_id && !updateData.city_id) {
      updateData.city_id = updateData.destination_id;
      delete updateData.destination_id;
    }

    // Convert status to valid enum if needed
    if (
      updateData.status &&
      !['planning', 'upcoming', 'in_progress', 'completed', 'cancelled'].includes(updateData.status)
    ) {
      delete updateData.status;
    }

    const { data: updatedTrip, error } = await supabase
      .from('trips')
      .update(updateData)
      .eq('id', tripId)
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };
    // Add title field for type compatibility
    const tripWithTitle: Trip = {
      ...updatedTrip,
      title: updatedTrip.name || 'Untitled Trip',
      destination_id: updatedTrip.city_id, // Map city_id to destination_id for compatibility
    };
    return { success: true, data: tripWithTitle };
  } catch (error) {
    return handleError(error, 'Failed to update trip');
  }
}

/**
 * Delete a trip by ID.
 * @param tripId - The trip's unique identifier
 * @returns Result indicating success or failure
 */
export async function deleteTrip(tripId: string): Promise<Result<null>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.from('trips').delete().eq('id', tripId);
    if (error) return { success: false, error: error.message };
    return { success: true, data: null };
  } catch (error) {
    return handleError(error, 'Failed to delete trip');
  }
}

/**
 * List all public trips with cities.
 * @param params - Pagination params
 * @returns Result containing an array of public trips with cities
 */
export async function listPublicTrips({
  limit = 10,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
}): Promise<Result<Trip[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('trips')
      .select(`*, cities:trip_cities(city:city_id(*))`)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return { success: false, error: error.message };
    // Flatten cities
    const trips = (data ?? []).map((trip) => ({
      ...trip,
      cities: (trip.cities || []).map((c: any) => c.city),
      title: trip.name || 'Untitled Trip', // Add title for type compatibility
      destination_id: trip.city_id, // Map city_id to destination_id for compatibility
    }));
    return { success: true, data: trips };
  } catch (error) {
    return handleError(error, 'Failed to fetch public trips');
  }
}

/**
 * List all trips for a user, optionally including shared trips (where user is a member).
 *
 * Note: trip_members does NOT have a 'status' field. Only filter by user_id, trip_id, or role.
 *
 * @param userId - The user's unique identifier
 * @param params - includeShared, limit, offset
 * @returns Result containing an array of trips with cities
 */
export async function listUserTripsWithMembership(
  userId: string,
  {
    includeShared = false,
    limit = 10,
    offset = 0,
  }: { includeShared?: boolean; limit?: number; offset?: number }
): Promise<Result<Trip[]>> {
  try {
    const supabase = await createRouteHandlerClient();
    // Get trips created by user
    let tripIds: string[] = [];
    if (includeShared) {
      const { data: memberTrips, error: memberError } = await supabase
        .from('trip_members')
        .select('trip_id')
        .eq('user_id', userId);
      if (memberError) return { success: false, error: memberError.message };
      tripIds = (memberTrips ?? []).map((m: any) => m.trip_id);
    }
    const filter =
      includeShared && tripIds.length > 0
        ? `created_by.eq.${userId},id.in.(${tripIds.join(',')})`
        : `created_by.eq.${userId}`;
    const { data, error } = await supabase
      .from('trips')
      .select(`*, cities:trip_cities(city:city_id(*))`)
      .or(filter)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return { success: false, error: error.message };
    const trips = (data ?? []).map((trip) => ({
      ...trip,
      cities: (trip.cities || []).map((c: any) => c.city),
      title: trip.name || 'Untitled Trip', // Add title for type compatibility
      destination_id: trip.city_id, // Map city_id to destination_id for compatibility
    }));
    return { success: true, data: trips };
  } catch (error) {
    return handleError(error, 'Failed to fetch user trips');
  }
}

/**
 * Get a trip with all related data (members, cities, tags, etc.)
 *
 * Note: trip_members does NOT have a 'status' field. Only user_id, role, and profiles are selected for members.
 *
 * @param tripId - The trip's unique identifier
 * @returns Result containing the trip with details
 */
export async function getTripWithDetails(tripId: string): Promise<
  Result<
    Trip & {
      cities?: any[];
      members?: any[];
    }
  >
> {
  try {
    const supabase = await createRouteHandlerClient();
    // Remove 'status' from the select and only select user_id, role, and profiles
    const { data: trip, error } = await supabase
      .from('trips')
      .select(
        `*, cities:trip_cities(city:city_id(*)), members:trip_members(user_id, role, profiles:profiles!trip_members_user_id_fkey(*))`
      )
      .eq('id', tripId)
      .single();
    if (error) return { success: false, error: error.message };
    if (!trip) return { success: false, error: 'Trip not found' };
    return {
      success: true,
      data: {
        ...trip,
        title: trip.name || 'Untitled Trip', // Add title for type compatibility
        destination_id: trip.city_id, // Map city_id to destination_id for compatibility
        cities: (trip.cities || []).map((c: any) => c.city),
        members: (trip.members || []).map((m: any) => ({ ...m, profile: m.profiles })),
      },
    };
  } catch (error) {
    return handleError(error, 'Failed to fetch trip details');
  }
}

/**
 * Update a trip and its related data (cities, tags, etc.)
 * @param tripId - The trip's unique identifier
 * @param data - Trip and related data
 * @returns Result containing the updated trip
 */
export async function updateTripWithDetails(tripId: string, data: any): Promise<Result<Trip>> {
  // TODO: Implement atomic update for trip, cities, tags, etc.
  // For now, just update trip main fields
  return updateTrip(tripId, data);
}
// (Add more as needed)

// ============================================================================
// CALENDAR EXPORT (ICS/GOOGLE CALENDAR)
// ============================================================================

/**
 * Options for exporting a trip calendar
 */
export interface ExportTripCalendarOptions {
  /** Export all days or only selected days */
  exportOption: 'all' | 'selected';
  /** List of selected day strings (YYYY-MM-DD) */
  selectedDays?: string[];
  /** If true, return ICS string for download; if false, return event objects for Google Calendar */
  asIcs?: boolean;
  /** The user's session object (must include user id, provider, and provider_token for Google export) */
  session: {
    user: {
      id: string;
      app_metadata?: { provider?: string };
      provider_token?: string;
    };
  };
}

/**
 * Centralized business logic for exporting a trip's itinerary as calendar events (Google Calendar or ICS).
 *
 * @param tripId - The trip's unique identifier
 * @param options - Export options (selected days, format, session)
 * @returns Result with either event data (for Google Calendar) or ICS string (for download)
 */
export async function exportTripCalendar(
  tripId: string,
  options: ExportTripCalendarOptions
): Promise<Result<{ events?: any[]; icsString?: string; tripName?: string; exportedItems: number }>> {
  try {
    const supabase = await createRouteHandlerClient();
    const { exportOption, selectedDays, asIcs, session } = options;

    // Validate session
    if (!session || !session.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is a member of this trip
    const { data: member, error: memberError } = await supabase
      .from(TABLES.TRIP_MEMBERS)
      .select()
      .eq('trip_id', tripId)
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (memberError || !member) {
      return { success: false, error: "You don't have access to this trip" };
    }

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from(TABLES.TRIPS)
      .select('name, start_date, end_date')
      .eq('id', tripId)
      .single();
    if (tripError || !trip) {
      return { success: false, error: tripError?.message || 'Trip not found' };
    }

    // Get itinerary items
    let query = supabase.from('itinerary_items').select('*').eq('trip_id', tripId);
    if (exportOption === 'selected' && selectedDays && selectedDays.length > 0) {
      query = query.in('date', selectedDays);
    }
    const { data: items, error: itemsError } = await query;
    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    // Format events for Google Calendar or ICS
    const calendarEvents =
      items && Array.isArray(items) && items.length > 0
        ? items
            .map((item: any) => {
              // Defensive: skip items without required fields
              if (!item || typeof item.date !== 'string' || !item.title) return null;
              // Default to all day event if no times specified
              const hasStartTime = Boolean(item.start_time);
              const hasEndTime = Boolean(item.end_time);
              let itemDate: Date;
              try {
                itemDate = new Date(item.date);
                if (isNaN(itemDate.getTime())) return null;
              } catch {
                return null;
              }
              let startDateTime: Date;
              let endDateTime: Date;
              try {
                startDateTime =
                  hasStartTime && item.start_time
                    ? new Date(`${item.date}T${item.start_time}`)
                    : new Date(itemDate.setHours(9, 0, 0));
                endDateTime =
                  hasEndTime && item.end_time
                    ? new Date(`${item.date}T${item.end_time}`)
                    : new Date(startDateTime.getTime() + 60 * 60 * 1000);
                if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                  startDateTime = new Date(itemDate.setHours(9, 0, 0));
                  endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
                }
              } catch {
                startDateTime = new Date(itemDate.setHours(9, 0, 0));
                endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
              }
              return {
                summary: item.title || 'Untitled Event',
                description: item.notes || `Part of your trip with withme.travel`,
                location: item.location || undefined,
                start: {
                  dateTime: startDateTime.toISOString(),
                  timeZone: 'UTC',
                },
                end: {
                  dateTime: endDateTime.toISOString(),
                  timeZone: 'UTC',
                },
              };
            })
            .filter(Boolean)
        : [];

    if (asIcs) {
      // Generate ICS string using ical-generator
      const calendar = ical({
        name: `${trip.name} Itinerary`,
        timezone: 'UTC',
      });
      calendarEvents.forEach((event: any) => {
        calendar.createEvent({
          start: new Date(event.start.dateTime),
          end: new Date(event.end.dateTime),
          summary: event.summary,
          description: event.description,
          location: event.location,
          url: `https://withme.travel/trips/${tripId}`,
        });
      });
      const icsString = calendar.toString();
      return {
        success: true,
        data: {
          icsString,
          tripName: trip.name,
          exportedItems: calendarEvents.length,
        },
      };
    } else {
      // For Google Calendar or preview
      return {
        success: true,
        data: {
          events: calendarEvents,
          tripName: trip.name,
          exportedItems: calendarEvents.length,
        },
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
