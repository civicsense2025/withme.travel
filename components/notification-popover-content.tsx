'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import { API_ROUTES } from '@/utils/constants/routes';
import { useAuth } from '@/lib/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/utils/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationCount } from '@/contexts/notification-count-context';

// Define the notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  link?: string;
  type?: string;
}

// Define props for the component
interface NotificationPopoverContentProps {
  onOpen: (open: boolean) => void;
}

// Cache key for storing notification etag
const NOTIFICATION_ETAG_KEY = 'notification_etag';
// Cache key for notification data
const NOTIFICATION_CACHE_KEY = 'notifications_cache';
// Cache TTL - 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

export default function NotificationPopoverContent({ onOpen }: NotificationPopoverContentProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref: loadMoreRef, inView } = useInView();
  const supabase = createClient();
  const { user } = useAuth();
  const etagRef = useRef<string | null>(null);
  
  // Safely access the notification count context
  let refreshUnreadCount: () => Promise<void> = async () => {};
  try {
    const notificationCountContext = useNotificationCount();
    refreshUnreadCount = notificationCountContext.refreshUnreadCount;
  } catch (error) {
    console.error('Failed to access notification count context:', error);
    // Use no-op function as fallback
    refreshUnreadCount = async () => {};
  }
  
  // Function to fetch notifications with pagination and caching
  const fetchNotifications = useCallback(async (pageToFetch: number, reset = false) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', pageToFetch.toString());
      params.append('limit', '10');
      
      if (activeTab === 'unread') {
        params.append('unread', 'true');
      }
      
      // Check local storage for cached data
      let cachedData = null;
      const cachedString = localStorage.getItem(NOTIFICATION_CACHE_KEY);
      if (cachedString) {
        try {
          const cache = JSON.parse(cachedString);
          if (cache.tab === activeTab && Date.now() - cache.timestamp < CACHE_TTL) {
            cachedData = cache.data;
            if (pageToFetch === 1 && !reset) {
              setNotifications(cachedData);
              setHasMore(cache.hasMore);
              setIsLoading(false);
            }
          }
        } catch (e) {
          console.error('Error parsing cached notifications:', e);
        }
      }
      
      // Prepare headers for conditional request
      const headers: HeadersInit = {};
      if (pageToFetch === 1 && etagRef.current) {
        headers['If-None-Match'] = etagRef.current;
      }
      
      // Make the API request
      const response = await fetch(`${API_ROUTES.NOTIFICATIONS}?${params.toString()}`, {
        headers
      });
      
      // Handle 304 Not Modified
      if (response.status === 304 && cachedData) {
        if (pageToFetch === 1) {
          setIsLoading(false);
          return;
        }
      }
      
      // Update etag if provided
      const newEtag = response.headers.get('ETag');
      if (newEtag) {
        etagRef.current = newEtag;
        localStorage.setItem(NOTIFICATION_ETAG_KEY, newEtag);
      }
      
      // Parse response
      if (response.ok) {
        const data = await response.json();
        
        // Update state based on whether this is the first page or not
        if (pageToFetch === 1 || reset) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        
        setHasMore(data.hasMore);
        
        // Cache the result
        localStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify({
          data: pageToFetch === 1 ? data.notifications : [...notifications, ...data.notifications],
          timestamp: Date.now(),
          tab: activeTab,
          hasMore: data.hasMore
        }));
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, notifications, user]);
  
  // Effect to load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
      fetchNotifications(page + 1);
    }
  }, [inView, hasMore, isLoading, fetchNotifications, page]);
  
  // Initial load
  useEffect(() => {
    // Load etag from localStorage
    const storedEtag = localStorage.getItem(NOTIFICATION_ETAG_KEY);
    if (storedEtag) {
      etagRef.current = storedEtag;
    }
    
    setPage(1);
    fetchNotifications(1, true);
    
    // Set up real-time updates
    if (user) {
      const channel = supabase
        .channel('notification-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Refresh the first page when changes occur
            fetchNotifications(1, true);
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, activeTab, fetchNotifications]);
  
  // Function to mark notifications as read
  const markAsRead = async (notificationId?: string) => {
    if (!user) return;
    
    try {
      const endpoint = notificationId 
        ? `${API_ROUTES.NOTIFICATIONS}/${notificationId}/read`
        : `${API_ROUTES.NOTIFICATIONS}/read-all`;
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        // Update UI and refresh unread count
        refreshUnreadCount();
        
        if (notificationId) {
          // Update single notification
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === notificationId 
                ? { ...notification, read: true } 
                : notification
            )
          );
        } else {
          // Mark all as read
          setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
          );
        }
        
        // Update cache
        const cachedString = localStorage.getItem(NOTIFICATION_CACHE_KEY);
        if (cachedString) {
          try {
            const cache = JSON.parse(cachedString);
            const updatedNotifications = notificationId
              ? cache.data.map((n: Notification) => n.id === notificationId ? { ...n, read: true } : n)
              : cache.data.map((n: Notification) => ({ ...n, read: true }));
              
            localStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify({
              ...cache,
              data: updatedNotifications,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.error('Error updating cached notifications:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
    setIsLoading(true);
    setNotifications([]);
    fetchNotifications(1, true);
  };
  
  // Handle clicking a notification
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      // Navigate to the link
      window.location.href = notification.link;
    }
    
    // Close the popover
    onOpen(false);
  };
  
  // Render the notification item
  const renderNotificationItem = (notification: Notification) => (
    <div 
      key={notification.id}
      className={`flex gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className={`min-w-2 self-stretch ${!notification.read ? 'bg-primary' : 'bg-transparent'} rounded-full`} />
      <div className="flex-1">
        <div className="font-medium">{notification.title}</div>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <div className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
        <h3 className="font-medium">Notifications</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-6"
          onClick={() => markAsRead()}
        >
          Mark all as read
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="flex-1 overflow-hidden flex flex-col" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 px-4 py-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[400px]">
          <TabsContent value={activeTab} className="flex-1 overflow-y-auto pb-4 mt-0">
            {error ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    setError(null);
                    setPage(1);
                    fetchNotifications(1, true);
                  }}
                >
                  Try again
                </Button>
              </div>
            ) : (
              <>
                {notifications.length === 0 && !isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications found
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map(renderNotificationItem)}
                    
                    {/* Loading more indicator */}
                    {isLoading && (
                      <div className="space-y-4 p-4">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex gap-3">
                            <Skeleton className="h-full w-2 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Load more trigger */}
                    {hasMore && !isLoading && (
                      <div ref={loadMoreRef} className="h-4" />
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
      
      <div className="border-t p-2 text-center">
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs h-6 text-muted-foreground"
          onClick={() => {
            onOpen(false);
            window.location.href = '/notifications/history';
          }}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );
} 