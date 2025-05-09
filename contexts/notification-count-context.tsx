'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

interface NotificationCountContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  isLoading: boolean;
}

const NotificationCountContext = createContext<NotificationCountContextType | undefined>(undefined);

// Cache state and timestamps
interface CountCache {
  count: number;
  timestamp: number;
}

// Constants for caching and retry
const CACHE_TTL = 30000; // 30 seconds cache TTL
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 2000; // Start with 2 seconds

export function NotificationCountProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const cache = useRef<CountCache | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const fetchInProgressRef = useRef(false);
  
  // Clear the fetch timeout
  const clearFetchTimeout = () => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
  };
  
  // Debounced fetch function
  const debouncedFetch = useCallback(() => {
    clearFetchTimeout();
    fetchTimeoutRef.current = setTimeout(refreshUnreadCount, 300);
  }, []);
  
  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Check if we already have a fetch in progress
    if (fetchInProgressRef.current) {
      return;
    }
    
    // Check if we have a valid cache entry
    if (cache.current && (Date.now() - cache.current.timestamp) < CACHE_TTL) {
      setUnreadCount(cache.current.count);
      return;
    }
    
    fetchInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/notifications/count', {
        headers: { 
          'x-requested-with': 'XMLHttpRequest',
          'Cache-Control': 'max-age=30' // Tell browsers to cache for 30 seconds
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch count: ${response.status}`);
      }
      
      const data = await response.json();
      const count = data.unreadCount || 0;
      
      // Update the count and cache
      setUnreadCount(count);
      cache.current = {
        count,
        timestamp: Date.now()
      };
      
      // Reset retry count on success
      retryCountRef.current = 0;
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      
      // Only retry if we haven't exceeded max retries
      if (retryCountRef.current < MAX_RETRIES) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, retryCountRef.current);
        retryCountRef.current++;
        console.log(`Retrying notification count fetch in ${delay}ms, attempt ${retryCountRef.current}`);
        
        setTimeout(debouncedFetch, delay);
      }
    } finally {
      setIsLoading(false);
      fetchInProgressRef.current = false;
    }
  }, [user, debouncedFetch]);
  
  // Fetch count on mount, when user changes
  useEffect(() => {
    if (user) {
      refreshUnreadCount();
    }
    
    // Clean up any pending timeouts
    return () => {
      clearFetchTimeout();
    };
  }, [user, refreshUnreadCount]);
  
  // Set up polling at a reasonable interval (2 minutes)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(refreshUnreadCount, 120000); // 2 minutes
    
    return () => {
      clearInterval(interval);
    };
  }, [user, refreshUnreadCount]);
  
  return (
    <NotificationCountContext.Provider value={{ unreadCount, refreshUnreadCount, isLoading }}>
      {children}
    </NotificationCountContext.Provider>
  );
}

export function useNotificationCount() {
  const context = useContext(NotificationCountContext);
  if (context === undefined) {
    throw new Error('useNotificationCount must be used within a NotificationCountProvider');
  }
  return context;
} 