'use client';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ResearchSession, Survey, ResearchContextValue, EventType } from '@/types/research';

const LOCAL_STORAGE_KEY = 'withme_research_session';

const defaultContext: ResearchContextValue = {
  session: null,
  activeSurvey: null,
  trackEvent: () => {},
  setActiveSurvey: () => {},
};

export const ResearchContext = createContext<ResearchContextValue>(defaultContext);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load or create session on mount
  useEffect(() => {
    async function initSession() {
      try {
        // First try to load from localStorage
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && parsed.id) {
            setSession(parsed);
            setIsInitializing(false);
            return;
          }
        }
        
        // If no valid session in localStorage, create a new one
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
          }
        }
      } catch (err) {
        console.error('Failed to initialize research session:', err);
        // Continue without a session - we'll fall back to dev-only tracking
      } finally {
        setIsInitializing(false);
      }
    }
    
    initSession();
  }, []);

  // Save session to localStorage when it changes
  useEffect(() => {
    if (session) {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ 
            id: session.id, 
            token: session.token,
            status: session.status,
            createdAt: session.createdAt || new Date().toISOString()
          })
        );
      } catch (err) {
        // Defensive: ignore storage errors
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [session]);

  const trackEvent = useCallback(async (eventType: EventType, details?: Record<string, any>) => {
    if (!eventType) return;
    
    // Log to console for development
    console.log(`[Research] Event: ${eventType}`, details);
    
    // Only send to backend if we have a session
    if (session?.id) {
      try {
        const response = await fetch('/api/research/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: session.id,
            event_type: eventType,
            event_data: details || {},
            timestamp: new Date().toISOString(),
          }),
        });
        
        const data = await response.json();
        
        // If the backend suggests a survey to show based on this event
        if (data?.triggerFormId && !activeSurvey) {
          // Fetch the survey and set it as active
          const surveyRes = await fetch(`/api/research/surveys/${data.triggerFormId}`);
          if (surveyRes.ok) {
            const surveyData = await surveyRes.json();
            if (surveyData?.survey) {
              setActiveSurvey(surveyData.survey);
            }
          }
        }
      } catch (error) {
        // Silently fail in production, log in development
        console.error('[Research] Failed to track event:', error);
      }
    }
  }, [session, activeSurvey]);

  const value: ResearchContextValue = {
    session,
    activeSurvey,
    trackEvent,
    setActiveSurvey,
  };

  // Don't block rendering even if session is initializing
  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
};

export function useResearchContext() {
  return useContext(ResearchContext);
}
