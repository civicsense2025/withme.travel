'use server';

import { getRecentTripsDB, getTripCountDB } from '@/utils/db';
import { cookies } from 'next/headers';
import { getServerSession } from '@/utils/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { TABLES } from '@/utils/constants/database';
import { createServerComponentClient } from '@/utils/supabase/server';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
// Utility function to create a Supabase client for server-side code
function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Fetches recent trips for a user
 *
 * @param userId - The user ID to fetch trips for
 * @param limit - Maximum number of trips to return (default: 3)
 */
export async function getRecentTrips(userId: string, limit: number = 3) {
  try {
    return await getRecentTripsDB(userId, limit);
  } catch (error) {
    console.error('Error fetching recent trips:', error);
    return [];
  }
}

/**
 * Fetches trip count for a user
 */
export async function getTripCount(userId: string) {
  try {
    return await getTripCountDB(userId);
  } catch (error) {
    console.error('Error fetching trip count:', error);
    return 0;
  }
}

/**
 * Fetches user profile data
 */
export async function getUserProfile(userId: string) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerComponentClient();
    // Fetch profile from the database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, bio, onboarding_completed')
      .eq('id', userId)
      .single();
    if (error || !profile) {
      throw new Error('Profile not found');
    }
    return {
      id: profile.id,
      name: profile.name ?? 'User',
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      onboarding_completed: profile.onboarding_completed ?? false,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Fetches a comprehensive dashboard overview
 * This combines multiple data sources into a single dashboard object
 */
export async function getDashboardOverview(userId: string) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerComponentClient();

    // Fetch recent trips, stats, and saved content in parallel
    const [recentTrips, tripCount, userProfile, travelStats, savedContent] = await Promise.all([
      getRecentTrips(userId, 3),
      getTripCount(userId),
      getUserProfile(userId),
      getUserTravelStats(userId),
      getSavedContent(userId, 4),
    ]);

    // Get active trips with their recent updates
    const activeTrips = await getActiveTripsWithUpdates(userId);

    return {
      recentTrips,
      tripCount,
      userProfile,
      travelStats,
      savedContent,
      activeTrips,
    };
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return {
      recentTrips: [],
      tripCount: 0,
      userProfile: null,
      travelStats: { visitedCount: 0, plannedCount: 0, wishlistCount: 0, countriesCount: 0 },
      savedContent: { destinations: [], itineraries: [] },
      activeTrips: [],
    };
  }
}

/**
 * Fetches active trips with recent updates
 * These are trips with recent activity or upcoming dates
 */
export async function getActiveTripsWithUpdates(userId: string) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerComponentClient();

    // Check if the trip_members table exists
    const { error: tableError } = await supabase
      .from('trip_members') // Use string literal since TABLES.TRIP_MEMBERS might not be defined
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (tableError) {
      console.error('Error accessing trip_members table:', tableError);
      return [];
    }

    // First get trips where the user is a member - using direct table name to avoid constant issues
    const { data: memberships, error: membershipError } = await supabase
      .from('trip_members') // Use string literal instead of TABLES constant
      .select('trip_id, role')
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      throw membershipError;
    }

    if (!memberships || memberships.length === 0) {
      return [];
    }

    const tripIds = memberships.map((m) => m.trip_id);

    // Fetch the trips with additional metadata
    const { data: trips, error: tripsError } = await supabase
      .from('trips') // Use string literal instead of TABLES constant
      .select(
        `
        id, 
        name, 
        start_date, 
        end_date, 
        destination_name,
        cover_image_url,
        is_public,
        created_at,
        updated_at,
        slug
      `
      )
      .in('id', tripIds)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (tripsError) {
      console.error('Error fetching trips:', tripsError);
      throw tripsError;
    }

    if (!trips) return [];

    // For each trip, fetch the recent updates (comments, new items, etc.)
    const tripsWithUpdates = await Promise.all(
      trips.map(async (trip) => {
        // Get role for this trip
        const membership = memberships.find((m) => m.trip_id === trip.id);
        const role = membership?.role || null;

        // Get any recent updates (simplified version - in production you would
        // fetch actual updates from notifications or activity tables)
        const { data: updates, error: updatesError } = await supabase
          .from(TABLES.ITINERARY_ITEMS)
          .select('id, title, created_at')
          .eq('trip_id', trip.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (updatesError) {
          console.error('Error fetching updates for trip:', updatesError);
          return {
            ...trip,
            role,
            recentUpdates: [],
            updateCount: 0,
          };
        }

        return {
          ...trip,
          role,
          recentUpdates: updates || [],
          updateCount: updates?.length || 0,
        };
      })
    );

    return tripsWithUpdates;
  } catch (error) {
    console.error('Error fetching active trips with updates:', error);
    return [];
  }
}

/**
 * Fetches user travel statistics
 * This includes counts of visited destinations, planned trips, etc.
 */
export async function getUserTravelStats(userId: string) {
  try {
    const cookieStore = cookies();
    const supabase = await createServerComponentClient();

    // Define default stats
    const defaultStats = {
      visitedCount: 0,
      plannedCount: 0,
      wishlistCount: 0,
      countriesCount: 0,
    };

    // Test if user_travel table exists
    try {
      const { error: tableCheckError } = await supabase
        .from('user_travel')
        .select('id', { count: 'exact', head: true })
        .limit(1);

      // If the table doesn't exist, just return default stats
      if (tableCheckError) {
        console.error('user_travel table does not exist or is not accessible:', tableCheckError);
        return defaultStats;
      }
    } catch (error) {
      console.error('Error checking user_travel table:', error);
      return defaultStats;
    }

    // If we get here, the table exists, so let's query it

    // Get count of visited destinations
    const { count: visitedCount, error: visitedError } = await supabase
      .from('user_travel')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'visited');

    if (visitedError) {
      console.error('Error fetching visited count:', visitedError);
    }

    // Get count of wishlist destinations
    const { count: wishlistCount, error: wishlistError } = await supabase
      .from('user_travel')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'wishlist');

    if (wishlistError) {
      console.error('Error fetching wishlist count:', wishlistError);
    }

    // Get count of planned trips
    const { count: plannedCount, error: plannedError } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId);

    if (plannedError) {
      console.error('Error fetching planned count:', plannedError);
    }

    // Get count of unique countries
    const { data: countries, error: countriesError } = await supabase
      .from('user_travel')
      .select('destination_id')
      .eq('user_id', userId)
      .eq('status', 'visited');

    if (countriesError) {
      console.error('Error fetching countries:', countriesError);
    }

    // Estimate country count - in a real implementation, you'd join with destinations table
    // to get actual country data, but we'll simplify here
    const countriesCount = countries ? new Set(countries.map((c) => c.destination_id)).size : 0;

    return {
      visitedCount: visitedCount || 0,
      plannedCount: plannedCount || 0,
      wishlistCount: wishlistCount || 0,
      countriesCount: countriesCount,
    };
  } catch (error: any) {
    console.error('Error fetching user travel stats:', error);
    throw new Error(error?.message || '');
  }
}

/**
 * Fetches saved content (destinations, itineraries)
 */
export async function getSavedContent(userId: string, limit: number = 4) {
  try {
    const cookieStore = cookies();
      const supabase = await createServerComponentClient();

    // Get saved destinations - Use separate queries instead of join
    const { data: likedDestinations, error: likedDestError } = await supabase
      .from('likes')
      .select('item_id')
      .eq('user_id', userId)
      .eq('item_type', 'destination')
      .limit(limit);

    if (likedDestError) {
      console.error('Error fetching liked destinations:', likedDestError);
      throw likedDestError;
    }

    // Get actual destination data in a separate query if we have liked destinations
    let destinationResults: any[] = [];
    if (likedDestinations && likedDestinations.length > 0) {
      const destinationIds = likedDestinations.map((like) => like.item_id);
      const { data: destinationData, error: destDataError } = await supabase
        .from('destinations') // Use string literal instead of TABLES.DESTINATIONS
        .select('id, city, country, image_url, slug')
        .in('id', destinationIds);

      if (destDataError) {
        console.error('Error fetching destination data:', destDataError);
      } else {
        destinationResults = destinationData || [];
      }
    }

    // Get saved itineraries - Use separate queries instead of join
    const { data: likedItineraries, error: likedItinError } = await supabase
      .from('likes')
      .select('item_id')
      .eq('user_id', userId)
      .eq('item_type', 'itinerary')
      .limit(limit);

    if (likedItinError) {
      console.error('Error fetching liked itineraries:', likedItinError);
      throw likedItinError;
    }

    // Get actual itinerary data in a separate query
    let itineraryResults: any[] = [];
    if (likedItineraries && likedItineraries.length > 0) {
      const itineraryIds = likedItineraries.map((like) => like.item_id);

      // Using the same pattern as in app/itineraries/page.tsx
      const { data: itineraryData, error: itinDataError } = await supabase
        .from('itinerary_templates')
        .select(
          `
          id, 
          title, 
          description,
          slug, 
          destination_id,
          duration_days,
          created_by,
          is_published,
          tags,
          metadata,
          cover_image_url,
          destination_name,
          image_url,
          profile: created_by (
            id,
            name,
            avatar_url
          ),
          destinations: destination_id (
            id,
            name,
            country,
            state,
            featured_image_url
          )
        `
        )
        .in('id', itineraryIds);

      if (itinDataError) {
        console.error('Error fetching itinerary data:', itinDataError);
      } else {
        itineraryResults = itineraryData || [];
      }
    }

    return {
      destinations: destinationResults,
      itineraries: itineraryResults,
    };
  } catch (error) {
    console.error('Error fetching saved content:', error);
    return {
      destinations: [],
      itineraries: [],
    };
  }
}
