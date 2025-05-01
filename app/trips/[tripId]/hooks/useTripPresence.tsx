'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { UserPresence, ExtendedUserPresence } from '@/types/presence';

export function useTripPresence(tripId: string) {
  const [activeUsers, setActiveUsers] = useState<ExtendedUserPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const fetchActiveUsers = useCallback(async () => {
    if (!tripId || !user) return;

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .select(
          `
          id, 
          user_id, 
          status, 
          last_active, 
          editing_item_id,
          page_path,
          trip_id,
          profiles(id, name, username, avatar_url)
        `
        )
        .eq('trip_id', tripId)
        .neq('user_id', user.id);

      if (error) throw error;

      // Transform data to match ExtendedUserPresence type
      const transformedData: ExtendedUserPresence[] = data.map((presence: any) => ({
        id: presence.id,
        user_id: presence.user_id,
        trip_id: presence.trip_id || tripId,
        status: presence.status,
        last_active: presence.last_active,
        editing_item_id: presence.editing_item_id,
        page_path: presence.page_path,
        name: presence.profiles?.name || presence.profiles?.username || 'Unknown User',
        avatar_url: presence.profiles?.avatar_url,
      }));

      setActiveUsers(transformedData);
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setLoading(false);
    }
  }, [tripId, user, supabase]);

  const updateUserPresence = useCallback(
    async (status: string, itemId?: string) => {
      if (!tripId || !user) return;

      try {
        const presenceData = {
          user_id: user.id,
          trip_id: tripId,
          status,
          last_active: new Date().toISOString(),
          page_path: pathname,
          editing_item_id: itemId,
        };

        const { error } = await supabase.from('user_presence').upsert(presenceData, {
          onConflict: 'user_id,trip_id',
          ignoreDuplicates: false,
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    },
    [tripId, user, supabase, pathname]
  );

  const startEditing = useCallback(
    (itemId: string) => {
      updateUserPresence('editing', itemId);
    },
    [updateUserPresence]
  );

  const stopEditing = useCallback(() => {
    updateUserPresence('online');
  }, [updateUserPresence]);

  useEffect(() => {
    if (!tripId || !user) return;

    // Setup subscription for real-time updates
    const channel = supabase
      .channel(`presence-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          fetchActiveUsers();
        }
      )
      .subscribe();

    // Initial fetch
    fetchActiveUsers();

    // Set initial presence
    updateUserPresence('online');

    // Set up regular pings to maintain presence
    const interval = setInterval(() => {
      updateUserPresence('online');
    }, 30000); // Every 30 seconds

    // Clean up
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);

      // Mark user as away when leaving
      updateUserPresence('away');
    };
  }, [tripId, user, supabase, fetchActiveUsers, updateUserPresence]);

  return {
    activeUsers,
    loading,
    startEditing,
    stopEditing,
    updatePresence: updateUserPresence,
  };
}
