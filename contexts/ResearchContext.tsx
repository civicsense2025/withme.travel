'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useResearchSession } from '@/lib/hooks/use-research-session';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';
import { Survey, SurveyQuestion } from '@/types/research';

// Define the context type
interface ResearchContextType {
  isResearchSession: boolean;
  isLoading: boolean;
  trackEvent: (eventName: string, metadata?: Record<string, any>) => Promise<void>;
  endSession: () => void;
  currentSurvey: Survey | null;
  dismissSurvey: () => void;
  submitSurvey: (answers: any[]) => Promise<void>;
}

// Create the context with default values
const ResearchContext = createContext<ResearchContextType>({
  isResearchSession: false,
  isLoading: true,
  trackEvent: async () => {},
  endSession: () => {},
  currentSurvey: null,
  dismissSurvey: () => {},
  submitSurvey: async () => {},
});

// Export a hook to use the context
export const useResearch = () => useContext(ResearchContext);

interface ResearchProviderProps {
  children: React.ReactNode;
}

export const ResearchProvider: React.FC<ResearchProviderProps> = ({ children }) => {
  const { 
    isResearchSession, 
    participantId, 
    studyId, 
    isLoading: sessionLoading,
    trackEvent: sessionTrackEvent,
    endSession 
  } = useResearchSession();
  
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [currentTriggerEvent, setCurrentTriggerEvent] = useState<string | null>(null);
  const [isCheckingTriggers, setIsCheckingTriggers] = useState(false);
  
  const supabase = getBrowserClient();
  
  // Check for triggers when events are tracked
  const trackEvent = async (eventName: string, metadata: Record<string, any> = {}) => {
    if (!isResearchSession || !participantId || !studyId) return;
    
    // Track the event using the session hook
    await sessionTrackEvent(eventName, metadata);
    
    // Don't check for triggers if we're already showing a survey
    if (currentSurvey) return;
    
    try {
      setIsCheckingTriggers(true);
      
      // Check if there are any triggers matching this event
      const { data: triggers, error: triggerError } = await supabase
        .from('research_triggers')
        .select('*')
        .eq('study_id', studyId)
        .eq('trigger_event', eventName)
        .eq('active', true);
      
      if (triggerError) {
        console.error('Error checking research triggers:', triggerError);
        return;
      }
      
      if (!triggers || triggers.length === 0) {
        return;
      }
      
      // Check if we've already shown this trigger the max number of times
      const trigger = triggers[0]; // Use the first matching trigger
      
      // Get count of responses for this trigger
      const { count, error: countError } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('participant_id', participantId)
        .eq('trigger_event', eventName);
      
      if (countError) {
        console.error('Error counting survey responses:', countError);
        return;
      }
      
      // If we've already shown this survey the max number of times, don't show it again
      if (count !== null && count >= trigger.max_triggers) {
        return;
      }
      
      // Get the survey for this trigger
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', trigger.survey_id)
        .eq('is_active', true)
        .single();
      
      if (surveyError || !survey) {
        console.error('Error fetching survey:', surveyError);
        return;
      }
      
      // Show the survey after a delay if configured
      if (trigger.min_delay_ms > 0) {
        setTimeout(() => {
          setCurrentSurvey(survey);
          setCurrentTriggerEvent(eventName);
        }, trigger.min_delay_ms);
      } else {
        setCurrentSurvey(survey);
        setCurrentTriggerEvent(eventName);
      }
    } catch (error) {
      console.error('Error processing research trigger:', error);
    } finally {
      setIsCheckingTriggers(false);
    }
  };
  
  // Dismiss the current survey without submitting
  const dismissSurvey = () => {
    setCurrentSurvey(null);
    setCurrentTriggerEvent(null);
  };
  
  // Submit survey responses
  const submitSurvey = async (answers: any[]) => {
    if (!currentSurvey || !currentTriggerEvent || !participantId || !studyId) return;
    
    try {
      await supabase
        .from('survey_responses')
        .insert({
          study_id: studyId,
          survey_id: currentSurvey.id,
          participant_id: participantId,
          trigger_event: currentTriggerEvent,
          answers: answers
        });
      
      // Track completion event
      await sessionTrackEvent('survey_completed', {
        survey_id: currentSurvey.id,
        trigger_event: currentTriggerEvent
      });
      
      // Clear the current survey
      dismissSurvey();
    } catch (error) {
      console.error('Error submitting survey response:', error);
      
      // Track error event
      await sessionTrackEvent('survey_submission_error', {
        survey_id: currentSurvey.id,
        trigger_event: currentTriggerEvent,
        error: String(error)
      });
    }
  };
  
  return (
    <ResearchContext.Provider
      value={{
        isResearchSession,
        isLoading: sessionLoading || isCheckingTriggers,
        trackEvent,
        endSession,
        currentSurvey,
        dismissSurvey,
        submitSurvey
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
}; 