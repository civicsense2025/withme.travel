// types/research.ts

export type EventType =
  // Trip actions
  | 'trip_created'
  | 'trip_updated'
  | 'trip_deleted'
  // Itinerary actions
  | 'itinerary_item_added'
  | 'itinerary_item_updated'
  | 'itinerary_item_deleted'
  | 'itinerary_voted'
  // Group actions
  | 'group_created'
  | 'group_member_added'
  | 'group_member_removed'
  // Comment & reaction actions
  | 'comment_posted'
  | 'comment_reacted'
  // Focus mode
  | 'focus_mode_started'
  | 'focus_mode_ended'
  // Budget actions
  | 'budget_item_added'
  | 'budget_item_updated'
  | 'budget_item_deleted'
  // Feedback & survey
  | 'feedback_submitted'
  | 'survey_started'
  | 'survey_completed'
  | 'survey_step_completed'
  | 'survey_question_answered'
  // Onboarding & feature
  | 'onboarding_completed'
  | 'feature_discovered'
  // Content actions
  | 'destination_saved'
  | 'template_used';

export type SurveyType = 'survey' | 'feedback' | 'bug';

export type QuestionType = 'text' | 'select' | 'radio' | 'checkbox' | 'rating';

export interface ResearchSession {
  id: string;
  userId?: string;
  token?: string;
  status: 'active' | 'completed' | 'expired';
  metadata?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface Survey {
  id: string;
  type: SurveyType;
  title: string;
  description?: string;
  milestoneTriggers?: EventType[];
  isActive: boolean;
  createdAt: string;
  questions: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  text: string;
  type: QuestionType;
  options?: any[];
  required: boolean;
  order: number;
  milestone?: string;
  config?: Record<string, any>;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId?: string;
  responses: Record<string, any>;
  milestone?: string;
  progress: number;
  createdAt: string;
}

export interface ResearchContextValue {
  session: ResearchSession | null;
  activeSurvey: Survey | null;
  trackEvent: (eventType: EventType, details?: Record<string, any>) => void;
  setActiveSurvey: (survey: Survey | null) => void;
}
