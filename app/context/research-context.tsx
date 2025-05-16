'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { 
  ResearchSession, 
  Survey, 
  ResearchContextValue, 
  EventType,
  UserTestingSession 
} from '@/types/research';

const LOCAL_STORAGE_KEY = 'withme_research_session';
// This is a unique key to track if we've already initialized a session for the current page load
const SESSION_INIT_KEY = 'withme_research_session_init';

// Create a default context that aligns with our types
const defaultContext: ResearchContextValue = {
  session: null,
  startSession: async () => null,
  trackEvent: async () => {},
  showSurvey: () => {},
  activeSurvey: null,
  closeSurvey: () => {},
  isSurveyVisible: false
};

// Check if window is defined (client-side)
const isClient = typeof window !== 'undefined';

// Global initialization tracker to prevent multiple init calls across renders
let globalInitAttempted = false;

export const ResearchContext = createContext<ResearchContextValue>(defaultContext);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserTestingSession | null>(null);
  const [activeSurvey, setActiveSurvey] = useState<{ formId: string; milestone?: string } | null>(null);
  const [isSurveyVisible, setIsSurveyVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const sessionInitAttempted = useRef(false);

  // Load existing session on mount but don't create a new one automatically
  useEffect(() => {
    // Prevent excessive initializations
    if (sessionInitAttempted.current || globalInitAttempted) return;
    sessionInitAttempted.current = true;
    globalInitAttempted = true;

    // Check for existing session in localStorage first
    const loadExistingSession = () => {
      if (!isClient) return;
      
      try {
        // First try to load from localStorage
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && parsed.id && parsed.token) {
              console.log('Using existing research session from localStorage');
              setSession(parsed);
              setIsInitializing(false);
              return true;
            }
          } catch (e) {
            // Invalid JSON in localStorage, remove it
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Error loading research session:', e);
      }
      
      setIsInitializing(false);
      return false;
    };
    
    loadExistingSession();
  }, []);

  const startSession = useCallback(async (token?: string): Promise<UserTestingSession | null> => {
    // Return existing session if available
    if (session) return session;
    
    try {
      setIsInitializing(true);
      
      // If a token is provided, try to validate it
      if (token) {
        const response = await fetch(`/api/research/user-testing-session?token=${token}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.session) {
            setSession(data.session);
            setIsInitializing(false);
            return data.session;
          }
        }
        // If token validation fails, continue to create/load session
      }
      
      // Try to load from localStorage again (as a fallback)
      if (isClient) {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && parsed.id && parsed.token) {
              setSession(parsed);
              setIsInitializing(false);
              return parsed;
            }
          } catch (e) {
            // Invalid JSON in localStorage, continue to create a new session
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      }
      
      // Create a new session only when explicitly requested
      const response = await fetch('/api/research/user-testing-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            // Basic client info
            url: window.location.href,
            referrer: document.referrer,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.session) {
          setSession(data.session);
          setIsInitializing(false);
          return data.session;
        }
      } else {
        console.warn('Failed to create research session, status:', response.status);
        // Fallback to temporary session
        const tempSession: UserTestingSession = {
          id: 'temp-' + Date.now(),
          token: 'temp-token',
          status: 'active',
          created_at: new Date().toISOString()
        };
        setSession(tempSession);
        setIsInitializing(false);
        return tempSession;
      }
      
      setIsInitializing(false);
      return null;
    } catch (err) {
      console.error('Failed to initialize research session:', err);
      setIsInitializing(false);
      return null;
    }
  }, [session]);

  // Save session to localStorage when it changes
  useEffect(() => {
    if (!isClient) return;
    
    if (session) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
      } catch (err) {
        // Defensive: ignore storage errors
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [session]);

  const trackEvent = useCallback(async (eventType: EventType | string, details?: Record<string, any>) => {
    if (!eventType) return;
    
    // Ensure we have a session when tracking events
    const currentSession = session || await startSession();
    if (!currentSession) {
      console.warn('No session available for event tracking');
      return;
    }
    
    // Log to console for development
    console.log(`[Research] Event: ${eventType}`, details);
    
    // Only send to backend if we have a valid session with an ID
    if (currentSession?.id && !currentSession.id.startsWith('temp-')) {
      try {
        const response = await fetch('/api/research/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: currentSession.id,
            event_type: eventType,
            event_data: details || {},
            timestamp: new Date().toISOString(),
          }),
        });
        
        const data = await response.json();
        
        // If the backend suggests a survey to show based on this event
        if (data?.triggerFormId && !activeSurvey) {
          showSurvey(data.triggerFormId, data.milestone);
        }
      } catch (error) {
        // Silently fail in production, log in development
        console.error('[Research] Failed to track event:', error);
      }
    }
  }, [session, activeSurvey, startSession]);

  const showSurvey = useCallback((formId: string, milestone?: string) => {
    setActiveSurvey({ formId, milestone });
    setIsSurveyVisible(true);
  }, []);

  const closeSurvey = useCallback(() => {
    setIsSurveyVisible(false);
    // Keep the activeSurvey in state so we don't trigger the same survey multiple times
  }, []);

  const value: ResearchContextValue = {
    session,
    startSession,
    trackEvent,
    showSurvey,
    activeSurvey,
    closeSurvey,
    isSurveyVisible
  };

  // Don't block rendering even if session is initializing
  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
};

export function useResearchContext() {
  return useContext(ResearchContext);
}
