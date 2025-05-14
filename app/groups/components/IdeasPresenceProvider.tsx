'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
// TODO: Update to new presence hook if available, fallback to disabled if not
// import { usePresence } from '@/_disabled_features/presence/use-presence';

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
  // Presence features are disabled or unavailable, provide a fallback implementation
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
