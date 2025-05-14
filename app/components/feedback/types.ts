/**
 * Feedback System Types
 */

import { z } from 'zod';

// =========================================
// ENUMS
// =========================================

export enum QuestionType {
  // Text Questions
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  EMAIL = 'email',

  // Choice Questions
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  YES_NO = 'yes_no',

  // Rating Questions
  RATING = 'rating',
  NPS = 'nps',
  NUMERIC_SCALE = 'numeric_scale',

  // Visual Selectors
  IMAGE_CHOICE = 'image_choice',
  COLOR_PICKER = 'color_picker',
  EMOJI_REACTION = 'emoji_reaction',

  // Specialized Inputs
  DATE_PICKER = 'date_picker',
  TIME_SELECTOR = 'time_selector',
  LOCATION_PICKER = 'location_picker',
  FILE_UPLOAD = 'file_upload',

  // Interactive Elements
  SLIDER_SCALE = 'slider_scale',
  DRAG_RANK = 'drag_rank',
  BUDGET_ALLOCATOR = 'budget_allocator',

  // Trip-Specific Questions
  DESTINATION_PREFERENCE = 'destination_preference',
  ACTIVITY_INTEREST = 'activity_interest',
  ACCOMMODATION_STYLE = 'accommodation_style',

  // Group Questions
  MATRIX_RATING = 'matrix_rating',
  PREFERENCE_RANKING = 'preference_ranking',
  PAIRED_COMPARISON = 'paired_comparison',

  // Information Screens
  WELCOME = 'welcome',
  INSTRUCTIONS = 'instructions',
  THANK_YOU = 'thank_you',
  STATEMENT = 'statement',
}

export enum FormStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum FeedbackType {
  IN_APP = 'in_app',
  POST_TASK = 'post_task',
  FEATURE = 'feature',
  EXIT = 'exit',
  COMPREHENSIVE = 'comprehensive',
  TRIP_PLANNING = 'trip_planning',
  PREFERENCES = 'preferences',
  QUIZ = 'quiz',
}

// =========================================
// ZOD SCHEMAS
// =========================================

// Option schema for choice questions
export const QuestionOptionSchema = z.object({
  id: z
    .string()
    .optional()
    .default(() => crypto.randomUUID()),
  label: z.string(),
  value: z.string().optional(),
  imageUrl: z.string().optional(),
  color: z.string().optional(),
  emoji: z.string().optional(),
});

export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

// Base question schema
export const BaseQuestionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  formId: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
  isRequired: z.boolean().default(false),
  type: z.nativeEnum(QuestionType),
  position: z.number().default(0),
  conditionalDisplay: z.record(z.string(), z.any()).optional(), // For conditional logic
  metadata: z.record(z.string(), z.any()).optional(), // For additional configuration
});

// Different schema variants based on question type
export const ShortTextQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.SHORT_TEXT),
  maxCharacterCount: z.number().optional(),
});

export const LongTextQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.LONG_TEXT),
  maxCharacterCount: z.number().optional(),
});

export const EmailQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.EMAIL),
});

export const SingleChoiceQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.SINGLE_CHOICE),
  options: z.array(QuestionOptionSchema).min(1),
});

export const MultipleChoiceQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.MULTIPLE_CHOICE),
  options: z.array(QuestionOptionSchema).min(1),
});

export const RatingQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.RATING),
  ratingScale: z.number().min(3).max(10).default(5),
});

export const YesNoQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.YES_NO),
});

export const NPSQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.NPS),
});

export const NumericScaleQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.NUMERIC_SCALE),
  minValue: z.number().default(1),
  maxValue: z.number().default(5),
  stepSize: z.number().default(1),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
});

export const ImageChoiceQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.IMAGE_CHOICE),
  options: z
    .array(
      QuestionOptionSchema.extend({
        imageUrl: z.string(),
      })
    )
    .min(1),
  allowMultiple: z.boolean().default(false),
});

export const ColorPickerQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.COLOR_PICKER),
  predefinedColors: z.array(z.string()).optional(),
  allowCustomColor: z.boolean().default(false),
});

export const EmojiReactionQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.EMOJI_REACTION),
  options: z
    .array(
      QuestionOptionSchema.extend({
        emoji: z.string(),
      })
    )
    .min(1),
});

export const DatePickerQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.DATE_PICKER),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  allowRange: z.boolean().default(false),
});

export const TimePickerQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.TIME_SELECTOR),
  is24Hour: z.boolean().default(false),
  timeIntervals: z.number().default(30), // minutes
});

export const LocationPickerQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.LOCATION_PICKER),
  defaultLocation: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      name: z.string().optional(),
    })
    .optional(),
});

export const FileUploadQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.FILE_UPLOAD),
  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().optional(), // in bytes
  maxFiles: z.number().default(1),
});

export const SliderScaleQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.SLIDER_SCALE),
  minValue: z.number().default(0),
  maxValue: z.number().default(100),
  stepSize: z.number().default(1),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
  showValue: z.boolean().default(true),
});

export const DragRankQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.DRAG_RANK),
  options: z.array(QuestionOptionSchema).min(2),
  maxSelections: z.number().optional(),
});

export const BudgetAllocatorQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.BUDGET_ALLOCATOR),
  categories: z.array(QuestionOptionSchema).min(2),
  totalBudget: z.number().default(100),
  allowExceedTotal: z.boolean().default(false),
});

export const DestinationPreferenceQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.DESTINATION_PREFERENCE),
  destinations: z.array(QuestionOptionSchema).optional(),
  allowCustomDestination: z.boolean().default(true),
  maxSelections: z.number().optional(),
});

export const ActivityInterestQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.ACTIVITY_INTEREST),
  activities: z.array(
    QuestionOptionSchema.extend({
      category: z.string().optional(),
    })
  ),
  groupByCategory: z.boolean().default(false),
});

export const AccommodationStyleQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.ACCOMMODATION_STYLE),
  options: z.array(QuestionOptionSchema).min(1),
  allowMultiple: z.boolean().default(false),
});

export const MatrixRatingQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.MATRIX_RATING),
  rows: z.array(QuestionOptionSchema).min(1),
  columns: z.array(QuestionOptionSchema).min(1),
});

export const PreferenceRankingQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.PREFERENCE_RANKING),
  options: z.array(QuestionOptionSchema).min(2),
});

export const PairedComparisonQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.PAIRED_COMPARISON),
  options: z.array(QuestionOptionSchema).min(2),
});

export const WelcomeScreenSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.WELCOME),
  buttonText: z.string().default("Let's go!"),
  imageUrl: z.string().optional(),
});

export const InstructionsScreenSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.INSTRUCTIONS),
  buttonText: z.string().default('Got it'),
  imageUrl: z.string().optional(),
});

export const ThankYouScreenSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.THANK_YOU),
  buttonText: z.string().default('Done'),
  imageUrl: z.string().optional(),
  redirectUrl: z.string().optional(),
});

export const StatementScreenSchema = BaseQuestionSchema.extend({
  type: z.literal(QuestionType.STATEMENT),
  buttonText: z.string().default('Continue'),
  imageUrl: z.string().optional(),
});

// Combined question schema with discriminated union
export const QuestionSchema = z.discriminatedUnion('type', [
  // Text Questions
  ShortTextQuestionSchema,
  LongTextQuestionSchema,
  EmailQuestionSchema,

  // Choice Questions
  SingleChoiceQuestionSchema,
  MultipleChoiceQuestionSchema,
  YesNoQuestionSchema,

  // Rating Questions
  RatingQuestionSchema,
  NPSQuestionSchema,
  NumericScaleQuestionSchema,

  // Visual Selectors
  ImageChoiceQuestionSchema,
  ColorPickerQuestionSchema,
  EmojiReactionQuestionSchema,

  // Specialized Inputs
  DatePickerQuestionSchema,
  TimePickerQuestionSchema,
  LocationPickerQuestionSchema,
  FileUploadQuestionSchema,

  // Interactive Elements
  SliderScaleQuestionSchema,
  DragRankQuestionSchema,
  BudgetAllocatorQuestionSchema,

  // Trip-Specific Questions
  DestinationPreferenceQuestionSchema,
  ActivityInterestQuestionSchema,
  AccommodationStyleQuestionSchema,

  // Group Questions
  MatrixRatingQuestionSchema,
  PreferenceRankingQuestionSchema,
  PairedComparisonQuestionSchema,

  // Information Screens
  WelcomeScreenSchema,
  InstructionsScreenSchema,
  ThankYouScreenSchema,
  StatementScreenSchema,
]);

export type Question = z.infer<typeof QuestionSchema>;
export type ShortTextQuestion = z.infer<typeof ShortTextQuestionSchema>;
export type LongTextQuestion = z.infer<typeof LongTextQuestionSchema>;
export type EmailQuestion = z.infer<typeof EmailQuestionSchema>;
export type SingleChoiceQuestion = z.infer<typeof SingleChoiceQuestionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestionSchema>;
export type RatingQuestion = z.infer<typeof RatingQuestionSchema>;
export type YesNoQuestion = z.infer<typeof YesNoQuestionSchema>;
export type NPSQuestion = z.infer<typeof NPSQuestionSchema>;
export type NumericScaleQuestion = z.infer<typeof NumericScaleQuestionSchema>;
export type ImageChoiceQuestion = z.infer<typeof ImageChoiceQuestionSchema>;
export type ColorPickerQuestion = z.infer<typeof ColorPickerQuestionSchema>;
export type EmojiReactionQuestion = z.infer<typeof EmojiReactionQuestionSchema>;
export type DatePickerQuestion = z.infer<typeof DatePickerQuestionSchema>;
export type TimePickerQuestion = z.infer<typeof TimePickerQuestionSchema>;
export type LocationPickerQuestion = z.infer<typeof LocationPickerQuestionSchema>;
export type FileUploadQuestion = z.infer<typeof FileUploadQuestionSchema>;
export type SliderScaleQuestion = z.infer<typeof SliderScaleQuestionSchema>;
export type DragRankQuestion = z.infer<typeof DragRankQuestionSchema>;
export type BudgetAllocatorQuestion = z.infer<typeof BudgetAllocatorQuestionSchema>;
export type DestinationPreferenceQuestion = z.infer<typeof DestinationPreferenceQuestionSchema>;
export type ActivityInterestQuestion = z.infer<typeof ActivityInterestQuestionSchema>;
export type AccommodationStyleQuestion = z.infer<typeof AccommodationStyleQuestionSchema>;
export type MatrixRatingQuestion = z.infer<typeof MatrixRatingQuestionSchema>;
export type PreferenceRankingQuestion = z.infer<typeof PreferenceRankingQuestionSchema>;
export type PairedComparisonQuestion = z.infer<typeof PairedComparisonQuestionSchema>;
export type WelcomeScreen = z.infer<typeof WelcomeScreenSchema>;
export type InstructionsScreen = z.infer<typeof InstructionsScreenSchema>;
export type ThankYouScreen = z.infer<typeof ThankYouScreenSchema>;
export type StatementScreen = z.infer<typeof StatementScreenSchema>;

// Form schema
export const FeedbackFormSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  title: z.string(),
  description: z.string().nullable().optional(),
  feedbackType: z.nativeEnum(FeedbackType),
  status: z.nativeEnum(FormStatus).default(FormStatus.ACTIVE),
  targetFeature: z.string().optional(),
  targetPage: z.string().optional(),
  tripId: z.string().optional(), // For trip-specific forms
  displayTrigger: z
    .enum(['immediate', 'delay', 'exit_intent', 'scroll_percent', 'time_on_page'])
    .optional(),
  triggerValue: z.string().optional(), // Value for the trigger (e.g., "50" for 50% scroll)
  showProgressBar: z.boolean().default(true),
  completionMessage: z.string().optional(),
  themeColor: z.string().optional(), // For custom branding
  fontFamily: z.string().optional(), // For custom branding
  isTemplate: z.boolean().default(false), // For form templates
  templateCategory: z.string().optional(), // For categorizing templates
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  metadata: z.record(z.string(), z.any()).optional(), // For additional configuration
});

export type FeedbackForm = z.infer<typeof FeedbackFormSchema>;

// Analytics schema for tracking form performance
export const FormAnalyticsSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  formId: z.string(),
  views: z.number().default(0),
  submissions: z.number().default(0),
  completionRate: z.number().optional(),
  averageTimeToComplete: z.number().optional(), // in seconds
  dropoffPoints: z
    .array(
      z.object({
        questionId: z.string(),
        dropoffCount: z.number(),
      })
    )
    .optional(),
  updatedAt: z.date().default(() => new Date()),
});

export type FormAnalytics = z.infer<typeof FormAnalyticsSchema>;

// Response value schemas for different question types
export const ResponseValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
  z.record(z.string(), z.any()), // For complex response types like location or matrix
]);

export type ResponseValue = z.infer<typeof ResponseValueSchema>;

// Response schema
export const ResponseSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  formId: z.string(),
  questionId: z.string(),
  value: ResponseValueSchema,
  respondentId: z.string().optional(),
  userAgent: z.string().optional(),
  timeToAnswer: z.number().optional(), // in milliseconds
  createdAt: z.date().default(() => new Date()),
});

export type Response = z.infer<typeof ResponseSchema>;

// Session schema for grouping responses
export const ResponseSessionSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  formId: z.string(),
  tripId: z.string().optional(), // For trip-associated forms
  respondentId: z.string().optional(),
  startedAt: z.date().default(() => new Date()),
  completedAt: z.date().optional(),
  totalTimeSpent: z.number().optional(), // in milliseconds
  responses: z.array(ResponseSchema).optional(),
  deviceInfo: z
    .object({
      browser: z.string().optional(),
      os: z.string().optional(),
      device: z.string().optional(),
      viewportSize: z.string().optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type ResponseSession = z.infer<typeof ResponseSessionSchema>;

// Create form input schema
export const CreateFeedbackFormSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  feedbackType: z.nativeEnum(FeedbackType),
  targetFeature: z.string().optional(),
  targetPage: z.string().optional(),
  tripId: z.string().optional(),
  themeColor: z.string().optional(),
  fontFamily: z.string().optional(),
  isTemplate: z.boolean().optional(),
  templateCategory: z.string().optional(),
  questions: z.array(QuestionSchema).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type CreateFeedbackFormInput = z.infer<typeof CreateFeedbackFormSchema>;

// Submit response input schema
export const SubmitResponsesSchema = z.object({
  formId: z.string(),
  tripId: z.string().optional(),
  sessionId: z.string().optional(),
  responses: z.array(
    z.object({
      questionId: z.string(),
      value: ResponseValueSchema,
      timeToAnswer: z.number().optional(),
    })
  ),
  totalTimeSpent: z.number().optional(),
  deviceInfo: z
    .object({
      browser: z.string().optional(),
      os: z.string().optional(),
      device: z.string().optional(),
      viewportSize: z.string().optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type SubmitResponsesInput = z.infer<typeof SubmitResponsesSchema>;
