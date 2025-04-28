'use client';

import React, { createContext, useContext, useEffect, Suspense } from 'react';
import { usePresence } from '@/hooks/use-presence';
import { PresenceContextType, UserPresence, ConnectionState } from '@/types/presence';

// Create a context with a default empty state
const PresenceContext = createContext<PresenceContextType>({
  activeUsers: [],
  myPresence: null,
  status: 'online',
  error: null,
  isLoading: false,
  isCleaningUp: false,
  connectionState: 'connecting',
  startEditing: () => {},
  stopEditing: () => {},
  setStatus: () => {},
  isEditing: false,
  editingItemId: null,
  recoverPresence: async () => {},
});

interface PresenceProviderProps {
  children: React.ReactNode;
  tripId: string;
  trackCursor?: boolean;
  announceConnectionChanges?: boolean;
}

export function PresenceProvider({ 
  children,
  tripId,
  trackCursor = false,
  announceConnectionChanges = true,
}: PresenceProviderProps) {
  const presence = usePresence(tripId, {
    trackCursor,
    updateInterval: 15000, // 15 seconds
    awayTimeout: 300000, // 5 minutes
  });

  // Announce connection state changes to screen readers
  useEffect(() => {
    if (announceConnectionChanges) {
      const announceMessages: Record<ConnectionState, string> = {
        connected: 'Connected to collaborative editing',
        connecting: 'Connecting to collaborative editing...',
        disconnected: 'Disconnected from collaborative editing. Attempting to reconnect...'
      };
      
      // Skip the initial connecting state to avoid unnecessary announcements on first load
      if (presence.connectionState !== 'connecting' || presence.error) {
        const message = presence.error 
          ? `Connection error: ${presence.error.message}` 
          : announceMessages[presence.connectionState];
        
        // Create and use an ARIA live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('role', 'status');
        liveRegion.classList.add('sr-only'); // visually hidden
        document.body.appendChild(liveRegion);
        
        // Set the message after a short delay to ensure screen readers catch it
        setTimeout(() => {
          liveRegion.textContent = message;
          
          // Remove the element after announcement
          setTimeout(() => {
            document.body.removeChild(liveRegion);
          }, 3000);
        }, 100);
      }
    }
  }, [presence.connectionState, presence.error, announceConnectionChanges]);

  // Make presence available to children components
  return (
    <PresenceContext.Provider value={presence}>
      {/* Hidden live region for major state changes */}
      <div aria-live="polite" className="sr-only" role="status">
        {presence.isLoading ? 'Loading collaborative presence...' : null}
        {presence.isCleaningUp ? 'Cleaning up presence data...' : null}
      </div>
      {children}
    </PresenceContext.Provider>
  );
}

// Custom hook to use the presence context
export function usePresenceContext(): PresenceContextType {
  const context = useContext(PresenceContext);
  
  if (context === undefined) {
    throw new Error('usePresenceContext must be used within a PresenceProvider');
  }
  
  return context;
}

// Component that wraps an element to mark it as being edited
interface EditingWrapperProps {
  children: React.ReactNode;
  itemId: string;
  autoMarkAsEditing?: boolean;
}

export function EditingWrapper({ 
  children, 
  itemId,
  autoMarkAsEditing = true,
}: EditingWrapperProps) {
  const { startEditing, stopEditing, editingItemId } = usePresenceContext();
  
  // Automatically mark the item as being edited when mounted
  useEffect(() => {
    if (autoMarkAsEditing) {
      startEditing(itemId);
      
      // Mark as not editing when unmounted
      return () => {
        stopEditing();
      };
    }
  }, [itemId, autoMarkAsEditing, startEditing, stopEditing]);
  
  return <>{children}</>;
}

// Simple component to display active users in the trip
interface ActiveUsersProps {
  maxAvatars?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ActiveUsers({ maxAvatars = 3, size = 'md' }: ActiveUsersProps) {
  const { activeUsers } = usePresenceContext();
  
  // Dynamically import the PresenceIndicator component
  const PresenceIndicator = React.lazy(() => 
    import('./presence-indicator').then(mod => ({ default: mod.PresenceIndicator }))
  );
  
  return (
    <Suspense fallback={<div className="flex space-x-2 animate-pulse" aria-label="Loading active users">
      {Array.from({ length: Math.min(activeUsers.length, maxAvatars) }).map((_, i) => (
        <div 
          key={i} 
          className={`rounded-full bg-muted ${size === 'sm' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-10 w-10'}`} 
        />
      ))}
    </div>}>
      <PresenceIndicator 
        users={activeUsers} 
        maxAvatars={maxAvatars}
        size={size}
      />
    </Suspense>
  );
}
