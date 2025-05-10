'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useNotificationCount } from '@/contexts/notification-count-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from '@/components/ui/use-toast';
import { Notification } from '@/types/notifications';

export function NotificationRealtimeListener() {
  const { user } = useAuth();
  const { refreshUnreadCount } = useNotificationCount();
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  const supabaseClientRef = useRef<ReturnType<typeof createClient> | null>(null);
  
  useEffect(() => {
    if (!user?.id) return;
    
    // Create Supabase client only once and store in ref
    if (!supabaseClientRef.current) {
      supabaseClientRef.current = createClient();
    }
    
    const supabase = supabaseClientRef.current;
    
    // Set up the channel
    try {
      // Clean up any existing channel first
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      // Create a new channel with optimized settings
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Refresh notification count
            refreshUnreadCount();
            
            // Extract notification data
            const notification = payload.new as Notification;
            
            // Determine toast variant based on priority
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
            
            // Show toast notification
            toast({
              title: notification.title || 'New notification',
              description: notification.content || '',
              variant: variant,
              duration: notification.priority === 'high' ? 7000 : 5000,
            });
          }
        )
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.error('Failed to subscribe to notifications:', status);
          }
        });
      
      // Store the channel reference
      channelRef.current = channel;
      
    } catch (error) {
      console.error('Failed to set up notification subscription:', error);
    }
    
    // Clean up function
    return () => {
      // Use the current references for cleanup
      const currentSupabase = supabaseClientRef.current;
      const currentChannel = channelRef.current;
      
      if (currentChannel && currentSupabase) {
        try {
          currentSupabase.removeChannel(currentChannel);
        } catch (error) {
          console.error('Error removing notification channel:', error);
        }
      }
    };
  }, [user, refreshUnreadCount]);
  
  // This is a non-visual component
  return null;
} 