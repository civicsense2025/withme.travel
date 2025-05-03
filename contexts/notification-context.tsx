'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';
import { Notification, NotificationPreferences } from '@/types/notifications';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  preferences: null,
  loading: false,
  error: null,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: async () => {},
  updatePreferences: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: React.ReactNode;
  pollingInterval?: number;
  initialUnreadCount?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  pollingInterval = 30000, // 30 seconds by default
  initialUnreadCount = 0,
}) => {
  const supabase = createClient();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (limit = 20, unreadOnly = false) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: '0',
          unread_only: unreadOnly.toString()
        });

        const response = await fetch(`/api/notifications?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data.notifications);

        // Update unread count
        const countResponse = await fetch('/api/notifications/count');
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setUnreadCount(countData.count);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_enabled: true,
            push_enabled: true,
            in_app_enabled: true,
            trip_updates: true,
            itinerary_changes: true,
            member_activity: true,
            comments: true,
            votes: true,
            focus_events: true
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setPreferences(newPrefs);
      }
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
    }
  }, [supabase, user]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => { return await fetchNotifications(); }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId],
          read: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!notifications.length) return;

    const unreadNotificationIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    if (!unreadNotificationIds.length) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: unreadNotificationIds,
          read: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));

      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifications]);

  // Update notification preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      if (!user || !preferences) return;

      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .update(newPreferences)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        setPreferences(data);
      } catch (err) {
        console.error('Error updating notification preferences:', err);
      }
    },
    [supabase, user, preferences]
  );

  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [user, fetchNotifications, fetchPreferences]);

  // Set up polling for notifications
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => { return fetchNotifications(); }, pollingInterval);

    return () => clearInterval(interval);
  }, [user, fetchNotifications, pollingInterval]);

  // Set up realtime subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => { 
          // New notification arrived
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1); 
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, user]);

  const value = {
    notifications,
    unreadCount,
    preferences,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    updatePreferences,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};