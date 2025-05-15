// types/research.ts

/**
 * Types for the new forms and research system
 * This replaces the legacy research types with a more flexible form-based system.
 */
import { RESEARCH_EVENT_TYPES, FORM_FIELD_TYPES, FORM_TYPES, SESSION_STATUS } from '@/utils/constants/research-tables';

/**
 * Research event type
 */
export type EventType = typeof RESEARCH_EVENT_TYPES[keyof typeof RESEARCH_EVENT_TYPES];

/**
 * Form field type
 */
export type FormFieldType = typeof FORM_FIELD_TYPES[keyof typeof FORM_FIELD_TYPES];

/**
 * Form type
 */
export type FormType = typeof FORM_TYPES[keyof typeof FORM_TYPES];

/**
 * Session status
 */
export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];

/**
 * Form field interface
 */
export interface FormField {
  id: string;
  form_id: string;
  type: FormFieldType;
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  order?: number;
  config?: {
    options?: { label: string; value: string }[];
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Form interface
 */
export interface Form {
  id: string;
  name: string;
  description?: string;
  type: FormType;
  is_active: boolean;
  milestone_trigger?: string | null;
  config?: {
    welcome_message?: string;
    completion_message?: string;
    show_progress?: boolean;
    [key: string]: any;
  };
  fields?: FormField[];
  created_at: string;
  updated_at?: string;
}

/**
 * Form response interface
 */
export interface FormResponse {
  id: string;
  form_id: string;
  user_id?: string;
  session_id?: string;
  field_responses: Record<string, any>;
  device_info?: {
    userAgent?: string;
    screenWidth?: number;
    screenHeight?: number;
    language?: string;
    platform?: string;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * User testing session
 */
export interface UserTestingSession {
  id: string;
  user_id?: string;
  token: string;
  status: SessionStatus;
  form_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

/**
 * Research event
 */
export interface ResearchEvent {
  id: string;
  session_id?: string;
  user_id?: string;
  event_type: EventType;
  details?: Record<string, any>;
  route?: string;
  milestone?: string;
  created_at: string;
}

/**
 * Milestone trigger
 */
export interface MilestoneTrigger {
  id: string;
  name: string;
  description?: string;
  milestone: string;
  event_type: EventType;
  conditions?: {
    route?: string;
    properties?: Record<string, any>;
    user_property?: string;
    [key: string]: any;
  };
  form_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Legacy interfaces for backward compatibility
// These are aliased to the new types to maintain compatibility
export type Survey = Form;
export type SurveyQuestion = FormField;
export type QuestionType = FormFieldType;
export type ResearchSession = UserTestingSession;
export type SurveyResponse = FormResponse;

/**
 * Research context value
 */
export interface ResearchContextValue {
  session: UserTestingSession | null;
  startSession: (token?: string) => Promise<UserTestingSession | null>;
  trackEvent: (eventType: EventType | string, data?: Record<string, any>) => Promise<void>;
  showSurvey: (formId: string, milestone?: string) => void;
  activeSurvey: { formId: string; milestone?: string } | null;
  closeSurvey: () => void;
  isSurveyVisible: boolean;
}

export { RESEARCH_EVENT_TYPES };
