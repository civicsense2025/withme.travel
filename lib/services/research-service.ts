import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/database';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface SurveyDefinition {
  id: string;
  survey_id: string;
  title: string;
  description: string | null;
  questions: SurveyQuestion[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'likert' | 'text' | 'rating' | 'single_choice';
  options?: {label: string; value: string}[] | string[];
  required: boolean;
  displayCondition?: {
    questionId: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  };
}

export interface ResearchTrigger {
  id: string;
  study_id: string;
  trigger_event: string;
  survey_id: string;
  min_delay_ms: number;
  max_triggers: number;
  active: boolean;
  display_cooldown_minutes?: number;
  max_surveys_per_session?: number;
}

export interface SurveyResponse {
  question_id: string;
  value: any;
}

export interface TriggerContext {
  eventHistory: string[];
  previousResponses: Record<string, SurveyResponse[]>;
  sessionDuration: number;
  currentPage: string;
}

// Local storage keys
const STORAGE_KEYS = {
  PENDING_RESPONSES: 'withme_research_pending_responses',
  SURVEY_CACHE: 'withme_research_survey_cache',
  TRIGGER_COUNTS: 'withme_research_trigger_counts',
  SESSION_EVENTS: 'withme_research_session_events',
  LAST_SURVEY_TIME: 'withme_research_last_survey_time',
  SURVEYS_THIS_SESSION: 'withme_research_surveys_this_session'
};

/**
 * ResearchService handles interactions with the research system,
 * providing caching, offline support, and robust error handling
 */
class ResearchService {
  private supabase: any = null;
  private surveyCache: Map<string, SurveyDefinition> = new Map();
  private pendingResponses: Array<{
    surveyId: string;
    triggerEvent: string;
    participantId: string;
    studyId: string;
    responses: SurveyResponse[];
    timestamp: string;
  }> = [];
  private initialized = false;
  private offlineMode = false;
  private sessionEvents: string[] = [];
  private lastSynced: number = 0;
  private surveysThisSession: number = 0;

  /**
   * Initialize the service
   */
  public init() {
    if (typeof window === 'undefined') return;
    if (this.initialized) return;

    try {
      this.supabase = getBrowserClient();
      this.initialized = true;
      
      // Load cached data
      this.loadCachedData();
      
      // Set up offline detection
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      this.offlineMode = !navigator.onLine;
      
      // Set up sync interval (sync every 5 minutes)
      setInterval(() => this.syncPendingData(), 5 * 60 * 1000);
      
      // Sync data when the page is about to unload
      window.addEventListener('beforeunload', () => {
        this.syncPendingData(true);
      });
      
      console.log('[ResearchService] Initialized');
    } catch (error) {
      console.error('[ResearchService] Initialization error:', error);
      this.offlineMode = true;
    }
    
    return this;
  }
  
  /**
   * Handle browser going online
   */
  private handleOnline = () => {
    this.offlineMode = false;
    console.log('[ResearchService] Online mode');
    this.syncPendingData();
  };
  
  /**
   * Handle browser going offline
   */
  private handleOffline = () => {
    this.offlineMode = true;
    console.log('[ResearchService] Offline mode');
  };
  
  /**
   * Load cached data from localStorage
   */
  private loadCachedData() {
    try {
      // Load pending responses
      const pendingResponsesJson = localStorage.getItem(STORAGE_KEYS.PENDING_RESPONSES);
      if (pendingResponsesJson) {
        this.pendingResponses = JSON.parse(pendingResponsesJson);
      }
      
      // Load survey cache
      const surveyCacheJson = localStorage.getItem(STORAGE_KEYS.SURVEY_CACHE);
      if (surveyCacheJson) {
        const surveyCache = JSON.parse(surveyCacheJson);
        Object.entries(surveyCache).forEach(([key, value]) => {
          this.surveyCache.set(key, value as SurveyDefinition);
        });
      }
      
      // Load session events
      const sessionEventsJson = localStorage.getItem(STORAGE_KEYS.SESSION_EVENTS);
      if (sessionEventsJson) {
        this.sessionEvents = JSON.parse(sessionEventsJson);
      }
      
      // Load surveys this session
      const surveysThisSession = localStorage.getItem(STORAGE_KEYS.SURVEYS_THIS_SESSION);
      if (surveysThisSession) {
        this.surveysThisSession = parseInt(surveysThisSession, 10);
      }
    } catch (error) {
      console.error('[ResearchService] Error loading cached data:', error);
    }
  }
  
  /**
   * Save data to localStorage for offline support
   */
  private saveToLocalStorage() {
    try {
      // Save pending responses
      localStorage.setItem(STORAGE_KEYS.PENDING_RESPONSES, JSON.stringify(this.pendingResponses));
      
      // Save survey cache
      const surveyCache: Record<string, SurveyDefinition> = {};
      this.surveyCache.forEach((value, key) => {
        surveyCache[key] = value;
      });
      localStorage.setItem(STORAGE_KEYS.SURVEY_CACHE, JSON.stringify(surveyCache));
      
      // Save session events
      localStorage.setItem(STORAGE_KEYS.SESSION_EVENTS, JSON.stringify(this.sessionEvents));
      
      // Save surveys this session
      localStorage.setItem(STORAGE_KEYS.SURVEYS_THIS_SESSION, this.surveysThisSession.toString());
    } catch (error) {
      console.error('[ResearchService] Error saving to localStorage:', error);
    }
  }
  
  /**
   * Sync pending data with the server
   */
  public async syncPendingData(isUnloading = false) {
    if (!this.initialized || this.offlineMode || !this.supabase || this.pendingResponses.length === 0) {
      return;
    }
    
    // Don't sync too frequently unless the page is unloading
    const now = Date.now();
    if (!isUnloading && now - this.lastSynced < 60000) {
      return;
    }
    
    this.lastSynced = now;
    console.log(`[ResearchService] Syncing ${this.pendingResponses.length} pending responses`);
    
    try {
      // Clone the array to avoid issues with concurrent modifications
      const pendingResponses = [...this.pendingResponses];
      
      // Clear the array - we'll add back any failures
      this.pendingResponses = [];
      
      // Try to submit each response
      for (const response of pendingResponses) {
        try {
          await this.supabase
            .from(TABLES.SURVEY_RESPONSES)
            .insert({
              survey_id: response.surveyId,
              trigger_event: response.triggerEvent,
              participant_id: response.participantId,
              study_id: response.studyId,
              answers: response.responses,
              created_at: response.timestamp
            });
          
          console.log('[ResearchService] Synced response for survey:', response.surveyId);
        } catch (error) {
          console.error('[ResearchService] Error syncing response:', error);
          // Add back to pending responses
          this.pendingResponses.push(response);
        }
      }
      
      // Save the updated pending responses
      this.saveToLocalStorage();
    } catch (error) {
      console.error('[ResearchService] Error during sync:', error);
    }
  }
  
  /**
   * Track a research event
   */
  public async trackEvent(
    eventName: string,
    participantId: string,
    studyId: string
  ): Promise<void> {
    if (!this.initialized) this.init();
    
    console.log(`[ResearchService] Tracking event: ${eventName}`);
    
    // Add to session events
    this.sessionEvents.push(eventName);
    this.saveToLocalStorage();
    
    if (this.offlineMode || !this.supabase) {
      console.log('[ResearchService] Offline mode: event will be synced later');
      return;
    }
    
    try {
      await this.supabase
        .from(TABLES.RESEARCH_EVENTS)
        .insert({
          participant_id: participantId,
          study_id: studyId,
          event_name: eventName,
        });
    } catch (error) {
      console.error('[ResearchService] Error tracking event:', error);
    }
  }
  
  /**
   * Get triggers for a study
   */
  public async getTriggers(studyId: string): Promise<ResearchTrigger[]> {
    if (!this.initialized) this.init();
    
    if (this.offlineMode || !this.supabase) {
      console.log('[ResearchService] Offline mode: cannot fetch triggers');
      return [];
    }
    
    try {
      const { data, error } = await this.supabase
        .from(TABLES.RESEARCH_TRIGGERS)
        .select(`
          id,
          study_id,
          trigger_event,
          survey_id,
          min_delay_ms,
          max_triggers,
          display_cooldown_minutes,
          max_surveys_per_session,
          active
        `)
        .eq('study_id', studyId)
        .eq('active', true);
        
      if (error) {
        console.error('[ResearchService] Error fetching triggers:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('[ResearchService] Error fetching triggers:', error);
      return [];
    }
  }
  
  /**
   * Get a survey definition by ID with caching
   */
  public async getSurvey(surveyId: string): Promise<SurveyDefinition | null> {
    if (!this.initialized) this.init();
    
    // Check cache first
    if (this.surveyCache.has(surveyId)) {
      return this.surveyCache.get(surveyId) || null;
    }
    
    if (this.offlineMode || !this.supabase) {
      console.log('[ResearchService] Offline mode: cannot fetch survey');
      return null;
    }
    
    try {
      const { data, error } = await this.supabase
        .from('survey_definitions')
        .select('*')
        .eq('survey_id', surveyId)
        .single();
        
      if (error || !data) {
        console.error('[ResearchService] Error fetching survey:', error);
        return null;
      }
      
      // Add to cache
      this.surveyCache.set(surveyId, data);
      this.saveToLocalStorage();
      
      return data;
    } catch (error) {
      console.error('[ResearchService] Error fetching survey:', error);
      return null;
    }
  }
  
  /**
   * Submit a survey response with offline support
   */
  public async submitSurveyResponse(
    surveyId: string,
    triggerEvent: string,
    participantId: string,
    studyId: string,
    responses: SurveyResponse[]
  ): Promise<void> {
    if (!this.initialized) this.init();
    
    // Increment surveys this session
    this.surveysThisSession++;
    
    // Record the last survey time
    localStorage.setItem(STORAGE_KEYS.LAST_SURVEY_TIME, Date.now().toString());
    
    // Validate the response data
    const validationResult = this.validateSurveyResponse(responses);
    if (!validationResult.isValid) {
      console.warn('[ResearchService] Invalid survey response:', validationResult.issues);
    }
    
    // Add to pending responses
    const timestamp = new Date().toISOString();
    this.pendingResponses.push({
      surveyId,
      triggerEvent,
      participantId,
      studyId,
      responses,
      timestamp
    });
    
    this.saveToLocalStorage();
    
    // Try to sync immediately if we're online
    if (!this.offlineMode && this.supabase) {
      try {
        await this.supabase
          .from(TABLES.SURVEY_RESPONSES)
          .insert({
            survey_id: surveyId,
            trigger_event: triggerEvent,
            participant_id: participantId,
            study_id: studyId,
            answers: responses,
            created_at: timestamp
          });
        
        // If successful, remove from pending
        this.pendingResponses = this.pendingResponses.filter(r => 
          !(r.surveyId === surveyId && r.timestamp === timestamp)
        );
        this.saveToLocalStorage();
      } catch (error) {
        console.error('[ResearchService] Error submitting response:', error);
        // Already added to pending, so it will be synced later
      }
    } else {
      console.log('[ResearchService] Offline mode: response will be synced later');
    }
  }
  
  /**
   * Validate a survey response
   */
  private validateSurveyResponse(responses: SurveyResponse[]): { 
    isValid: boolean; 
    issues: string[] 
  } {
    const issues: string[] = [];
    
    // Simple validation - check for empty responses
    if (!responses || responses.length === 0) {
      issues.push('No responses provided');
    }
    
    // Check for missing question IDs
    const missingIds = responses.filter(r => !r.question_id);
    if (missingIds.length > 0) {
      issues.push(`Missing question IDs for ${missingIds.length} responses`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
  
  /**
   * Check if we should show a survey based on cooldown and session limits
   */
  public shouldShowSurvey(trigger: ResearchTrigger): boolean {
    // Check max surveys per session
    if (trigger.max_surveys_per_session && this.surveysThisSession >= trigger.max_surveys_per_session) {
      return false;
    }
    
    // Check cooldown period
    if (trigger.display_cooldown_minutes) {
      const lastSurveyTime = localStorage.getItem(STORAGE_KEYS.LAST_SURVEY_TIME);
      if (lastSurveyTime) {
        const now = Date.now();
        const lastTime = parseInt(lastSurveyTime, 10);
        const cooldownMs = trigger.display_cooldown_minutes * 60 * 1000;
        
        if (now - lastTime < cooldownMs) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get a context object for event triggering
   */
  public getTriggerContext(currentPage: string): TriggerContext {
    return {
      eventHistory: this.sessionEvents,
      previousResponses: {}, // Not implemented yet
      sessionDuration: Date.now() - this.lastSynced,
      currentPage
    };
  }
  
  /**
   * Check if triggers match the specified conditions
   */
  public doesTriggerMatch(trigger: ResearchTrigger, eventName: string): boolean {
    // This is where we'd implement more complex logic
    // For now, just match on event name
    return trigger.trigger_event === eventName;
  }
  
  /**
   * Get the next survey progression based on previous answers
   */
  public getNextSurveyQuestions(
    survey: SurveyDefinition, 
    currentAnswers: Record<string, any>
  ): SurveyQuestion[] {
    if (!survey || !survey.questions) return [];
    
    // Filter questions based on conditional display logic
    return survey.questions.filter(question => {
      // If no display condition, always show
      if (!question.displayCondition) return true;
      
      const { questionId, operator, value } = question.displayCondition;
      const answerValue = currentAnswers[questionId];
      
      // If the condition depends on a question that hasn't been answered, don't show
      if (answerValue === undefined) return false;
      
      switch (operator) {
        case 'equals':
          return answerValue === value;
        case 'contains':
          return Array.isArray(answerValue) 
            ? answerValue.includes(value)
            : String(answerValue).includes(String(value));
        case 'greaterThan':
          return Number(answerValue) > Number(value);
        case 'lessThan':
          return Number(answerValue) < Number(value);
        default:
          return true;
      }
    });
  }
  
  /**
   * Update the participant status
   */
  public async updateParticipantStatus(
    participantId: string,
    studyId: string,
    status: 'invited' | 'active' | 'completed' | 'dropped'
  ): Promise<void> {
    if (!this.initialized) this.init();
    
    if (this.offlineMode || !this.supabase) {
      console.log('[ResearchService] Offline mode: cannot update participant status');
      return;
    }
    
    try {
      await this.supabase
        .from(TABLES.RESEARCH_PARTICIPANTS)
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', participantId)
        .eq('study_id', studyId);
    } catch (error) {
      console.error('[ResearchService] Error updating participant status:', error);
    }
  }
  
  /**
   * Clear all cached data and reset state
   */
  public clearCache(): void {
    this.surveyCache.clear();
    this.pendingResponses = [];
    this.sessionEvents = [];
    this.surveysThisSession = 0;
    
    // Clear localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('[ResearchService] Cache cleared');
  }
}

// Export a singleton instance
export const researchService = new ResearchService(); 