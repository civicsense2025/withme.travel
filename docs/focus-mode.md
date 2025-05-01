# Focus Mode

## Overview

Focus Mode is a collaborative feature in withme.travel that enables team members to coordinate their trip planning activities in real-time. It provides visual cues about who is working on what section of a trip, helps reduce conflicts, and enhances the collaborative planning experience.

## Key Features

- **Section-based Focus**: Start focus sessions on specific trip sections (itinerary, budget, notes, etc.)
- **Presence Awareness**: See who's currently working on a particular section
- **Real-time Updates**: Join or leave sessions with automatic UI updates
- **Expiration Mechanism**: Sessions automatically expire after a period of inactivity
- **Permission-aware**: Respects user permissions and roles within trips

## Technical Architecture

The Focus Mode feature is built on several components:

1. **Core Components**:

   - `FocusMode`: Base component implementing the UI and core logic
   - `ClientFocusMode`: Client-side wrapper for the FocusMode component
   - `FocusToggle`: Toggle button for showing/hiding focus mode
   - `TripFocusContainer`: Container component for easy integration

2. **Data Layer**:

   - `FocusSessionContext`: Context provider for managing session state
   - Supabase real-time channels for live updates
   - Database tables for storing session information

3. **Integration Points**:
   - Trip pages
   - Itinerary planning sections
   - Budget management
   - Notes and documents

## Component Usage Guide

### Basic Integration

The simplest way to add Focus Mode to a trip page is with the `TripFocusContainer`:

```tsx
import { TripFocusContainer } from '@/components/trips/trip-focus-container';

export default function MyTripPage({ tripId, canEdit }) {
  return (
    <TripFocusContainer tripId={tripId} canEdit={canEdit}>
      {/* Your trip page content */}
    </TripFocusContainer>
  );
}
```

This provides:

- A toggle button in the top-right corner
- Proper context setup
- Focus mode UI when activated

### Manual Integration

For more control, you can integrate the components individually:

```tsx
'use client';

import { FocusSessionProvider } from '@/contexts/focus-session-context';
import { FocusToggle } from '@/components/trips/focus-toggle';
import { ClientFocusMode } from '@/components/trips/client-focus-mode';
import { useState } from 'react';

export default function CustomTripPage({ tripId, canEdit }) {
  const [showFocusMode, setShowFocusMode] = useState(false);

  return (
    <FocusSessionProvider tripId={tripId}>
      <div className="relative">
        {canEdit && (
          <FocusToggle show={showFocusMode} onToggle={() => setShowFocusMode(!showFocusMode)} />
        )}

        {/* Your trip page content */}

        {showFocusMode && canEdit && <ClientFocusMode tripId={tripId} />}
      </div>
    </FocusSessionProvider>
  );
}
```

### Adding Focus Controls to a Section

To add focus controls to a specific section:

```tsx
'use client';

import { useFocusSession } from '@/contexts/focus-session-context';
import { Button } from '@/components/ui/button';

export function ItinerarySection() {
  const { activeFocusSession, loading, startFocusSession, joinFocusSession, endFocusSession } =
    useFocusSession();

  const isItineraryFocused = activeFocusSession?.section_path === 'itinerary';
  const isFocused = !!activeFocusSession;
  const canStartSession = !loading && !isFocused;
  const canJoinSession = !loading && isItineraryFocused && !activeFocusSession?.has_joined;
  const isCreator = activeFocusSession?.created_by_id === activeFocusSession?.current_user_id;

  return (
    <div className="itinerary-section">
      <div className="flex items-center justify-between">
        <h2>Itinerary</h2>

        <div className="focus-controls">
          {canStartSession && (
            <Button onClick={() => startFocusSession('itinerary')}>Focus on This Section</Button>
          )}

          {canJoinSession && (
            <Button onClick={() => joinFocusSession(activeFocusSession)}>Join Focus Session</Button>
          )}

          {isItineraryFocused && isCreator && (
            <Button variant="outline" onClick={() => endFocusSession()}>
              End Focus Session
            </Button>
          )}
        </div>
      </div>

      {/* Itinerary content */}
    </div>
  );
}
```

## User Experience Guidelines

### When to Show Focus Mode

- **Make it optional**: Focus Mode should be an opt-in feature
- **Default to hidden**: Don't show it automatically
- **Permission-based**: Only show to users who can edit the trip
- **Context-aware**: Hide when viewing public/shared trip views

### UI Placement

- **Focus toggle**: Place in the top-right corner of the page
- **Focus UI**: Position in a non-intrusive side panel
- **Section indicators**: Use subtle visual cues near section headers

### Visual Styling

- **Use subtle indicators**: Focus indicators should be noticeable but not distracting
- **Consistent with brand**: Use withme.travel color palette and design elements
- **Clear state changes**: Different visual states for "can focus", "focused by you", and "focused by others"

## Database Schema

The Focus Mode feature relies on these database tables:

### focus_sessions

```sql
create table public.focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  section_path text not null,
  created_by_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  is_active boolean not null default true,

  unique(trip_id, section_path)
);
```

### focus_session_participants

```sql
create table public.focus_session_participants (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.focus_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),

  unique(session_id, user_id)
);
```

## Implementation Examples

### Focus Mode Demo Component

For a complete example implementation, see the demo component:

```tsx
// components/trips/focus-mode-demo.tsx
'use client';

import { useFocusSession } from '@/contexts/focus-session-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/utils/string-utils';

export function FocusModeDemo() {
  const {
    activeFocusSession,
    loading,
    error,
    startFocusSession,
    joinFocusSession,
    endFocusSession,
  } = useFocusSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Format time remaining
  const formatTimeRemaining = () => {
    if (!activeFocusSession) return '';

    const expiresAt = new Date(activeFocusSession.expires_at);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expired';

    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Focus Mode Demo</h3>

      {!activeFocusSession ? (
        <div className="space-y-4">
          <p>No active focus session. Start one for a specific section:</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => startFocusSession('itinerary')}>Focus on Itinerary</Button>
            <Button onClick={() => startFocusSession('budget')}>Focus on Budget</Button>
            <Button onClick={() => startFocusSession('notes')}>Focus on Notes</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Active Focus Session</h4>
            <p>Section: {activeFocusSession.section_path}</p>
            <p>Time remaining: {formatTimeRemaining()}</p>
          </div>

          <div>
            <h4 className="font-medium">Participants:</h4>
            <div className="flex gap-2 mt-2">
              {activeFocusSession.participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{participant.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {!activeFocusSession.has_joined && (
              <Button onClick={() => joinFocusSession(activeFocusSession)}>Join Session</Button>
            )}

            {activeFocusSession.created_by_id === activeFocusSession.current_user_id && (
              <Button variant="destructive" onClick={() => endFocusSession()}>
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

- **Efficient Real-time Updates**: The Focus Mode feature uses Supabase's real-time channels for efficient updates.
- **Minimal Re-renders**: Components are optimized to minimize re-renders when session data changes.
- **Lazy Loading**: Focus Mode UI components are loaded only when needed, reducing initial page load time.
- **Session Cleanup**: Expired sessions are automatically cleaned up to prevent database bloat.

## Testing Focus Mode

When testing Focus Mode, consider these scenarios:

1. **Multiple users**: Test with multiple users in different browsers/devices
2. **Permission scenarios**: Test with users who have different permission levels
3. **Error cases**: Test behavior when database connections fail
4. **Expiration**: Verify session expiration and cleanup works correctly

## Troubleshooting

### Common Issues

**Issue**: Focus mode toggle doesn't appear

- Check user permissions (must have edit access)
- Verify trip ID is being passed correctly

**Issue**: Real-time updates not working

- Ensure Supabase real-time is properly configured
- Check internet connection
- Verify subscriptions are being set up correctly

**Issue**: Focus session doesn't start

- Check console for errors
- Verify the database schema is set up correctly
- Ensure proper authentication is in place

## Future Enhancements

Planned improvements to Focus Mode include:

1. **Enhanced presence**: Show cursors and typing indicators
2. **Chat integration**: Add section-specific chat for focused collaboration
3. **History tracking**: Keep a log of focus sessions for analytics
4. **Extended durations**: Allow extending sessions beyond the default expiration
5. **Custom focus areas**: Allow users to define custom focus sections

## Related Documentation

- [Focus Session Context](./focus-session-context.md)
- [Trip Collaboration Features](./trip-collaboration.md)
- [Real-time Features](./realtime-features.md)
