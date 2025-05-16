'use client';

import { useResearch } from './ResearchProvider';

// Define research event types
export const RESEARCH_EVENT_TYPES = {
  // Session events
  SESSION_STARTED: 'session_started',
  SESSION_COMPLETED: 'session_completed',
  
  // Survey events
  SURVEY_STARTED: 'survey_started',
  SURVEY_STEP_COMPLETED: 'survey_step_completed',
  SURVEY_COMPLETED: 'survey_completed',
  SURVEY_ABANDONED: 'survey_abandoned',
  SURVEY_VIEWED: 'survey_viewed',
  
  // Milestone events
  MILESTONE_REACHED: 'milestone_reached',
  
  // Trip-related events
  TRIP_CREATED: 'trip_created',
  TRIP_EDITED: 'trip_edited',
  TRIP_SHARED: 'trip_shared',
  
  // Itinerary events
  ITINERARY_ITEM_ADDED: 'itinerary_item_added',
  ITINERARY_ITEM_EDITED: 'itinerary_item_edited',
  ITINERARY_ITEM_REMOVED: 'itinerary_item_removed',
  
  // Feature usage events
  FEATURE_USED: 'feature_used',
  
  // Error events
  ERROR_ENCOUNTERED: 'error_encountered'
};

/**
 * Hook for tracking research events with proper typing and utilities
 */
export function useResearchTracking() {
  const { trackEvent, session } = useResearch();
  
  /**
   * Track a research event with the proper event type
   * @param eventType - The type of event from RESEARCH_EVENT_TYPES
   * @param details - Optional details about the event
   * @param milestone - Optional milestone this event belongs to
   */
  const track = async (
    eventType: string,
    details?: Record<string, any>,
    milestone?: string
  ) => {
    return trackEvent(eventType, details, milestone);
  };
  
  /**
   * Track a milestone event
   * @param milestone - The milestone name
   * @param details - Optional details about the milestone
   */
  const trackMilestone = async (milestone: string, details?: Record<string, any>) => {
    return trackEvent(
      RESEARCH_EVENT_TYPES.MILESTONE_REACHED,
      { ...details, milestone },
      milestone
    );
  };
  
  /**
   * Track a feature usage event
   * @param featureName - The name of the feature being used
   * @param details - Optional details about the usage
   */
  const trackFeatureUsage = async (featureName: string, details?: Record<string, any>) => {
    return trackEvent(
      RESEARCH_EVENT_TYPES.FEATURE_USED,
      { ...details, feature: featureName }
    );
  };
  
  /**
   * Track an error event
   * @param errorMessage - The error message
   * @param details - Optional details about the error
   */
  const trackError = async (errorMessage: string, details?: Record<string, any>) => {
    return trackEvent(
      RESEARCH_EVENT_TYPES.ERROR_ENCOUNTERED,
      { ...details, error: errorMessage }
    );
  };
  
  return {
    track,
    trackMilestone,
    trackFeatureUsage,
    trackError,
    session,
    eventTypes: RESEARCH_EVENT_TYPES
  };
} 