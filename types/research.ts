/**
 * Research and Survey Types
 */

// Study status types
export type ResearchStudyStatus = 'draft' | 'active' | 'completed' | 'paused';

// Participant status types
export type ParticipantStatus = 'invited' | 'active' | 'completed' | 'dropped';

// Milestone types - these match the enum in the database
export enum MilestoneType {
  COMPLETE_ONBOARDING = 'COMPLETE_ONBOARDING',
  ITINERARY_MILESTONE_3_ITEMS = 'ITINERARY_MILESTONE_3_ITEMS',
  GROUP_FORMATION_COMPLETE = 'GROUP_FORMATION_COMPLETE',
  VOTE_PROCESS_USED = 'VOTE_PROCESS_USED',
  TRIP_FROM_TEMPLATE_CREATED = 'TRIP_FROM_TEMPLATE_CREATED'
}

// Study definition
export interface ResearchStudy {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  status?: ResearchStudyStatus;
}

// Participant record
export interface ResearchParticipant {
  id: string;
  study_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
}

// Event tracking
export interface ResearchEvent {
  id: string;
  study_id: string;
  participant_id: string;
  event_type: string;
  event_data?: Record<string, unknown>;
  created_at: string;
}

// Milestone trigger configuration
export interface MilestoneTrigger {
  id: string;
  study_id: string;
  milestone_type: MilestoneType;
  threshold_value?: number;
  is_active: boolean;
  survey_id: string;
  created_at: string;
  updated_at: string;
}

// Milestone completion record
export interface MilestoneCompletion {
  id: string;
  participant_id: string;
  study_id: string;
  milestone_type: MilestoneType;
  completion_data?: Record<string, unknown>;
  created_at: string;
}

// A/B test variant
export interface ABTestVariant {
  id: string;
  study_id: string;
  name: string;
  description?: string;
  weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Participant variant assignment
export interface ParticipantVariant {
  id: string;
  participant_id: string;
  variant_id: string;
  created_at: string;
}

// Participant status change record
export interface ParticipantStatusHistory {
  id: string;
  participant_id: string;
  previous_status?: ParticipantStatus;
  new_status: ParticipantStatus;
  reason?: string;
  created_at: string;
}

// Analytics record
export interface ResearchAnalytics {
  id: string;
  study_id: string;
  metric_type: string;
  metric_name: string;
  metric_value: number;
  dimension?: string;
  dimension_value?: string;
  calculation_time: string;
}

// Survey trigger rule
export interface ResearchTrigger {
  id: string;
  study_id: string;
  trigger_event: string;
  survey_id: string;
  min_delay_ms?: number;
  max_triggers?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Question types for survey
export type QuestionType = 
  | 'text' 
  | 'textarea'
  | 'radio' 
  | 'checkbox' 
  | 'rating' 
  | 'matrix'
  | 'dropdown';

// Base question interface
interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  required: boolean;
}

// Text input question
export interface TextQuestion extends BaseQuestion {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
}

// Textarea question
export interface TextareaQuestion extends BaseQuestion {
  type: 'textarea';
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

// Radio/selection question
export interface RadioQuestion extends BaseQuestion {
  type: 'radio';
  options: Array<{
    value: string;
    label: string;
  }>;
  other?: boolean;
}

// Checkbox question
export interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox';
  options: Array<{
    value: string;
    label: string;
  }>;
  other?: boolean;
  max_selections?: number;
}

// Rating question
export interface RatingQuestion extends BaseQuestion {
  type: 'rating';
  min: number;
  max: number;
  min_label?: string;
  max_label?: string;
  step?: number;
}

// Matrix question
export interface MatrixQuestion extends BaseQuestion {
  type: 'matrix';
  rows: Array<{
    value: string;
    label: string;
  }>;
  columns: Array<{
    value: string;
    label: string;
  }>;
}

// Dropdown question
export interface DropdownQuestion extends BaseQuestion {
  type: 'dropdown';
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder?: string;
}

// Union type for all question types
export type SurveyQuestion =
  | TextQuestion
  | TextareaQuestion
  | RadioQuestion
  | CheckboxQuestion
  | RatingQuestion
  | MatrixQuestion
  | DropdownQuestion;

// Complete survey definition (from existing survey_definitions table)
export interface Survey {
  id: string; // Survey ID from survey_definitions
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

// Answer to a survey question
export interface SurveyAnswer {
  question_id: string;
  answer: string | string[] | number | Record<string, string | number>;
}

// Complete survey response
export interface SurveyResponse {
  id?: string;
  survey_id: string;
  participant_id: string;
  study_id: string;
  trigger_event?: string;
  answers: SurveyAnswer[];
  created_at?: string;
}

// Research session data structure
export interface ResearchSession {
  participantId: string;
  studyId: string;
  isActive: boolean;
  startTime: string;
  variant?: string; // A/B test variant if assigned
}

// API responses
export interface ResearchEventResponse {
  success: boolean;
  error?: string;
  event_id?: string;
}

export interface SurveyResponseResponse {
  success: boolean;
  error?: string;
  response_id?: string;
} 

// Milestone tracking helper function result
export interface MilestoneCheckResult {
  milestoneReached: boolean;
  milestoneName?: MilestoneType;
  triggerSurvey?: boolean;
  surveyId?: string;
} 