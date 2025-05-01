# Focus Mode Feature Documentation

## Overview

Focus Mode is a collaborative tool in withme.travel that enables real-time coordination during trip planning. The feature allows users to indicate which sections of a trip they're actively working on, promoting clear communication and reducing the chance of conflicting edits.

## Key Features

- **Section-based Focus**: Users can focus on specific trip sections (itinerary, budget, notes, etc.)
- **Presence Awareness**: Shows which team members are actively working on each section
- **Real-time Updates**: Changes to focus sessions are instantly visible to all connected users
- **Expiration Mechanism**: Sessions automatically expire after 30 minutes to prevent stale sessions
- **Permission-Aware**: Only users with edit permissions can start or join focus sessions

## Technical Architecture

### Core Components

1. **`FocusMode`** (`components/trips/focus-mode.tsx`)

   - Primary component that interfaces with the focus session context
   - Displays active focus sessions and participants
   - Provides UI for joining or ending sessions

2. **`ClientFocusMode`** (`components/trips/client-focus-mode.tsx`)

   - Client-side wrapper for the FocusMode component
   - Handles client-side state and interactions

3. **`FocusToggle`** (`components/trips/focus-toggle.tsx`)

   - Toggle button component for showing/hiding the focus mode UI
   - Typically positioned in the top-right corner of trip pages

4. **`TripFocusContainer`** (`components/trips/trip-focus-container.tsx`)
   - Container component that simplifies integration with trip pages
   - Handles logic for showing/hiding focus mode based on user permissions
   - Wraps child components with necessary context providers

### Data Layer

1. **`FocusSessionContext`** (`contexts/focus-session-context.tsx`)

   - React context that manages focus session state
   - Provides hooks and methods for interacting with focus sessions
   - Handles real-time updates using Supabase subscriptions

2. **`FocusSessionService`** (`lib/services/focus-session-service.ts`)
   - Service layer for focus session API interactions
   - Handles CRUD operations for focus sessions
   - Manages session participants

### Integration Points

1. **Trip Pages**: Focus Mode integrates with trip pages through `TripFocusContainer`
2. **Itinerary Sections**: Section-specific focus controls in itinerary components
3. **Real-time Presence**: Integrates with the broader presence system to show active users

## Component Usage Guide

### Basic Integration (Recommended)

The simplest way to add Focus Mode to a trip page is using the `TripFocusContainer`:

```tsx
import { TripFocusContainer } from '@/components/trips/trip-focus-container';

export default function TripPage({ tripId, canEdit }) {
  return (
    <TripFocusContainer tripId={tripId} canEdit={canEdit}>
      {/* Trip page content */}
    </TripFocusContainer>
  );
}
```

This container:

- Wraps children with the FocusSessionProvider
- Renders the FocusToggle button in the top-right corner
- Shows the FocusMode UI when activated
- Respects user permissions (only shows for users with edit access)

### Manual Integration

For more control, you can integrate the components manually:

```tsx
import { FocusSessionProvider } from '@/contexts/focus-session-context';
import { ClientFocusMode } from '@/components/trips/client-focus-mode';
import { FocusToggle } from '@/components/trips/focus-toggle';
import { useState } from 'react';

export default function CustomTripPage({ tripId, canEdit }) {
  const [showFocusMode, setShowFocusMode] = useState(false);

  return (
    <FocusSessionProvider tripId={tripId}>
      <div className="relative">
        {canEdit && (
          <FocusToggle
            show={showFocusMode}
            onToggle={() => setShowFocusMode(!showFocusMode)}
            className="absolute top-4 right-4"
          />
        )}

        {/* Trip content */}

        {showFocusMode && canEdit && <ClientFocusMode tripId={tripId} />}
      </div>
    </FocusSessionProvider>
  );
}
```

### Adding Focus Controls to Sections

To add focus controls to specific sections (e.g., the itinerary):

```tsx
import { useFocusSession } from '@/contexts/focus-session-context';
import { Button } from '@/components/ui/button';

export function ItinerarySection() {
  const { activeFocusSession, startFocusSession, joinFocusSession, loading } = useFocusSession();

  const isItineraryFocused = activeFocusSession?.section_path === 'itinerary';
  const canJoin = isItineraryFocused && !activeFocusSession.has_joined;

  return (
    <div className="itinerary-section">
      <div className="flex items-center justify-between">
        <h2>Itinerary</h2>

        {!isItineraryFocused && !loading && (
          <Button size="sm" variant="outline" onClick={() => startFocusSession('itinerary')}>
            Focus on Itinerary
          </Button>
        )}

        {canJoin && (
          <Button size="sm" variant="outline" onClick={() => joinFocusSession(activeFocusSession)}>
            Join Focus Session
          </Button>
        )}
      </div>

      {/* Itinerary content */}
    </div>
  );
}
```

## User Experience Guidelines

To maintain a consistent UX across the application:

1. **Optional Usage**: Focus Mode is always optional and never required for basic trip planning
2. **Default Hidden**: Focus Mode UI is hidden by default and shown via toggle button
3. **Permission-Based Visibility**: Only show Focus Mode to users with edit permissions
4. **Context-Aware Display**: Focus toggles should appear near the content they affect

### UI Placement

- Place the main focus toggle in the top-right corner of trip pages
- Section-specific focus controls should be in the section header
- The focus mode panel should slide in from the right side
- Use consistent styling for focus-related UI elements

### Visual Styling

- Use the coffee cup icon (☕) for focus-related controls
- Apply a subtle highlight effect to sections that have active focus sessions
- Show participant avatars with a green "active" indicator
- Use tooltips to provide additional context for focus controls

## Database Schema

Focus Mode requires two database tables:

### focus_sessions Table

```sql
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  section_path TEXT NOT NULL,
  created_by_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Constraints
  UNIQUE(trip_id, section_path),

  -- Ensure expiration is in the future
  CONSTRAINT expires_in_future CHECK (expires_at > created_at)
);

-- Index for efficient lookups
CREATE INDEX focus_sessions_trip_id_idx ON focus_sessions(trip_id);
CREATE INDEX focus_sessions_expires_at_idx ON focus_sessions(expires_at);
```

### focus_session_participants Table

```sql
CREATE TABLE focus_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES focus_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate participants
  UNIQUE(session_id, user_id)
);

-- Index for efficient lookups
CREATE INDEX focus_session_participants_session_id_idx ON focus_session_participants(session_id);
```

## Implementation Examples

### Focus Mode Demo Component

```tsx
// components/trips/focus-mode-demo.tsx
import { useState } from 'react';
import { useFocusSession } from '@/contexts/focus-session-context';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export function FocusModeDemo() {
  const {
    activeFocusSession,
    loading,
    error,
    startFocusSession,
    joinFocusSession,
    endFocusSession,
  } = useFocusSession();

  const [section, setSection] = useState('itinerary');

  if (loading) {
    return <div>Loading focus session data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  const handleStartSession = async () => {
    try {
      await startFocusSession(section);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Focus Mode Demo</h3>

      {!activeFocusSession ? (
        <div>
          <div className="mb-4">
            <label className="block mb-2">Section to focus on:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="itinerary">Itinerary</option>
              <option value="budget">Budget</option>
              <option value="notes">Notes</option>
              <option value="general">General Info</option>
            </select>
          </div>

          <Button onClick={handleStartSession}>Start Focus Session</Button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h4 className="font-medium">Active Focus Session</h4>
            <p>
              Section: <span className="font-bold">{activeFocusSession.section_path}</span>
            </p>
            <p>Started: {formatDistanceToNow(new Date(activeFocusSession.created_at))} ago</p>
            <p>Expires: {formatDistanceToNow(new Date(activeFocusSession.expires_at))}</p>
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Participants</h4>
            <div className="flex gap-2">
              {activeFocusSession.participants.map((participant) => (
                <div key={participant.id} className="flex flex-col items-center">
                  <Avatar
                    src={participant.avatar_url || undefined}
                    alt={participant.name}
                    className="w-10 h-10"
                  />
                  <span className="text-sm mt-1">{participant.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {!activeFocusSession.has_joined && (
              <Button onClick={() => joinFocusSession(activeFocusSession)} variant="outline">
                Join Session
              </Button>
            )}

            {activeFocusSession.created_by_id === activeFocusSession.current_user_id && (
              <Button onClick={endFocusSession} variant="destructive">
                End Session
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Performance Considerations

- **Efficient Real-time Updates**: The focus session context optimizes subscriptions to minimize network traffic
- **Minimal Re-renders**: Components only re-render when relevant focus session data changes
- **Lazy Loading**: The Focus Mode UI components are only loaded when the toggle is activated
- **Session Cleanup**: Expired sessions are automatically cleaned up by a database job

## Testing Scenarios

When testing Focus Mode, verify these key scenarios:

1. **Multiple Users**: Test with multiple users simultaneously accessing the same trip
2. **Permission Scenarios**: Test with users who have different permission levels
3. **Error Cases**: Test behavior when network errors or permission issues occur
4. **Session Expiration**: Verify that sessions properly expire after 30 minutes

### Test Cases

- User can start a focus session on a specific section
- Other users can see active focus sessions in real-time
- Users can join existing focus sessions
- Creator can end a focus session
- Sessions automatically expire after the timeout period
- Only users with edit permissions can see/use focus mode
- Multiple users can be active in the same focus session

## Common Troubleshooting

1. **Focus Mode Toggle Not Visible**

   - **Cause**: User doesn't have edit permissions or context provider is missing
   - **Solution**: Verify permissions and ensure the page is wrapped with TripFocusContainer

2. **Real-time Updates Not Working**

   - **Cause**: Supabase real-time subscription issues or network problems
   - **Solution**: Check network connectivity and ensure Supabase is properly configured

3. **Unable to Start Focus Session**

   - **Cause**: Another session might already be active for that section
   - **Solution**: Look for existing sessions and join them instead of creating new ones

4. **Participants Not Showing Up**
   - **Cause**: Database or permission issues with participant tables
   - **Solution**: Check database configuration and user permissions

## Future Enhancements

1. **Improved Presence Indicators**: Show typing indicators and cursor positions
2. **Chat Integration**: Add section-specific chat for participants in a focus session
3. **History Tracking**: Record who focused on what and when for analytics
4. **Extended Session Duration**: Allow extending sessions beyond the default timeout
5. **Custom Focus Areas**: Enable defining custom sections to focus on beyond the standard ones

## References

- [Focus Session Context Documentation](../focus-session-context.md)
- [Trip Collaboration Features](./trip-collaboration.md)
- [Real-time Features](./real-time-features.md)
