'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useNotificationCount } from '@/contexts/notification-count-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import { Notification, NotificationPriority } from '@/types/notifications';

export function NotificationRealtimeListener() {
  const { user } = useAuth();
  const { refreshUnreadCount } = useNotificationCount();
  const channelRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const reconnectAttemptRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const supabaseClientRef = useRef<ReturnType<typeof createClient> | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    // Create Supabase client once
    if (!supabaseClientRef.current) {
      supabaseClientRef.current = createClient();
    }
    
    const supabase = supabaseClientRef.current;
    
    // Cleanup function that closes the channel
    const cleanupFn = () => {
      try {
        if (channelRef.current) {
          console.log('Cleaning up notification subscription');
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up notification subscription:', error);
      }
    };
    
    // Store the cleanup function
    cleanupRef.current = cleanupFn;
    
    // Function to set up the channel
    const setupChannel = () => {
      // Clean up any existing subscription first
      if (channelRef.current) {
        cleanupFn();
      }
      
      try {
        // Subscribe to notification changes for the current user
        const channel = supabase
          .channel('notification-updates')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              // Refresh the unread count when a new notification is inserted
              refreshUnreadCount();
              
              // Extract the notification from the payload
              const notification = payload.new as Notification;
              
              // Get the appropriate variant based on priority
              let variant: 'default' | 'destructive' | undefined;
              switch (notification.priority) {
                case 'high':
                  variant = 'destructive';
                  break;
                case 'medium':
                  variant = 'default';
                  break;
                default:
                  variant = undefined;
              }
              
              // Show a toast notification for new notifications
              toast({
                title: notification.title || 'New notification',
                description: notification.content || '',
                variant: variant,
                duration: notification.priority === 'high' ? 7000 : 5000,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            () => {
              // Refresh the unread count when a notification is updated
              refreshUnreadCount();
            }
          )
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log('Successfully subscribed to notification updates');
              // Reset reconnect attempts on successful connection
              reconnectAttemptRef.current = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error('Error subscribing to notifications:', status, err);
              
              // Try to reconnect with exponential backoff
              if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
                const delay = Math.pow(2, reconnectAttemptRef.current) * 1000;
                console.log(`Attempting to reconnect in ${delay}ms, attempt ${reconnectAttemptRef.current + 1}`);
                
                setTimeout(() => {
                  reconnectAttemptRef.current++;
                  setupChannel();
                }, delay);
              }
            }
          });
        
        // Store the channel reference
        channelRef.current = channel;
      } catch (error) {
        console.error('Failed to set up notification subscription:', error);
      }
    };
    
    // Initial setup
    setupChannel();
    
    // Clean up when component unmounts or user changes
    return () => {
      const cleanup = cleanupRef.current;
      if (cleanup) {
        cleanup();
      }
    };
  }, [user, refreshUnreadCount]);
  
  return null; // This is a non-visual component
} 