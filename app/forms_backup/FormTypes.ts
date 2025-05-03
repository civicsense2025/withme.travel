/**
 * Form System Types
 *
 * This file contains TypeScript types and Zod schemas for the forms system
 
 */

import { type TABLES } from '@/utils/constants/database';
import z from 'zod';

// =========================================
// ENUMS
// =========================================

export enum QuestionType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  EMAIL = 'email',
  NUMBER = 'number',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  YES_NO = 'yes_no',
  DATE = 'date',
  RATING = 'rating',
  FILE_UPLOAD = 'file_upload',
  LOCATION = 'location',
  PHONE = 'phone',
  WEBSITE = 'website',
  STATEMENT = 'statement', // Informational text, not a question
  WELCOME = 'welcome', // Welcome screen
  THANK_YOU = 'thank_you', // Thank you/completion screen
}

export enum FormVisibility {
  PRIVATE = 'private',
  SHARED_WITH_LINK = 'shared_with_link',
  PUBLIC = 'public',
}

export enum FormStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum CollaboratorRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  ADMIN = 'admin',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

// =========================================
// DATABASE TYPES
// =========================================

/**
 * Form type from database
 
 */

export type DbForm = {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  slug: string | null;
  form_emoji: string | null;
  cover_image_url: string | null;
  theme_color: string | null;
  font_family: string | null;
  logo_url: string | null;
  show_progress_bar: boolean;
  show_question_numbers: boolean;
  visibility: string;
  status: string;
  allow_anonymous_responses: boolean;
  response_limit: number | null;
  closes_at: string | null;
  view_count: number;
  start_count: number;
  completion_count: number;
  average_time_seconds: number;
  notify_on_response: boolean;
  notification_email: string | null;
  redirect_url: string | null;
  completion_message: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  access_code: string | null;
};

/**
 * Question type from database
 
 */

export type DbQuestion = {
  id: string;
  form_id: string;
  title: string;
  description: string | null;
  placeholder: string | null;
  is_required: boolean;
  question_type: string;
  position: number;
  options: any | null;
  validation_rules: any | null;
  conditional_logic: any | null;
  default_value: string | null;
  max_character_count: number | null;
  show_character_count: boolean;
  rating_scale: number | null;
  rating_type: string | null;
  allowed_file_types: string[] | null;
  max_file_size: number | null;
  max_files: number;
  created_at: string;
  updated_at: string;
};

/**
 * Question branching type from database
 
 */

export type DbQuestionBranching = {
  id: string;
  form_id: string;
  source_question_id: string;
  target_question_id: string;
  condition_type: string;
  condition_value: string;
  created_at: string;
  updated_at: string;
};

/**
 * Response session type from database
 
 */

export type DbResponseSession = {
  id: string;
  form_id: string;
  respondent_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  is_completed: boolean;
  completion_percentage: number;
  started_at: string;
  last_activity_at: string;
  completed_at: string | null;
  time_spent_seconds: number;
  current_question_id: string | null;
  access_code_used: string | null;
};

/**
 * Response type from database
 
 */

export type DbResponse = {
  id: string;
  session_id: string;
  question_id: string;
  text_value: string | null;
  number_value: number | null;
  boolean_value: boolean | null;
  date_value: string | null;
  json_value: any | null;
  file_urls: string[] | null;
  file_metadata: any | null;
  response_time_seconds: number | null;
  skipped: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Form template type from database
 
 */

export type DbFormTemplate = {
  id: string;
  created_by: string;
  name: string;
  description: string | null;
  category: string | null;
  form_structure: any;
  is_official: boolean;
  is_public: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
};

/**
 * Form collaborator type from database
 
 */

export type DbFormCollaborator = {
  id: string;
  form_id: string;
  user_id: string;
  role: string;
  invitation_status: string;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
};

// =========================================
// APPLICATION TYPES
// =========================================

/**
 * Form type for application use
 
 */

export type Form = {
  id: string;
  createdBy: string;
  title: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
  coverImageUrl: string | null;
  themeColor: string | null;
  fontFamily: string | null;
  logoUrl: string | null;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  visibility: FormVisibility;
  status: FormStatus;
  allowAnonymousResponses: boolean;
  responseLimit: number | null;
  closesAt: Date | null;
  viewCount: number;
  startCount: number;
  completionCount: number;
  averageTimeSeconds: number;
  notifyOnResponse: boolean;
  notificationEmail: string | null;
  redirectUrl: string | null;
  completionMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  accessCode: string | null;

  // Computed/additional properties
  isPublished: boolean;
  isActive: boolean;
  responseRate?: number;
  questionCount?: number;
};

/**
 * Option type for choice questions
 
 */

export type QuestionOption = {
  id: string;
  label: string;
  value: string;
  description?: string;
  imageUrl?: string;
};

/**
 * Validation rule type for questions
 
 */

export type ValidationRule = {
  type:
    | 'required'
    | 'min_length'
    | 'max_length'
    | 'min_value'
    | 'max_value'
    | 'regex'
    | 'file_type'
    | 'file_size'
    | 'email'
    | 'url'
    | 'phone';
  value?: string | number;
  message?: string;
};

/**
 * Conditional logic type for questions
 
 */

export type ConditionalLogic = {
  questionId: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'starts_with'
    | 'ends_with';
  value: string | number | boolean;
};

/**
 * Question type for application use
 
 */

export type Question = {
  id: string;
  formId: string;
  title: string;
  description: string | null;
  placeholder: string | null;
  isRequired: boolean;
  type: QuestionType;
  position: number;
  options: QuestionOption[] | null;
  validationRules: ValidationRule[] | null;
  conditionalLogic: ConditionalLogic | null;
  defaultValue: string | null;
  maxCharacterCount: number | null;
  showCharacterCount: boolean;
  ratingScale: number | null;
  ratingType: string | null;
  allowedFileTypes: string[] | null;
  maxFileSize: number | null;
  maxFiles: number;
  createdAt: Date;
  updatedAt: Date;

  // Computed properties
  isEmpty?: boolean;
  responseRate?: number;
  averageCompletionTime?: number;
};

/**
 * Response type for application use
 
 */

export type Response = {
  id: string;
  sessionId: string;
  questionId: string;
  textValue: string | null;
  numberValue: number | null;
  booleanValue: boolean | null;
  dateValue: Date | null;
  jsonValue: any | null;
  fileUrls: string[] | null;
  fileMetadata: any | null;
  responseTimeSeconds: number | null;
  skipped: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Additional properties
  question?: Question;
  responseText?: string; // Formatted response for display
};

/**
 * Response session type for application use
 
 */

export type ResponseSession = {
  id: string;
  formId: string;
  respondentId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  isCompleted: boolean;
  completionPercentage: number;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt: Date | null;
  timeSpentSeconds: number;
  currentQuestionId: string | null;
  accessCodeUsed: string | null;

  // Additional properties
  responses?: Response[];
  currentQuestion?: Question;
  respondentName?: string; // For display
  respondentEmail?: string; // For display
};

/**
 * Form template type for application use
 
 */

export type FormTemplate = {
  id: string;
  createdBy: string;
  name: string;
  description: string | null;
  category: string | null;
  formStructure: any;
  isOfficial: boolean;
  isPublic: boolean;
  useCount: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Form collaborator type for application use
 
 */

export type FormCollaborator = {
  id: string;
  formId: string;
  userId: string;
  role: CollaboratorRole;
  invitationStatus: InvitationStatus;
  invitedBy: string | null;
  invitedAt: Date;
  acceptedAt: Date | null;

  // Additional properties
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
};

// =========================================
// CREATE/UPDATE TYPES
// =========================================

/**
 * Form creation type
 
 */

export type CreateFormData = {
  title: string;
  description?: string;
  emoji?: string;
  visibility?: FormVisibility;
  allowAnonymousResponses?: boolean;
  showProgressBar?: boolean;
  showQuestionNumbers?: boolean;
  themeColor?: string;
  fontFamily?: string;
};

/**
 * Question creation type
 
 */

export type CreateQuestionData = {
  formId: string;
  title: string;
  type: QuestionType;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
  position?: number;
  options?: Omit<QuestionOption, 'id'>[];
  validationRules?: ValidationRule[];
  defaultValue?: string;
  maxCharacterCount?: number;
  showCharacterCount?: boolean;
  ratingScale?: number;
  ratingType?: string;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
};

// =========================================
// ZOD SCHEMAS
// =========================================

/**
 * Form creation schema
 
 */

export const createFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Form title is required')
    .max(100, 'Form title must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  emoji: z.string().max(4, 'Emoji must be 4 characters or less').optional(),
  visibility: z.nativeEnum(FormVisibility).default(FormVisibility.PRIVATE),
  allowAnonymousResponses: z.boolean().default(false),
  showProgressBar: z.boolean().default(true),
  showQuestionNumbers: z.boolean().default(true),
  themeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .optional(),
  fontFamily: z.string().optional(),
});

/**
 * Form update schema
 
 */

export const updateFormSchema = createFormSchema.partial().extend({
  id: z.string().uuid('Invalid form ID'),
  status: z.nativeEnum(FormStatus).optional(),
  responseLimit: z.number().int().positive().optional().nullable(),
  closesAt: z.string().datetime().optional().nullable(),
  notifyOnResponse: z.boolean().optional(),
  notificationEmail: z.string().email('Invalid email address').optional().nullable(),
  redirectUrl: z.string().url('Invalid URL').optional().nullable(),
  completionMessage: z
    .string()
    .max(1000, 'Completion message must be 1000 characters or less')
    .optional()
    .nullable(),
});

/**
 * Question option schema
 
 */

export const questionOptionSchema = z.object({
  label: z.string().min(1, 'Option label is required'),
  value: z.string().min(1, 'Option value is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

/**
 * Validation rule schema
 
 */

export const validationRuleSchema = z.object({
  type: z.enum([
    'required',
    'min_length',
    'max_length',
    'min_value',
    'max_value',
    'regex',
    'file_type',
    'file_size',
    'email',
    'url',
    'phone',
  ]),
  value: z.union([z.string(), z.number()]).optional(),
  message: z.string().optional(),
});

/**
 * Conditional logic schema
 
 */

export const conditionalLogicSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  operator: z.enum([
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'greater_than',
    'less_than',
    'starts_with',
    'ends_with',
  ]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

/**
 * Question creation schema
 
 */

export const createQuestionSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  title: z
    .string()
    .min(1, 'Question title is required')
    .max(255, 'Question title must be 255 characters or less'),
  type: z.nativeEnum(QuestionType),
  description: z
    .string()
    .max(1000, 'Question description must be 1000 characters or less')
    .optional()
    .nullable(),
  placeholder: z
    .string()
    .max(255, 'Placeholder must be 255 characters or less')
    .optional()
    .nullable(),
  isRequired: z.boolean().default(false),
  position: z.number().int().nonnegative().optional(),
  options: z.array(questionOptionSchema).optional().nullable(),
  validationRules: z.array(validationRuleSchema).optional().nullable(),
  conditionalLogic: conditionalLogicSchema.optional().nullable(),
  defaultValue: z.string().optional().nullable(),
  maxCharacterCount: z.number().int().positive().optional().nullable(),
  showCharacterCount: z.boolean().default(false),
  ratingScale: z.number().int().min(3).max(10).optional().nullable(),
  ratingType: z.enum(['stars', 'numbers', 'emojis']).optional().nullable(),
  allowedFileTypes: z.array(z.string()).optional().nullable(),
  maxFileSize: z.number().int().positive().optional().nullable(),
  maxFiles: z.number().int().positive().default(1),
});

/**
 * Question update schema
 
 */

export const updateQuestionSchema = createQuestionSchema.partial().extend({
  id: z.string().uuid('Invalid question ID'),
});

/**
 * Response creation schema
 
 */

export const createResponseSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  questionId: z.string().uuid('Invalid question ID'),
  textValue: z.string().optional().nullable(),
  numberValue: z.number().optional().nullable(),
  booleanValue: z.boolean().optional().nullable(),
  dateValue: z.string().datetime().optional().nullable(),
  jsonValue: z.any().optional().nullable(),
  fileUrls: z.array(z.string()).optional().nullable(),
  fileMetadata: z.any().optional().nullable(),
  responseTimeSeconds: z.number().int().nonnegative().optional().nullable(),
  skipped: z.boolean().default(false),
});

/**
 * Form template creation schema
 
 */

export const createFormTemplateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  category: z.string().optional(),
  formStructure: z.any(),
  isOfficial: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

/**
 * Form collaborator creation schema
 
 */

export const createFormCollaboratorSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(CollaboratorRole).default(CollaboratorRole.VIEWER),
});

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Convert from database to application form type
 
 */
export function mapDbFormToForm(dbForm: DbForm): Form {
  return {
    id: dbForm.id,
    createdBy: dbForm.created_by,
    title: dbForm.title,
    description: dbForm.description,
    slug: dbForm.slug,
    emoji: dbForm.form_emoji,
    coverImageUrl: dbForm.cover_image_url,
    themeColor: dbForm.theme_color,
    fontFamily: dbForm.font_family,
    logoUrl: dbForm.logo_url,
    showProgressBar: dbForm.show_progress_bar,
    showQuestionNumbers: dbForm.show_question_numbers,
    visibility: dbForm.visibility as FormVisibility,
    status: dbForm.status as FormStatus,
    allowAnonymousResponses: dbForm.allow_anonymous_responses,
    responseLimit: dbForm.response_limit,
    closesAt: dbForm.closes_at ? new Date(dbForm.closes_at) : null,
    viewCount: dbForm.view_count,
    startCount: dbForm.start_count,
    completionCount: dbForm.completion_count,
    averageTimeSeconds: dbForm.average_time_seconds,
    notifyOnResponse: dbForm.notify_on_response,
    notificationEmail: dbForm.notification_email,
    redirectUrl: dbForm.redirect_url,
    completionMessage: dbForm.completion_message,
    createdAt: new Date(dbForm.created_at),
    updatedAt: new Date(dbForm.updated_at),
    publishedAt: dbForm.published_at ? new Date(dbForm.published_at) : null,
    accessCode: dbForm.access_code,

    // Computed properties
    isPublished: dbForm.status === FormStatus.PUBLISHED,
    isActive:
      dbForm.status === FormStatus.PUBLISHED &&
      (!dbForm.closes_at || new Date(dbForm.closes_at) > new Date()),
  };
}

/**
 * Convert from database to application question type
 
 */
export function mapDbQuestionToQuestion(dbQuestion: DbQuestion): Question {
  return {
    id: dbQuestion.id,
    formId: dbQuestion.form_id,
    title: dbQuestion.title,
    description: dbQuestion.description,
    placeholder: dbQuestion.placeholder,
    isRequired: dbQuestion.is_required,
    type: dbQuestion.question_type as QuestionType,
    position: dbQuestion.position,
    options: dbQuestion.options
      ? JSON.parse(
          typeof dbQuestion.options === 'string'
            ? dbQuestion.options
            : JSON.stringify(dbQuestion.options)
        )
      : null,
    validationRules: dbQuestion.validation_rules
      ? JSON.parse(
          typeof dbQuestion.validation_rules === 'string'
            ? dbQuestion.validation_rules
            : JSON.stringify(dbQuestion.validation_rules)
        )
      : null,
    conditionalLogic: dbQuestion.conditional_logic
      ? JSON.parse(
          typeof dbQuestion.conditional_logic === 'string'
            ? dbQuestion.conditional_logic
            : JSON.stringify(dbQuestion.conditional_logic)
        )
      : null,
    defaultValue: dbQuestion.default_value,
    maxCharacterCount: dbQuestion.max_character_count,
    showCharacterCount: dbQuestion.show_character_count,
    ratingScale: dbQuestion.rating_scale,
    ratingType: dbQuestion.rating_type,
    allowedFileTypes: dbQuestion.allowed_file_types,
    maxFileSize: dbQuestion.max_file_size,
    maxFiles: dbQuestion.max_files,
    createdAt: new Date(dbQuestion.created_at),
    updatedAt: new Date(dbQuestion.updated_at),
  };
}

/**
 * Convert from database to application response type
 
 */
export function mapDbResponseToResponse(dbResponse: DbResponse): Response {
  return {
    id: dbResponse.id,
    sessionId: dbResponse.session_id,
    questionId: dbResponse.question_id,
    textValue: dbResponse.text_value,
    numberValue: dbResponse.number_value,
    booleanValue: dbResponse.boolean_value,
    dateValue: dbResponse.date_value ? new Date(dbResponse.date_value) : null,
    jsonValue: dbResponse.json_value
      ? JSON.parse(
          typeof dbResponse.json_value === 'string'
            ? dbResponse.json_value
            : JSON.stringify(dbResponse.json_value)
        )
      : null,
    fileUrls: dbResponse.file_urls,
    fileMetadata: dbResponse.file_metadata
      ? JSON.parse(
          typeof dbResponse.file_metadata === 'string'
            ? dbResponse.file_metadata
            : JSON.stringify(dbResponse.file_metadata)
        )
      : null,
    responseTimeSeconds: dbResponse.response_time_seconds,
    skipped: dbResponse.skipped,
    createdAt: new Date(dbResponse.created_at),
    updatedAt: new Date(dbResponse.updated_at),
  };
}

/**
 * Convert from database to application response session type
 
 */
export function mapDbResponseSessionToResponseSession(
  dbSession: DbResponseSession
): ResponseSession {
  return {
    id: dbSession.id,
    formId: dbSession.form_id,
    respondentId: dbSession.respondent_id,
    ipAddress: dbSession.ip_address,
    userAgent: dbSession.user_agent,
    referrer: dbSession.referrer,
    isCompleted: dbSession.is_completed,
    completionPercentage: dbSession.completion_percentage,
    startedAt: new Date(dbSession.started_at),
    lastActivityAt: new Date(dbSession.last_activity_at),
    completedAt: dbSession.completed_at ? new Date(dbSession.completed_at) : null,
    timeSpentSeconds: dbSession.time_spent_seconds,
    currentQuestionId: dbSession.current_question_id,
    accessCodeUsed: dbSession.access_code_used,
  };
}
