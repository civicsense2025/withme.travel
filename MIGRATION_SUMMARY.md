# Notification Deep Linking & User Role System Migration

## Overview

This migration implements two major components:

1. **Two-Way Notification Integration**: A comprehensive system for creating deep links in notifications that direct users to specific content with highlighting and tracking.
2. **User Role System**: A flexible role-based permission system using database enums instead of a simple is_admin boolean.

## Notification Deep Linking

### Features Implemented

1. **Deep Link Generation Utility**

   - Created standardized utility for notification URL generation
   - Handles parameter encoding and deep linking to specific content
   - Supports all notification types with appropriate routes

2. **Context-Aware Highlighting**

   - Added notification context extraction from URLs
   - Implemented highlight effect for notification targets
   - Automatic scrolling to relevant content

3. **Analytics Tracking**

   - Click-through tracking for notifications
   - Impression tracking when notifications are viewed
   - Analytic aggregation for measuring engagement

4. **Database Schema Updates**
   - Added notification_analytics table
   - Created tracking functions for notification events
   - Implemented RLS policies for security

### Files Created/Modified

- `utils/notification-deeplinks.ts` - Core utility for generating deep links and tracking interactions
- `app/api/notifications/click/route.ts` - API endpoint for tracking notification clicks
- `app/api/notifications/analytics/route.ts` - API for tracking impressions and retrieving analytics
- `app/api/notifications/deep-link/route.ts` - API endpoint for generating deep links
- `app/trips/[tripId]/notification-context-handler.tsx` - Component for handling notification context in trip pages
- `components/notification-highlight.tsx` - Component for highlighting elements from notifications
- `components/notification-indicator.tsx` - Updated to use tracking functionality
- `supabase/migrations/20240510000000_notification_deep_links.sql` - Database migration for analytics tables

### Usage

#### Creating Deep Links in Notifications

```typescript
import { createDeepLink } from '@/utils/notification-deeplinks';

// Create deep link for a notification
const notificationUrl = createDeepLink('trip_update', {
  tripId: '123',
  referenceId: '456',
  highlight: true,
  notificationId: '789',
});

// Use this URL in notification objects
const notification = {
  title: 'Trip Updated',
  content: 'Your trip to Paris was updated',
  action_url: notificationUrl,
};
```

#### Handling Notification Context in Pages

Add the NotificationContextHandler to your page component:

```tsx
import { NotificationContextHandler } from './notification-context-handler';

export function TripPageWrapper({ tripId }) {
  return (
    <>
      <NotificationContextHandler tripId={tripId} />
      <TripContent tripId={tripId} />
    </>
  );
}
```

#### Highlighting Elements from Notifications

Use the NotificationHighlight component to wrap content that should be highlighted:

```tsx
import { NotificationHighlight } from '@/components/notification-highlight';
import { useNotificationHighlighting } from './notification-context-handler';

function ItineraryItem({ item }) {
  const { shouldHighlight, highlightId } = useNotificationHighlighting();

  return (
    <NotificationHighlight
      id={`item-${item.id}`}
      highlightId={highlightId}
      className="rounded-md p-4"
    >
      {/* Item content */}
    </NotificationHighlight>
  );
}
```

#### Tracking Notification Interactions

```typescript
import {
  trackNotificationClick,
  trackNotificationImpression,
} from '@/utils/notification-deeplinks';

// Track when a notification is clicked
async function handleNotificationClick(notificationId) {
  await trackNotificationClick(notificationId);
  // Navigate to the notification URL
}

// Track when a notification is viewed
useEffect(() => {
  if (notificationId) {
    trackNotificationImpression(notificationId);
  }
}, [notificationId]);
```

## User Role System

### Features Implemented

1. **Role Enum Type**

   - Created `user_role` enum in the database
   - Defined five role types: user, admin, moderator, support, guest
   - Added migration to convert existing role columns

2. **Permission System**

   - Implemented role-permission mapping
   - Created utility functions for permission checking
   - Added role display names for UI

3. **Profile UI Updates**
   - Added role badge to user profile page
   - Display friendly role names

### Files Created/Modified

- `types/users.ts` - Defined role types, permissions, and utility functions
- `supabase/migrations/20240510000000_notification_deep_links.sql` - Added enum type and table alterations
- `app/settings/page.tsx` - Updated to display user role

### Usage

#### Checking User Permissions

```typescript
import { hasPermission } from '@/types/users';

// Check if user can perform an action
function AdminOnlyButton({ userRole }) {
  if (!hasPermission(userRole, 'canManageUsers')) {
    return null;
  }

  return <Button>Admin Action</Button>;
}
```

#### Getting Role Display Names

```typescript
import { getRoleDisplayName } from '@/types/users';

function UserBadge({ role }) {
  return (
    <Badge variant="outline">
      {getRoleDisplayName(role)}
    </Badge>
  );
}
```

## Database Migration

The migration file (`20240510000000_notification_deep_links.sql`) handles:

1. Creating the notification_analytics table
2. Creating the user_role enum type
3. Converting existing roles to use the enum
4. Adding analytics functions for tracking and reporting
5. Setting up proper RLS policies

To apply the migration:

```bash
pnpm supabase migration up
```

## Testing Considerations

1. Verify deep links work for all notification types
2. Test analytics tracking captures all events
3. Ensure highlighting works properly on target pages
4. Verify role permissions function correctly
5. Test migration on a staging database before production
