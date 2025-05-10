import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { useResearchSession } from '@/lib/hooks/use-research-session';
import { researchEventsTable, researchTriggersTable } from '@/utils/supabase/table-helpers';
import { milestoneTracker, initMilestoneTracker } from '@/lib/services/milestone-tracker';
import { MilestoneCheckResult, MilestoneType, Survey } from '@/types/research';
import { useToast } from '@/components/ui/use-toast';

interface ResearchContextType {
  isResearchSession: boolean;
  participantId: string | null;
  studyId: string | null;
  variantId: string | null;
  variantName: string | null;
  currentSurvey: Survey | null;
  currentTriggerEvent: string | null;
  isShowingSurvey: boolean;
  
  // Event tracking methods
  trackEvent: (eventName: string, metadata?: Record<string, any>) => Promise<void>;
  trackMilestone: (milestoneType: MilestoneType, data?: Record<string, any>) => Promise<void>;
  checkMilestone: (milestoneType: MilestoneType) => Promise<MilestoneCheckResult>;
  
  // Survey methods
  dismissSurvey: () => void;
  submitSurvey: (answers: any[]) => Promise<void>;
  
  // Session methods
  endResearchSession: () => Promise<void>;
  
  // Tracking status
  hasCompletedMilestone: (milestoneName: MilestoneType) => Promise<boolean>;
}

const ResearchContext = createContext<ResearchContextType>({
  isResearchSession: false,
  participantId: null,
  studyId: null,
  variantId: null,
  variantName: null,
  currentSurvey: null,
  currentTriggerEvent: null,
  isShowingSurvey: false,
  
  trackEvent: async () => {},
  trackMilestone: async () => {},
  checkMilestone: async () => ({ milestoneReached: false }),
  
  dismissSurvey: () => {},
  submitSurvey: async () => {},
  
  endResearchSession: async () => {},
  
  hasCompletedMilestone: async () => false,
});

export const useResearch = () => useContext(ResearchContext);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { isResearchSession, participantId, studyId } = useResearchSession();
  const supabase = getBrowserClient();
  
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [currentTriggerEvent, setCurrentTriggerEvent] = useState<string | null>(null);
  const [isShowingSurvey, setIsShowingSurvey] = useState(false);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [variantName, setVariantName] = useState<string | null>(null);
  
  // Initialize milestone tracker when session begins
  useEffect(() => {
    if (isResearchSession && participantId && studyId) {
      const tracker = initMilestoneTracker(supabase);
      tracker.init(participantId, studyId);
      
      // Check for A/B test variant assignment
      assignVariant();
      
      // Set up OpenReplay metadata
      if (typeof window !== 'undefined' && window.tracker) {
        window.tracker.setMetadata('researchSession', 'true');
        window.tracker.setMetadata('participantId', participantId);
        window.tracker.setMetadata('studyId', studyId);
      }
    }
  }, [isResearchSession, participantId, studyId, supabase]);
  
  /**
   * Assign participant to A/B test variant if not already assigned
   */
  const assignVariant = async () => {
    if (!isResearchSession || !participantId || !studyId) return;
    
    try {
      // Check if participant is already assigned to a variant
      const { data: existingAssignment } = await supabase
        .from('participant_variants')
        .select('variant_id, ab_test_variants(name)')
        .eq('participant_id', participantId)
        .single();
      
      if (existingAssignment) {
        // Already assigned, use that assignment
        setVariantId(existingAssignment.variant_id);
        const abTestVariants = existingAssignment.ab_test_variants;
        if (Array.isArray(abTestVariants)) {
          setVariantName((abTestVariants as { name?: string }[])[0]?.name || null);
        } else {
          setVariantName((abTestVariants as { name?: string } | undefined)?.name || null);
        }
        return;
      }
      
      // Get active variants for this study
      const { data: variants } = await supabase
        .from('ab_test_variants')
        .select('id, name, weight')
        .eq('study_id', studyId)
        .eq('is_active', true);
      
      if (!variants || variants.length === 0) {
        // No active variants, no assignment needed
        return;
      }
      
      // Random assignment based on weights
      const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 50), 0);
      let random = Math.random() * totalWeight;
      let selectedVariant = variants[0];
      
      for (const variant of variants) {
        random -= (variant.weight || 50);
        if (random <= 0) {
          selectedVariant = variant;
          break;
        }
      }
      
      // Store the assignment
      await supabase.from('participant_variants').insert({
        participant_id: participantId,
        variant_id: selectedVariant.id
      });
      
      setVariantId(selectedVariant.id);
      setVariantName(selectedVariant.name);
      
      // Track the variant assignment as an event
      await researchEventsTable(supabase).insert({
        participant_id: participantId,
        study_id: studyId,
        event_type: 'variant_assigned',
        event_data: {
          variant_id: selectedVariant.id,
          variant_name: selectedVariant.name
        }
      });
      
      // Set OpenReplay metadata for the variant
      if (typeof window !== 'undefined' && window.tracker) {
        window.tracker.setMetadata('variant', selectedVariant.name);
      }
    } catch (error) {
      console.error('Error assigning A/B test variant:', error);
    }
  };
  
  /**
   * Track a general user event and check for matching trigger rules
   */
  const trackEvent = async (eventName: string, metadata: Record<string, any> = {}) => {
    if (!isResearchSession || !participantId || !studyId) return;
    
    try {
      // Add variant info to the event data if available
      const eventData = {
        ...metadata,
        ...(variantId ? { variant_id: variantId, variant_name: variantName } : {})
      };
      
      // Track the event
      await researchEventsTable(supabase).insert({
        participant_id: participantId,
        study_id: studyId,
        event_type: eventName,
        event_data: eventData
      });
      
      // Track in OpenReplay if available
      if (typeof window !== 'undefined' && window.tracker) {
        window.tracker.trackEvent(eventName, eventData);
      }
      
      // Check for milestone completion
      const milestoneResult = await milestoneTracker.trackEvent(eventName, eventData);
      
      // If a milestone was reached that should trigger a survey, handle it
      if (milestoneResult.milestoneReached && milestoneResult.triggerSurvey && milestoneResult.surveyId) {
        await showSurveyForTrigger(milestoneResult.surveyId, `milestone_${milestoneResult.milestoneName}`);
        return;
      }
      
      // Otherwise check standard triggers
      await checkTriggers(eventName);
    } catch (error) {
      console.error(`Error tracking event ${eventName}:`, error);
    }
  };
  
  /**
   * Directly track a milestone event
   */
  const trackMilestone = async (milestoneType: MilestoneType, data: Record<string, any> = {}) => {
    if (!isResearchSession || !participantId || !studyId) return;
    
    try {
      const eventName = `milestone_${milestoneType}`;
      const eventData = {
        milestone_type: milestoneType,
        ...data,
        ...(variantId ? { variant_id: variantId, variant_name: eventName } : {})
      };
      
      // Track the milestone event
      await researchEventsTable(supabase).insert({
        participant_id: participantId,
        study_id: studyId,
        event_type: eventName,
        event_data: eventData
      });
      
      // Record milestone completion
      await supabase.from('milestone_completions').insert({
        participant_id: participantId,
        study_id: studyId,
        milestone_type: milestoneType,
        completion_data: eventData
      });
      
      // Check if this milestone has an associated survey
      const surveyId = await getSurveyForMilestone(milestoneType);
      if (surveyId) {
        await showSurveyForTrigger(surveyId, eventName);
      }
      
      // Track in OpenReplay if available
      if (typeof window !== 'undefined' && window.tracker) {
        window.tracker.trackEvent(eventName, eventData);
      }
    } catch (error) {
      console.error(`Error tracking milestone ${milestoneType}:`, error);
    }
  };
  
  /**
   * Check if the participant has completed a specific milestone
   */
  const hasCompletedMilestone = async (milestoneType: MilestoneType): Promise<boolean> => {
    if (!isResearchSession || !participantId) return false;
    
    try {
      const { data, error } = await supabase
        .from('milestone_completions')
        .select('id')
        .eq('participant_id', participantId)
        .eq('milestone_type', milestoneType)
        .limit(1);
        
      return !error && !!data && data.length > 0;
    } catch (error) {
      console.error(`Error checking milestone completion for ${milestoneType}:`, error);
      return false;
    }
  };
  
  /**
   * Check a specific milestone type
   */
  const checkMilestone = async (milestoneType: MilestoneType): Promise<MilestoneCheckResult> => {
    if (!isResearchSession || !participantId || !studyId) {
      return { milestoneReached: false };
    }
    
    if (milestoneType === MilestoneType.ITINERARY_MILESTONE_3_ITEMS) {
      return milestoneTracker.checkItineraryMilestone();
    }
    
    // Check if this milestone is already completed
    const isCompleted = await hasCompletedMilestone(milestoneType);
    if (isCompleted) {
      return {
        milestoneReached: true,
        milestoneName: milestoneType,
        triggerSurvey: false
      };
    }
    
    return { milestoneReached: false };
  };
  
  /**
   * Get a survey ID for a milestone type
   */
  const getSurveyForMilestone = async (milestoneType: MilestoneType): Promise<string | null> => {
    if (!studyId) return null;
    
    try {
      // Check milestone_triggers table first
      const { data: milestoneTrigger } = await supabase
        .from('milestone_triggers')
        .select('survey_id')
        .eq('study_id', studyId)
        .eq('milestone_type', milestoneType)
        .eq('is_active', true)
        .limit(1)
        .single();
        
      if (milestoneTrigger?.survey_id) {
        return milestoneTrigger.survey_id;
      }
      
      // Fall back to research_triggers with the milestone event name
      const triggerEventName = `milestone_${milestoneType}`;
      const { data: researchTrigger } = await researchTriggersTable(supabase)
        .select('survey_id')
        .eq('study_id', studyId)
        .eq('trigger_event', triggerEventName)
        .eq('active', true)
        .limit(1)
        .single();
        
      return researchTrigger?.survey_id || null;
    } catch (error) {
      console.error(`Error getting survey for milestone ${milestoneType}:`, error);
      return null;
    }
  };
  
  /**
   * Check if any trigger rules match the current event
   */
  const checkTriggers = async (eventName: string) => {
    if (!studyId) return;
    
    try {
      // Look for matching trigger rules
      const { data: triggers } = await researchTriggersTable(supabase)
        .select('*')
        .eq('study_id', studyId)
        .eq('trigger_event', eventName)
        .eq('active', true);
        
      if (!triggers || triggers.length === 0) return;
      
      // Find the first active trigger
      const trigger = triggers.find((t: any) => t.active);
      if (!trigger) return;
      
      // Show the survey for this trigger
      await showSurveyForTrigger(trigger.survey_id, eventName);
    } catch (error) {
      console.error(`Error checking triggers for ${eventName}:`, error);
    }
  };
  
  /**
   * Show a survey for a specific trigger
   */
  const showSurveyForTrigger = async (surveyId: string, triggerEvent: string) => {
    try {
      // Fetch the survey definition
      const { data: survey } = await supabase
        .from('survey_definitions')
        .select('*')
        .eq('survey_id', surveyId)
        .eq('is_active', true)
        .single();
        
      if (!survey) {
        console.error(`Survey ${surveyId} not found or not active`);
        return;
      }
      
      // Format the survey for display
      const formattedSurvey: Survey = {
        id: survey.survey_id,
        title: survey.title,
        description: survey.description || undefined,
        questions: survey.questions || []
      };
      
      // Save the current trigger event for when the survey is submitted
      setCurrentTriggerEvent(triggerEvent);
      
      // Show the survey
      setCurrentSurvey(formattedSurvey);
      setIsShowingSurvey(true);
      
      // Track survey shown event
      await researchEventsTable(supabase).insert({
        participant_id: participantId,
        study_id: studyId,
        event_type: 'survey_shown',
        event_data: {
          survey_id: surveyId,
          trigger_event: triggerEvent
        }
      });
      
      // Track in OpenReplay if available
      if (typeof window !== 'undefined' && window.tracker) {
        window.tracker.trackEvent('survey_shown', {
          survey_id: surveyId,
          trigger_event: triggerEvent
        });
      }
    } catch (error) {
      console.error(`Error showing survey for trigger ${triggerEvent}:`, error);
    }
  };
  
  /**
   * Dismiss the current survey without submitting
   */
  const dismissSurvey = () => {
    if (!currentSurvey) return;
    
    // Track survey dismissed event
    if (participantId && studyId) {
      researchEventsTable(supabase).insert({
        participant_id: participantId,
        study_id: studyId,
        event_type: 'survey_dismissed',
        event_data: {
          survey_id: currentSurvey.id,
          trigger_event: currentTriggerEvent
        }
      }).then(() => {
        // Clear the survey state
        setCurrentSurvey(null);
        setCurrentTriggerEvent(null);
        setIsShowingSurvey(false);
      });
      
      // Track in OpenReplay if available
      if (typeof window !== 'undefined' && window.tracker) {
        window.tracker.trackEvent('survey_dismissed', {
          survey_id: currentSurvey.id,
          trigger_event: currentTriggerEvent
        });
      }
    } else {
      // Just clear the survey state
      setCurrentSurvey(null);
      setCurrentTriggerEvent(null);
      setIsShowingSurvey(false);
    }
  };
  
  /**
   * Submit survey responses
   */
  const submitSurvey = async (answers: any[]) => {
    if (!currentSurvey || !currentTriggerEvent || !participantId || !studyId) return;
    
    try {
      // Submit survey responses
      const { data, error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: currentSurvey.id,
          participant_id: participantId,
          study_id: studyId,
          trigger_event: currentTriggerEvent,
          answers: answers
        })
        .select('id')
        .single();
        
      if (error) {
        throw error;
      }
      
      // Track survey completed event
      await researchEventsTable(supabase).insert({
        participant_id: participantId,
        study_id: studyId,
        event_type: 'survey_completed',
        event_data: {
          survey_id: currentSurvey.id,
          trigger_event: currentTriggerEvent,
          response_id: data.id
        }
      });
      
      // Track in OpenReplay if available
      if (typeof window !== 'undefined' && window.tracker) {
        window.tracker.trackEvent('survey_completed', {
          survey_id: currentSurvey.id,
          trigger_event: currentTriggerEvent,
          response_id: data.id
        });
      }
      
      // Show success toast
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully.',
        duration: 3000
      });
      
      // Clear the survey state
      setCurrentSurvey(null);
      setCurrentTriggerEvent(null);
      setIsShowingSurvey(false);
    } catch (error) {
      console.error('Error submitting survey:', error);
      
      // Show error toast
      toast({
        title: 'Submission error',
        description: 'There was a problem submitting your feedback. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
    }
  };
  
  /**
   * End the research session
   */
  const endResearchSession = async () => {
    if (!participantId || !studyId) return;
    
    try {
      // Update participant status to completed
      await supabase
        .from('research_participants')
        .update({ status: 'completed' })
        .eq('id', participantId);
      
      // Add status history record
      await supabase.from('participant_status_history').insert({
        participant_id: participantId,
        previous_status: 'active',
        new_status: 'completed',
        reason: 'User ended session'
      });
      
      // Track session end event
      await researchEventsTable(supabase).insert({
        participant_id: participantId,
        study_id: studyId,
        event_type: 'research_session_end',
        event_data: {
          reason: 'User ended session'
        }
      });
      
      // Clear the cookies
      document.cookie = 'research_participant_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'research_study_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Show confirmation toast
      toast({
        title: 'Research session ended',
        description: 'Thank you for participating in our research!',
        duration: 3000
      });
      
      // Refresh the page to reset the session state
      window.location.reload();
    } catch (error) {
      console.error('Error ending research session:', error);
      
      // Show error toast
      toast({
        title: 'Error',
        description: 'There was a problem ending your research session.',
        variant: 'destructive',
        duration: 5000
      });
    }
  };
  
  return (
    <ResearchContext.Provider
      value={{
        isResearchSession,
        participantId,
        studyId,
        variantId,
        variantName,
        currentSurvey,
        currentTriggerEvent,
        isShowingSurvey,
        
        trackEvent,
        trackMilestone,
        checkMilestone,
        
        dismissSurvey,
        submitSurvey,
        
        endResearchSession,
        
        hasCompletedMilestone,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

// Add TypeScript support for OpenReplay tracker
declare global {
  interface Window {
    tracker?: {
      trackEvent: (name: string, payload?: any) => void;
      setMetadata: (key: string, value: string) => void;
    };
  }
} 