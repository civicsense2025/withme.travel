# Real-Time Collaboration Features in WithMe.travel

This document provides an overview of the real-time collaboration features implemented in WithMe.travel, including presence indicators, cursor tracking, and collaborative editing.

## Component Overview

The collaboration system consists of the following key components:

### Core Components

1. **PresenceProvider** (`components/presence/presence-context.tsx`)
   - React context provider that manages user presence state
   - Wraps sections of the application where collaboration is required
   - Provides presence data and methods to child components

2. **usePresence Hook** (`hooks/use-presence.ts`)
   - Core logic for managing real-time presence
   - Handles connection to Supabase Realtime
   - Manages user status, cursor position, and editing state
   - Provides methods for updating presence information

### UI Components

3. **PresenceIndicator** (`components/presence/presence-indicator.tsx`)
   - Displays avatars of active users with status indicators
   - Shows what users are editing
   - Provides tooltips with additional user information

4. **CursorTracker** (`components/presence/cursor-tracker.tsx`)
   - Displays remote users' cursor positions in real-time
   - Includes a toggle for showing/hiding cursors
   - Shows tooltips with user information on hover

5. **Cursor** (`components/presence/cursor.tsx`)
   - Individual cursor component for a remote user
   - Displays cursor with user's unique color
   - Shows tooltip with user name and status on hover

6. **UserStatusBadge** (`components/presence/user-status-badge.tsx`)
   - Small colored indicator showing user status
   - Green for online, yellow for away, gray for offline, blue for editing

7. **AvatarGroup** (`components/ui/avatar-group.tsx`)
   - Displays multiple user avatars with overlap
   - Shows additional count for hidden avatars
   - Consistent styling for presence visualization

8. **FocusSession** (`components/presence/focus-session.tsx`)
   - Demonstration component showcasing collaborative features
   - Implements cursor tracking and real-time presence
   - Provides a shared text area for collaborative editing

## Integration with Supabase Realtime

The collaboration system uses Supabase Realtime for presence tracking:

1. **Presence Channels**
   - Each collaborative area (like a trip) has a dedicated presence channel
   - Users join the channel when they enter the area
   - Users' status, cursor position, and editing state are broadcasted to all channel members

2. **Real-time Updates**
   - Status changes are reflected immediately across all connected clients
   - Cursor positions are updated with throttling to prevent overwhelming the network
   - Editing status prevents conflicts when multiple users are collaborating

3. **Offline Handling**
   - System detects user inactivity and sets status to "away"
   - Handles disconnections gracefully with reconnection attempts
   - Cleans up presence data when users leave

## Status Types

The system defines several presence statuses:

- **Online**: User is actively using the application
- **Away**: User has been inactive for a period (default: 5 minutes)
- **Offline**: User has disconnected from the presence system
- **Editing**: User is actively editing a specific item

## User Experience Features

1. **Cursor Tracking**
   - Real-time visualization of where other users are on the page
   - Opt-in feature that respects user preferences
   - Visual indications of who is editing what

2. **Editing Indicators**
   - Shows what item each user is currently editing
   - Prevents editing conflicts
   - Provides visual feedback when multiple users are working together

3. **Accessibility**
   - Status changes are announced to screen readers
   - All components include proper ARIA attributes
   - Color choices follow accessibility guidelines

## How to Use the Components

### Basic Presence Setup

Wrap any collaborative section with the `PresenceProvider`:

```tsx
import { PresenceProvider } from '@/components/presence/presence-context';

function CollaborativePage() {
  return (
    <PresenceProvider tripId="trip-123" trackCursor={true}>
      {/* Collaborative components here */}
    </PresenceProvider>
  );
}
```

### Displaying Active Users

Show who's currently active:

```tsx
import { PresenceIndicator } from '@/components/presence/presence-indicator';
import { usePresenceContext } from '@/components/presence/presence-context';

function ActiveUsersSection() {
  const { activeUsers } = usePresenceContext();
  
  return (
    <div>
      <h3>Active Users</h3>
      <PresenceIndicator 
        users={activeUsers} 
        showStatus={true}
      />
    </div>
  );
}
```

### Cursor Tracking

Enable cursor tracking in a specific area:

```tsx
import { CursorTracker } from '@/components/presence/cursor-tracker';

function CollaborativeEditor() {
  return (
    <div className="relative">
      <CursorTracker />
      {/* Editor content */}
    </div>
  );
}
```

### Marking Items as Being Edited

Prevent editing conflicts by showing what's being edited:

```tsx
import { EditingWrapper } from '@/components/presence/presence-context';

function EditableItem({ itemId, children }) {
  return (
    <EditingWrapper itemId={itemId}>
      {children}
    </EditingWrapper>
  );
}
```

### Complete Collaboration Example

Create a fully collaborative area:

```tsx
import { FocusSession } from '@/components/presence/focus-session';
import { PresenceProvider } from '@/components/presence/presence-context';

function CollaborationPage() {
  return (
    <div className="container">
      <h1>Team Collaboration</h1>
      
      <PresenceProvider tripId="team-project" trackCursor={true}>
        <FocusSession 
          sessionId="project-notes"
          title="Project Notes"
          description="Collaborate on project documentation"
        />
      </PresenceProvider>
    </div>
  );
}
```

## Performance Considerations

1. **Throttling and Debouncing**
   - Cursor updates are debounced to prevent overwhelming the network
   - Presence updates are throttled to reduce real-time database load

2. **Selective Rendering**
   - Components only render what's necessary based on active users
   - Status updates only trigger re-renders when relevant

3. **Cleanup**
   - Presence data is cleaned up when users leave
   - Subscriptions are properly managed to prevent memory leaks

## Future Improvements

1. **Conflict Resolution**
   - More sophisticated conflict resolution for simultaneous edits
   - Operational transformation or CRDT for text collaboration

2. **Enhanced Visualization**
   - User activity heatmaps
   - Visual history of recent edits
   - Animation improvements for smoother cursor tracking

3. **Offline Support**
   - Local storage of edits when offline
   - Syncing when connection is restored

## Demo

A demonstration of these features can be found in the Design Sandbox:

```
/app/design-sandbox
```

This page showcases all the collaborative features working together in a real-world scenario. 