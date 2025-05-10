'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { API_ROUTES } from '@/utils/constants/routes';
import { 
  getResearchSession, 
  setResearchSession, 
  clearResearchSession
} from '@/utils/research-cookies';
import {
  researchService,
  SurveyDefinition,
  SurveyQuestion,
  ResearchTrigger,
  SurveyResponse
} from '@/lib/services/research-service';

// Types
interface ResearchContextType {
  // Research session state
  isResearchSession: boolean;
  participantId: string | null;
  studyId: string | null;
  
  // Survey state
  currentSurvey: SurveyDefinition | null;
  currentTriggerEvent: string | null;
  
  // Actions
  trackEvent: (eventName: string) => void;
  dismissSurvey: () => void;
  submitSurvey: (answers: SurveyResponse[]) => Promise<void>;
  exitResearch: () => void;
  
  // Welcome modal state
  showWelcomeModal: boolean;
  completeWelcome: () => void;
}

// Create the context with a default value
const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

// Provider props type
interface ResearchProviderProps {
  children: React.ReactNode;
}

export function ResearchProvider({ children }: ResearchProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const supabaseRef = useRef<any>(null);
  
  // Only initialize service in the browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      researchService.init();
    }
  }, []);
  
  // Research session state
  const [isResearchSession, setIsResearchSession] = useState<boolean>(false);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [studyId, setStudyId] = useState<string | null>(null);
  
  // Survey state
  const [currentSurvey, setCurrentSurvey] = useState<SurveyDefinition | null>(null);
  const [currentTriggerEvent, setCurrentTriggerEvent] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<ResearchTrigger[]>([]);
  const [triggerCounts, setTriggerCounts] = useState<Record<string, number>>({});
  
  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  
  // Check if this is a research participation link
  useEffect(() => {
    const research = searchParams?.get('research');
    const pid = searchParams?.get('pid');
    const sid = searchParams?.get('sid');
    
    // If we have research URL parameters
    if (research === 'true' && pid && sid) {
      console.log('Research parameters detected, initializing research session');
      
      // Update the participant status to active
      researchService.updateParticipantStatus(pid, sid, 'active')
        .then(() => {
          console.log('Participant status updated to active');
        })
        .catch(error => {
          console.error('Error updating participant status:', error);
        });
      
      // Set the research cookies
      setResearchSession(pid, sid);
      
      // Update state
      setParticipantId(pid);
      setStudyId(sid);
      setIsResearchSession(true);
      
      // Show the welcome modal
      setShowWelcomeModal(true);
      
      // Remove research parameters from URL to prevent sharing issues
      if (typeof window !== 'undefined') {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } else {
      // Check if we have research cookies from previous page loads
      const session = getResearchSession();
      
      if (session.participantId && session.studyId && session.status === 'active') {
        setParticipantId(session.participantId);
        setStudyId(session.studyId);
        setIsResearchSession(true);
      }
    }
  }, [searchParams]);
  
  // Fetch triggers when studyId is available
  useEffect(() => {
    if (!studyId || !isResearchSession) return;
    
    researchService.getTriggers(studyId)
      .then(data => {
        setTriggers(data);
        
        // Initialize trigger counts
        const counts: Record<string, number> = {};
        data.forEach(trigger => {
          counts[trigger.trigger_event] = 0;
        });
        
        setTriggerCounts(counts);
      })
      .catch(error => {
        console.error('Error fetching triggers:', error);
      });
  }, [studyId, isResearchSession]);
  
  // Track a research event
  const trackEvent = useCallback(async (eventName: string) => {
    if (!isResearchSession || !participantId || !studyId) return;
    
    console.log(`[Research] Tracking event: ${eventName}`);
    
    // Record the event
    try {
      await researchService.trackEvent(eventName, participantId, studyId);
    } catch (error) {
      console.error('Error tracking research event:', error);
    }
    
    // Check if this event should trigger a survey
    const matchingTrigger = triggers.find(trigger => 
      researchService.doesTriggerMatch(trigger, eventName)
    );
    
    if (matchingTrigger) {
      // Check if we've already shown this trigger the maximum number of times
      const currentCount = triggerCounts[eventName] || 0;
      
      if (currentCount < matchingTrigger.max_triggers) {
        // Check if we should show a survey based on cooldown and limits
        if (!researchService.shouldShowSurvey(matchingTrigger)) {
          console.log('[Research] Survey skipped due to cooldown/limit:', matchingTrigger);
          return;
        }
        
        // Update the count
        setTriggerCounts({
          ...triggerCounts,
          [eventName]: currentCount + 1
        });
        
        // Fetch the survey definition
        const surveyDefinition = await researchService.getSurvey(matchingTrigger.survey_id);
        
        if (!surveyDefinition) {
          console.error('Error fetching survey definition for', matchingTrigger.survey_id);
          return;
        }
        
        // Add a delay before showing the survey
        setTimeout(() => {
          // Only show if we don't already have a survey showing
          if (!currentSurvey) {
            setCurrentSurvey(surveyDefinition);
            setCurrentTriggerEvent(eventName);
          }
        }, matchingTrigger.min_delay_ms || 2000);
      }
    }
  }, [isResearchSession, participantId, studyId, triggers, triggerCounts, currentSurvey]);
  
  // Dismiss the current survey
  const dismissSurvey = useCallback(() => {
    setCurrentSurvey(null);
    setCurrentTriggerEvent(null);
  }, []);
  
  // Submit survey responses
  const submitSurvey = useCallback(async (answers: SurveyResponse[]) => {
    if (!isResearchSession || !participantId || !studyId || !currentSurvey || !currentTriggerEvent) {
      return;
    }
    
    try {
      await researchService.submitSurveyResponse(
        currentSurvey.survey_id,
        currentTriggerEvent,
        participantId,
        studyId,
        answers
      );
      
      toast({
        title: "Thanks for your feedback!",
        description: "Your responses have been recorded.",
        duration: 3000,
      });
      
      dismissSurvey();
    } catch (error) {
      console.error('Error submitting survey response:', error);
      
      toast({
        title: "Feedback saved",
        description: "Your responses will be submitted when you're back online.",
        duration: 3000,
      });
      
      // Still dismiss the survey since we've stored the response locally
      dismissSurvey();
    }
  }, [isResearchSession, participantId, studyId, currentSurvey, currentTriggerEvent, dismissSurvey]);
  
  // Exit research study
  const exitResearch = useCallback(() => {
    if (participantId && studyId) {
      researchService.updateParticipantStatus(participantId, studyId, 'dropped')
        .catch(error => {
          console.error('Error updating participant status:', error);
        });
    }
    
    // Clear cookies and state
    clearResearchSession();
    researchService.clearCache();
    
    setIsResearchSession(false);
    setParticipantId(null);
    setStudyId(null);
    
    toast({
      title: "Research study exited",
      description: "You have been removed from the research study.",
      duration: 3000,
    });
  }, [participantId, studyId]);
  
  // Complete welcome onboarding
  const completeWelcome = useCallback(() => {
    setShowWelcomeModal(false);
  }, []);
  
  // Provide the context value
  const contextValue: ResearchContextType = {
    isResearchSession,
    participantId,
    studyId,
    currentSurvey,
    currentTriggerEvent,
    trackEvent,
    dismissSurvey,
    submitSurvey,
    exitResearch,
    showWelcomeModal,
    completeWelcome,
  };
  
  return (
    <ResearchContext.Provider value={contextValue}>
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