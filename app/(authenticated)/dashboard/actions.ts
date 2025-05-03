'use server';

import { getRecentTripsDB, getTripCountDB } from '@/utils/db';
import { cookies } from 'next/headers';
import { getServerSession } from '@/utils/supabase/server';
import { Session } from '@supabase/supabase-js';

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
    const { data } = await getServerSession();
    const session = data.session;

    if (!session || session.user.id !== userId) {
      throw new Error('Not authorized to access this profile');
    }

    // Return a simplified profile with only the needed fields
    return {
      id: session.user.id,
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
      avatar_url: session.user.user_metadata?.avatar_url || null,
      bio: session.user.user_metadata?.bio || null,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
