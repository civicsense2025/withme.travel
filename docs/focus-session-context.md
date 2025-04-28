# Focus Session Context Documentation

## Overview

The Focus Session Context provides a comprehensive system for collaborative trip planning, allowing users to coordinate their efforts by indicating which trip sections they're actively working on. The context manages the creation, joining, and ending of focus sessions while providing real-time updates across all connected clients.

## Core Components

- **FocusSessionProvider**: Context provider that manages focus session state
- **useFocusSession**: Hook for consuming focus session data and actions
- **FocusMode**: UI component for displaying and interacting with focus sessions
- **ClientFocusMode**: Client-side wrapper for the FocusMode component
- **FocusToggle**: Simple toggle button to show/hide focus mode
- **TripFocusContainer**: Container component for easy integration with trip pages

## Data Model

The Focus Session data model includes:

```typescript
interface FocusSession {
  id: string;
  trip_id: string;
  section_path: string;
  created_by_id: string;
  created_at: string;
  expires_at: string;
  current_user_id?: string; // ID of current user
  has_joined?: boolean; // Whether current user has joined
  joined_at?: string; // When the current user joined
  participants: FocusSessionParticipant[];
}

interface FocusSessionParticipant {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  joined_at: string;
}
```

## Installation and Setup

1. Wrap your trip-related components with the `FocusSessionProvider`:

```tsx
import { FocusSessionProvider } from "@/contexts/focus-session-context";

function TripPage({ tripId, children }) {
  return (
    <FocusSessionProvider tripId={tripId}>
      {children}
    </FocusSessionProvider>
  );
}
```

2. For simpler integration, you can use the `TripFocusContainer` component:

```tsx
import { TripFocusContainer } from "@/components/trips/trip-focus-container";

function TripPage({ tripId, canEdit, children }) {
  return (
    <TripFocusContainer tripId={tripId} canEdit={canEdit}>
      {children}
    </TripFocusContainer>
  );
}
```

## API Reference

### FocusSessionContext

The context provides the following values:

```typescript
interface FocusSessionContextType {
  // State
  activeFocusSession: FocusSession | null;
  loading: boolean;
  error: Error | null;
  
  // Actions
  startFocusSession: (sectionPath: string) => Promise<void>;
  joinFocusSession: (session: FocusSession) => Promise<void>;
  endFocusSession: () => Promise<void>;
  refreshFocusSession: () => Promise<void>;
}
```

### FocusMode Component Props

```typescript
interface FocusModeProps {
  tripId: string;
  className?: string;
}
```

### ClientFocusMode Component Props

```typescript
interface ClientFocusModeProps {
  tripId: string;
  className?: string;
}
```

### FocusToggle Component Props

```typescript
interface FocusToggleProps {
  show: boolean;
  onToggle: () => void;
  className?: string;
}
```

### TripFocusContainer Component Props

```typescript
interface TripFocusContainerProps {
  tripId: string;
  canEdit: boolean;
  children: React.ReactNode;
}
```

## Usage Examples

### Starting a Focus Session

```tsx
function ItinerarySection() {
  const { startFocusSession, activeFocusSession, loading } = useFocusSession();
  
  const handleStartFocus = async () => {
    try {
      await startFocusSession("itinerary");
      // Session started successfully
    } catch (error) {
      console.error("Failed to start focus session:", error);
    }
  };
  
  return (
    <div>
      <h2>Itinerary</h2>
      {!activeFocusSession && !loading && (
        <Button onClick={handleStartFocus}>Focus on Itinerary</Button>
      )}
      {/* Itinerary content */}
    </div>
  );
}
```

### Joining an Active Focus Session

```tsx
function TripSection() {
  const { activeFocusSession, joinFocusSession } = useFocusSession();
  
  // Check if there's an active session for this section that the user hasn't joined
  const canJoin = activeFocusSession?.section_path === "itinerary" && !activeFocusSession.has_joined;
  
  return (
    <div>
      {canJoin && (
        <div>
          <p>Someone is focusing on this section</p>
          <Button onClick={() => joinFocusSession(activeFocusSession)}>
            Join Focus Session
          </Button>
        </div>
      )}
    </div>
  );
}
```

### Ending a Focus Session

```tsx
function ActiveFocusIndicator() {
  const { activeFocusSession, endFocusSession } = useFocusSession();
  
  // Only the creator can end the session
  const isCreator = activeFocusSession?.created_by_id === activeFocusSession?.current_user_id;
  
  if (!activeFocusSession) return null;
  
  return (
    <div>
      <p>Currently focusing on: {activeFocusSession.section_path}</p>
      {isCreator && (
        <Button onClick={endFocusSession}>End Focus Session</Button>
      )}
    </div>
  );
}
```

## Integration with Trip Pages

The focus session functionality is fully integrated with trip pages using the `TripFocusContainer` component. This provides:

1. A toggle button in the top-right corner of the page
2. The focus mode UI panel when activated
3. Proper context wrapping for all child components

This simplified integration ensures consistent behavior across all trip-related pages while maintaining the flexibility of the underlying context.

### Integration Example

```tsx
// app/trips/[tripId]/page.tsx
import { TripFocusContainer } from "@/components/trips/trip-focus-container";
import { TripHeader } from "@/components/trips/trip-header";
import { TripItinerary } from "@/components/trips/trip-itinerary";

export default function TripPage({ params }) {
  const tripId = params.tripId;
  const canEdit = true; // Determined by permissions check
  
  return (
    <TripFocusContainer tripId={tripId} canEdit={canEdit}>
      <TripHeader tripId={tripId} />
      <TripItinerary tripId={tripId} />
      {/* Other trip sections */}
    </TripFocusContainer>
  );
}
```

## Real-time Updates

Focus session changes are synchronized in real-time across all clients using Supabase's real-time features. The context handles:

1. Subscribing to relevant channels when mounted
2. Processing incoming events (new sessions, participants joining, sessions ending)
3. Updating local state accordingly
4. Cleaning up subscriptions when unmounted

No additional setup is required for real-time functionality beyond using the `FocusSessionProvider`.

## Best Practices

### Loading States

Always check the `loading` state before rendering focus session-related UI to prevent flashing or incorrect states:

```tsx
const { loading, activeFocusSession } = useFocusSession();

if (loading) {
  return <LoadingSpinner />;
}

// Now it's safe to use activeFocusSession
```

### Error Handling

Handle errors gracefully to prevent disrupting the user experience:

```tsx
const { error, startFocusSession } = useFocusSession();

// Display error if present
{error && <ErrorBanner message={error.message} />}

// Handle errors in actions
const handleStartFocus = async () => {
  try {
    await startFocusSession("itinerary");
  } catch (error) {
    // Handle error locally if needed
  }
};
```

### Session Expiration

Focus sessions automatically expire after a set period (default: 30 minutes). Don't rely on sessions persisting indefinitely.

### UI Consistency

Maintain consistent UI patterns for focus-related functionality:
- Use the coffee cup icon for focus toggles
- Position toggles in the top-right corner of sections or pages
- Use consistent terminology ("Focus", "Join Session", "End Session")

## Troubleshooting

### Common Issues

1. **Focus session not updating in real-time**
   - Check if Supabase real-time is configured correctly
   - Ensure the current user has proper permissions
   - Verify network connectivity

2. **Cannot start a focus session**
   - Ensure the user has edit permissions for the trip
   - Check if there's already an active session for the selected section
   - Verify the API endpoint is functioning correctly

3. **Session not expiring properly**
   - Check server time synchronization
   - Verify the database cleanup job is running
   - Ensure the client's clock is accurate

## Limitations

- Only one active focus session per section is allowed at a time
- Focus sessions automatically expire after 30 minutes
- Users must manually join sessions; they are not automatically added
- Focus sessions are only available to users with edit permissions

## Future Improvements

Planned enhancements to the focus session system include:

1. **Extended session duration**: Allow extending sessions beyond the default timeout
2. **Typing indicators**: Show when participants are actively typing
3. **Section locking**: Optional soft-locking of sections during focus sessions
4. **Focus history**: Track historical focus sessions for analytics
5. **Custom focus areas**: Allow defining custom sections to focus on

## Related Components

### Focus Mode Components

The Focus Session Context is complemented by the following UI components:

1. **FocusMode**: The core UI component that displays focus session information and controls
   - Shows active sessions with participants, timers, and section information
   - Provides interface for starting new focus sessions
   - Displays join/end session controls based on user permissions

2. **ClientFocusMode**: Client-side wrapper for the FocusMode component
   - Wraps FocusMode with the FocusSessionProvider
   - Ensures proper context initialization in client components

3. **TripFocusContainer**: Container component that simplifies integration with trip pages
   - Provides the focus toggle in the trip UI
   - Conditionally renders focus components based on permissions

### Implementation Details

The focus session system uses Supabase for real-time updates:

```typescript
// Real-time subscription example
useEffect(() => {
  if (!supabase || !tripId) return;

  // Subscribe to focus session changes
  const subscription = supabase
    .channel('focus_session_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'focus_sessions',
        filter: `trip_id=eq.${tripId}`
      },
      () => {
        refreshSession();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'focus_session_participants'
      },
      () => {
        refreshSession();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, [supabase, tripId, refreshSession]);
```

## Trip Sections Integration

The focus session system integrates with predefined trip sections defined in the application constants:

```typescript
// Example of how trip sections are used in focus mode
const sectionName = TRIP_SECTIONS.find(s => s.id === activeFocusSession.section_path)?.name || 'Unknown Section';
```

Available sections include:
- Itinerary
- Budget
- Notes
- Manage
- Photos

When a user starts a focus session, they select which section they want to focus on, and other users are notified of this focus area.

## Component Usage Examples

### Basic Usage with ClientFocusMode

```tsx
import { ClientFocusMode } from "@/components/trips/client-focus-mode";

function TripHeader({ tripId }) {
  return (
    <div className="trip-header">
      <h1>Trip Details</h1>
      <div className="trip-focus-container">
        <ClientFocusMode tripId={tripId} />
      </div>
    </div>
  );
}
```

### Advanced Integration with Toggle

```tsx
import { useState } from 'react';
import { ClientFocusMode } from "@/components/trips/client-focus-mode";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

function TripPage({ tripId, canEdit }) {
  const [showFocusMode, setShowFocusMode] = useState(false);
  
  if (!canEdit) return null;
  
  return (
    <div className="trip-page">
      <div className="trip-header">
        <h1>Trip Details</h1>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowFocusMode(!showFocusMode)}
        >
          <Coffee className="h-4 w-4 mr-1" />
          {showFocusMode ? 'Hide Focus Mode' : 'Show Focus Mode'}
        </Button>
      </div>
      
      {showFocusMode && (
        <ClientFocusMode tripId={tripId} />
      )}
      
      {/* Rest of trip content */}
    </div>
  );
}
```

## Visual Styling Guidelines

To maintain consistent appearance across the application, Focus Mode components follow these visual guidelines:

1. **Active Session Card**:
   - Amber/yellow background for visibility
   - Badge with timer showing remaining time
   - Clear section identification
   - Compact participant list with avatars

2. **Creation UI**:
   - Section selector with dropdown
   - Primary action button with target icon
   - Clear spacing and alignment with other UI elements

3. **Join UI**:
   - Simple join button for non-participants
   - End button (X icon) only shown to session creator
   - Tooltip explanations for all interactive elements

Following these guidelines ensures that the Focus Mode components integrate seamlessly with the rest of the application's UI. 