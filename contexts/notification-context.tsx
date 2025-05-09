'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import type { 
  Notification, 
  NotificationPreferences,
} from '@/types/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  isLoadingPreferences: boolean;
  preferencesError: string | null;
  loading: boolean;
  loadMoreNotifications: () => Promise<void>;
  hasMore: boolean;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Default preferences
const defaultPreferences: NotificationPreferences = {
  user_id: '',
  email_enabled: true,
  push_enabled: true,
  in_app_enabled: true,
  digest_frequency: 'daily',
  muted_types: [],
  quiet_hours: {
    enabled: false,
    start: "22:00",
    end: "07:00",
    timezone: "America/New_York"
  },
  trip_updates: true,
  itinerary_changes: true,
  member_activity: true,
  comments: true,
  votes: true,
  focus_events: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [lastPreferencesFetch, setLastPreferencesFetch] = useState<number>(0);
  
  // Load more notifications with pagination
  const loadMoreNotifications = useCallback(async () => {
    if (!user || loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?page=${page}&pageSize=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      const newNotifications = data.notifications || [];
      
      if (newNotifications.length === 0 || newNotifications.length < pageSize) {
        setHasMore(false);
      }
      
      setNotifications(prev => [...prev, ...newNotifications]);
      
      // Count unread notifications
      const allNotifications = [...notifications, ...newNotifications];
      setUnreadCount(allNotifications.filter(n => !n.read_at).length);
      
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, loading, hasMore, page, pageSize, notifications]);
  
  // Initial load of notifications
  useEffect(() => {
    if (user && page === 1) {
      loadMoreNotifications();
    }
  }, [loadMoreNotifications, user, page]);
  
  // Add a debounce utility
  function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timeout: ReturnType<typeof setTimeout>;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    }) as T;
  }

  // Debounced preferences fetch function
  const debouncedFetchPreferences = useCallback(
    debounce(async () => {
      if (!user) return;
      
      // Check if we've fetched recently (within the last 10 seconds)
      const now = Date.now();
      if (now - lastPreferencesFetch < 10000 && preferences !== null) {
        console.log('Skipping preferences fetch - fetched recently');
        return;
      }
      
      setIsLoadingPreferences(true);
      setPreferencesError(null);
      
      try {
        console.log('Fetching notification preferences...');
        const response = await fetch('/api/notifications/preferences');
        
        // Handle rate limiting explicitly
        if (response.status === 429) {
          console.warn('Rate limited when fetching preferences');
          setPreferencesError('Too many requests. Please try again in a moment.');
          
          // Still use cached preferences if we have them
          if (preferences === null && user.id) {
            const userDefaultPrefs = {
              ...defaultPreferences,
              user_id: user.id
            };
            setPreferences(userDefaultPrefs);
          }
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response from preferences API:', response.status, errorData);
          throw new Error(`Failed to fetch preferences: ${response.status} ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Preferences data received:', data);
        
        if (data.preferences) {
          setPreferences(data.preferences);
        } else {
          console.warn('No preferences data found in API response');
          if (user.id) {
            // Create default preferences with user ID
            const userDefaultPrefs = {
              ...defaultPreferences,
              user_id: user.id
            };
            setPreferences(userDefaultPrefs);
          }
        }
        
        // Update the last fetch timestamp
        setLastPreferencesFetch(now);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        setPreferencesError(error instanceof Error ? error.message : 'Unknown error fetching preferences');
        
        // Still set default preferences for the UI
        if (user.id && preferences === null) {
          const userDefaultPrefs = {
            ...defaultPreferences,
            user_id: user.id
          };
          setPreferences(userDefaultPrefs);
        }
      } finally {
        setIsLoadingPreferences(false);
      }
    }, 1000),
    [user, preferences, lastPreferencesFetch]
  );

  // Fetch notification preferences
  useEffect(() => {
    if (!user) return;
    debouncedFetchPreferences();
  }, [user, debouncedFetchPreferences]);
  
  // Mark a single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read_at: new Date().toISOString() } 
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);
  
  // Update notification preferences
  const updatePreferences = useCallback(
    debounce(async (newPreferences: Partial<NotificationPreferences>) => {
      if (!user) {
        console.error('Cannot update preferences: No authenticated user');
        throw new Error('User not authenticated');
      }
      
      try {
        console.log('Updating notification preferences:', newPreferences);
        
        const response = await fetch('/api/notifications/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ preferences: newPreferences }),
        });
        
        // Handle rate limiting explicitly
        if (response.status === 429) {
          console.warn('Rate limited when updating preferences');
          toast({
            title: 'Rate limited',
            description: 'You are making too many requests. Please try again in a moment.',
            variant: 'destructive',
          });
          throw new Error('Too many requests. Please try again in a moment.');
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response when updating preferences:', response.status, errorData);
          throw new Error(`Failed to update preferences: ${response.status} ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Preferences updated successfully:', data);
        
        if (data.preferences) {
          setPreferences(data.preferences);
          // Update the last fetch timestamp to prevent immediate re-fetch
          setLastPreferencesFetch(Date.now());
        }
        
        // Show success toast
        toast({
          title: 'Preferences updated',
          description: 'Your notification preferences have been updated',
        });
        
        return data;
      } catch (error) {
        console.error('Error updating notification preferences:', error);
        
        // Show error toast
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update notification preferences',
          variant: 'destructive',
        });
        
        throw error;
      }
    }, 500), // Use a shorter debounce delay for user-initiated actions
    [user, toast, setLastPreferencesFetch]
  );
  
  // Replace refreshNotifications with a debounced version
  const refreshNotifications = useCallback(
    debounce(async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/notifications');
        if (response.status === 429) {
          console.warn('Rate limited when fetching notifications');
          return;
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read_at).length || 0);
      } catch (error) {
        console.error('Error refreshing notifications:', error);
      }
    }, 1000),
    [user]
  );
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    preferences,
    updatePreferences,
    isLoadingPreferences,
    preferencesError,
    loading,
    loadMoreNotifications,
    hasMore,
    refreshNotifications,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}
