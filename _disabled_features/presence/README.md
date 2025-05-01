# Real-time Presence System

This directory contains components for implementing real-time presence features in withme.travel. The presence system allows users to see who else is active in a trip, what they're editing, and their online status.

## Key Components

### 1. `PresenceProvider`

The main context provider that manages presence state and makes it available to child components.

**Usage:**

```tsx
<PresenceProvider tripId="trip-123" trackCursor={false}>
  {/* Child components that need presence awareness */}
  <TripPageContent />
</PresenceProvider>
```

**Props:**

- `tripId` (required): The ID of the trip to track presence for
- `trackCursor` (optional): Whether to track cursor positions (default: false)

### 2. `usePresenceContext` Hook

A hook to access presence data and actions from any component within a `PresenceProvider`.

**Usage:**

```tsx
function ActiveUserDisplay() {
  const { activeUsers, myPresence, status, isEditing, startEditing, stopEditing } =
    usePresenceContext();

  return (
    <div>
      <p>My status: {status}</p>
      <p>Active users: {activeUsers.length}</p>
      {/* Render user information */}
    </div>
  );
}
```

### 3. `EditingWrapper`

A wrapper component that automatically marks an item as being edited when mounted and releases the edit when unmounted.

**Usage:**

```tsx
<EditingWrapper itemId="item-456">
  <ItemEditForm id="item-456" />
</EditingWrapper>
```

**Props:**

- `itemId` (required): The ID of the item being edited
- `autoMarkAsEditing` (optional): Whether to automatically mark the item as being edited (default: true)

### 4. `ActiveUsers`

A component to display avatars of active users with their status indicators.

**Usage:**

```tsx
<ActiveUsers maxAvatars={5} size="md" />
```

**Props:**

- `maxAvatars` (optional): Maximum number of avatars to display (default: 3)
- `size` (optional): Size of avatars - "sm", "md", or "lg" (default: "md")

### 5. `PresenceErrorBoundary`

An error boundary specifically for handling presence-related errors with auto-recovery capabilities.

**Usage:**

```tsx
<PresenceErrorBoundary>
  <ComponentsThatUsePresence />
</PresenceErrorBoundary>
```

## Presence Data Types

### UserPresence

```typescript
interface UserPresence {
  id: string;
  user_id: string;
  trip_id: string;
  status: PresenceStatus; // 'online' | 'away' | 'offline' | 'editing'
  last_active: string;
  cursor_position?: CursorPosition | null;
  editing_item_id?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
}
```

### PresenceContextType

```typescript
interface PresenceContextType {
  activeUsers: UserPresence[];
  myPresence: UserPresence | null;
  status: PresenceStatus;
  error: Error | null;
  isLoading: boolean;
  isCleaningUp: boolean;
  connectionState: ConnectionState; // 'connected' | 'connecting' | 'disconnected'
  startEditing: (itemId: string) => void;
  stopEditing: () => void;
  setStatus: (status: PresenceStatus) => void;
  isEditing: boolean;
  editingItemId: string | null;
  recoverPresence: () => Promise<void>;
}
```

## Implementation Notes

### Under the Hood

The presence system uses Supabase Realtime Presence features combined with a custom database table for persistence. This allows for:

1. Real-time updates when users join/leave a trip
2. Persistence of user status between page refreshes
3. Automatic cleanup when users go offline or close the page
4. Conflict resolution for concurrent edits

### Best Practices

1. **Always wrap with error boundary**: Use `PresenceErrorBoundary` to gracefully handle and recover from connection issues

2. **Use `EditingWrapper` for edit actions**: This ensures proper release of edit locks when components unmount

3. **Connection State Handling**: Check `connectionState` before performing critical operations

4. **Cleanup**: The system automatically cleans up when components unmount, but for best results, always call `stopEditing()` when an edit operation completes

5. **Performance**: Only enable `trackCursor` when necessary, as it generates more network traffic

## Security Considerations

### 1. Privacy Protection

The presence system shares minimal user data to balance collaboration needs with privacy:

- Basic profile information (name, avatar) is shared
- Exact cursor positions are only tracked when explicitly enabled
- User activity is anonymized in database logs
- Presence data has trip-specific scope (users only see other users in the same trip)

### 2. Database Security

- RLS (Row Level Security) policies limit access to presence data by trip membership
- Presence records are automatically cleaned up to prevent data accumulation
- Connection tokens have limited time validity and trip-specific scope
- Presence updates are rate-limited to prevent abuse

### 3. Secure Implementation Guidelines

When implementing presence features:

- Never log personal information to the console
- Verify user permissions before showing detailed presence information
- Use the `PresenceErrorBoundary` to prevent exposing technical error details
- Be mindful of cursor tracking, which should be opt-in for privacy reasons

## Performance Optimization

The presence system is designed with performance in mind:

1. **Debounced Updates**: User status and cursor positions are debounced to minimize network traffic
2. **Lazy Loading**: Presence components use dynamic imports and suspended loading
3. **Optimized Rendering**: Components only re-render when relevant state changes
4. **Connection State Management**: Automatic reconnect with exponential backoff
5. **Resource Cleanup**: Efficient cleanup of event listeners and subscriptions

Guidelines for maintaining good performance:

- Limit the scope of presence tracking to active views
- Implement proper memoization for components using presence data
- Avoid unnecessarily enabling cursor tracking in read-only views
- Consider disabling presence updates for very large trips (100+ users)

## Accessibility Enhancements

The presence components follow these accessibility guidelines:

1. **Screen Reader Support**:

   - Proper ARIA labels for presence indicators
   - Status information announced appropriately
   - Editing indicators with appropriate semantic markup

2. **Keyboard Navigation**:

   - All interactive elements are keyboard accessible
   - Focus management respects tab order
   - No keyboard traps in presence UI components

3. **Visual Accessibility**:

   - High contrast status indicators
   - Alternative text for presence information
   - Visual states that don't rely solely on color

4. **Reduced Motion**:
   - Respects user preference for reduced motion
   - Essential animations only for critical status changes
   - Static alternatives for animated elements

## Troubleshooting

### Common Issues

1. **Ghost presences**: If users appear online after they've left, it might be due to an unclean disconnection. The system has an automatic cleanup timeout, but you can manually trigger cleanup by checking the database.

2. **Edit conflicts**: If multiple users appear to be editing the same item, ensure you're properly using `EditingWrapper` and checking edit status before allowing edits.

3. **Connection issues**: If you experience connection problems, try:
   - Using the `recoverPresence()` function from the context
   - Check network connectivity
   - Ensure Supabase Realtime services are enabled for your project

For more complex scenarios, refer to the implementation in `hooks/use-presence.ts`.
