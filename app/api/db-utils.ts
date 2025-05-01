// Server-side database functions that use the Supabase server client
// These should only be used in API routes or server components

import { createSupabaseServerClient } from '@/utils/supabase/server';

// ----- NOTE ON TYPE HANDLING -----
// This file uses an untyped Supabase client to work around complex TypeScript issues.
// We manually define the interfaces for all returned data and use explicit type
// conversions to ensure type safety within our application code.
// A more type-safe approach will be implemented in the future as the database
// schema and types stabilize.
// ------------------------------------

// Type definitions
interface ItineraryItemWithVotes {
  id: string;
  trip_id: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  user_vote?: 'up' | 'down' | null;
  votes?: number;
}

// Type for expense data
interface ExpenseWithUser {
  id: string;
  trip_id: string;
  amount: number;
  category: string;
  description?: string;
  paid_by_user: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

// Type for expense by category
interface ExpenseCategory {
  name: string;
  amount: number;
  color: string;
}

// Type for trip member with user data
interface TripMemberWithUser {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

// Type for trip with member count
interface TripWithMembers {
  id: string;
  created_by: string | null;
  name: string;
  destination_id: string | null;
  destination_name: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  members: number;
  created_by_user?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
}

// Type for vote response
interface VoteResponse {
  newVoteCount: number;
}

// Trip-related functions
export async function getTrips(): Promise<TripWithMembers[]> {
  const supabase = await createSupabaseServerClient();
  
  // Use SQL query to avoid TypeScript issues
  const { data, error } = await supabase.rpc('get_trips_with_member_count');

  if (error) {
    console.error('Error fetching trips:', error);
    return [];
  }

  return (data || []) as TripWithMembers[];
}

export async function getTripById(id: string): Promise<TripWithMembers | null> {
  const supabase = await createSupabaseServerClient();
  
  try {
    // Use SQL query to avoid TypeScript issues
    const { data, error } = await supabase.rpc('get_trip_by_id', { trip_id: id });

    if (error) {
      console.error('Error fetching trip:', error);
      return null;
    }

    // Safe type checking for the response data
    if (!data) {
      return null;
    }
    
    // Check if the result is an array and has elements
    const dataArray = Array.isArray(data) ? data : [data];
    if (dataArray.length === 0) {
      return null;
    }

    return dataArray[0] as TripWithMembers;
  } catch (e) {
    console.error('Exception fetching trip:', e);
    return null;
  }
}

export async function getTripMembers(tripId: string): Promise<TripMemberWithUser[]> {
  const supabase = await createSupabaseServerClient();
  
  // Use SQL query to avoid TypeScript issues
  const { data, error } = await supabase.rpc('get_trip_members', { trip_id: tripId });

  if (error) {
    console.error('Error fetching trip members:', error);
    return [];
  }

  return (data || []) as TripMemberWithUser[];
}

// Itinerary item functions
export async function getItineraryItems(
  tripId: string,
  userId?: string
): Promise<ItineraryItemWithVotes[]> {
  const supabase = await createSupabaseServerClient();

  // Use SQL query to avoid TypeScript issues
  const { data, error } = await supabase.rpc('get_itinerary_items_with_votes', { 
    trip_id: tripId,
    user_id: userId || null 
  });

  if (error) {
    console.error('Error fetching itinerary items:', error);
    return [];
  }

  return (data || []) as ItineraryItemWithVotes[];
}

/**
 * Get the trip ID for an itinerary item
 */
async function getItemTripId(itemId: string): Promise<string> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc('get_item_trip_id', { item_id: itemId });

  if (error) {
    console.error('Error getting item trip ID:', error);
    throw new Error('Failed to get item trip ID');
  }

  // Ensure we return a string
  if (typeof data === 'string') {
    return data;
  }
  
  // If data is an object with a trip_id property, return that
  if (data && typeof data === 'object' && 'trip_id' in data) {
    return String(data.trip_id);
  }
  
  throw new Error('Failed to get trip ID: unexpected data format');
}

/**
 * Get the vote count for an itinerary item
 */
async function getItemVoteCount(itemId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc('get_item_vote_count', { item_id: itemId });

  if (error) {
    console.error('Error getting vote count:', error);
    throw new Error('Failed to get vote count');
  }

  // Ensure we return a number
  if (typeof data === 'number') {
    return data;
  }
  
  // If data is an object with a count property, return that
  if (data && typeof data === 'object' && 'count' in data) {
    return Number(data.count);
  }
  
  return 0; // Default to 0 if no valid count is found
}

/**
 * Cast a vote on an itinerary item
 * @param itemId - The ID of the itinerary item
 * @param userId - The ID of the user casting the vote
 * @param voteType - The type of vote (up, down, or null to remove the vote)
 * @returns An object containing the new vote count for the item
 */
export async function castVote(
  itemId: string,
  userId: string,
  voteType: 'up' | 'down' | null
): Promise<VoteResponse> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc('cast_vote', {
    item_id: itemId,
    user_id: userId,
    vote_type: voteType
  });

  if (error) {
    console.error('Error casting vote:', error);
    throw new Error('Failed to cast vote');
  }

  // Get the updated vote count
  const newVoteCount = await getItemVoteCount(itemId);
  return { newVoteCount };
}

/**
 * Get the expenses by category for a trip
 * @param tripId - The ID of the trip
 * @returns An array of expense categories with amounts
 */
export async function getExpensesByCategory(tripId: string): Promise<ExpenseCategory[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc('get_expenses_by_category', { trip_id: tripId });

  if (error) {
    console.error('Error fetching expenses by category:', error);
    return [];
  }

  // Define category colors
  const categoryColors: Record<string, string> = {
    accommodation: '#4f46e5', // indigo
    food: '#16a34a', // green
    transportation: '#f59e0b', // amber
    activities: '#06b6d4', // cyan
    shopping: '#ec4899', // pink
    other: '#6b7280', // gray
  };

  // Add colors to the categories
  return (Array.isArray(data) ? data : []).map((category: any) => ({
    name: category.name || 'other',
    amount: Number(category.amount) || 0,
    color: categoryColors[category.name || 'other'] || '#6b7280', // default to gray if no color defined
  }));
}
