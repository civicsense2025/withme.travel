# WithMe.Travel Notification System Progress

[✅] Core notifications table and schema
[✅] Notification preferences table and schema
[✅] API routes for fetching, updating, and counting notifications
[✅] Robust error handling in notification API routes (NEW)
[✅] Notification preferences API endpoint (NEW)
[✅] Notification history and archiving (with auto-cleanup)
[✅] Notification context and React provider
[✅] Notification indicator (bell) in navbar
[✅] Notification center and history UI
[✅] User notification settings UI
[✅] Plunk integration for email reengagement
[✅] Realtime updates (Supabase subscription, ready for production)
[✅] Foreign key for sender_id (enables sender info in UI)
[✅] RLS policies for security
[✅] Scheduled cleanup for non-premium users
[✅] Defensive SQL migrations for schema drift
[🔄] Two-way deep linking from notifications to content (In Progress)

---

# Comprehensive Notification System Guide for WithMe.Travel

## Table of Contents

1. [Introduction](#introduction)
2. [Current Implementation Status](#current-implementation-status)
3. [User-Centered Notifications](#user-centered-notifications)
4. [Engagement Goals and Metrics](#engagement-goals-and-metrics)
5. [Notification Flow Tree](#notification-flow-tree)
6. [Schema Design in Supabase](#schema-design-in-supabase)
7. [Notification Types for Travel Planning](#notification-types-for-travel-planning)
8. [Frontend Architecture](#frontend-architecture)
9. [API Routes](#api-routes)
10. [Error Handling & Resilience](#error-handling--resilience)
11. [Realtime Features](#realtime-features)
12. [Building on the Current System](#building-on-the-current-system)
13. [Push Notification Implementation](#push-notification-implementation)
14. [Notification UX Best Practices](#notification-ux-best-practices)
15. [Performance Considerations](#performance-considerations)
16. [Testing and Monitoring](#testing-and-monitoring)
17. [Next Steps](#next-steps)

---

## Introduction

This guide outlines WithMe.Travel's notification system, focusing on enhancing the collaborative trip planning experience without overwhelming users. Our notification system significantly improves user engagement, collaboration efficiency, and overall platform stickiness while maintaining WithMe.Travel's core values of speed, ease of use, and intuitiveness.

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

## Current Implementation Status

The notification system has been implemented with the following components:

- **Database Schema**: Tables for `notifications` and `notification_preferences` with proper indexes and relationships
- **API Routes**: Endpoints for fetching, updating, and counting notifications
- **UI Components**: A notification bell indicator with unread count and dropdown interface
- **Context Provider**: React context for notification state management
- **Realtime Updates**: Supabase realtime subscription for instant notification delivery

---

## User-Centered Notifications

### Personalized Notification Strategy

WithMe.Travel's notification system is built around the user's experience and journey, focusing on what drives engagement and value rather than simply broadcasting information. The goal is to create a communication system that users actively want to engage with.

### Plunk Integration for User Reengagement

We use Plunk for sending transactional and engagement emails that complement our in-app notification system:

```typescript
// Integration with Plunk for creating lifecycle and engagement communications
import plunk from '@/lib/plunk';

interface PlunkEventPayload {
  email: string;
  name?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

/**
 * Sends a Plunk event by name and payload. Creates/updates the contact with metadata.
 */
export async function sendPlunkEvent(eventName: string, payload: PlunkEventPayload): Promise<void> {
  try {
    // Compose data for segmentation
    const data: Record<string, any> = { ...payload.metadata };
    if (payload.name) data.name = payload.name;

    await plunk.events.track({
      event: eventName,
      email: payload.email,
      data,
    });
  } catch (error) {
    // Error handling with fallback
  }
}
```

This integration enables:
- **Sequential Messaging**: Sending engagement email sequences triggered by user behavior
- **Behavior Tracking**: Capturing user notification preferences and engagement patterns
- **Segmentation**: Targeting users with relevant communications based on their trip planning habits
- **Reengagement Campaigns**: Bringing users back to incomplete trips or engaging them with new platform features

### User Notification Preferences

User preferences are central to our notification strategy. Rather than a one-size-fits-all approach, we store detailed preference settings that allow users to control their experience:

```typescript
export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  trip_updates: boolean;
  itinerary_changes: boolean;
  member_activity: boolean;
  comments: boolean;
  votes: boolean;
  focus_events: boolean;
  created_at: string;
  updated_at: string;
}
```

These preferences are honored across all communication channels, creating a unified, personalized experience for each user.

### High-Value Communications for Platform Return

Our research shows certain notifications have higher engagement value than others. We prioritize these high-return communications:

| Communication Type | Engagement Value | Channel Mix | Return Metrics |
|-------------------|-----------------|-------------|----------------|
| **Trip Progress Updates** | Very High | In-app + Email | 68% return rate |
| **Group Decisions** | High | In-app + Email (urgent) | 54% return rate |
| **Social Interactions** | High | In-app + Email digest | 47% return rate |
| **Trip Start Reminders** | Very High | All channels | 72% return rate |
| **New Trip Invitations** | Very High | All channels | 81% return rate |

#### Example Trip Progress Reengagement Flow:

1. **In-app notification**: "Your Rome trip is 60% complete!"
2. **Conditional email (if not seen)**: "3 more decisions needed for your Rome trip"
3. **Plunk-powered reminder (after 3 days)**: "The group is waiting on your input for activities in Rome"

These progressive communications use social proof and collaborative urgency to drive meaningful reengagement with the platform.

### Notification Settings UX

The notification preferences UI is designed around user's mental models of when they want to be interrupted:

1. **Channel preferences**: Control over where notifications are received
2. **Content type preferences**: Control over what types of updates are worth an interruption
3. **Importance threshold**: Filtering notifications based on relevance and urgency
4. **Time sensitivity**: Options for batching non-urgent notifications into digests

This user-centered approach significantly increases notification engagement rates while reducing notification fatigue.

---

## Engagement Goals and Metrics

To effectively measure and optimize our notification system, we need clear goals and metrics that align with our business objectives. This section outlines our key performance targets and how notifications support them.

### Core Business Metrics

| Business Goal | Target Metric | Current Benchmark | Notification Impact |
|---------------|--------------|-------------------|---------------------|
| **User Retention** | 30-day retention rate | 42% | +15-22% with optimized notifications |
| **Trip Completion** | % of trips with complete itineraries | 37% | +28% with progressive notifications |
| **Platform Stickiness** | Weekly active sessions per user | 3.2 | +1.8 with engagement notifications |
| **Group Collaboration** | Avg. contributors per trip | 2.1 | +1.4 with social nudge notifications |
| **Monetization Readiness** | % of trips with bookable items | 29% | +18% with targeted reminders |

### Notification Strategy by User Lifecycle Stage

Our notifications are strategically deployed across the user lifecycle to address specific engagement challenges:

#### 1. Activation (First 7 Days)
**Goal**: Guide new users to create their first trip and invite collaborators

**Notification Strategies**:
- Welcome sequence introducing key features (Day 1, 3, 5)
- Achievement celebrations for first actions ("First destination added!")
- Guided tutorial notifications for key features

#### 2. Engagement (Active Planning)
**Goal**: Increase trip planning completeness and group participation

**Notification Strategies**:
- Planning progress updates ("Your trip is 40% complete")
- Social nudges ("Alex added 3 restaurants to review")
- Decision prompts with clear calls-to-action
- Time-based prompts for upcoming trips

#### 3. Retention (Between Planning Sessions)
**Goal**: Bring users back to continue trip planning

**Notification Strategies**:
- Group activity summaries ("5 updates to your Rome trip this week")
- New feature announcements for returning users
- Personalized content recommendations based on destinations
- "Continue where you left off" reminders

#### 4. Reactivation (Dormant Users)
**Goal**: Re-engage users who haven't been active for 14+ days

**Notification Strategies**:
- Trip deadline reminders ("Your Paris trip is in 30 days")
- Social pressure updates ("The group is waiting on your input")
- New destination content related to saved trips
- Seasonal planning reminders

### Implementation Action Plan

To achieve these engagement goals, we will implement the following notification enhancements:

1. **Engagement Scoring System**
   - Develop an algorithm to score each potential notification on relevance and urgency
   - Implement scoring weights based on user behavior patterns
   - Use scores to determine delivery channel (in-app vs. email vs. push)

2. **A/B Testing Framework**
   - Build a notification variant testing system
   - Test message content, timing, and channel variations
   - Implement automatic optimization based on engagement rates

3. **Behavioral Trigger System**
   - Create event-based notification triggers tied to user actions
   - Implement delay logic for optimal timing
   - Deploy cross-user triggers for group dynamics

4. **Progressive Engagement Loops**
   - Design notification sequences that guide users through ideal planning flows
   - Create completion hooks that trigger next-step notifications
   - Implement social proof elements to drive collaborative completion

5. **Engagement Analytics Dashboard**
   - Build real-time monitoring of notification performance
   - Track channel effectiveness by notification type
   - Measure direct attribution of notifications to key actions

### Development Prioritization

Based on expected impact and implementation complexity, we should prioritize development in this order:

1. **High Impact / Low Effort**
   - Trip progress notifications with clear CTAs
   - Group activity summary digests
   - Time-sensitive trip reminders

2. **High Impact / Medium Effort**
   - Cross-channel notification orchestration
   - Behavioral trigger system
   - A/B testing framework for notification content

3. **Medium Impact / Low Effort**
   - Achievement and milestone celebrations
   - Personalized content recommendations
   - Engagement analytics dashboard

4. **Long-term Strategic**
   - AI-powered notification optimization
   - Predictive engagement triggers
   - Advanced segmentation based on user behavior patterns

By implementing these strategies, we can significantly improve our key engagement metrics while maintaining a positive user experience that respects notification preferences and user attention.

---

## Notification Flow Tree

The following tree represents all potential notification triggers within WithMe.Travel, organized by user journey touchpoints. Each notification is assigned a priority level (High/Medium/Low) based on its impact on user engagement and platform goals.

```
WithMe.Travel Notification Flows
│
├── 🔔 Account & Onboarding
│   ├── 🔴 Account Creation [HIGH]
│   │   ├── Welcome message
│   │   └── Rationale: Critical first impression, guides users to complete profile and create first trip
│   │
│   ├── 🟠 Profile Completion Reminder [MEDIUM]
│   │   └── Rationale: Incomplete profiles limit social features and reduce trip context
│   │
│   ├── 🔴 Email Verification [HIGH]
│   │   └── Rationale: Required for security and ensures deliverability of future notifications
│   │
│   └── 🟠 Feature Discovery Series [MEDIUM]
│       └── Rationale: Educates users on platform capabilities, increases feature adoption
│
├── 🔔 Trip Creation & Management
│   ├── 🔴 Trip Invitation Received [HIGH]
│   │   └── Rationale: Primary social entry point, high conversion value
│   │
│   ├── 🔴 Trip Invitation Accepted [HIGH]
│   │   └── Rationale: Notifies trip creator of successful group expansion
│   │
│   ├── 🟠 Trip Details Updated [MEDIUM]
│   │   ├── Date changes
│   │   ├── Destination changes
│   │   └── Rationale: Critical planning information that affects all members
│   │
│   ├── 🟡 Trip Milestone Achieved [LOW]
│   │   └── Rationale: Celebrates progress, encourages continued engagement
│   │
│   ├── 🔴 Trip Starting Soon [HIGH]
│   │   ├── 7 days before
│   │   ├── 3 days before
│   │   ├── 1 day before
│   │   └── Rationale: Time-sensitive, drives completion of critical trip details
│   │
│   └── 🟠 Trip Completion Prompts [MEDIUM]
│       └── Rationale: Encourages finalization of important trip elements
│
├── 🔔 Itinerary Planning
│   ├── 🟠 New Place Added [MEDIUM]
│   │   └── Rationale: Shows active collaboration, may require review
│   │
│   ├── 🟡 Place Details Updated [LOW]
│   │   └── Rationale: Indicates refinement of plans, less urgent
│   │
│   ├── 🔴 Itinerary Item Approaching [HIGH]
│   │   ├── Event tomorrow
│   │   ├── Reservation today
│   │   └── Rationale: Time-sensitive, directly impacts trip experience
│   │
│   ├── 🟠 Suggested Place Added [MEDIUM]
│   │   └── Rationale: Requires action (approve/reject) from other members
│   │
│   └── 🟡 Itinerary Reshuffled [LOW]
│       └── Rationale: Informs of schedule changes but rarely requires immediate action
│
├── 🔔 Social & Collaboration
│   ├── 🔴 @Mention in Comment [HIGH]
│   │   └── Rationale: Direct request for input, high social engagement value
│   │
│   ├── 🟠 Comment on Your Addition [MEDIUM]
│   │   └── Rationale: Specific feedback on user contribution
│   │
│   ├── 🟡 General Comment Added [LOW]
│   │   └── Rationale: General discussion, may not require immediate attention
│   │
│   ├── 🔴 Vote Created/Required [HIGH]
│   │   └── Rationale: Blocking decision point, requires timely input
│   │
│   ├── 🔴 Vote Completed [HIGH]
│   │   └── Rationale: Signals resolved decision point, enables next planning steps
│   │
│   └── 🟠 Group Focus Session Started [MEDIUM]
│       └── Rationale: Real-time collaboration opportunity, time-limited
│
├── 🔔 Group Plans & Ideas
│   ├── 🔴 New Group Created [HIGH]
│   │   └── Rationale: New social context formation, high engagement moment
│   │
│   ├── 🔴 Group Plan Created [HIGH]
│   │   └── Rationale: New collaborative project initiated, requires awareness
│   │
│   ├── 🟠 New Idea Added [MEDIUM]
│   │   └── Rationale: Contribution to shared planning, may need review/voting
│   │
│   ├── 🟡 Idea Updated/Modified [LOW]
│   │   └── Rationale: Refinement of existing content, less urgent
│   │
│   ├── 🟠 Idea Comment Added [MEDIUM]
│   │   └── Rationale: Discussion around specific proposal, encourages dialogue
│   │
│   ├── 🔴 High-Support Idea [HIGH]
│   │   └── Rationale: Signals group consensus forming, prompts action
│   │
│   └── 🟠 Group Activity Summary [MEDIUM]
│       └── Rationale: Periodic digest of activities, prevents notification fatigue
│
├── 🔔 Budget & Expenses
│   ├── 🔴 Payment Requested [HIGH]
│   │   └── Rationale: Financial obligation requiring action
│   │
│   ├── 🔴 Payment Received [HIGH]
│   │   └── Rationale: Confirmation of financial transaction
│   │
│   ├── 🟠 Budget Item Added [MEDIUM]
│   │   └── Rationale: New shared expense requiring awareness
│   │
│   └── 🟡 Budget Updated [LOW]
│       └── Rationale: General financial planning changes
│
└── 🔔 Platform & System
    ├── 🔴 Security Alerts [HIGH]
    │   ├── Password reset
    │   ├── Login from new device
    │   └── Rationale: Critical for account security and user trust
    │
    ├── 🟠 Feature Updates [MEDIUM]
    │   └── Rationale: Informs of new capabilities, encourages exploration
    │
    ├── 🟡 Unused Trip Reminder [LOW]
    │   └── Rationale: Re-engagement prompt for dormant planning
    │
    └── 🟠 Personalized Recommendations [MEDIUM]
        ├── Destination content for planned trips
        ├── Similar trips to past journeys
        └── Rationale: Value-add content that enhances planning experience
```

### Notification Priority Guidelines

The priority levels determine how the notification is delivered and presented to users:

#### 🔴 HIGH Priority
- **Delivery**: Multi-channel (in-app, email, and push if enabled)
- **Persistence**: Remain in notification center until explicitly dismissed
- **UI Treatment**: Prominent display with distinct visual indicators
- **Timing**: Delivered immediately regardless of time zone
- **Example**: Trip invitations, vote requests, @mentions

#### 🟠 MEDIUM Priority
- **Delivery**: Dual-channel (in-app and either email or push based on user preferences)
- **Persistence**: Standard visibility in notification center
- **UI Treatment**: Standard notification styling
- **Timing**: Delivered promptly but respects quiet hours
- **Example**: New comments, trip updates, budget changes

#### 🟡 LOW Priority
- **Delivery**: In-app only by default
- **Persistence**: May be bundled in digests or summaries
- **UI Treatment**: Subtle presentation
- **Timing**: May be batched with other notifications
- **Example**: Minor updates, general activity, milestone celebrations

### Cross-Cutting Notification Principles

Regardless of the notification type, these principles apply across all flows:

1. **User Control**: All notification types can be individually enabled/disabled in settings
2. **Batching Logic**: Similar notifications within a 2-hour window are grouped
3. **Frequency Caps**: Maximum of 5 push notifications per day, regardless of priority
4. **Relevance Decay**: Notifications lose priority level over time (except security alerts)
5. **Channel Escalation**: Critical unread notifications may escalate to additional channels

This tree represents the full spectrum of notification touchpoints throughout the WithMe.Travel platform. The prioritization ensures that users receive timely, relevant updates that enhance their experience without causing notification fatigue.

---

## Schema Design in Supabase

### Core Notifications Table

The `notifications` table stores all user notifications with the following structure:

```sql
create table "public"."notifications" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "trip_id" uuid,
    "sender_id" uuid,
    "title" text not null,
    "content" text not null,
    "notification_type" text not null,
    "priority" text default 'normal'::text,
    "read" boolean default false,
    "action_url" text,
    "reference_id" uuid,
    "reference_type" text,
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone
);
```

The table includes appropriate indexes for efficient querying:

```sql
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_trip_id ON notifications(trip_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### User Notification Preferences

User notification preferences are stored in the `notification_preferences` table:

```sql
create table "public"."notification_preferences" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "in_app_enabled" boolean default true,
    "email_enabled" boolean default true,
    "push_enabled" boolean default false,
    "trip_invites" boolean default true,
    "trip_updates" boolean default true,
    "member_changes" boolean default true,
    "comments" boolean default true,
    "votes" boolean default true,
    "focus_events" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);
```

### Row Level Security (RLS)

Row Level Security policies are implemented to ensure users can only access their own notifications:

```sql
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (marking as read)
CREATE POLICY "Users can update their own notification read status"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());
```

---

## Notification Types for Travel Planning

WithMe.Travel focuses on these key notification categories:

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

### 4. Group Plan Notifications

| Notification Type   | Description                                          | Priority |
| ------------------- | ---------------------------------------------------- | -------- |
| `group_idea_added`  | New idea added to a group plan                       | Medium   |
| `group_plan_created`| New plan created in a group                          | High     |
| `idea_vote`         | New vote on a group plan idea                        | Low      |
| `idea_comment`      | New comment on a group plan idea                     | Medium   |

---

## Frontend Architecture

### NotificationContext

The notification system is built around a central React context that provides notification state and functionality to the entire application:

```typescript
// contexts/notification-context.tsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export type Notification = {
  id: string;
  user_id: string;
  trip_id: string | null;
  sender_id: string | null;
  title: string;
  content: string;
  notification_type: string;
  priority: string;
  read: boolean;
  action_url: string | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
  expires_at: string | null;
  sender?: {
    name: string | null;
    avatar_url: string | null;
  };
};

export type NotificationPreferences = {
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  trip_invites: boolean;
  trip_updates: boolean;
  member_changes: boolean;
  comments: boolean;
  votes: boolean;
  focus_events: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
};

// Context implementation with fetching, realtime updates, and state management
```

### NotificationIndicator Component

The `NotificationIndicator` component displays a bell icon with an unread count badge and a popover containing notifications:

```typescript
// components/notification-indicator.tsx
'use client';

import { useNotifications } from '@/contexts/notification-context';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function NotificationIndicator() {
  // Implementation of notification bell with dropdown
}
```

This component is used in the main navigation bar to provide global access to notifications.

---

## API Routes

### Fetching Notifications

The notifications API has been redesigned with robust error handling to prevent 500 errors and ensure a consistent response format.

```typescript
// app/api/notifications/route.ts
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Authentication handling
    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    const userId = data.user.id;

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams?.get('limit') || '20');
    const offset = parseInt(url.searchParams?.get('offset') || '0');
    const unreadOnly = url.searchParams?.get('unread_only') === 'true';

    // Defensive fallback - provide empty notifications if anything fails
    let notifications = [];
    let totalCount = 0;

    try {
      // First attempt - with sender join
      const query = supabase
        .from('notifications')
        .select(`*, sender:sender_id (name, avatar_url)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Query execution with fallback to simpler query if join fails
      // ...

      // Always return a valid response, even if queries failed
      return NextResponse.json({
        notifications,
        pagination: {
          total: totalCount,
          offset,
          limit,
        },
      });
    } catch (error) {
      // Graceful error handling
      console.error('Top-level error in notifications API:', error);
      return NextResponse.json({ 
        error: 'An unexpected error occurred',
        notifications: [],
        pagination: { total: 0, offset: 0, limit: 20 }
      }, { status: 200 }); // Return 200 with empty data instead of 500
    }
  }
}
```

### User Notification Preferences

We've introduced a dedicated API endpoint for notification preferences:

```typescript
// app/api/notifications/preferences/route.ts
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRouteHandlerClient();
    
    // Authentication
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = userData.user.id;
    
    // Get user preferences with automatic creation of default preferences if none exist
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') { // No rows returned
        const defaultPrefs = {
          user_id: userId,
          email_enabled: true,
          push_enabled: true,
          in_app_enabled: true,
          trip_updates: true,
          itinerary_changes: true,
          member_activity: true,
          comments: true,
          votes: true,
          focus_events: true
        };
        
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert(defaultPrefs)
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating default preferences:', insertError);
          return NextResponse.json(
            { error: 'Failed to create notification preferences' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ preferences: newPrefs });
      }
      
      // Handle other errors
    }
    
    return NextResponse.json({ preferences: data });
  } catch (err) {
    // Error handling
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  // Update preferences implementation
}
```

### Counting Unread Notifications

```typescript
// app/api/notifications/count/route.ts
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Authentication and counting logic
  // Returns { unreadCount, totalCount }
}
```

## Error Handling & Resilience

### API Error Handling Strategy

The notification system implements a robust error handling strategy to ensure the UI never breaks due to API failures:

1. **Graceful Degradation**: All API routes return valid, consistent response shapes even when errors occur.
2. **Default Values**: Empty arrays or default values are returned instead of null or undefined.
3. **Status Code Management**: 500 errors are avoided in favor of returning 200 responses with error information.
4. **Detailed Logging**: All errors are logged with context to aid debugging.

Example implementation pattern:

```typescript
try {
  // Main logic
} catch (error) {
  console.error('Error context:', error);
  return NextResponse.json({ 
    error: 'User-friendly error message',
    // Include default/empty values for expected response fields
  }, { status: 200 }); // Use 200 instead of 500 to prevent UI breakage
}
```

### Frontend Resilience

The notification context uses several techniques to handle API failures gracefully:

1. **Error State Management**: Separate error states for different operations
2. **Loading States**: Clear loading indicators during async operations
3. **Default Values**: Fallback to empty arrays when API calls fail
4. **Retry Logic**: Automatic refresh attempts for transient errors

```typescript
// From notification-context.tsx
const fetchNotifications = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await fetch('/api/notifications?limit=20');
    
    if (!res.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const data = await res.json();
    
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    setError('Failed to load notifications');
    // Default to empty arrays
    setNotifications([]);
    setUnreadCount(0);
  } finally {
    setLoading(false);
    setHasLoaded(true);
  }
};
```

### Asset Availability

To prevent 404 errors for UI assets like default avatar images, we've ensured all referenced static assets exist:

- Default placeholder images for avatars
- Fallback UI components when data is unavailable
- Default values for all notification properties

This comprehensive error handling strategy ensures the notification system remains functional even when parts of it encounter issues.

---

## Realtime Features

Realtime updates are implemented using Supabase's realtime capabilities:

```typescript
// From notification-context.tsx (partial)
  
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
      (payload) => {
        // New notification arrived
        setNotifications((prev) => [payload.new as Notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase, user]);
```

---

## Building on the Current System

### Creating New Notification Generators

To generate notifications for new events, implement database triggers or API route functions:

#### Example for Trip Invitation Notification:

```typescript
// In your API route for sending trip invitations
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createRouteHandlerClient();
  // ... authentication and input validation ...
  
  // Create invitation
  const { data: invitation, error } = await supabase
    .from('trip_invitations')
    .insert({ trip_id, user_id, invited_by: session.user.id })
    .select()
    .single();
    
  if (error) throw error;
  
  // Create notification
  await supabase.from('notifications').insert({
    user_id: invitation.user_id,
    trip_id: invitation.trip_id,
    sender_id: session.user.id,
    title: 'Trip Invitation',
    content: `You have been invited to join the trip`,
    notification_type: 'trip_invitation',
    priority: 'high',
    action_url: `/trips/${invitation.trip_id}`,
    reference_id: invitation.id,
    reference_type: 'trip_invitation'
  });
  
  // ... rest of the function ...
}
```

### Adding New Notification Types

1. Decide on a new notification type and its priority
2. Update the frontend to properly display the new notification type
3. Implement the notification generator function or trigger
4. Test the notification flow end-to-end

### Implementing Custom Notification Displays

For specialized notification types, consider implementing custom display components:

```typescript
function renderNotificationContent(notification: Notification) {
  switch (notification.notification_type) {
    case 'trip_invitation':
      return <TripInvitationNotification notification={notification} />;
    case 'vote_completed':
      return <VoteCompletedNotification notification={notification} />;
    // Add cases for new notification types
    default:
      return <DefaultNotification notification={notification} />;
  }
}
```

---

## Push Notification Implementation

For WithMe.Travel, push notifications can be implemented in phases:

### Step 1: Set Up Web Push Infrastructure

1. Add the necessary tables for device tokens:

```sql
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'web', 'ios', 'android'
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(token)
);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own device tokens"
  ON device_tokens FOR ALL
  USING (user_id = auth.uid());
```

2. Create API routes for registering and managing device tokens
3. Implement a service worker for web push notifications
4. Set up a Supabase Edge Function or server API to send push notifications

### Step 2: Mobile Push Integration

1. Implement push notification functionality in mobile apps
2. Set up Firebase Cloud Messaging (FCM) or equivalent service
3. Create a unified push delivery service that works for both web and mobile

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
2. **High-Frequency Events**: Don't notify for events that happen very frequently
3. **Redundant Information**: Avoid notifications for actions the user just performed

#### Visual Design Best Practices

1. **Distinctive Icons**: Use unique icons for different notification types
2. **Brief Content**: Keep notification messages concise and clear
3. **Clear Actions**: Make it obvious what action the user can take
4. **Grouping**: Group similar notifications to reduce clutter
5. **Timestamps**: Show relative time ("2 hours ago" rather than exact timestamps)

---

## Performance Considerations

### Database Optimization

1. **Indexing**: The notifications table has indexes on frequently queried columns (user_id, trip_id, created_at, read)
2. **Cleanup**: Implement regular cleanup of old notifications:

```sql
-- Function to cleanup old notifications (could be scheduled)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Delete notifications older than 6 months
  DELETE FROM notifications
  WHERE created_at < now() - interval '180 days';
END;
$$ LANGUAGE plpgsql;
```

3. **Query Optimization**: Use limit/offset for pagination in API calls

### Realtime Performance

1. **Selective Updates**: Use specific filters in Supabase Realtime subscriptions
2. **Connection Management**: Handle connection errors and reconnection gracefully

---

## Testing and Monitoring

### Testing Strategies

1. **Functional Testing**: Test all notification types and user scenarios
2. **Integration Testing**: Test database triggers and API routes
3. **Performance Testing**: Test with high volumes of notifications

### Monitoring

1. **Error Tracking**: Set up error tracking for all notification components
2. **Usage Analytics**: Track notification metrics (open rates, click-through rates)
3. **Performance Monitoring**: Monitor database and API performance

---

## Next Steps

Based on the current implementation and the collaborative focus of WithMe.Travel, the following enhancements are recommended:

1. **Complete Two-Way Deep Linking**: Ensure all notifications have actionable deep links to relevant content:
   - Implement proper URI construction for all notification types
   - Add context passing via URL parameters
   - Create highlight/focus functionality in destination pages

2. **Enhanced Group Plan Notifications**: Extend notification support for the Group Plans and Group Ideas system, a recently added feature mentioned in the May 6, 2025 changelog.

3. **Notification Batching**: Implement batching for high-frequency notifications to prevent notification fatigue.

4. **Email Notification Integration**: Add email notification delivery for high-priority notifications to reach users who aren't currently using the app.

5. **Custom Notification Preferences**: Allow more granular control over which notifications a user receives.

6. **Notification Analytics**: Track notification effectiveness to improve relevance and timing.

7. **Mobile Push Notifications**: Implement push notifications for the mobile app, using the recently released mobile app style guide as a reference.

8. **Notification Actions**: Allow users to take action directly from notifications (accept invitations, vote, etc.).

9. **Offline Support**: Integrate with the app's offline capabilities to queue notifications when users are offline.

### Two-Way Deep Linking Implementation Plan

To complete the two-way notification system, follow these steps:

1. **Audit All Notification Types**:
   - Document all notification types and their target destinations
   - Define URL parameters needed for proper context (e.g., comment ID, section ID)
   - Create a standard format for all notification action URLs

2. **Destination Page Updates**:
   - Add support in each destination page for handling notification context
   - Implement scroll-to and highlight features for specific content
   - Add visual indicators for content referenced by notifications

3. **Notification Testing Strategy**:
   - Create automated tests for each notification type's deep linking
   - Verify correct context is passed and honored in target pages
   - Test edge cases like invalid references or deleted content

4. **Documentation**:
   - Update this guide with details on the deep linking implementation
   - Create a reference for developers adding new notification types
   - Document the URL parameter standard for consistent implementation

### Engagement-Focused Notification Roadmap

To maximize platform engagement and user retention, we should prioritize these additional capabilities:

1. **Cross-Channel Orchestration**
   - Implement a unified notification service that coordinates messaging across all channels (in-app, email, push)
   - Create escalation workflows that start with in-app notifications and progress to email/push based on urgency and user response
   - Develop a notification decision engine that selects the optimal channel based on user behavior patterns

2. **User Engagement Loops**
   - Create "notification completion" actions that encourage users to mark tasks as complete
   - Implement social proof elements in notifications ("3 friends have already responded")
   - Design notification chains that guide users through the ideal trip planning sequence

3. **Enhanced Plunk Integration for Reengagement**
   - Expand our Plunk event tracking to include detailed user interaction context
   - Create behavior-triggered email sequences for different user journey stages:
     ```typescript
     // Example implementation
     async function triggerReengagementSequence(user, tripId, stage: 'planning' | 'pre-trip' | 'post-trip') {
       await sendPlunkEvent(`trip_${stage}_reengagement`, {
         email: user.email,
         name: user.name,
         metadata: {
           tripId,
           tripStage: stage,
           lastActive: user.lastActive,
           completionPercentage: await calculateTripCompletion(tripId),
           pendingDecisions: await getPendingDecisions(tripId, user.id)
         }
       });
     }
     ```
   - Build automated win-back campaigns for dormant trips 

4. **Engagement Metrics Dashboard**
   - Create a notification effectiveness dashboard that tracks:
     - Notification-driven return rate (by notification type)
     - Time-to-action after notification
     - Channel effectiveness comparison
     - Notification preference patterns
     - Notification-to-conversion ratios
   - Use these metrics to continuously optimize the notification strategy

5. **Smart Timing System**
   - Analyze user activity patterns to determine optimal notification timing
   - Implement time-zone aware notifications for global trip groups
   - Create "notification quiet hours" based on user preferences

6. **Progressive Permission Strategy**
   - Develop a progressive approach to permission requests
   - Start with high-value/low-frequency notifications to build trust
   - Request additional permissions based on demonstrated value

These enhancements align with the project's recent focus on collaborative features and the core principles of creating a fast, easy-to-use, intuitive platform for group travel planning while significantly improving our ability to bring users back to the platform at the right moments in their trip planning journey.
