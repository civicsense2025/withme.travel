'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// External dependencies
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Internal modules
import { UserTestingSession } from '@/types';
import { RESEARCH_EVENT_TYPES, Form } from '@/types/research';
import { SAMPLE_SURVEYS } from '@/data/sample-surveys';

// Hooks
import { useAuth } from '@/hooks/use-auth';

export interface ResearchSession {
  id: string;
  token?: string;
  completedMilestones: string[];
  responses: Record<string, any>[];
  startedAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface ResearchEvent {
  type: string;
  details?: Record<string, any>;
  timestamp: string;
  milestone?: string;
}

export interface ResearchContextType {
  // Session management
  session: ResearchSession | null;
  createSession: (token?: string) => Promise<ResearchSession>;
  updateSession: (updates: Partial<ResearchSession>) => void;
  completeSession: () => Promise<void>;
  
  // Event tracking
  trackEvent: (eventType: string, details?: Record<string, any>, milestone?: string) => Promise<void>;
  
  // Survey responses
  saveResponses: (surveyId: string, responses: { id: string; value: string | number | boolean | Array<string | number> }[]) => Promise<void>;
  
  // Survey data
  surveys: Form[];
  getSurveyById: (surveyId: string) => Form | undefined;
  getSurveyByType: (surveyType: string) => Form | undefined;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

/**
 * Local storage keys for research
 */
const LS_KEYS = {
  SESSION_TOKEN: 'withme_research_session_token',
  SESSION_DATA: 'research-session',
};

export interface ResearchProviderProps {
  children: ReactNode;
}

// Default session for development use only
const createDefaultSession = (): ResearchSession => ({
  id: `session-${Date.now()}`,
  completedMilestones: [],
  responses: [],
  startedAt: new Date().toISOString(),
  metadata: {
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    source: 'development',
  },
});

/**
 * ResearchProvider component that manages research sessions and event tracking
 * Provides context for the entire research system
 */
export function ResearchProvider({ children }: ResearchProviderProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<Form[]>([]);

  // Fetch surveys from API
  const fetchSurveys = async () => {
    try {
      console.log('[ResearchProvider] Fetching surveys from API');
      setIsLoading(true);
      
      const response = await fetch('/api/forms');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch surveys: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data.forms)) {
        console.log(`[ResearchProvider] Loaded ${data.forms.length} surveys from API`);
        setSurveys(data.forms);
      } else {
        console.error('[ResearchProvider] Invalid survey data format:', data);
        // Fall back to sample data only in development
        if (process.env.NODE_ENV !== 'production') {
          console.log('[ResearchProvider] Using sample surveys in development mode');
          setSurveys(SAMPLE_SURVEYS);
        }
      }
    } catch (error) {
      console.error('[ResearchProvider] Error fetching surveys:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch surveys');
      
      // Fall back to sample data only in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('[ResearchProvider] Using sample surveys in development mode');
        setSurveys(SAMPLE_SURVEYS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load surveys when the provider mounts
  useEffect(() => {
    fetchSurveys();
  }, []);

  // Load session from localStorage in development mode
  useEffect(() => {
    const loadSavedSession = () => {
      if (typeof window === 'undefined') return;
      
      try {
        const savedSession = localStorage.getItem(LS_KEYS.SESSION_DATA);
        if (savedSession) {
          setSession(JSON.parse(savedSession));
        }
      } catch (e) {
        console.error('Error loading research session:', e);
      }
    };
    
    loadSavedSession();
  }, []);
  
  // Save session to localStorage in development mode
  useEffect(() => {
    if (typeof window === 'undefined' || !session) return;
    
    try {
      localStorage.setItem(LS_KEYS.SESSION_DATA, JSON.stringify(session));
    } catch (e) {
      console.error('Error saving research session:', e);
    }
  }, [session]);

  /**
   * Create a new research session
   */
  const createSession = async (token?: string): Promise<ResearchSession> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the API
      // For now, we'll create a local session for development
      const newSession: ResearchSession = {
        ...createDefaultSession(),
        token,
        id: uuidv4(), // Ensure we use a valid UUID for session ID
      };
      
      setSession(newSession);
      console.log('[ResearchProvider] Created session:', newSession.id);
      return newSession;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update the current session with new data
   */
  const updateSession = (updates: Partial<ResearchSession>) => {
    if (!session) return;
    
    setSession({
      ...session,
      ...updates,
    });
  };

  /**
   * Mark a session as completed
   */
  const completeSession = async (): Promise<void> => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the API
      // For now, we'll update the local session
      updateSession({
        completedAt: new Date().toISOString(),
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to complete session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Track a research event
   */
  const trackEvent = async (
    eventType: string,
    details?: Record<string, any>,
    milestone?: string
  ): Promise<void> => {
    if (!session) return;
    
    try {
      // Create the event
      const event: ResearchEvent = {
        type: eventType,
        details,
        timestamp: new Date().toISOString(),
        milestone,
      };
      
      // In a real implementation, this would call the API
      console.log('Research event tracked:', event);
      
      // Dispatch custom event for the debugger to pick up
      if (typeof window !== 'undefined') {
        const customEvent = new CustomEvent('research_event', { detail: event });
        window.dispatchEvent(customEvent);
      }
      
      // If this is a milestone event, update the session
      if (milestone && !session.completedMilestones.includes(milestone)) {
        updateSession({
          completedMilestones: [...session.completedMilestones, milestone],
        });
      }
    } catch (e) {
      console.error('Error tracking research event:', e);
    }
  };

  /**
   * Save survey responses to the backend API and update local session state on success.
   *
   * @param surveyId - The ID of the survey being answered
   * @param responses - Array of response objects ({ id, value })
   * @throws {Error} If submission fails
   */
  const saveResponses = async (
    surveyId: string,
    responses: { id: string; value: string | number | boolean | Array<string | number> }[]
  ): Promise<void> => {
    if (!session) {
      console.error('[ResearchProvider] No active session, creating one');
      await createSession();
      if (!session) {
        throw new Error('No active session and failed to create one');
      }
    }
    
    setIsLoading(true);
    setError(null);

    // Prepare payload type
    interface SubmitPayload {
      form_id: string;
      session_id: string;
      responses: { id: string; value: string | number | boolean | Array<string | number> }[];
      milestone?: string;
    }

    // API response type
    interface ApiResponse {
      id: string;
      form_id: string;
      session_id: string;
      user_id?: string;
      responses: unknown;
      milestone?: string;
      created_at: string;
      [key: string]: unknown;
    }

    try {
      // Ensure we have a valid session ID (UUID format)
      if (!session.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.warn('[ResearchProvider] Invalid session ID format, creating new session');
        await createSession();
        if (!session) {
          throw new Error('Failed to create a valid session');
        }
      }
      
      console.log('[ResearchProvider] Submitting responses to API:', { 
        surveyId, 
        responseCount: responses.length,
        sessionId: session.id
      });

      const payload: SubmitPayload = {
        form_id: surveyId,
        session_id: session.id,
        responses,
        // Add milestone if available in session
        milestone: session.completedMilestones.length > 0 
          ? session.completedMilestones[session.completedMilestones.length - 1]
          : undefined
      };

      const res = await fetch('/api/research/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = 'Failed to submit survey';
        try {
          const { error } = (await res.json()) as { error?: string };
          if (error) errorMsg = error;
        } catch (parseError) {
          console.error('[ResearchProvider] Error parsing error response:', parseError);
        }
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Parse and validate response
      const apiResponse = (await res.json()) as ApiResponse;
      if (!apiResponse.id || !apiResponse.form_id) {
        setError('Invalid response from server');
        throw new Error('Invalid response from server');
      }
      
      console.log('[ResearchProvider] Response saved successfully:', apiResponse.id);

      // Update local session state
      updateSession({
        responses: [
          ...session.responses,
          {
            surveyId,
            responses,
            timestamp: new Date().toISOString(),
            apiResponseId: apiResponse.id,
          },
        ],
      });

      // Track response submitted event
      await trackEvent(RESEARCH_EVENT_TYPES.SURVEY_RESPONSE_SUBMITTED, {
        surveyId,
        responseCount: responses.length,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save responses';
      setError(errorMessage);
      console.error('[ResearchProvider] Error saving responses:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Get a survey by ID
   */
  const getSurveyById = (surveyId: string): Form | undefined => {
    return surveys.find(survey => survey.id === surveyId);
  };
  
  /**
   * Get a survey by type
   */
  const getSurveyByType = (surveyType: string): Form | undefined => {
    return surveys.find(survey => survey.type === surveyType);
  };

  const value: ResearchContextType = {
    session,
    createSession,
    updateSession,
    completeSession,
    trackEvent,
    saveResponses,
    surveys,
    getSurveyById,
    getSurveyByType,
    isLoading,
    error,
  };

  return (
    <ResearchContext.Provider value={value}>
      {children}
    </ResearchContext.Provider>
  );
}

/**
 * Hook to use the research context
 */
export function useResearch(): ResearchContextType {
  const context = useContext(ResearchContext);
  
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  
  return context;
} 