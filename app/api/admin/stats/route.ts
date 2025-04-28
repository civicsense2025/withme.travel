import { createApiClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';

/**
 * Get system statistics for admin dashboard
 * @returns A JSON response with system statistics
 */
export async function GET(): Promise<NextResponse> {
  const supabase = createClient()

  try {
    // First, verify this user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabase
      .from(DB_TABLES.PROFILES)
      .select(DB_FIELDS.PROFILES.IS_ADMIN)
      .eq(DB_FIELDS.PROFILES.ID, user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("Admin verified, fetching stats");

    // Use the authenticated client to fetch stats
    // In a real app, you might use a service role client for admin operations

    // Initialize stats with default values
    const stats = {
      totalUsers: 0,
      totalTrips: 0,
      totalDestinations: 0,
      newUsersLastWeek: 0,
      activeTrips: 0,
    };

    try {
      // Get total user count
      const { count: userCount, error: userError } = await supabase
        .from(DB_TABLES.PROFILES)
        .select('*', { count: 'exact', head: true });

      if (!userError && userCount !== null) {
        stats.totalUsers = userCount;
      }

      // Get total trips count
      const { count: tripCount, error: tripError } = await supabase
        .from(DB_TABLES.TRIPS)
        .select('*', { count: 'exact', head: true });
      
      if (!tripError && tripCount !== null) {
        stats.totalTrips = tripCount;
      }

      // Get total destinations count
      const { count: destinationCount, error: destinationError } = await supabase
        .from(DB_TABLES.DESTINATIONS)
        .select('*', { count: 'exact', head: true });
      
      if (!destinationError && destinationCount !== null) {
        stats.totalDestinations = destinationCount;
      }

      // Get new users in the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newUserCount, error: newUserError } = await supabase
        .from(DB_TABLES.PROFILES)
        .select('*', { count: 'exact', head: true })
        .gte(DB_FIELDS.PROFILES.CREATED_AT, oneWeekAgo.toISOString());
      
      if (!newUserError && newUserCount !== null) {
        stats.newUsersLastWeek = newUserCount;
      }
      
      // Get active trips (those with recent updates)
      const { count: activeTripsCount, error: activeTripsError } = await supabase
        .from(DB_TABLES.TRIPS)
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', oneWeekAgo.toISOString());
      
      if (!activeTripsError && activeTripsCount !== null) {
        stats.activeTrips = activeTripsCount;
      }
    } catch (e) {
      console.error("Error collecting stats:", e);
    }

    return NextResponse.json({ 
      success: true,
      stats 
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch stats", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
