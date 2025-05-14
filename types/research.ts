// types/research.ts

export type EventType =
  // Trip actions
  | 'trip_created'
  | 'trip_updated'
  | 'trip_deleted'
  | 'trip_creation_failed'
  // Itinerary actions
  | 'itinerary_item_added'
  | 'itinerary_item_updated'
  | 'itinerary_item_deleted'
  | 'itinerary_item_creation_failed'
  | 'itinerary_voted'
  // Group actions
  | 'group_created'
  | 'group_member_added'
  | 'group_member_removed'
  | 'group_plan_created'
  | 'group_plan_creation_failed'
  // Comment & reaction actions
  | 'comment_posted'
  | 'comment_reacted'
  | 'comment_reaction_failed'
  // Budget actions
  | 'budget_item_added'
  | 'budget_item_updated'
  | 'budget_item_deleted'
  | 'budget_item_addition_failed'
  // Feedback & survey
  | 'feedback_submitted'
  | 'survey_started'
  | 'survey_completed'
  | 'survey_step_completed'
  | 'survey_question_answered'
  | 'survey_submission_failed'
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
