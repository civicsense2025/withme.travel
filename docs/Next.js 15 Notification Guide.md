# Comprehensive Notification System Guide for WithMe.Travel

## Table of Contents

1. [Introduction](#introduction)
2. [Schema Design for Supabase](#schema-design-for-supabase)
3. [Notification Types for Travel Planning](#notification-types-for-travel-planning)
4. [Database Triggers and Functions](#database-triggers-and-functions)
5. [Implementing Realtime Features](#implementing-realtime-features)
6. [Next.js Website Integration](#nextjs-website-integration)
7. [Push Notification Implementation](#push-notification-implementation)
8. [Notification UX Best Practices](#notification-ux-best-practices)
9. [Performance Considerations](#performance-considerations)
10. [Testing and Monitoring](#testing-and-monitoring)
11. [Maintenance and Scalability](#maintenance-and-scalability)

---

## Introduction

This guide outlines a comprehensive notification system for WithMe.Travel, focusing on enhancing the collaborative trip planning experience without overwhelming users. A well-designed notification system can significantly improve user engagement, collaboration efficiency, and overall platform stickiness while maintaining WithMe.Travel's core values of speed, ease of use, and intuitiveness.

### Purpose of Notifications in WithMe.Travel

For WithMe.Travel, notifications serve several critical purposes:

1. **Facilitating Collaboration**: Keeping all trip members informed about changes, decisions, and updates
2. **Time-Sensitive Alerts**: Reminding users of upcoming trips and important deadlines
3. **Engagement Promotion**: Re-engaging users with relevant trip activities and progress
4. **User Experience Enhancement**: Providing awareness of platform activity without requiring constant manual checking

### Key Design Principles

- **Relevance**: Only notify users about truly important information
- **Timeliness**: Deliver notifications when they're actionable
- **Non-intrusiveness**: Enhance rather than disrupt the user experience
- **Customizability**: Allow users to control their notification experience

---

## Schema Design for Supabase

### Core Notifications Table

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trip_id UUID REFERENCES public.trips(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  actor_id UUID REFERENCES auth.users(id),
  notification_type VARCHAR NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT
);

-- Create indexes for efficient querying
CREATE INDEX notifications_recipient_id_idx ON public.notifications(recipient_id);
CREATE INDEX notifications_trip_id_idx ON public.notifications(trip_id);
CREATE INDEX notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX notifications_is_read_idx ON public.notifications(is_read);
CREATE INDEX notifications_type_idx ON public.notifications(notification_type);
```

### User Notification Preferences

```sql
-- Add to existing profiles table
ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{
  "trip_invitations": true,
  "member_changes": true,
  "itinerary_updates": true,
  "comments": true,
  "trip_reminders": true,
  "email_notifications": true,
  "push_notifications": false
}'::jsonb;
```

### Device Tokens Table (for Push Notifications)

```sql
CREATE TABLE public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL,
  device_type VARCHAR NOT NULL, -- 'ios', 'android', 'web'
  device_name VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Ensure token uniqueness
  UNIQUE(token)
);

CREATE INDEX device_tokens_user_id_idx ON public.device_tokens(user_id);
CREATE INDEX device_tokens_is_active_idx ON public.device_tokens(is_active);
```

### Row Level Security (RLS) Implementation

```sql
-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can see their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Device tokens policies
CREATE POLICY "Users can see their own device tokens"
  ON public.device_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device tokens"
  ON public.device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device tokens"
  ON public.device_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens"
  ON public.device_tokens FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Notification Types for Travel Planning

WithMe.Travel should focus on these key notification categories:

### 1. Collaboration Notifications

| Notification Type | Description                              | Priority |
| ----------------- | ---------------------------------------- | -------- |
| `trip_invitation` | When a user is invited to join a trip    | High     |
| `member_joined`   | When a new member joins a trip           | Medium   |
| `member_left`     | When a member leaves a trip              | Medium   |
| `role_changed`    | When a user's role or permissions change | Medium   |

### 2. Itinerary Update Notifications

| Notification Type        | Description                                      | Priority |
| ------------------------ | ------------------------------------------------ | -------- |
| `itinerary_major_update` | Significant changes to trip plans                | Medium   |
| `place_added`            | When important places are added to the itinerary | Low      |
| `comment_added`          | New comments on places or activities             | Low      |
| `comment_mention`        | When a user is @mentioned in comments            | High     |
| `vote_created`           | When a new vote is created                       | Medium   |
| `vote_completed`         | When a group decision vote completes             | High     |

### 3. Time-sensitive Alerts

| Notification Type   | Description                                          | Priority |
| ------------------- | ---------------------------------------------------- | -------- |
| `trip_reminder`     | Upcoming trip alerts (7 days, 3 days, 1 day before)  | High     |
| `deadline_reminder` | Important reservation or booking deadlines           | High     |
| `travel_disruption` | Weather alerts or travel disruptions (if integrated) | High     |

### 4. System Notifications

| Notification Type      | Description                               | Priority |
| ---------------------- | ----------------------------------------- | -------- |
| `feature_announcement` | New features or improvements              | Low      |
| `account_alert`        | Security or account-related notifications | High     |

---

## Database Triggers and Functions

### Creating Notification Triggers

Implement database triggers to automatically generate notifications when certain events occur:

#### Trip Invitation Notification

```sql
CREATE OR REPLACE FUNCTION create_trip_invitation_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the trip name
  DECLARE trip_name TEXT;
  BEGIN
    SELECT name INTO trip_name FROM trips WHERE id = NEW.trip_id;
  END;

  -- Create notification
  INSERT INTO public.notifications (
    trip_id,
    recipient_id,
    actor_id,
    notification_type,
    content,
    metadata,
    action_url
  )
  VALUES (
    NEW.trip_id,
    NEW.user_id,
    NEW.invited_by,
    'trip_invitation',
    'You have been invited to join "' || trip_name || '"',
    jsonb_build_object(
      'trip_name', trip_name,
      'inviter_id', NEW.invited_by
    ),
    '/trips/' || NEW.trip_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_trip_invitation
  AFTER INSERT ON public.trip_invitations
  FOR EACH ROW
  EXECUTE PROCEDURE create_trip_invitation_notification();
```

#### Member Joined Notification

```sql
CREATE OR REPLACE FUNCTION create_member_joined_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user name and trip details
  DECLARE
    user_name TEXT;
    trip_name TEXT;
    trip_owner_id UUID;
    trip_members UUID[];
  BEGIN
    -- Get the user's name
    SELECT full_name INTO user_name FROM profiles WHERE id = NEW.user_id;

    -- Get trip details
    SELECT name, owner_id INTO trip_name, trip_owner_id FROM trips WHERE id = NEW.trip_id;

    -- Get trip members (excluding the new member)
    SELECT array_agg(user_id) INTO trip_members
    FROM trip_members
    WHERE trip_id = NEW.trip_id AND user_id != NEW.user_id;
  END;

  -- Create notifications for all existing trip members
  IF trip_members IS NOT NULL THEN
    FOREACH member_id IN ARRAY trip_members
    LOOP
      -- Check user notification preferences before creating notification
      DECLARE member_prefs JSONB;
      BEGIN
        SELECT notification_preferences INTO member_prefs FROM profiles WHERE id = member_id;

        IF member_prefs->>'member_changes' = 'true' THEN
          INSERT INTO public.notifications (
            trip_id,
            recipient_id,
            actor_id,
            notification_type,
            content,
            metadata,
            action_url
          )
          VALUES (
            NEW.trip_id,
            member_id,
            NEW.user_id,
            'member_joined',
            user_name || ' joined "' || trip_name || '"',
            jsonb_build_object(
              'trip_name', trip_name,
              'user_name', user_name
            ),
            '/trips/' || NEW.trip_id || '/members'
          );
        END IF;
      END;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_member_joined
  AFTER INSERT ON public.trip_members
  FOR EACH ROW
  EXECUTE PROCEDURE create_member_joined_notification();
```

#### Itinerary Update Notification

```sql
CREATE OR REPLACE FUNCTION create_itinerary_update_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on significant changes
  IF TG_OP = 'UPDATE' AND (
    OLD.title = NEW.title AND
    OLD.description = NEW.description AND
    OLD.start_date = NEW.start_date AND
    OLD.end_date = NEW.end_date
  ) THEN
    -- Skip notification for minor changes
    RETURN NEW;
  END IF;

  -- Get trip details
  DECLARE
    trip_name TEXT;
    trip_members UUID[];
    actor_name TEXT;
  BEGIN
    -- Get the trip name
    SELECT name INTO trip_name FROM trips WHERE id = NEW.trip_id;

    -- Get trip members (excluding the actor)
    SELECT array_agg(user_id) INTO trip_members
    FROM trip_members
    WHERE trip_id = NEW.trip_id AND user_id != auth.uid();

    -- Get actor name
    SELECT full_name INTO actor_name FROM profiles WHERE id = auth.uid();
  END;

  -- Create notifications for all trip members
  IF trip_members IS NOT NULL THEN
    FOREACH member_id IN ARRAY trip_members
    LOOP
      -- Check user preferences before creating notification
      DECLARE member_prefs JSONB;
      BEGIN
        SELECT notification_preferences INTO member_prefs FROM profiles WHERE id = member_id;

        IF member_prefs->>'itinerary_updates' = 'true' THEN
          INSERT INTO public.notifications (
            trip_id,
            recipient_id,
            actor_id,
            notification_type,
            content,
            metadata,
            action_url
          )
          VALUES (
            NEW.trip_id,
            member_id,
            auth.uid(),
            'itinerary_major_update',
            actor_name || ' updated the itinerary for "' || trip_name || '"',
            jsonb_build_object(
              'trip_name', trip_name,
              'actor_name', actor_name,
              'update_type', TG_OP,
              'item_title', NEW.title
            ),
            '/trips/' || NEW.trip_id || '/itinerary'
          );
        END IF;
      END;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_itinerary_update
  AFTER INSERT OR UPDATE ON public.itinerary_items
  FOR EACH ROW
  EXECUTE PROCEDURE create_itinerary_update_notification();
```

### Notification Cleanup Function

```sql
-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Delete notifications older than 6 months
  DELETE FROM public.notifications
  WHERE created_at < now() - interval '180 days';

  -- Or archive older notifications if you want to keep history
  -- UPDATE public.notifications
  -- SET is_archived = true
  -- WHERE created_at < now() - interval '180 days'
  -- AND is_archived = false;
END;
$$ LANGUAGE plpgsql;
```

---

## Implementing Realtime Features

### Enable Realtime on Notifications Table

```sql
-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### Implementing Client-Side Realtime Subscription

Create a React hook to manage notification subscriptions:

```typescript
// hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { RealtimeChannel } from '@supabase/supabase-js';

export type Notification = {
  id: string;
  created_at: string;
  trip_id: string | null;
  recipient_id: string;
  actor_id: string | null;
  notification_type: string;
  content: string;
  metadata: any;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = useSupabaseClient();
  const user = useUser();

  // Fetch initial notifications
  useEffect(() => {
    if (!user) return;

    async function fetchNotifications() {
      try {
        setLoading(true);

        // Fetch recent notifications (last 30 days)
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        setNotifications(data || []);
        setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [user, supabase]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      // Create and subscribe to the channel
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            // Add new notification to state
            const newNotification = payload.new as Notification;
            setNotifications((current) => [newNotification, ...current]);
            setUnreadCount((current) => current + 1);

            // Optional: Play sound or show toast notification
            playNotificationSound();
            showToast(newNotification);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            // Update notification in state
            const updatedNotification = payload.new as Notification;
            setNotifications((current) =>
              current.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
            );

            // Update unread count
            calculateUnreadCount();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, supabase]);

  // Helper function to recalculate unread count
  const calculateUnreadCount = () => {
    setUnreadCount(notifications.filter((n) => !n.is_read).length);
  };

  // Function to mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state optimistically
      setNotifications((current) =>
        current.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );

      // Update unread count
      setUnreadCount((current) => Math.max(0, current - 1));

      // Update in database
      await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Update local state optimistically
      setNotifications((current) =>
        current.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );

      // Update unread count
      setUnreadCount(0);

      // Update in database
      await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('recipient_id', user!.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Helper functions for notification feedback
  const playNotificationSound = () => {
    // Implement sound if needed
    // const audio = new Audio('/notification-sound.mp3');
    // audio.play().catch(e => console.log('Audio play error:', e));
  };

  const showToast = (notification: Notification) => {
    // Implement toast notification if needed
    // toast.success(notification.content);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
```

---

## Next.js Website Integration

### Setting Up the Notification Context

Create a global context to manage notifications across your Next.js application:

```typescript
// contexts/NotificationContext.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notificationData = useNotifications();

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }

  return context;
}
```

### Implementing the Notification UI Components

#### Notification Bell Icon with Badge

```tsx
// components/NotificationBell.tsx
'use client';

import { useState } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import NotificationPopover from './NotificationPopover';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const { unreadCount } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`Notifications ${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={20} className="text-gray-700" />

        {/* Notification badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification popover */}
      {isOpen && <NotificationPopover onClose={() => setIsOpen(false)} />}
    </div>
  );
}
```

#### Notification Popover

```tsx
// components/NotificationPopover.tsx
'use client';

import { useRef, useEffect } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { UserCircle, Calendar, MapPin, MessageSquare, Users } from 'lucide-react';

type NotificationPopoverProps = {
  onClose: () => void;
};

export default function NotificationPopover({ onClose }: NotificationPopoverProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotificationContext();
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate to target page if action_url exists
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose();
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trip_invitation':
      case 'member_joined':
      case 'member_left':
      case 'role_changed':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'itinerary_major_update':
      case 'place_added':
        return <MapPin className="w-5 h-5 text-green-500" />;
      case 'comment_added':
      case 'comment_mention':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'trip_reminder':
      case 'deadline_reminder':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      default:
        return <UserCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-md shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="py-6 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-gray-500">No notifications yet</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0 mr-3 mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{notification.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-center border-t border-gray-200">
        <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900">
          Close
        </button>
      </div>
    </div>
  );
}
```

### Adding the Notification Provider to Your Layout

```tsx
// app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { NotificationProvider } from '@/contexts/NotificationContext';

export function Providers({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient();

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <NotificationProvider>{children}</NotificationProvider>
    </SessionContextProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

### Creating the Notification Preferences Page

```tsx
// app/account/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

type NotificationPreferences = {
  trip_invitations: boolean;
  member_changes: boolean;
  itinerary_updates: boolean;
  comments: boolean;
  trip_reminders: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
};

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    trip_invitations: true,
    member_changes: true,
    itinerary_updates: true,
    comments: true,
    trip_reminders: true,
    email_notifications: true,
    push_notifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();

  // Fetch current preferences
  useEffect(() => {
    if (!user) return;

    async function fetchPreferences() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.notification_preferences) {
          setPreferences(data.notification_preferences as NotificationPreferences);
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [user, supabase]);

  // Handle toggle change
  const handleToggleChange = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Save preferences
  const savePreferences = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: preferences,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading preferences...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Notification Preferences</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Trip Notifications</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Trip Invitations</h3>
                <p className="text-sm text-gray-500">
                  Get notified when someone invites you to join a trip
                </p>
              </div>
              <Switch
                checked={preferences.trip_invitations}
                onCheckedChange={() => handleToggleChange('trip_invitations')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Member Changes</h3>
                <p className="text-sm text-gray-500">
                  Get notified when people join or leave your trips
                </p>
              </div>
              <Switch
                checked={preferences.member_changes}
                onCheckedChange={() => handleToggleChange('member_changes')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Itinerary Updates</h3>
                <p className="text-sm text-gray-500">
                  Get notified about important changes to trip itineraries
                </p>
              </div>
              <Switch
                checked={preferences.itinerary_updates}
                onCheckedChange={() => handleToggleChange('itinerary_updates')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Comments</h3>
                <p className="text-sm text-gray-500">
                  Get notified about new comments and mentions
                </p>
              </div>
              <Switch
                checked={preferences.comments}
                onCheckedChange={() => handleToggleChange('comments')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Trip Reminders</h3>
                <p className="text-sm text-gray-500">
                  Get reminders about upcoming trips and deadlines
                </p>
              </div>
              <Switch
                checked={preferences.trip_reminders}
                onCheckedChange={() => handleToggleChange('trip_reminders')}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Notification Channels</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive important notifications via email</p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={() => handleToggleChange('email_notifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications on your devices</p>
              </div>
              <Switch
                checked={preferences.push_notifications}
                onCheckedChange={() => handleToggleChange('push_notifications')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Push Notification Implementation

For WithMe.Travel, push notifications can be implemented in phases. Start with the web app and email notifications, then add push notifications for mobile when needed.

### Step 1: Register Service Worker for Web Push (Optional)

```typescript
// public/service-worker.js
self.addEventListener('push', function (event) {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    data: {
      url: data.url,
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
```

### Step 2: Supabase Edge Function for Push Notification Delivery

```typescript
// supabase/functions/push-notifications/index.ts
import { createClient } from '@supabase/supabase-js';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    recipient_id: string;
    notification_type: string;
    content: string;
    action_url: string | null;
  };
  schema: 'public';
}

serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload: WebhookPayload = await req.json();

    // Only process notifications table inserts
    if (payload.table !== 'notifications' || payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user preferences and tokens
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', payload.record.recipient_id)
      .single();

    if (profileError) throw profileError;

    // Check if user wants push notifications
    const preferences = profileData.notification_preferences || {};
    if (!preferences.push_notifications) {
      return new Response(JSON.stringify({ message: 'Push notifications disabled' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user's device tokens
    const { data: deviceTokens, error: deviceError } = await supabase
      .from('device_tokens')
      .select('token, device_type')
      .eq('user_id', payload.record.recipient_id)
      .eq('is_active', true);

    if (deviceError) throw deviceError;

    if (!deviceTokens || deviceTokens.length === 0) {
      return new Response(JSON.stringify({ message: 'No device tokens found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send push notifications to all user devices
    const results = await Promise.all(
      deviceTokens.map(async (device) => {
        // Example using FCM (Firebase Cloud Messaging)
        if (device.device_type === 'android' || device.device_type === 'ios') {
          return await sendFCMNotification(
            device.token,
            'WithMe.Travel',
            payload.record.content,
            payload.record.action_url
          );
        }

        // Example using Web Push
        if (device.device_type === 'web') {
          return await sendWebPushNotification(
            device.token,
            'WithMe.Travel',
            payload.record.content,
            payload.record.action_url
          );
        }

        return null;
      })
    );

    return new Response(JSON.stringify({ message: 'Notifications sent', results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending push notification:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Implementation of sendFCMNotification and sendWebPushNotification
// would depend on your chosen push notification service
async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
  url?: string | null
) {
  // Implementation using Firebase Admin SDK or similar
  // This is a placeholder
  return { success: true, token };
}

async function sendWebPushNotification(
  subscription: string,
  title: string,
  body: string,
  url?: string | null
) {
  // Implementation using web-push library or similar
  // This is a placeholder
  return { success: true, subscription };
}
```

### Step 3: Set Up Database Webhook for Push Notifications

In your Supabase Dashboard:

1. Go to Database → Webhooks
2. Create a new webhook:
   - Name: Push Notifications
   - Table: notifications
   - Events: INSERT
   - Function: push-notifications (the Edge Function created above)

---

## Notification UX Best Practices

### General Principles

1. **Relevance**: Only notify users about information that is directly relevant to them
2. **Timeliness**: Deliver notifications at appropriate times
3. **Clarity**: Make notifications clear and actionable
4. **Control**: Give users control over their notification experience

### UX Guidelines

#### When to Send Notifications

1. **Collaborative Events**: Send notifications for interactions that directly involve the user (mentions, invitations)
2. **Important Changes**: Send notifications for significant changes (trip date changes, itinerary overhaul)
3. **Critical Deadlines**: Send notifications for important upcoming events (trip start, booking deadlines)

#### When NOT to Send Notifications

1. **Minor Updates**: Avoid notifications for small edits or routine changes
2. **High-Frequency Events**: Don't notify for events that happen very frequently (every chat message)
3. **Redundant Information**: Avoid notifications for actions the user just performed

#### Visual Design Best Practices

1. **Distinctive Icons**: Use unique icons for different notification types
2. **Brief Content**: Keep notification messages concise and clear
3. **Clear Actions**: Make it obvious what action the user can take
4. **Grouping**: Group similar notifications to reduce clutter
5. **Timestamps**: Show relative time ("2 hours ago" rather than exact timestamps)

#### Interaction Design

1. **One-Click Actions**: Allow users to take action directly from the notification
2. **Bulk Actions**: Provide options to mark all notifications as read
3. **Progressive Disclosure**: Show summaries first, then details on interaction
4. **Easy Dismissal**: Make it easy to dismiss notifications

#### Email Notification Best Practices

1. **Digestible Format**: Consider daily/weekly digests instead of individual emails
2. **Clear Subject Lines**: Make email subjects clear and specific
3. **Mobile-Friendly**: Ensure email notifications look good on mobile devices
4. **Actionable**: Include direct links to relevant content
5. **Unsubscribe Option**: Always provide easy opt-out options

---

## Performance Considerations

### Database Optimization

1. **Indexing**: Ensure all frequently queried columns have appropriate indexes
2. **Partitioning**: For high-volume apps, consider time-based partitioning of the notifications table
3. **Cleanup**: Implement regular cleanup of old notifications
4. **Query Optimization**: Limit query results and use pagination

### Realtime Performance

1. **Selective Updates**: Use specific filters in Supabase Realtime subscriptions
2. **Throttling**: Implement throttling for high-frequency updates
3. **Offline Support**: Implement offline caching for notification data
4. **Connection Management**: Handle connection errors and reconnection gracefully

### Client-Side Performance

1. **Virtualization**: Use virtualized lists for long notification lists
2. **Lazy Loading**: Load older notifications only when needed
3. **Optimistic Updates**: Update UI immediately before waiting for server response
4. **State Management**: Use efficient state management to prevent unnecessary re-renders

---

## Testing and Monitoring

### Testing Strategies

1. **Functional Testing**: Test all notification types and user scenarios
2. **Integration Testing**: Test database triggers and Edge Functions
3. **Performance Testing**: Test with high volumes of notifications
4. **Device Testing**: Test across different browsers and devices

### Monitoring

1. **Error Tracking**: Set up error tracking for all notification components
2. **Usage Analytics**: Track notification metrics (open rates, click-through rates)
3. **Performance Monitoring**: Monitor database and Edge Function performance
4. **User Feedback**: Collect and analyze user feedback on notifications

---

## Maintenance and Scalability

### Regular Maintenance

1. **Clean up old notifications** periodically (implement scheduled functions)
2. **Monitor database size** and performance
3. **Update notification types** as new features are added
4. **Audit notification content** for relevance and clarity

### Scaling Strategies

1. **Database Partitioning**: Implement table partitioning for large datasets
2. **Queuing System**: For high-volume systems, use a dedicated queue for notification delivery
3. **Horizontal Scaling**: Use Supabase's built-in scaling capabilities
4. **Caching**: Implement caching for frequently accessed notification data

### Future Enhancements

1. **Smart Notifications**: Use ML to determine notification relevance and timing
2. **Enhanced Push Notifications**: Add rich media and interactive elements
3. **Cross-Platform Sync**: Ensure notification state syncs across all user devices
4. **Analytics Dashboard**: Create dashboards for notification engagement metrics

---

This comprehensive guide provides everything needed to implement a robust notification system for WithMe.Travel. By following these guidelines, you can create a notification experience that enhances user engagement and collaboration without overwhelming users with unnecessary alerts.
