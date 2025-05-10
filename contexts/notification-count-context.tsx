'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/utils/supabase/client';
import { API_ROUTES } from '@/utils/constants/routes';
import { initCacheCleaner } from '@/utils/local-storage-cache';
import { 
  getUnreadCountCache, 
  setUnreadCountCache, 
  isUnreadCountCacheValid,
  setupStorageListener
} from '@/utils/notification-state';

interface NotificationCountContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  isLoading: boolean;
}

const NotificationCountContext = createContext<NotificationCountContextType | undefined>(undefined);

// Constants for timing and retry
const CIRCUIT_BREAKER_INTERVAL = 10000; // 10 seconds between API calls
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 3000; // 3 seconds

export const NotificationCountProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const etagRef = useRef<string | null>(null);
  const retryAttemptsRef = useRef(0);
  const lastFetchTimestampRef = useRef(0);
  const fetchInProgressRef = useRef(false);
  const supabaseClientRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  
  // Initialize Supabase client once
  useEffect(() => {
    if (!supabaseClientRef.current) {
      supabaseClientRef.current = createClient();
    }
    
    // Initialize cache cleaner
    const cleanupCacheInterval = initCacheCleaner();
    
    return () => {
      cleanupCacheInterval();
    };
  }, []);
  
  /**
   * Fetches the unread notification count with circuit breaker pattern
   */
  const fetchUnreadCount = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    // Performance optimization: Use cached value if valid (unless forced refresh)
    if (!forceRefresh && isUnreadCountCacheValid()) {
      const cache = getUnreadCountCache();
      if (cache) {
        setUnreadCount(cache.count);
        return;
      }
    }
    
    // Circuit breaker pattern: Prevent frequent API calls
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTimestampRef.current < CIRCUIT_BREAKER_INTERVAL) {
      return;
    }
    
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) {
      return;
    }

    fetchInProgressRef.current = true;
    lastFetchTimestampRef.current = now;
    setIsLoading(true);

    try {
      // Prepare conditional request with ETag
      const headers: HeadersInit = {};
      if (etagRef.current) {
        headers['If-None-Match'] = etagRef.current;
      }
      
      const response = await fetch(API_ROUTES.NOTIFICATIONS_COUNT, { headers });
      
      // Handle 304 Not Modified - use cached data
      if (response.status === 304) {
        const cache = getUnreadCountCache();
        if (cache) {
          setUnreadCount(cache.count);
          setIsLoading(false);
          fetchInProgressRef.current = false;
          return;
        }
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        // Rate limited, use cached data if available
        const cache = getUnreadCountCache();
        if (cache) {
          setUnreadCount(cache.count);
        }
        setIsLoading(false);
        fetchInProgressRef.current = false;
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error fetching notification count: ${response.status}`);
      }
      
      // Update ETag for future conditional requests
      const newEtag = response.headers.get('ETag');
      if (newEtag) {
        etagRef.current = newEtag;
      }
      
      const data = await response.json();
      const count = data.unreadCount || 0;
      
      setUnreadCount(count);
      setUnreadCountCache(count);
      retryAttemptsRef.current = 0;
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      
      // Retry with exponential backoff
      if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
        retryAttemptsRef.current++;
        const backoffDelay = RETRY_DELAY * Math.pow(2, retryAttemptsRef.current - 1);
        
        setTimeout(() => {
          fetchInProgressRef.current = false;
          fetchUnreadCount(false);
        }, backoffDelay);
      }
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
   * Setup for cross-tab communication
   */
  useEffect(() => {
    const cleanup = setupStorageListener((count) => {
      setUnreadCount(count);
    });
    
    return cleanup;
  }, []);
  
  /**
   * Tab visibility handler
   */
  useEffect(() => {
    if (!user?.id) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only refresh when becoming visible and cache is invalid/old
        if (!isUnreadCountCacheValid()) {
          fetchUnreadCount(true);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchUnreadCount]);
  
  /**
   * Initial fetch and setup
   */
  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    
    // Get cached value if available
    if (isUnreadCountCacheValid()) {
      const cache = getUnreadCountCache();
      if (cache) {
        setUnreadCount(cache.count);
      }
    }
    
    // Then fetch fresh data
    fetchUnreadCount();
    
    // Set up realtime subscription
    if (supabaseClientRef.current) {
      // Clean up any existing channel
      if (channelRef.current) {
        supabaseClientRef.current.removeChannel(channelRef.current);
      }
      
      // Set up new channel
      const channel = supabaseClientRef.current
        .channel(`count:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Only refresh when cache is invalid to prevent excessive API calls
            if (!isUnreadCountCacheValid()) {
              fetchUnreadCount(true);
            }
          }
        )
        .subscribe();
      
      channelRef.current = channel;
    }
    
    return () => {
      if (channelRef.current && supabaseClientRef.current) {
        supabaseClientRef.current.removeChannel(channelRef.current);
      }
    };
  }, [user, fetchUnreadCount]);
  
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