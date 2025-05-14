import { createRouteHandlerClient } from '@/utils/supabase/server';
import { useCallback, useState } from 'react';

/**
 * Migrates all guest data to a new real user profile.
 * @param guestProfileId - The UUID of the guest's profile (from cookie or session)
 * @param realUserId - The UUID of the new real user (from auth.users)
 * @returns {Promise<{ success: boolean; error?: string }>} Result of migration
 */
export async function migrateGuestProfileToUser(guestProfileId: string, realUserId: string) {
  const supabase = await createRouteHandlerClient();

  // 1. Get guest profile data
  const { data: guestProfile, error: guestProfileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', guestProfileId)
    .single();

  if (guestProfileError || !guestProfile) {
    return { success: false, error: 'Guest profile not found' };
  }

  // 2. Upsert the real user profile (update if exists, insert if not)
  const { error: upsertError } = await supabase.from('profiles').upsert([
    {
      id: realUserId,
      name: guestProfile.name || 'User',
      avatar_url: guestProfile.avatar_url ?? null,
      is_guest: false,
      // Add any other fields you want to preserve
    },
  ]);

  if (upsertError) {
    return { success: false, error: 'Failed to upsert real user profile' };
  }

  // 3. Migrate all guest-owned data (example: trips, trip_members)
  // Update trips.created_by
  await supabase.from('trips').update({ created_by: realUserId }).eq('created_by', guestProfileId);

  // Update trip_members.user_id
  await supabase
    .from('trip_members')
    .update({ user_id: realUserId, is_guest: false })
    .eq('user_id', guestProfileId);

  // ...repeat for any other tables that reference profiles.id

  // 4. Remove the old guest profile to avoid duplicates
  await supabase.from('profiles').delete().eq('id', guestProfileId);

  return { success: true };
}

/**
 * React hook for guest-to-user migration
 */
export function useGuestMigration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const migrate = useCallback(async (guestProfileId: string, realUserId: string) => {
    setLoading(true);
    setError(null);
    const result = await migrateGuestProfileToUser(guestProfileId, realUserId);
    setLoading(false);
    if (!result.success) setError(result.error || 'Migration failed');
    return result.success;
  }, []);

  return { migrate, loading, error };
}
