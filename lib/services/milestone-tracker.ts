import { SupabaseClient } from '@supabase/supabase-js';
import { MilestoneType, MilestoneCheckResult } from '@/types/research';
import { 
  researchEventsTable, 
  researchTriggersTable 
} from '@/utils/supabase/table-helpers';

/**
 * Service for tracking research milestone events
 * This handles detecting when users reach specific milestones
 * and triggering appropriate surveys at those points
 */
export class MilestoneTracker {
  private supabase: SupabaseClient;
  private participantId: string | null = null;
  private studyId: string | null = null;
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  
  /**
   * Initialize the milestone tracker for a specific participant and study
   */
  public init(participantId: string, studyId: string) {
    this.participantId = participantId;
    this.studyId = studyId;
    return this;
  }
  
  /**
   * Track an event and check if it completes any milestones
   * @param eventType The type of event being tracked
   * @param eventData Additional data about the event
   * @returns Promise with milestone check result
   */
  public async trackEvent(eventType: string, eventData: Record<string, any> = {}): Promise<MilestoneCheckResult> {
    if (!this.participantId || !this.studyId) {
      console.error('MilestoneTracker not initialized');
      return { milestoneReached: false };
    }
    
    try {
      // Track the event in research_events
      await researchEventsTable(this.supabase).insert({
        participant_id: this.participantId,
        study_id: this.studyId,
        event_type: eventType,
        event_data: eventData
      });
      
      // Check if this event completes any milestones
      const milestoneResult = await this.checkForMilestones(eventType, eventData);
      return milestoneResult;
    } catch (error) {
      console.error('Error tracking event:', error);
      return { milestoneReached: false };
    }
  }
  
  /**
   * Check if the user has completed any milestones based on this event
   * @param eventType The type of event that occurred
   * @param eventData Additional data about the event
   * @returns Promise with milestone check result
   */
  private async checkForMilestones(
    eventType: string, 
    eventData: Record<string, any>
  ): Promise<MilestoneCheckResult> {
    if (!this.participantId || !this.studyId) {
      return { milestoneReached: false };
    }
    
    // Check for specific milestone types based on the event
    switch (eventType) {
      case 'complete_onboarding':
        return this.handleOnboardingCompletion(eventData);
        
      case 'create_group':
        return this.handleGroupCreation(eventData);
        
      case 'cast_vote':
        return this.handleVoteProcess(eventData);
        
      case 'create_trip_from_template':
        return this.handleTemplateUsage(eventData);
        
      // Add more event type checks as needed
        
      default:
        return { milestoneReached: false };
    }
  }
  
  /**
   * Check if the onboarding completion milestone has been reached
   */
  private async handleOnboardingCompletion(eventData: Record<string, any>): Promise<MilestoneCheckResult> {
    // This is a direct milestone - completing onboarding directly triggers the milestone
    await this.recordMilestoneCompletion(
      MilestoneType.COMPLETE_ONBOARDING,
      eventData
    );
    
    const surveyId = await this.getMilestoneSurveyId(MilestoneType.COMPLETE_ONBOARDING);
    
    return {
      milestoneReached: true,
      milestoneName: MilestoneType.COMPLETE_ONBOARDING,
      triggerSurvey: !!surveyId,
      surveyId: surveyId || undefined
    };
  }
  
  /**
   * Check if the group formation milestone has been reached
   * This checks if the group has at least one member besides the creator
   */
  private async handleGroupCreation(eventData: Record<string, any>): Promise<MilestoneCheckResult> {
    // Check if this group has members (in the eventData)
    const hasMembers = eventData.members_count && eventData.members_count > 0;
    
    if (hasMembers) {
      await this.recordMilestoneCompletion(
        MilestoneType.GROUP_FORMATION_COMPLETE,
        eventData
      );
      
      const surveyId = await this.getMilestoneSurveyId(MilestoneType.GROUP_FORMATION_COMPLETE);
      
      return {
        milestoneReached: true,
        milestoneName: MilestoneType.GROUP_FORMATION_COMPLETE,
        triggerSurvey: !!surveyId,
        surveyId: surveyId || undefined
      };
    }
    
    return { milestoneReached: false };
  }
  
  /**
   * Check if the voting process milestone has been reached
   */
  private async handleVoteProcess(eventData: Record<string, any>): Promise<MilestoneCheckResult> {
    // Check if this is the first vote (other milestone for first voting activity)
    const { data: priorVotes } = await researchEventsTable(this.supabase)
      .select('id')
      .eq('participant_id', this.participantId)
      .eq('event_type', 'cast_vote')
      .limit(1);
      
    const isFirstVote = !priorVotes || priorVotes.length === 0;
    
    if (isFirstVote) {
      await this.recordMilestoneCompletion(
        MilestoneType.VOTE_PROCESS_USED,
        eventData
      );
      
      const surveyId = await this.getMilestoneSurveyId(MilestoneType.VOTE_PROCESS_USED);
      
      return {
        milestoneReached: true,
        milestoneName: MilestoneType.VOTE_PROCESS_USED,
        triggerSurvey: !!surveyId,
        surveyId: surveyId || undefined
      };
    }
    
    return { milestoneReached: false };
  }
  
  /**
   * Check if the template usage milestone has been reached
   */
  private async handleTemplateUsage(eventData: Record<string, any>): Promise<MilestoneCheckResult> {
    // Template usage is a direct milestone
    await this.recordMilestoneCompletion(
      MilestoneType.TRIP_FROM_TEMPLATE_CREATED,
      eventData
    );
    
    const surveyId = await this.getMilestoneSurveyId(MilestoneType.TRIP_FROM_TEMPLATE_CREATED);
    
    return {
      milestoneReached: true,
      milestoneName: MilestoneType.TRIP_FROM_TEMPLATE_CREATED,
      triggerSurvey: !!surveyId,
      surveyId: surveyId || undefined
    };
  }
  
  /**
   * Check for the 3+ itinerary items milestone
   * This is handled by the database trigger, but we can also check it here
   */
  public async checkItineraryMilestone(): Promise<MilestoneCheckResult> {
    if (!this.participantId || !this.studyId) {
      return { milestoneReached: false };
    }
    
    // Count user's itinerary add events
    const { count } = await researchEventsTable(this.supabase)
      .select('id', { count: 'exact', head: true })
      .eq('participant_id', this.participantId)
      .eq('event_type', 'add_itinerary_item');
      
    // If user has added 3 or more items
    if (count && count >= 3) {
      // Check if this milestone was already recorded
      const { data: existingMilestone } = await this.supabase
        .from('milestone_completions')
        .select('id')
        .eq('participant_id', this.participantId)
        .eq('milestone_type', MilestoneType.ITINERARY_MILESTONE_3_ITEMS)
        .limit(1);
        
      // If it wasn't already recorded, record it now
      if (!existingMilestone || existingMilestone.length === 0) {
        await this.recordMilestoneCompletion(
          MilestoneType.ITINERARY_MILESTONE_3_ITEMS,
          { item_count: count }
        );
        
        const surveyId = await this.getMilestoneSurveyId(MilestoneType.ITINERARY_MILESTONE_3_ITEMS);
        
        return {
          milestoneReached: true,
          milestoneName: MilestoneType.ITINERARY_MILESTONE_3_ITEMS,
          triggerSurvey: !!surveyId,
          surveyId: surveyId || undefined
        };
      }
      
      // Milestone already recorded, but it has been reached
      return {
        milestoneReached: true,
        milestoneName: MilestoneType.ITINERARY_MILESTONE_3_ITEMS,
        triggerSurvey: false
      };
    }
    
    // Milestone not reached yet
    return { milestoneReached: false };
  }
  
  /**
   * Record a milestone completion in the database
   */
  private async recordMilestoneCompletion(
    milestoneType: MilestoneType,
    completionData: Record<string, any> = {}
  ): Promise<void> {
    if (!this.participantId || !this.studyId) {
      return;
    }
    
    try {
      // Check if this milestone was already recorded for this participant
      const { data: existingMilestone } = await this.supabase
        .from('milestone_completions')
        .select('id')
        .eq('participant_id', this.participantId)
        .eq('milestone_type', milestoneType)
        .limit(1);
        
      // Only record if not already recorded
      if (!existingMilestone || existingMilestone.length === 0) {
        await this.supabase.from('milestone_completions').insert({
          participant_id: this.participantId,
          study_id: this.studyId,
          milestone_type: milestoneType,
          completion_data: completionData
        });
        
        // Also record as a research event for tracking
        await researchEventsTable(this.supabase).insert({
          participant_id: this.participantId,
          study_id: this.studyId,
          event_type: `milestone_${milestoneType}`,
          event_data: {
            milestone_reached: true,
            milestone_type: milestoneType,
            ...completionData
          }
        });
      }
    } catch (error) {
      console.error(`Error recording milestone completion for ${milestoneType}:`, error);
    }
  }
  
  /**
   * Get the survey ID for a specific milestone type
   */
  private async getMilestoneSurveyId(milestoneType: MilestoneType): Promise<string | null> {
    if (!this.studyId) return null;
    
    try {
      // First check milestone_triggers
      const { data: milestoneTrigger } = await this.supabase
        .from('milestone_triggers')
        .select('survey_id')
        .eq('study_id', this.studyId)
        .eq('milestone_type', milestoneType)
        .eq('is_active', true)
        .limit(1)
        .single();
        
      if (milestoneTrigger?.survey_id) {
        return milestoneTrigger.survey_id;
      }
      
      // If no specific milestone trigger, check research_triggers
      // by creating equivalent trigger event name
      const triggerEventName = `milestone_${milestoneType}`;
      
      const { data: researchTrigger } = await researchTriggersTable(this.supabase)
        .select('survey_id')
        .eq('study_id', this.studyId)
        .eq('trigger_event', triggerEventName)
        .eq('active', true)
        .limit(1)
        .single();
        
      return researchTrigger?.survey_id || null;
    } catch (error) {
      console.error(`Error getting survey ID for milestone ${milestoneType}:`, error);
      return null;
    }
  }
}

// Export a singleton instance
export const milestoneTracker = new MilestoneTracker(null as any);

// Helper function to initialize the milestone tracker with a supabase client
export function initMilestoneTracker(supabase: SupabaseClient): MilestoneTracker {
  (milestoneTracker as any).supabase = supabase;
  return milestoneTracker;
} 