'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// External dependencies
import { useToast } from '@/components/ui/use-toast';

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
  saveResponses: (surveyId: string, responses: Record<string, any>[]) => Promise<void>;
  
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
  const [surveys, setSurveys] = useState<Form[]>(SAMPLE_SURVEYS);

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
   * In production, this would call the API
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
      };
      
      setSession(newSession);
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
   * Save survey responses
   */
  const saveResponses = async (
    surveyId: string,
    responses: Record<string, any>[]
  ): Promise<void> => {
    if (!session) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the API
      // For now, we'll update the local session
      updateSession({
        responses: [...session.responses, { surveyId, responses, timestamp: new Date().toISOString() }],
      });
      
      // Track response submitted event
      await trackEvent(RESEARCH_EVENT_TYPES.SURVEY_RESPONSE_SUBMITTED, {
        surveyId,
        responseCount: responses.length,
      });
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save responses';
      setError(errorMessage);
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