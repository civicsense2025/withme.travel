/**
 * Represents a milestone (step) in a survey
 */
export interface SurveyMilestone {
  /** Unique milestone ID */
  id: string;
  /** Milestone name (e.g., 'Onboarding', 'Trip Planning') */
  name: string;
  /** Optional description for the milestone */
  description?: string;
  /** Order of this milestone in the survey */
  order: number;
  /** Questions belonging to this milestone */
  questions: SurveyQuestion[];
}

/**
 * Represents a survey question
 */
export interface SurveyQuestion {
  /** Unique question ID */
  id: string;
  /** Question type */
  type: 'text' | 'single_choice' | 'multiple_choice' | 'rating' | 'checkbox';
  /** Question label */
  label: string;
  /** Whether this question is required */
  required: boolean;
  /** Options for select/radio/checkbox questions */
  options?: { label: string; value: string }[];
  /** Placeholder text for text questions */
  placeholder?: string;
  /** Order of this question within the milestone */
  order: number;
}

/**
 * Represents a survey definition with milestones
 */
export interface SurveyDefinition {
  /** Unique survey ID */
  id: string;
  /** Survey title */
  title: string;
  /** Optional survey description */
  description?: string;
  /** Array of milestones (steps) in the survey */
  milestones: SurveyMilestone[];
  /** Whether the survey is active */
  isActive: boolean;
} 