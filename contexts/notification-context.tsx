'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import { API_ROUTES } from '@/utils/constants/routes';
import { getWithExpiry, setWithExpiry } from '@/utils/local-storage-cache';
import { createClient } from '@/utils/supabase/client';
import type { 
  Notification, 
  NotificationPreferences,
} from '@/types/notifications';
import { getUnreadCountCache, setUnreadCountCache, isUnreadCountCacheValid } from '@/utils/notification-state';

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (ids: string[]) => Promise<void>;
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

// Cache keys
const NOTIFICATIONS_CACHE_KEY = 'notifications_cache';
const PREFERENCES_CACHE_KEY = 'notification_preferences_cache';
const NOTIFICATIONS_ETAG_KEY = 'notifications_etag';
const PREFERENCES_ETAG_KEY = 'preferences_etag';

// TTL values
const NOTIFICATIONS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const PREFERENCES_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const supabase = createClient();
  
  // ETags for conditional requests
  const notificationsEtagRef = useRef<string | null>(null);
  const preferencesEtagRef = useRef<string | null>(null);
  
  // Retry counters
  const notificationsRetryCount = useRef<number>(0);
  const preferencesRetryCount = useRef<number>(0);
  const MAX_RETRY_ATTEMPTS = 3;
  
  // Load more notifications with pagination and caching
  const loadMoreNotifications = useCallback(async (reset: boolean = false) => {
    if (!user || loading) return;
    
    // If reset, start from page 1
    const currentPage = reset ? 1 : page;
    
    if (reset) {
      setPage(1);
      setHasMore(true);
    }
    
    setLoading(true);
    
    try {
      // Check cache for first page
      if (currentPage === 1 && !reset) {
        const cachedData = getWithExpiry<{notifications: Notification[], hasMore: boolean}>(NOTIFICATIONS_CACHE_KEY);
        if (cachedData) {
          setNotifications(cachedData.notifications);
          setHasMore(cachedData.hasMore);
          setLoading(false);
          return;
        }
      }
      
      // Prepare headers for conditional request
      const headers: HeadersInit = {};
      
      // Only use ETag for page 1 requests
      if (currentPage === 1 && notificationsEtagRef.current) {
        headers['If-None-Match'] = notificationsEtagRef.current;
      }
      
      // Make the API request
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString()
      });
      
      const response = await fetch(`${API_ROUTES.NOTIFICATIONS}?${params.toString()}`, {
        headers
      });
      
      // Handle 304 Not Modified
      if (response.status === 304) {
        // Use cached data
        const cachedData = getWithExpiry<{notifications: Notification[], hasMore: boolean}>(NOTIFICATIONS_CACHE_KEY);
        if (cachedData) {
          setNotifications(cachedData.notifications);
          setHasMore(cachedData.hasMore);
          setLoading(false);
          return;
        }
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      // Extract and store ETag for page 1
      if (currentPage === 1) {
        const newEtag = response.headers.get('ETag');
        if (newEtag) {
          notificationsEtagRef.current = newEtag;
          localStorage.setItem(NOTIFICATIONS_ETAG_KEY, newEtag);
        }
      }
      
      const data = await response.json();
      const newNotifications = data.notifications || [];
      
      // Check if there are more pages
      const hasMorePages = newNotifications.length === pageSize;
      setHasMore(hasMorePages);
      
      // Update notifications state based on whether we're resetting or adding more
      if (reset || currentPage === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      // Cache first page results
      if (currentPage === 1) {
        setWithExpiry(NOTIFICATIONS_CACHE_KEY, {
          notifications: newNotifications,
          hasMore: hasMorePages,
        }, NOTIFICATIONS_CACHE_TTL);
      }
      
      // Increment page for next load
      if (!reset) {
        setPage(prev => prev + 1);
      }
      
      // Reset retry counter on success
      notificationsRetryCount.current = 0;
    } catch (error) {
      console.error('Error loading notifications:', error);
      
      // Retry logic for failures
      if (notificationsRetryCount.current < MAX_RETRY_ATTEMPTS) {
        notificationsRetryCount.current++;
        setTimeout(() => {
          loadMoreNotifications(reset);
        }, 2000 * notificationsRetryCount.current);
      }
    } finally {
      setLoading(false);
    }
  }, [user, loading, page, pageSize]);
  
  // Refresh notifications (reset and load first page)
  const refreshNotifications = useCallback(async () => {
    await loadMoreNotifications(true);
  }, [loadMoreNotifications]);
  
  // Initial load of notifications
  useEffect(() => {
    if (user) {
      // Load stored ETag if available
      const storedEtag = localStorage.getItem(NOTIFICATIONS_ETAG_KEY);
      if (storedEtag) {
        notificationsEtagRef.current = storedEtag;
      }
      
      // Load initial data
      loadMoreNotifications(true);
    } else {
      // Reset when user is not available
      setNotifications([]);
      setHasMore(true);
      setPage(1);
    }
  }, [user, loadMoreNotifications]);
  
  // Set up realtime updates for notifications
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh notifications when changes are detected
          refreshNotifications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, refreshNotifications]);
  
  // Fetch notification preferences with proper caching
  const fetchPreferences = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    setIsLoadingPreferences(true);
    
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedPrefs = getWithExpiry<NotificationPreferences>(PREFERENCES_CACHE_KEY);
        if (cachedPrefs) {
          setPreferences(cachedPrefs);
          setIsLoadingPreferences(false);
          return;
        }
      }
      
      // Prepare headers for conditional request
      const headers: HeadersInit = {};
      if (preferencesEtagRef.current) {
        headers['If-None-Match'] = preferencesEtagRef.current;
      }
      
      // Make the API request
      const response = await fetch('/api/notifications/preferences', { headers });
      
      // Handle 304 Not Modified
      if (response.status === 304) {
        const cachedPrefs = getWithExpiry<NotificationPreferences>(PREFERENCES_CACHE_KEY);
        if (cachedPrefs) {
          setPreferences(cachedPrefs);
          setIsLoadingPreferences(false);
          return;
        }
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        console.warn('Rate limited when fetching preferences');
        setPreferencesError('Too many requests. Please try again later.');
        
        // Use cached or default preferences
        const cachedPrefs = getWithExpiry<NotificationPreferences>(PREFERENCES_CACHE_KEY);
        if (cachedPrefs) {
          setPreferences(cachedPrefs);
        } else if (user.id && preferences === null) {
          setPreferences({
            ...defaultPreferences,
            user_id: user.id
          });
        }
        
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.status}`);
      }
      
      // Extract and store ETag
      const newEtag = response.headers.get('ETag');
      if (newEtag) {
        preferencesEtagRef.current = newEtag;
        localStorage.setItem(PREFERENCES_ETAG_KEY, newEtag);
      }
      
      const data = await response.json();
      
      if (data.preferences) {
        setPreferences(data.preferences);
        // Cache the preferences
        setWithExpiry(PREFERENCES_CACHE_KEY, data.preferences, PREFERENCES_CACHE_TTL);
      } else {
        // Create default preferences with user ID
        if (user.id) {
          const userDefaultPrefs = {
            ...defaultPreferences,
            user_id: user.id
          };
          setPreferences(userDefaultPrefs);
        }
      }
      
      // Reset retry counter on success
      preferencesRetryCount.current = 0;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      setPreferencesError(error instanceof Error ? error.message : 'Unknown error');
      
      // Use cached or default preferences
      const cachedPrefs = getWithExpiry<NotificationPreferences>(PREFERENCES_CACHE_KEY);
      if (cachedPrefs) {
        setPreferences(cachedPrefs);
      } else if (user.id && preferences === null) {
        setPreferences({
          ...defaultPreferences,
          user_id: user.id
        });
      }
      
      // Retry logic
      if (preferencesRetryCount.current < MAX_RETRY_ATTEMPTS) {
        preferencesRetryCount.current++;
        setTimeout(() => {
          fetchPreferences(false);
        }, 5000 * preferencesRetryCount.current);
      }
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [user, preferences]);
  
  // Fetch preferences on mount and user change
  useEffect(() => {
    if (user) {
      // Load stored ETag if available
      const storedEtag = localStorage.getItem(PREFERENCES_ETAG_KEY);
      if (storedEtag) {
        preferencesEtagRef.current = storedEtag;
      }
      
      fetchPreferences(false);
    } else {
      setPreferences(null);
    }
  }, [user, fetchPreferences]);
  
  // Set up realtime updates for preferences
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('preferences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_preferences',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh preferences when changes are detected
          fetchPreferences(true);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchPreferences]);
  
  // Mark specified notifications as read
  const markAsRead = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    
    try {
      const response = await fetch(`${API_ROUTES.NOTIFICATIONS}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification.id)
            ? { ...notification, read_at: new Date().toISOString() } 
            : notification
        )
      );
      
      // Update cache if it exists
      const cachedData = getWithExpiry<{notifications: Notification[], hasMore: boolean}>(NOTIFICATIONS_CACHE_KEY);
      if (cachedData) {
        const updatedNotifications = cachedData.notifications.map(notification => 
          ids.includes(notification.id)
            ? { ...notification, read_at: new Date().toISOString() } 
            : notification
        );
        
        setWithExpiry(NOTIFICATIONS_CACHE_KEY, {
          ...cachedData,
          notifications: updatedNotifications
        }, NOTIFICATIONS_CACHE_TTL);
      }
      
      // Use shared cache for coordination with count context (optional, e.g. after marking as read)
      const updateCountCacheAfterRead = useCallback(() => {
        // Optionally, after marking notifications as read, update the shared count cache
        if (notifications) {
          const unread = notifications.filter(n => !n.read).length;
          setUnreadCountCache(unread);
        }
      }, [notifications]);
      
      // Call updateCountCacheAfterRead after markAsRead/markAllAsRead as needed
      updateCountCacheAfterRead();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read. Please try again.',
        variant: 'destructive',
      });
    }
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_ROUTES.NOTIFICATIONS}/read-all`, {
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
      
      // Update cache if it exists
      const cachedData = getWithExpiry<{notifications: Notification[], hasMore: boolean}>(NOTIFICATIONS_CACHE_KEY);
      if (cachedData) {
        const updatedNotifications = cachedData.notifications.map(notification => ({
          ...notification,
          read_at: notification.read_at || new Date().toISOString()
        }));
        
        setWithExpiry(NOTIFICATIONS_CACHE_KEY, {
          ...cachedData,
          notifications: updatedNotifications
        }, NOTIFICATIONS_CACHE_TTL);
      }
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
      
      // Use shared cache for coordination with count context (optional, e.g. after marking as read)
      const updateCountCacheAfterRead = useCallback(() => {
        // Optionally, after marking notifications as read, update the shared count cache
        if (notifications) {
          const unread = notifications.filter(n => !n.read).length;
          setUnreadCountCache(unread);
        }
      }, [notifications]);
      
      // Call updateCountCacheAfterRead after markAsRead/markAllAsRead as needed
      updateCountCacheAfterRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read. Please try again.',
        variant: 'destructive',
      });
    }
  }, []);
  
  // Update notification preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;
    
    const updatedPreferences = { ...preferences, ...prefs, updated_at: new Date().toISOString() };
    
    try {
      // Optimistically update local state
      setPreferences(updatedPreferences);
      
      // Send the update to the server
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: updatedPreferences }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      
      // Update the cache
      setWithExpiry(PREFERENCES_CACHE_KEY, updatedPreferences, PREFERENCES_CACHE_TTL);
      
      // Update ETag if provided
      const newEtag = response.headers.get('ETag');
      if (newEtag) {
        preferencesEtagRef.current = newEtag;
        localStorage.setItem(PREFERENCES_ETAG_KEY, newEtag);
      }
      
      toast({
        title: 'Success',
        description: 'Notification preferences updated',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      
      // Revert to previous state
      fetchPreferences(true);
      
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, preferences, fetchPreferences]);
  
  // Effect for tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if the cache is still valid before refreshing
        const cachedData = getWithExpiry<{notifications: Notification[], hasMore: boolean}>(NOTIFICATIONS_CACHE_KEY);
        if (!cachedData) {
          // Only refresh when cache is invalid to reduce API calls
          refreshNotifications();
          fetchPreferences(false);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshNotifications, fetchPreferences]);
  
  // Polling: Increase interval to 5 minutes, only poll when tab is visible
  useEffect(() => {
    if (!user) return;
    
    // Only poll every 5 minutes instead of constantly
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        // Check if cache is invalid before making API calls
        const cachedData = getWithExpiry<{notifications: Notification[], hasMore: boolean}>(NOTIFICATIONS_CACHE_KEY);
        if (!cachedData) {
          refreshNotifications();
        }
      }
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [user, refreshNotifications]);
  
  // Prevent duplicate fetches on mount using sessionStorage
  useEffect(() => {
    const sessionKey = 'notifications_loaded_' + (user?.id || '');
    const hasLoadedThisSession = sessionStorage.getItem(sessionKey);
    if (user && page === 1 && !hasLoadedThisSession) {
      sessionStorage.setItem(sessionKey, 'true');
      loadMoreNotifications(true);
    }
  }, [loadMoreNotifications, user, page]);
  
  // Context value
  const contextValue: NotificationContextType = {
    notifications,
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
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  
  return context;
}
