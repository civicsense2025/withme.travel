'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/utils/supabase/client';
import { API_ROUTES } from '@/utils/constants/routes';
import { getWithExpiry, setWithExpiry, initCacheCleaner } from '@/utils/local-storage-cache';
import { getUnreadCountCache, setUnreadCountCache, isUnreadCountCacheValid } from '@/utils/notification-state';

interface NotificationCountContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  isLoading: boolean;
}

const NotificationCountContext = createContext<NotificationCountContextType | undefined>(undefined);

// Constants for caching and retry
const CACHE_KEY = 'notification_count_cache';
const CACHE_TTL = 60000; // 1 minute
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds
const CIRCUIT_BREAKER_INTERVAL = 5000; // 5 seconds

export const NotificationCountProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();
  const etagRef = useRef<string | null>(null);
  const retryAttemptsRef = useRef(0);
  const visibilityListenerAddedRef = useRef(false);
  const lastFetchTimestampRef = useRef(0);
  const fetchInProgressRef = useRef(false);
  
  /**
   * Fetches the unread notification count with proper caching and error handling
   */
  const fetchUnreadCount = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Circuit breaker: Only allow one fetch every 5 seconds
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTimestampRef.current < CIRCUIT_BREAKER_INTERVAL) {
      return;
    }
    if (fetchInProgressRef.current) {
      return;
    }

    // Use shared cache if valid
    if (!forceRefresh && isUnreadCountCacheValid()) {
      const cache = getUnreadCountCache();
      if (cache) {
        setUnreadCount(cache.count);
        setIsLoading(false);
        return;
      }
    }

    fetchInProgressRef.current = true;
    lastFetchTimestampRef.current = now;
    setIsLoading(true);

    try {
      const headers: HeadersInit = {};
      if (etagRef.current) {
        headers['If-None-Match'] = etagRef.current;
      }
      const response = await fetch(API_ROUTES.NOTIFICATIONS_COUNT, { headers });
      if (response.status === 304) {
        const cache = getUnreadCountCache();
        if (cache) {
          setUnreadCount(cache.count);
          setIsLoading(false);
          fetchInProgressRef.current = false;
          return;
        }
      }
      if (response.status === 429) {
        // Rate limited, do not retry
        setIsLoading(false);
        fetchInProgressRef.current = false;
        return;
      }
      if (!response.ok) {
        throw new Error(`Error fetching notification count: ${response.status}`);
      }
      const newEtag = response.headers.get('ETag');
      if (newEtag) {
        etagRef.current = newEtag;
      }
      const data = await response.json();
      const count = data.unreadCount || 0;
      setUnreadCount(count);
      setUnreadCountCache(count);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      // Do not auto-retry to avoid cascading failures
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [user]);
  
  /**
   * Public method to refresh the unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    await fetchUnreadCount(true);
  }, [fetchUnreadCount]);
  
  /**
   * Set up tab visibility listener
   */
  const setupVisibilityListener = useCallback(() => {
    if (visibilityListenerAddedRef.current) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh count when tab becomes visible
        fetchUnreadCount(true);
      }
    };
    
    // Add event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    visibilityListenerAddedRef.current = true;
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      visibilityListenerAddedRef.current = false;
    };
  }, [fetchUnreadCount]);
  
  /**
   * Initial setup
   */
  useEffect(() => {
    // Initialize cache cleaner 
    const cleanupCacheInterval = initCacheCleaner();
    
    // Set up visibility listener
    const cleanupVisibilityListener = setupVisibilityListener();
    
    // Initial fetch
    fetchUnreadCount();
    
    return () => {
      cleanupCacheInterval();
      if (cleanupVisibilityListener) cleanupVisibilityListener();
    };
  }, [fetchUnreadCount, setupVisibilityListener]);
  
  /**
   * Set up realtime subscription for notifications
   */
  useEffect(() => {
    if (!user) return;
    
    // Listen to notification table changes for the current user
    const channel = supabase
      .channel('notification-count-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refresh the count when a notification changes
          fetchUnreadCount(true);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchUnreadCount]);
  
  // Create the context value
  const contextValue: NotificationCountContextType = {
    unreadCount,
    refreshUnreadCount,
    isLoading,
  };
  
  return (
    <NotificationCountContext.Provider value={contextValue}>
      {children}
    </NotificationCountContext.Provider>
  );
};

export const useNotificationCount = (): NotificationCountContextType => {
  const context = useContext(NotificationCountContext);
  
  if (context === undefined) {
    throw new Error('useNotificationCount must be used within a NotificationCountProvider');
  }
  
  return context;
}; 