// ============================================================================
// RESEARCH & USER TESTING TYPES
// ============================================================================

/**
 * Types for form system
 */
export interface Form {
  id: string;
  name: string;
  description: string | null;
  type: 'survey' | 'feedback' | 'bug' | string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * Types for form fields
 */
export interface FormField {
  id: string;
  form_id: string;
  label: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'rating' | string;
  options: any[] | null;
  required: boolean;
  order: number | null;
  milestone: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Types for form responses
 */
export interface FormResponse {
  id: string;
  form_id: string;
  user_id: string | null;
  session_id: string | null;
  responses: Record<string, any>;
  milestone: string | null;
  submitted_at: string;
  metadata: Record<string, any>;
}

/**
 * Types for milestone triggers
 */
export interface MilestoneTrigger {
  id: string;
  form_id: string;
  event_type: string;
  priority: number;
  active: boolean;
  cooldown_minutes: number;
  created_at: string;
  updated_at: string;
}

/**
 * Types for user testing sessions
 */
export interface UserTestingSession {
  id: string;
  user_id: string | null;
  guest_token: string | null;
  session_token: string;
  status: 'active' | 'completed' | 'expired' | string;
  metadata: Record<string, any>;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Types for user testing events
 */
export interface UserTestingEvent {
  id: string;
  session_id: string;
  user_id: string | null;
  event_type: string;
  data: Record<string, any>;
  created_at: string;
}

/**
 * Research event types
 */
export const RESEARCH_EVENT_TYPES = {
  PAGE_VIEW: 'page_view',
  COMPONENT_INTERACTION: 'component_interaction',
  SURVEY_STARTED: 'survey_started',
  SURVEY_STEP_COMPLETED: 'survey_step_completed',
  SURVEY_COMPLETED: 'survey_completed',
  SURVEY_ABANDONED: 'survey_abandoned',
  SESSION_STARTED: 'session_started',
  FEATURE_USED: 'feature_used',
  ERROR_ENCOUNTERED: 'error_encountered',
  MILESTONE_REACHED: 'milestone_reached'
} as const;

export type ResearchEventType = typeof RESEARCH_EVENT_TYPES[keyof typeof RESEARCH_EVENT_TYPES];

// Define Survey related types

export interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[] | { label: string; value: string }[];
  default_value?: any;
}

export interface SurveyConfig {
  progressBar?: boolean;
  allowBack?: boolean;
  showStepCount?: boolean;
  milestones?: string[];
}

export interface Survey {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'draft' | 'archived';
  form_fields: FormField[];
  config?: SurveyConfig;
} 