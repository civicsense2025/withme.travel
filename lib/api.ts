/**
 * Server-side API utilities for fetching and mutating core entities (trips, cities, groups, etc.)
 *
 * This module provides type-safe, error-handled, and schema-validated functions for all major data operations.
 * All functions use consistent patterns with discriminated union results, Zod validation, and robust error handling.
 *
 * Usage:
 *   import { getTrip, listTrips, createTrip, updateTrip } from '@/lib/api';
 *   import { useTripQuery, useTripListQuery, useTripMutation } from '@/lib/api';
 *
 * @module lib/api
 */

// ============================================================================
// IMPORTS & CONSTANTS
// ============================================================================

// External dependencies
import { cache } from 'react';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
// Removed next/headers import to avoid server component requirement

// Internal modules
import { TABLES } from '@/utils/constants/tables';
import { API_ROUTES } from '@/utils/constants/routes';

// ============================================================================
// RESULT TYPE & HELPERS
// ============================================================================

/**
 * Discriminated union result type for API functions
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Error codes for better error handling
 */
export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error type with code for more detailed error handling
 */
export type ApiError = {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
};

/**
 * Helper to handle Supabase errors and return a Result<T>
 * Safely handles null data by converting to appropriate error response
 */
function handleSupabase<T>(
  data: T | null,
  error: any,
  fallbackMsg: string
): Result<T> {
  if (error) {
    console.error(fallbackMsg, error);
    return { success: false, error: error?.message || fallbackMsg };
  }
  
  if (data === null) {
    return { success: false, error: fallbackMsg };
  }
  
  return { success: true, data };
}

/**
 * Error handler for try/catch blocks with consistent error formatting
 */
function handleError(error: unknown, fallbackMsg: string): Result<never> {
  console.error(fallbackMsg, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  return { success: false, error: errorMessage };
}

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

// Base schemas for reuse
const idSchema = z.string().uuid();
const nullableStringSchema = z.string().nullable();
const nullableNumberSchema = z.number().nullable();
const dateStringSchema = z.string().nullable();
const metadataSchema = z.record(z.any()).optional();

// City schema
export const citySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  country: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  image_url: z.string().nullable().optional(),
  state_province: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  country_code: z.string().nullable().optional(),
});

// Trip schema
export const tripSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  start_date: dateStringSchema,
  end_date: dateStringSchema,
  created_at: z.string(),
  status: z.string().nullable(),
  destination_name: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  created_by: z.string(),
  is_public: z.boolean().nullable(),
  privacy_setting: z.string().nullable(),
  cities: z.array(citySchema).optional(),
});

// Trip expense schema
export const expenseSchema = z.object({
  id: z.string(),
  trip_id: z.string(),
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: dateStringSchema,
  category: z.string().nullable(),
  paid_by: z.string().nullable(),
  split_type: z.string().nullable(),
  created_by: z.string(),
  created_at: z.string(),
  notes: z.string().nullable(),
});

// Trip note schema
export const noteSchema = z.object({
  id: z.string(),
  trip_id: z.string(),
  title: z.string(),
  content: z.string().nullable(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  is_pinned: z.boolean().default(false),
});

// Trip activity schema
export const activitySchema = z.object({
  id: z.string(),
  trip_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  date: dateStringSchema,
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  location: z.string().nullable(),
  created_by: z.string(),
  created_at: z.string(),
  status: z.string().nullable(),
});

// Group schema
export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
  created_by: z.string(),
  image_url: z.string().nullable(),
  is_active: z.boolean().default(true),
  metadata: metadataSchema,
});

// Group member schema
export const groupMemberSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  user_id: z.string(),
  role: z.string(),
  status: z.string(),
  created_at: z.string(),
  invited_by: z.string().nullable(),
});

// Group invitation schema
export const groupInvitationSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  email: z.string().email(),
  token: z.string(),
  expires_at: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  status: z.string(),
});

// Group plan idea schema
export const groupPlanIdeaSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: z.enum(['destination', 'date', 'activity', 'budget', 'other', 'question', 'note', 'place']),
  created_by: z.string(),
  created_at: z.string(),
  votes_up: z.number().default(0),
  votes_down: z.number().default(0),
  start_date: dateStringSchema,
  end_date: dateStringSchema,
  meta: metadataSchema,
});

// Destination schema
export const destinationSchema = z.object({
  id: z.string(),
  city: z.string(),
  country: z.string(),
  continent: z.string(),
  description: z.string().nullable().optional(),
  byline: z.string().nullable().optional(),
  highlights: z.array(z.string()).optional(),
  image_url: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  cuisine_rating: z.number().optional(),
  nightlife_rating: z.number().optional(),
  cultural_attractions: z.number().optional(),
  outdoor_activities: z.number().optional(),
  beach_quality: z.number().nullable().optional(),
  safety_rating: z.number().optional(),
  popularity: z.number(),
  country_code: z.string().optional(),
  state_province: z.string().nullable().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Export types from the schemas
export type City = z.infer<typeof citySchema>;
export type Trip = z.infer<typeof tripSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type Note = z.infer<typeof noteSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Group = z.infer<typeof groupSchema>;
export type GroupMember = z.infer<typeof groupMemberSchema>;
export type GroupInvitation = z.infer<typeof groupInvitationSchema>;
export type GroupPlanIdea = z.infer<typeof groupPlanIdeaSchema>;
export type Destination = z.infer<typeof destinationSchema>;

// ============================================================================
// SUPABASE CLIENT FACTORY
// ============================================================================

/**
 * Create a server-side Supabase client
 * 
 * Note: This version requires manually passing cookie handlers
 * as arguments to avoid dependencies on next/headers
 */
function getSupabaseForServer(cookieHandlers?: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: {
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    path?: string;
  }) => void;
  remove: (name: string, options?: {
    path?: string;
  }) => void;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieHandlers || {
        get: (name) => undefined, // Return undefined when no cookie handler provided
        set: () => {}, // No-op
        remove: () => {}, // No-op
      }
    }
  );
}

// ============================================================================
// PAGINATION HELPER
// ============================================================================

/**
 * Calculate pagination values
 */
function getPagination(page: number, limit: number) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { from, to };
}

// ============================================================================
// TRIPS API
// ============================================================================

/**
 * Get a trip by ID
 * @param tripId - The ID of the trip to retrieve
 * @param cookieHandlers - Optional cookie handlers for auth
 */
export async function getTrip(
  tripId: string, 
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<Trip>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
     
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        created_at,
        status,
        destination_name,
        cover_image_url,
        created_by,
        is_public,
        privacy_setting,
        trip_cities (
          city_id,
          arrival_date,
          departure_date,
          city:cities (
            id,
            name,
            country,
            latitude,
            longitude,
            image_url,
            state_province,
            timezone,
            country_code
          )
        )
      `)
      .eq('id', tripId)
      .single();
    
    if (error) {
      return { success: false, error: `Failed to fetch trip: ${error.message}` };
    }
    
    if (!data) {
      return { success: false, error: `Trip not found: ${tripId}` };
    }
    
    // Process and transform the data if needed
    const transformedData = {
      ...data,
      cities: data.trip_cities?.map((tripCity: any) => tripCity.city) || []
    };
    
    // Validate with Zod
    try {
      const validated = tripSchema.parse(transformedData);
      return { success: true, data: validated };
    } catch (validationError) {
      console.error('Trip validation error:', validationError);
      return { success: false, error: 'Invalid trip data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch trip ${tripId}`);
  }
}

/**
 * List trips with pagination and filtering
 */
export async function listTrips({
  userId,
  includeShared = false,
  page = 1,
  limit = 10,
  cookieHandlers
}: { 
  userId?: string; 
  includeShared?: boolean;
  page?: number; 
  limit?: number;
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0];
} = {}): Promise<Result<Trip[]>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    const { from, to } = getPagination(page, limit);
    
    // Base query
    let query = supabase
      .from('trips')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        created_at,
        status,
        destination_name,
        cover_image_url,
        created_by,
        is_public,
        privacy_setting
      `)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    // Apply filters if userId is provided
    if (userId) {
      if (includeShared) {
        // Get trips created by user OR shared with user
        const { data: membershipTripIds, error: membershipError } = await supabase
          .from('trip_members')
          .select('trip_id')
          .eq('user_id', userId);
        
        if (membershipError) {
          return { success: false, error: `Failed to fetch trip memberships: ${membershipError.message}` };
        }
        
        const tripIds = membershipTripIds?.map(m => m.trip_id) || [];
        
        // Combined filter: either created by user OR in the tripIds list
        query = query.or(`created_by.eq.${userId},id.in.(${tripIds.join(',')})`);
      } else {
        // Only get trips created by user
        query = query.eq('created_by', userId);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      return { success: false, error: `Failed to fetch trips: ${error.message}` };
    }
    
    // Validate with Zod
    try {
      const validatedTrips = z.array(tripSchema).parse(data);
      return { success: true, data: validatedTrips };
    } catch (validationError) {
      console.error('Trips validation error:', validationError);
      return { success: false, error: 'Invalid trips data structure' };
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch trips');
  }
}

/**
 * Create a new trip
 */
export async function createTrip(
  tripData: Omit<Trip, 'id' | 'created_at' | 'cities'> & { cities?: { id: string }[] }
): Promise<Result<Trip>> {
  try {
    const supabase = await getSupabaseForServer();
    
    // Create the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        name: tripData.name,
        description: tripData.description,
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        status: tripData.status,
        destination_name: tripData.destination_name,
        cover_image_url: tripData.cover_image_url,
        created_by: tripData.created_by,
        is_public: tripData.is_public ?? false,
        privacy_setting: tripData.privacy_setting || 'private',
      })
      .select()
      .single();
    
    if (tripError) {
      return { success: false, error: `Failed to create trip: ${tripError.message}` };
    }
    
    // Add creator as a member with admin role
    const { error: memberError } = await supabase
      .from('trip_members')
      .insert({
        trip_id: trip.id,
        user_id: tripData.created_by,
        role: 'admin',
      });
    
    if (memberError) {
      console.error('Failed to add trip member:', memberError);
      // Continue execution - we've created the trip, just failed to add the member
    }
    
    // Add cities if provided
    if (tripData.cities && tripData.cities.length > 0) {
      const cityInserts = tripData.cities.map(city => ({
        trip_id: trip.id,
        city_id: city.id,
      }));
      
      const { error: citiesError } = await supabase
        .from('trip_cities')
        .insert(cityInserts);
      
      if (citiesError) {
        console.error('Failed to add trip cities:', citiesError);
        // Continue execution - partial success
      }
    }
    
    return { success: true, data: trip };
  } catch (error) {
    return handleError(error, 'Failed to create trip');
  }
}

/**
 * Update an existing trip
 */
export async function updateTrip(
  tripId: string, 
  tripData: Partial<Omit<Trip, 'id' | 'created_at' | 'cities'>>
): Promise<Result<Trip>> {
  try {
    const supabase = await getSupabaseForServer();
    
    const { data, error } = await supabase
      .from('trips')
      .update(tripData)
      .eq('id', tripId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: `Failed to update trip: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, `Failed to update trip ${tripId}`);
  }
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId: string): Promise<Result<{ deleted: true }>> {
  try {
    const supabase = await getSupabaseForServer();
    
    // Delete the trip - cascade rules in the database will handle related records
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);
    
    if (error) {
      return { success: false, error: `Failed to delete trip: ${error.message}` };
    }
    
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleError(error, `Failed to delete trip ${tripId}`);
  }
}

/**
 * Update cities associated with a trip
 */
export async function updateTripCities(
  tripId: string, 
  cities: Array<{ cityId: string; arrivalDate?: string; departureDate?: string }>
): Promise<Result<{ updated: true }>> {
  try {
    const supabase = await getSupabaseForServer();
    
    // First, delete existing trip cities
    const { error: deleteError } = await supabase
      .from('trip_cities')
      .delete()
      .eq('trip_id', tripId);
    
    if (deleteError) {
      return { success: false, error: `Failed to update trip cities: ${deleteError.message}` };
    }
    
    // Then insert new trip cities
    if (cities.length > 0) {
      const insertRows = cities.map(city => ({
        trip_id: tripId,
        city_id: city.cityId,
        arrival_date: city.arrivalDate || null,
        departure_date: city.departureDate || null,
      }));
      
      const { error: insertError } = await supabase
        .from('trip_cities')
        .insert(insertRows);
      
      if (insertError) {
        return { success: false, error: `Failed to add trip cities: ${insertError.message}` };
      }
    }
    
    return { success: true, data: { updated: true } };
  } catch (error) {
    return handleError(error, `Failed to update trip cities for trip ${tripId}`);
  }
}

// ============================================================================
// TRIP EXPENSES API
// ============================================================================

/**
 * List expenses for a trip
 */
export async function listTripExpenses(
  tripId: string,
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<Expense[]>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    
    const { data, error } = await supabase
      .from('trip_expenses')
      .select()
      .eq('trip_id', tripId)
      .order('date', { ascending: false });
    
    if (error) {
      return { success: false, error: `Failed to fetch trip expenses: ${error.message}` };
    }
    
    try {
      const validatedExpenses = z.array(expenseSchema).parse(data);
      return { success: true, data: validatedExpenses };
    } catch (validationError) {
      console.error('Expenses validation error:', validationError);
      return { success: false, error: 'Invalid expenses data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch expenses for trip ${tripId}`);
  }
}

/**
 * Create a new expense for a trip
 */
export async function createTripExpense(
  expenseData: Omit<Expense, 'id' | 'created_at'>,
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<Expense>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    
    const { data, error } = await supabase
      .from('trip_expenses')
      .insert(expenseData)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: `Failed to create expense: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to create expense');
  }
}

// ============================================================================
// TRIP NOTES API
// ============================================================================

/**
 * List notes for a trip
 */
export async function listTripNotes(
  tripId: string,
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<Note[]>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    
    const { data, error } = await supabase
      .from('trip_notes')
      .select()
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { success: false, error: `Failed to fetch trip notes: ${error.message}` };
    }
    
    try {
      const validatedNotes = z.array(noteSchema).parse(data);
      return { success: true, data: validatedNotes };
    } catch (validationError) {
      console.error('Notes validation error:', validationError);
      return { success: false, error: 'Invalid notes data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch notes for trip ${tripId}`);
  }
}

/**
 * Create a new note for a trip
 */
export async function createTripNote(
  noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>,
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<Note>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    
    const { data, error } = await supabase
      .from('trip_notes')
      .insert(noteData)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: `Failed to create note: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to create note');
  }
}

// ============================================================================
// TRIP ACTIVITIES API
// ============================================================================

/**
 * List activities for a trip
 */
export async function listTripActivities(
  tripId: string,
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<Activity[]>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    
    const { data, error } = await supabase
      .from('trip_activities')
      .select()
      .eq('trip_id', tripId)
      .order('date', { ascending: true });
    
    if (error) {
      return { success: false, error: `Failed to fetch trip activities: ${error.message}` };
    }
    
    try {
      const validatedActivities = z.array(activitySchema).parse(data);
      return { success: true, data: validatedActivities };
    } catch (validationError) {
      console.error('Activities validation error:', validationError);
      return { success: false, error: 'Invalid activities data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch activities for trip ${tripId}`);
  }
}

/**
 * Create a new activity for a trip
 */
export async function createTripActivity(
  activityData: Omit<Activity, 'id' | 'created_at'>,
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<Activity>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    
    const { data, error } = await supabase
      .from('trip_activities')
      .insert(activityData)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: `Failed to create activity: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to create activity');
  }
}

// ============================================================================
// GROUP MEMBERS API
// ============================================================================

/**
 * List members of a group
 */
export async function listGroupMembers(
  groupId: string,
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<GroupMember[]>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    
    const { data, error } = await supabase
      .from('group_members')
      .select()
      .eq('group_id', groupId)
      .eq('status', 'active');
    
    if (error) {
      return { success: false, error: `Failed to fetch group members: ${error.message}` };
    }
    
    try {
      const validatedMembers = z.array(groupMemberSchema).parse(data);
      return { success: true, data: validatedMembers };
    } catch (validationError) {
      console.error('Group members validation error:', validationError);
      return { success: false, error: 'Invalid group members data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch members for group ${groupId}`);
  }
}

/**
 * Invite a user to a group
 */
export async function inviteToGroup(
  invitationData: Omit<GroupInvitation, 'id' | 'created_at' | 'token' | 'expires_at'>,
  cookieHandlers?: Parameters<typeof getSupabaseForServer>[0]
): Promise<Result<GroupInvitation>> {
  try {
    const supabase = getSupabaseForServer(cookieHandlers);
    
    // Generate token and expiration date
    const token = crypto.randomUUID?.() || Math.random().toString(36).substring(2);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    const { data, error } = await supabase
      .from('group_invitations')
      .insert({
        ...invitationData,
        token,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: `Failed to create invitation: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to invite user to group');
  }
}

// ============================================================================
// CITIES API
// ============================================================================

/**
 * Get a city by ID
 */
export async function getCity(cityId: string): Promise<Result<City>> {
  try {
    const supabase = await getSupabaseForServer();
    
    const { data, error } = await supabase
      .from('cities')
      .select()
      .eq('id', cityId)
      .single();
    
    if (error) {
      return { success: false, error: `Failed to fetch city: ${error.message}` };
    }
    
    if (!data) {
      return { success: false, error: `City not found: ${cityId}` };
    }
    
    // Validate with Zod
    try {
      const validated = citySchema.parse(data);
      return { success: true, data: validated };
    } catch (validationError) {
      console.error('City validation error:', validationError);
      return { success: false, error: 'Invalid city data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch city ${cityId}`);
  }
}

/**
 * List cities with pagination and search
 */
export async function listCities({ 
  page = 1, 
  limit = 20,
  search = '',
  countryCode = ''
}: { 
  page?: number; 
  limit?: number;
  search?: string;
  countryCode?: string;
} = {}): Promise<Result<City[]>> {
  try {
    const supabase = await getSupabaseForServer();
    const { from, to } = getPagination(page, limit);
    
    // Base query
    let query = supabase
      .from('cities')
      .select()
      .range(from, to);
    
    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }
    
    // Order by population if no search term, otherwise order by name similarity
    query = search
      ? query.order('name')
      : query.order('population', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      return { success: false, error: `Failed to fetch cities: ${error.message}` };
    }
    
    // Validate with Zod
    try {
      const validatedCities = z.array(citySchema).parse(data);
      return { success: true, data: validatedCities };
    } catch (validationError) {
      console.error('Cities validation error:', validationError);
      return { success: false, error: 'Invalid cities data structure' };
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch cities');
  }
}

// ============================================================================
// GROUPS API
// ============================================================================

/**
 * Get a group by ID
 */
export async function getGroup(groupId: string): Promise<Result<Group>> {
  try {
    const supabase = await getSupabaseForServer();
    
    const { data, error } = await supabase
      .from('groups')
      .select()
      .eq('id', groupId)
      .single();
    
    if (error) {
      return { success: false, error: `Failed to fetch group: ${error.message}` };
    }
    
    if (!data) {
      return { success: false, error: `Group not found: ${groupId}` };
    }
    
    // Validate with Zod
    try {
      const validated = groupSchema.parse(data);
      return { success: true, data: validated };
    } catch (validationError) {
      console.error('Group validation error:', validationError);
      return { success: false, error: 'Invalid group data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch group ${groupId}`);
  }
}

/**
 * List groups with pagination and filtering
 */
export async function listGroups({ 
  userId,
  page = 1, 
  limit = 10 
}: { 
  userId: string;
  page?: number; 
  limit?: number;
}): Promise<Result<Group[]>> {
  try {
    const supabase = await getSupabaseForServer();
    const { from, to } = getPagination(page, limit);
    
    // Get all groups where the user is a member
    const { data: groupMemberships, error: membershipError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)
      .eq('status', 'active');
    
    if (membershipError) {
      return { success: false, error: `Failed to fetch group memberships: ${membershipError.message}` };
    }
    
    const groupIds = groupMemberships?.map(m => m.group_id) || [];
    
    // If user isn't a member of any groups, return empty array
    if (groupIds.length === 0) {
      return { success: true, data: [] };
    }
    
    // Fetch the groups
    const { data, error } = await supabase
      .from('groups')
      .select()
      .in('id', groupIds)
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      return { success: false, error: `Failed to fetch groups: ${error.message}` };
    }
    
    // Validate with Zod
    try {
      const validatedGroups = z.array(groupSchema).parse(data);
      return { success: true, data: validatedGroups };
    } catch (validationError) {
      console.error('Groups validation error:', validationError);
      return { success: false, error: 'Invalid groups data structure' };
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch groups');
  }
}

/**
 * Create a new group
 */
export async function createGroup(
  groupData: Omit<Group, 'id' | 'created_at'>
): Promise<Result<Group>> {
  try {
    const supabase = await getSupabaseForServer();
    
    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        created_by: groupData.created_by,
        image_url: groupData.image_url,
        is_active: groupData.is_active ?? true,
        metadata: groupData.metadata || {},
      })
      .select()
      .single();
    
    if (groupError) {
      return { success: false, error: `Failed to create group: ${groupError.message}` };
    }
    
    // Add creator as a member with admin role
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: groupData.created_by,
        role: 'admin',
        status: 'active',
      });
    
    if (memberError) {
      console.error('Failed to add group member:', memberError);
      // Continue execution - we've created the group, just failed to add the member
    }
    
    return { success: true, data: group };
  } catch (error) {
    return handleError(error, 'Failed to create group');
  }
}

/**
 * Update an existing group
 */
export async function updateGroup(
  groupId: string,
  groupData: Partial<Omit<Group, 'id' | 'created_at' | 'created_by'>>
): Promise<Result<Group>> {
  try {
    const supabase = await getSupabaseForServer();
    
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', groupId)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: `Failed to update group: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, `Failed to update group ${groupId}`);
  }
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId: string): Promise<Result<{ deleted: true }>> {
  try {
    const supabase = await getSupabaseForServer();
    
    // Delete the group - cascade rules in the database will handle related records
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    
    if (error) {
      return { success: false, error: `Failed to delete group: ${error.message}` };
    }
    
    return { success: true, data: { deleted: true } };
  } catch (error) {
    return handleError(error, `Failed to delete group ${groupId}`);
  }
}

// ============================================================================
// GROUP PLAN IDEAS API
// ============================================================================

/**
 * List ideas for a group
 */
export async function listGroupIdeas(
  groupId: string
): Promise<Result<GroupPlanIdea[]>> {
  try {
    const supabase = await getSupabaseForServer();
    
    const { data, error } = await supabase
      .from('group_plan_ideas')
      .select()
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { success: false, error: `Failed to fetch group ideas: ${error.message}` };
    }
    
    // Validate with Zod
    try {
      const validatedIdeas = z.array(groupPlanIdeaSchema).parse(data);
      return { success: true, data: validatedIdeas };
    } catch (validationError) {
      console.error('Group ideas validation error:', validationError);
      return { success: false, error: 'Invalid group ideas data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch ideas for group ${groupId}`);
  }
}

/**
 * Create a new group plan idea
 */
export async function createGroupIdea(
  ideaData: Omit<GroupPlanIdea, 'id' | 'created_at' | 'votes_up' | 'votes_down'>
): Promise<Result<GroupPlanIdea>> {
  try {
    const supabase = await getSupabaseForServer();
    
    const { data, error } = await supabase
      .from('group_plan_ideas')
      .insert({
        group_id: ideaData.group_id,
        title: ideaData.title,
        description: ideaData.description,
        type: ideaData.type,
        created_by: ideaData.created_by,
        start_date: ideaData.start_date,
        end_date: ideaData.end_date,
        meta: ideaData.meta || {},
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: `Failed to create group idea: ${error.message}` };
    }
    
    return { success: true, data };
  } catch (error) {
    return handleError(error, 'Failed to create group idea');
  }
}

// ============================================================================
// DESTINATIONS API
// ============================================================================

/**
 * Get a destination by ID
 */
export async function getDestination(destinationId: string): Promise<Result<Destination>> {
  try {
    const supabase = await getSupabaseForServer();
    
    const { data, error } = await supabase
      .from('destinations')
      .select()
      .eq('id', destinationId)
      .single();
    
    if (error) {
      return { success: false, error: `Failed to fetch destination: ${error.message}` };
    }
    
    if (!data) {
      return { success: false, error: `Destination not found: ${destinationId}` };
    }
    
    // Validate with Zod
    try {
      const validated = destinationSchema.parse(data);
      return { success: true, data: validated };
    } catch (validationError) {
      console.error('Destination validation error:', validationError);
      return { success: false, error: 'Invalid destination data structure' };
    }
  } catch (error) {
    return handleError(error, `Failed to fetch destination ${destinationId}`);
  }
}

/**
 * List destinations with pagination, filtering, and sorting
 */
export async function listDestinations({ 
  page = 1, 
  limit = 10,
  continent = '',
  query = '',
  sortBy = 'popularity'
}: { 
  page?: number; 
  limit?: number;
  continent?: string;
  query?: string;
  sortBy?: 'popularity' | 'city' | 'country';
} = {}): Promise<Result<Destination[]>> {
  try {
    const supabase = await getSupabaseForServer();
    const { from, to } = getPagination(page, limit);
    
    // Base query
    let dbQuery = supabase
      .from('destinations')
      .select()
      .range(from, to);
    
    // Apply filters
    if (continent) {
      dbQuery = dbQuery.eq('continent', continent);
    }
    
    if (query) {
      dbQuery = dbQuery.or(`city.ilike.%${query}%,country.ilike.%${query}%`);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'city':
        dbQuery = dbQuery.order('city');
        break;
      case 'country':
        dbQuery = dbQuery.order('country');
        break;
      case 'popularity':
      default:
        dbQuery = dbQuery.order('popularity', { ascending: false });
        break;
    }
    
    const { data, error } = await dbQuery;
    
    if (error) {
      return { success: false, error: `Failed to fetch destinations: ${error.message}` };
    }
    
    // Validate with Zod
    try {
      const validatedDestinations = z.array(destinationSchema).parse(data);
      return { success: true, data: validatedDestinations };
    } catch (validationError) {
      console.error('Destinations validation error:', validationError);
      return { success: false, error: 'Invalid destinations data structure' };
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch destinations');
  }
}

/**
 * Get popular destinations
 * @param limit - Maximum number of destinations to return
 */
export async function getPopularDestinations(
  limit: number = 10
): Promise<Result<Destination[]>> {
  try {
    const supabase = await getSupabaseForServer();
    
    const { data, error } = await supabase
      .from('destinations')
      .select()
      .order('popularity', { ascending: false })
      .limit(limit);
    
    if (error) {
      return { success: false, error: `Failed to fetch popular destinations: ${error.message}` };
    }
    
    // Validate with Zod
    try {
      const validatedDestinations = z.array(destinationSchema).parse(data);
      return { success: true, data: validatedDestinations };
    } catch (validationError) {
      console.error('Destinations validation error:', validationError);
      return { success: false, error: 'Invalid destinations data structure' };
    }
  } catch (error) {
    return handleError(error, 'Failed to fetch popular destinations');
  }
}

// ============================================================================
// CLIENT API UTILITIES
// ============================================================================

/**
 * Utility function to handle fetch responses with proper error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<Result<T>> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Try to parse error response
      try {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP error: ${response.status}`
        };
      } catch {
        // If error response isn't valid JSON
        return {
          success: false,
          error: `HTTP error: ${response.status} ${response.statusText}`
        };
      }
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Helper to create a URL with query parameters
 */
export function createUrlWithParams(baseUrl: string, params: Record<string, any> = {}): string {
  const url = new URL(baseUrl, window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}

// ============================================================================
// END OF MODULE
// ============================================================================ 