'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// External dependencies
import { useToast } from '@/components/ui/use-toast';

// Internal modules
import { UserTestingSession } from '@/types';
import { RESEARCH_EVENT_TYPES } from '@/types/research';

// Hooks
import { useAuth } from '@/hooks/use-auth';

/**
 * Research context for tracking events and managing surveys
 */
interface ResearchContextType {
  /** Current user testing session */
  session: UserTestingSession | null;
  /** Function to start a new testing session */
  startSession: (token?: string) => Promise<UserTestingSession | null>;
  /** Function to track research events */
  trackEvent: (eventType: string, data?: Record<string, any>) => Promise<void>;
  /** Function to show a survey */
  showSurvey: (formId: string, milestone?: string) => void;
  /** Currently active survey information */
  activeSurvey: { formId: string; milestone?: string } | null;
  /** Function to close the survey */
  closeSurvey: () => void;
  /** Whether a survey is currently showing */
  isSurveyVisible: boolean;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

/**
 * Local storage keys for research
 */
const LS_KEYS = {
  SESSION_TOKEN: 'withme_research_session_token',
};

/**
 * Provider component for research context
 */
export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [session, setSession] = useState<UserTestingSession | null>(null);
  const [activeSurvey, setActiveSurvey] = useState<{ formId: string; milestone?: string } | null>(null);
  const [isSurveyVisible, setIsSurveyVisible] = useState(false);

  // Load session from local storage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = localStorage.getItem(LS_KEYS.SESSION_TOKEN);
        if (storedToken) {
          const session = await fetchSession(storedToken);
          if (session) {
            setSession(session);
          }
        }
      } catch (error) {
        console.error('Error loading research session:', error);
        // Clear invalid session
        localStorage.removeItem(LS_KEYS.SESSION_TOKEN);
      }
    };

    loadSession();
  }, []);

  /**
   * Fetch session data from the API
   */
  const fetchSession = async (token: string): Promise<UserTestingSession | null> => {
    try {
      const response = await fetch(`/api/research/sessions/${token}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  };

  /**
   * Start a new user testing session
   */
  const startSession = async (token?: string): Promise<UserTestingSession | null> => {
    try {
      let sessionResponse;
      
      if (token) {
        // Use provided token to validate
        sessionResponse = await fetch(`/api/research/sessions/${token}`);
      } else {
        // Create new session
        sessionResponse = await fetch('/api/research/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user?.id,
            metadata: {
              userAgent: navigator.userAgent,
              language: navigator.language,
              screenWidth: window.screen.width,
              screenHeight: window.screen.height,
            },
          }),
        });
      }

      if (!sessionResponse.ok) {
        throw new Error('Failed to start session');
      }

      const newSession = await sessionResponse.json();
      setSession(newSession);

      // Save session token to local storage
      localStorage.setItem(LS_KEYS.SESSION_TOKEN, newSession.token);

      // Track session started event
      await trackEventInternal(RESEARCH_EVENT_TYPES.SESSION_STARTED, { 
        session_id: newSession.id,
        guest_token: newSession.guest_token 
      });

      return newSession;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  };

  /**
   * Internal implementation of trackEvent
   */
  const trackEventInternal = async (
    eventType: string,
    data?: Record<string, any>
  ) => {
    try {
      if (!session) {
        // Silently return if no session
        return;
      }

      await fetch('/api/research/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.id,
          user_id: user?.id,
          event_type: eventType,
          details: data || {},
        }),
      });
    } catch (error) {
      // Log error but don't interrupt user experience
      console.error('Error tracking event:', error);
    }
  };

  /**
   * Track a research event and check for triggered surveys
   */
  const trackEvent = useCallback(async (
    eventType: string,
    data?: Record<string, any>,
  ) => {
    try {
      if (!session) {
        // Try to start a session first
        const newSession = await startSession();
        if (!newSession) {
          return;
        }
      }

      // Track the event
      const response = await fetch('/api/research/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session!.id,
          user_id: user?.id,
          event_type: eventType,
          details: data || {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track event');
      }

      // Check if this event triggers any surveys
      const surveyResponse = await fetch(`/api/research/triggers?event=${eventType}`);
      if (surveyResponse.ok) {
        const triggerResult = await surveyResponse.json();
        if (triggerResult.triggered && triggerResult.form_id) {
          // Show the triggered survey
          showSurvey(triggerResult.form_id, triggerResult.milestone);
        }
      }
    } catch (error) {
      console.error('Error in trackEvent:', error);
    }
  }, [session, user]);

  /**
   * Show a survey to the user
   */
  const showSurvey = useCallback((formId: string, milestone?: string) => {
    setActiveSurvey({ formId, milestone });
    setIsSurveyVisible(true);
    trackEventInternal(RESEARCH_EVENT_TYPES.SURVEY_VIEWED, { 
      form_id: formId, 
      milestone 
    });
  }, []);

  /**
   * Close the current survey
   */
  const closeSurvey = useCallback(() => {
    if (activeSurvey) {
      trackEventInternal(RESEARCH_EVENT_TYPES.SURVEY_ABANDONED, {
        form_id: activeSurvey.formId,
        milestone: activeSurvey.milestone,
      });
    }
    setIsSurveyVisible(false);
    // Keep the active survey data in case we want to reopen it
  }, [activeSurvey]);

  const contextValue = {
    session,
    startSession,
    trackEvent,
    showSurvey,
    activeSurvey,
    closeSurvey,
    isSurveyVisible,
  };

  return (
    <ResearchContext.Provider value={contextValue}>
      {children}
    </ResearchContext.Provider>
  );
}

/**
 * Hook to use research context
 */
export function useResearch() {
  const context = useContext(ResearchContext);
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
} 