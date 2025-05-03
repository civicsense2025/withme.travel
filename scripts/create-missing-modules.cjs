#!/usr/bin/env node

/**
 * Script to create missing presence and focus mode modules
 * 
 * This script creates the missing modules that are causing TypeScript errors:
 * 1. components/presence/presence-context.tsx
 * 2. components/presence/cursor-tracker.tsx
 * 3. types/presence.ts
 * 4. components/trips/client-focus-mode.tsx
 * 5. contexts/focus-session-context.tsx
 */

const fs = require('fs').promises;
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Templates for each file
const templates = {
  // Presence Context
  'components/presence/presence-context.tsx': `'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import type { ConnectionState, ExtendedUserPresence, UserPresence } from '@/types/presence';

interface PresenceContextType {
  users: ExtendedUserPresence[];
  connection: ConnectionState;
  updateCursorPosition: (position: { x: number; y: number } | null) => void;
  updateStatus: (status: 'online' | 'offline' | 'away' | 'editing') => void;
  focusedElement: string | null;
  setFocusedElement: (id: string | null) => void;
}

const PresenceContext = createContext<PresenceContextType>({
  users: [],
  connection: 'disconnected',
  updateCursorPosition: () => {},
  updateStatus: () => {},
  focusedElement: null,
  setFocusedElement: () => {},
});

export function PresenceProvider({ children, tripId }: { children: React.ReactNode; tripId?: string }) {
  const [users, setUsers] = useState<ExtendedUserPresence[]>([]);
  const [connection, setConnection] = useState<ConnectionState>('connecting');
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  
  // Get tripId from params if not provided
  const params = useParams();
  const resolvedTripId = tripId || (params?.tripId as string);

  // Connect to presence channel on mount
  useEffect(() => {
    if (!resolvedTripId) return;
    
    // For TypeScript compatibility, create empty implementation
    console.log('Presence provider mounted for trip:', resolvedTripId);
    
    setConnection('connected');
    
    return () => {
      setConnection('disconnected');
    };
  }, [resolvedTripId]);

  // Update cursor position
  const updateCursorPosition = (position: { x: number; y: number } | null) => {
    // Implementation stub
  };

  // Update user status
  const updateStatus = (status: 'online' | 'offline' | 'away' | 'editing') => {
    // Implementation stub
  };

  const value = useMemo(
    () => ({
      users,
      connection,
      updateCursorPosition,
      updateStatus,
      focusedElement,
      setFocusedElement,
    }),
    [users, connection, focusedElement]
  );

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresenceContext() {
  return useContext(PresenceContext);
}
`,

  // Cursor Tracker
  'components/presence/cursor-tracker.tsx': `'use client';

import { useEffect, useRef } from 'react';
import { usePresenceContext } from './presence-context';

interface CursorTrackerProps {
  disabled?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export default function CursorTracker({ disabled = false, containerRef }: CursorTrackerProps) {
  const { updateCursorPosition } = usePresenceContext();
  const throttlePending = useRef(false);
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (disabled) {
      // If disabled, clear cursor position
      updateCursorPosition(null);
      return;
    }

    // Reference to the container or document
    const container = containerRef?.current || document;

    // Throttled mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      if (throttlePending.current) return;
      
      throttlePending.current = true;
      
      // Calculate cursor position relative to container
      const rect = (containerRef?.current || document.documentElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only update after a delay (throttle)
      throttleTimeout.current = setTimeout(() => {
        updateCursorPosition({ x, y });
        throttlePending.current = false;
      }, 50); // 50ms throttle
    };

    // Mouse leave handler
    const handleMouseLeave = () => {
      updateCursorPosition(null);
    };

    // Add event listeners
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, [disabled, containerRef, updateCursorPosition]);

  // No visual component, just functionality
  return null;
}
`,

  // Presence Types
  'types/presence.ts': `/**
 * Types for presence features in the application
 */

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface UserPresence {
  user_id: string;
  trip_id: string;
  status: 'online' | 'offline' | 'away' | 'editing';
  last_active: string;
}

export interface ExtendedUserPresence extends UserPresence {
  name?: string;
  email?: string;
  avatar_url?: string | null;
  cursor_position?: { x: number; y: number } | null;
  focused_element?: string | null;
}

export interface ImportedUserPresence {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'away' | 'editing';
}

export interface CursorPosition {
  x: number;
  y: number;
}

export interface PresenceUser {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'away' | 'editing';
  cursor_position?: CursorPosition | null;
  focused_element?: string | null;
  last_active: string;
}
`,

  // Client Focus Mode
  'components/trips/client-focus-mode.tsx': `'use client';

import React, { useState, useEffect } from 'react';
import { useFocusSession } from '@/contexts/focus-session-context';

interface ClientFocusModeProps {
  tripId: string;
  children: React.ReactNode;
}

export function ClientFocusMode({ tripId, children }: ClientFocusModeProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { activeFocusSession, initializeFocusSession } = useFocusSession();

  useEffect(() => {
    if (!isInitialized && tripId) {
      initializeFocusSession(tripId);
      setIsInitialized(true);
    }
  }, [tripId, isInitialized, initializeFocusSession]);

  if (!isInitialized) {
    // Return a loading state or null
    return null;
  }

  return (
    <>
      {/* Render the active focus session overlay if one exists */}
      {activeFocusSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">Focus Session Active</h2>
            <p className="mb-4">
              {activeFocusSession.message || 'A focus session is currently active.'}
            </p>
            <div className="flex justify-end">
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => {/* Join focus session implementation */}}
              >
                Join Focus Session
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
`,

  // Focus Session Context
  'contexts/focus-session-context.tsx': `'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface FocusSessionParticipant {
  id: string;
  name: string;
  avatar_url: string | null;
  joined_at: string;
}

interface FocusSession {
  id: string;
  trip_id: string;
  initiated_by: string;
  section_id: string | null;
  section_path: string | null;
  section_name: string | null;
  active: boolean;
  message: string;
  created_at: string;
  expires_at: string | null;
  participants: FocusSessionParticipant[];
}

interface FocusSessionContextType {
  activeFocusSession: FocusSession | null;
  isLoading: boolean;
  error: Error | null;
  initializeFocusSession: (tripId: string) => void;
  startFocusSession: (options: {
    tripId: string;
    sectionId?: string;
    sectionPath?: string;
    sectionName?: string;
    message?: string;
    expiresIn?: number;
  }) => Promise<void>;
  endFocusSession: (sessionId: string) => Promise<void>;
  joinFocusSession: (sessionId: string) => Promise<void>;
  leaveFocusSession: (sessionId: string) => Promise<void>;
}

const FocusSessionContext = createContext<FocusSessionContextType>({
  activeFocusSession: null,
  isLoading: false,
  error: null,
  initializeFocusSession: () => {},
  startFocusSession: async () => {},
  endFocusSession: async () => {},
  joinFocusSession: async () => {},
  leaveFocusSession: async () => {},
});

export function FocusSessionProvider({ children }: { children: React.ReactNode }) {
  const [activeFocusSession, setActiveFocusSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize focus session subscription for a trip
  const initializeFocusSession = useCallback((tripId: string) => {
    setIsLoading(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      setIsLoading(false);
      // Comment out for stub implementation
      // setActiveFocusSession(mockFocusSession);
    }, 500);
    
    // Return cleanup function
    return () => {
      // Cleanup subscription
    };
  }, []);

  // Start a new focus session
  const startFocusSession = useCallback(async (options) => {
    setIsLoading(true);
    try {
      // Implementation stub
      console.log('Starting focus session with options:', options);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  // End an active focus session
  const endFocusSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Implementation stub
      console.log('Ending focus session:', sessionId);
      setActiveFocusSession(null);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  // Join a focus session
  const joinFocusSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Implementation stub
      console.log('Joining focus session:', sessionId);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  // Leave a focus session
  const leaveFocusSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      // Implementation stub
      console.log('Leaving focus session:', sessionId);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      activeFocusSession,
      isLoading,
      error,
      initializeFocusSession,
      startFocusSession,
      endFocusSession,
      joinFocusSession,
      leaveFocusSession,
    }),
    [
      activeFocusSession,
      isLoading,
      error,
      initializeFocusSession,
      startFocusSession,
      endFocusSession,
      joinFocusSession,
      leaveFocusSession,
    ]
  );

  return <FocusSessionContext.Provider value={value}>{children}</FocusSessionContext.Provider>;
}

export function useFocusSession() {
  return useContext(FocusSessionContext);
}
`
};

async function createDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    throw error;
  }
}

async function createFile(filePath, content) {
  try {
    // Check if file already exists
    try {
      await fs.access(filePath);
      console.log(`File already exists: ${filePath}`);
      return false;
    } catch {
      // File doesn't exist, continue
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    await createDirectory(dir);

    // Write the file
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Created file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error);
    return false;
  }
}

async function createMissingModules() {
  console.log('Creating missing modules...');
  
  let createdFiles = 0;
  
  for (const [filePath, content] of Object.entries(templates)) {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (await createFile(fullPath, content)) {
      createdFiles++;
    }
  }
  
  console.log(`\nCreated ${createdFiles} missing module files`);
}

// Run the script
createMissingModules().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 