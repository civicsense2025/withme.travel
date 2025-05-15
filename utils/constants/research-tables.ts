/**
 * Research and Forms System Constants
 * 
 * This file defines the new tables and fields for the unified forms/surveys system
 * as outlined in the user-testing-forms.md documentation.
 * 
 * This replaces the old research tables with a more flexible forms-based approach.
 */

/**
 * Form system tables
 */
export const FORM_TABLES = {
  /** Forms definitions */
  FORMS: 'forms',
  /** Form fields */
  FORM_FIELDS: 'form_fields',
  /** Form responses */
  FORM_RESPONSES: 'form_responses',
  /** Milestone triggers */
  MILESTONE_TRIGGERS: 'milestone_triggers',
  /** User testing sessions */
  USER_TESTING_SESSIONS: 'user_testing_sessions',
  /** User testing events */
  USER_TESTING_EVENTS: 'user_testing_events',
} as const;

/**
 * Form field constants
 */
export const FORM_FIELDS = {
  /** Form fields */
  ID: 'id',
  TYPE: 'type',
  NAME: 'name',
  DESCRIPTION: 'description',
  CONFIG: 'config',
  MILESTONE_TRIGGER: 'milestone_trigger',
  MILESTONES: 'milestones',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  IS_ACTIVE: 'is_active',
} as const;

/**
 * Form field types
 */
export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  SELECT: 'select',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  RATING: 'rating',
  DATE: 'date',
  EMAIL: 'email',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  WELCOME: 'welcome',
  COMPLETION: 'completion',
} as const;

/**
 * Research event types
 */
export const RESEARCH_EVENT_TYPES = {
  /** Page view */
  PAGE_VIEW: 'page_view',
  /** Component interaction */
  COMPONENT_INTERACTION: 'component_interaction',
  /** Survey started */
  SURVEY_STARTED: 'survey_started',
  /** Survey step completed */
  SURVEY_STEP_COMPLETED: 'survey_step_completed',
  /** Survey completed */
  SURVEY_COMPLETED: 'survey_completed',
  /** Survey viewed */
  SURVEY_VIEWED: 'survey_viewed',
  /** Survey abandoned */
  SURVEY_ABANDONED: 'survey_abandoned',
  /** Session started */
  SESSION_STARTED: 'session_started',
  /** Session ended */
  SESSION_ENDED: 'session_ended',
  /** Trip created */
  TRIP_CREATED: 'trip_created',
  /** Trip updated */
  TRIP_UPDATED: 'trip_updated',
  /** Group created */
  GROUP_CREATED: 'group_created',
  /** Milestone reached */
  MILESTONE_REACHED: 'milestone_reached',
} as const;

/**
 * Milestone types
 */
export const MILESTONE_TYPES = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  ITINERARY_3_ITEMS: 'itinerary_3_items',
  GROUP_FORMATION_COMPLETE: 'group_formation_complete',
  VOTE_PROCESS_USED: 'vote_process_used',
  TRIP_FROM_TEMPLATE: 'trip_from_template',
} as const;

/**
 * Form types
 */
export const FORM_TYPES = {
  SURVEY: 'survey',
  FEEDBACK: 'feedback',
  BUG_REPORT: 'bug_report',
  USER_TESTING: 'user_testing',
  CONTACT: 'contact',
} as const;

/**
 * User testing session status
 */
export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
} as const; 