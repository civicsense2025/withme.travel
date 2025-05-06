'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePresence } from '@/_disabled_features/presence/use-presence';

interface IdeaPresenceProviderProps {
  children: React.ReactNode;
  groupId: string;
}

interface UserPresenceInfo {
  id: string;
  name: string;
  avatar_url?: string;
  status: string;
  editing_idea_id?: string | null;
  lastSeen: Date;
}

interface IdeasPresenceContextType {
  activeUsers: UserPresenceInfo[];
  isLoading: boolean;
  error: Error | null;
  startEditingIdea: (ideaId: string) => void;
  stopEditingIdea: () => void;
  isEditingIdea: boolean;
  currentEditingIdeaId: string | null;
}

const IdeasPresenceContext = createContext<IdeasPresenceContextType>({
  activeUsers: [],
  isLoading: false,
  error: null,
  startEditingIdea: () => {},
  stopEditingIdea: () => {},
  isEditingIdea: false,
  currentEditingIdeaId: null,
});

export function useIdeasPresence() {
  return useContext(IdeasPresenceContext);
}

export function IdeasPresenceProvider({ children, groupId }: IdeaPresenceProviderProps) {
  // Attempt to use the presence hook if available
  try {
    // Use the presence hook with the group ID - we reuse trip presence infrastructure
    const {
      activeUsers = [],
      error = null,
      isLoading = false,
      startEditing,
      stopEditing,
      isEditing,
      editingItemId,
    } = usePresence(groupId, {
      trackCursor: false,
      updateInterval: 15000, // 15 seconds
      awayTimeout: 180000, // 3 minutes
    });

    // Map the active users to our simpler format, handling type incompatibilities
    const mappedUsers: UserPresenceInfo[] = activeUsers.map(user => ({
      id: user.user_id,
      name: user.name || 'Anonymous',
      // Handle potential null value by converting to undefined for avatar_url
      avatar_url: user.avatar_url === null ? undefined : user.avatar_url,
      status: user.status,
      // Use any custom field for editing_idea_id or fall back to null
      editing_idea_id: (user as any).editing_item_id || null,
      lastSeen: new Date(user.last_active),
    }));

    const startEditingIdea = (ideaId: string) => {
      try {
        startEditing(ideaId);
      } catch (err) {
        console.error('Failed to start editing idea:', err);
      }
    };

    const stopEditingIdea = () => {
      try {
        stopEditing();
      } catch (err) {
        console.error('Failed to stop editing idea:', err);
      }
    };

    // Provide the context value
    const contextValue: IdeasPresenceContextType = {
      activeUsers: mappedUsers,
      isLoading,
      error,
      startEditingIdea,
      stopEditingIdea,
      isEditingIdea: isEditing,
      currentEditingIdeaId: editingItemId,
    };

    return (
      <IdeasPresenceContext.Provider value={contextValue}>
        {children}
      </IdeasPresenceContext.Provider>
    );
  } catch (err) {
    // If presence is disabled or not available, provide a fallback implementation
    console.warn('Presence features are disabled or unavailable:', err);

    // Fallback context value with no real functionality
    const fallbackContextValue: IdeasPresenceContextType = {
      activeUsers: [],
      isLoading: false,
      error: null,
      startEditingIdea: () => {},
      stopEditingIdea: () => {},
      isEditingIdea: false,
      currentEditingIdeaId: null,
    };

    return (
      <IdeasPresenceContext.Provider value={fallbackContextValue}>
        {children}
      </IdeasPresenceContext.Provider>
    );
  }
} 