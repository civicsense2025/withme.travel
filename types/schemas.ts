/**
 * Zod schemas for domain objects
 */
import { z } from 'zod';
import { ENUMS } from '@/utils/constants/database';
import { GROUP_MEMBER_ROLES, GROUP_PLAN_IDEA_TYPE } from '@/utils/constants/status';

/**
 * Helper function to preprocess date strings to ensure they include seconds
 */
const preprocessDatetime = (input: unknown) => {
  if (typeof input !== 'string') return input;

  // If the string matches ISO format but without seconds (YYYY-MM-DDTHH:MM)
  // Add :00 for seconds
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) {
    return `${input}:00`;
  }

  // Handle PostgreSQL timestamp format (YYYY-MM-DD HH:MM:SS)
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(input)) {
    // Convert to ISO format by replacing space with T
    return input.replace(' ', 'T');
  }

  // Handle timestamp with timezone format
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[+-]\d{2}$/.test(input)) {
    return input.replace(' ', 'T');
  }

  return input;
};

/**
 * Create a datetime field that handles ISO dates with or without seconds
 */
const datetimeField = () =>
  z
    .preprocess(preprocessDatetime, z.string().datetime())
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?([+-]\d{2}:?\d{2}|Z)?$/)); // More lenient regex

/**
 * Trip schema
 */
export const TripSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Trip name is required'),
  description: z.string().optional().nullable(),
  destination_id: z.string().uuid().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  created_by: z.string().uuid(),
  is_public: z.boolean().default(false),
  created_at: datetimeField(),
  updated_at: datetimeField(),
  image_url: z.string().url().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  destination_name: z.string().optional().nullable(),
});

export type Trip = z.infer<typeof TripSchema>;

/**
 * Trip member schema
 */
export const TripMemberSchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum([
    ENUMS.TRIP_ROLES.ADMIN,
    ENUMS.TRIP_ROLES.EDITOR,
    ENUMS.TRIP_ROLES.VIEWER,
    ENUMS.TRIP_ROLES.CONTRIBUTOR,
  ]),
  joined_at: datetimeField(),
  status: z.string().optional(),
});

export type TripMember = z.infer<typeof TripMemberSchema>;

/**
 * Group schema
 */
export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional().nullable(),
  created_by: z.string().uuid(),
  is_public: z.boolean().default(false),
  created_at: datetimeField(),
  updated_at: datetimeField(),
  image_url: z.string().url().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
});

export type Group = z.infer<typeof GroupSchema>;

/**
 * Group member schema
 */
export const GroupMemberSchema = z.object({
  id: z.string().uuid(),
  group_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum([GROUP_MEMBER_ROLES.ADMIN, GROUP_MEMBER_ROLES.MEMBER]),
  joined_at: datetimeField(),
  status: z.string().optional(),
});

export type GroupMember = z.infer<typeof GroupMemberSchema>;

/**
 * Group plan schema
 */
export const GroupPlanSchema = z.object({
  id: z.string().uuid(),
  group_id: z.string().uuid(),
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  created_by: z.string().uuid(),
  created_at: datetimeField(),
  updated_at: datetimeField(),
  status: z.string().optional().nullable(),
  options: z.record(z.any()).optional().nullable(),
  destination_id: z.string().uuid().optional().nullable(),
  destination_name: z.string().optional().nullable(),
  is_archived: z.boolean().default(false),
});

export type GroupPlan = z.infer<typeof GroupPlanSchema>;

/**
 * Group idea schema
 */
export const GroupIdeaSchema = z.object({
  id: z.string().uuid(),
  group_id: z.string().uuid(),
  plan_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Idea title is required'),
  description: z.string().optional().nullable(),
  type: z.enum([
    GROUP_PLAN_IDEA_TYPE.DESTINATION,
    GROUP_PLAN_IDEA_TYPE.DATE,
    GROUP_PLAN_IDEA_TYPE.ACTIVITY,
    GROUP_PLAN_IDEA_TYPE.BUDGET,
    GROUP_PLAN_IDEA_TYPE.OTHER,
    GROUP_PLAN_IDEA_TYPE.QUESTION,
    GROUP_PLAN_IDEA_TYPE.NOTE,
    GROUP_PLAN_IDEA_TYPE.PLACE,
  ]),
  created_by: z.string().uuid(),
  created_at: datetimeField(),
  updated_at: datetimeField(),
  metadata: z.record(z.any()).optional().nullable(),
  place_id: z.string().optional().nullable(),
  place_name: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_resolved: z.boolean().default(false),
});

export type GroupIdea = z.infer<typeof GroupIdeaSchema>;

/**
 * Comment schema
 */
export const CommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, 'Comment content is required'),
  created_by: z.string().uuid(),
  created_at: datetimeField(),
  updated_at: datetimeField(),
  content_id: z.string().uuid(),
  content_type: z.enum([
    ENUMS.CONTENT_TYPE.TRIP,
    ENUMS.CONTENT_TYPE.DESTINATION,
    ENUMS.CONTENT_TYPE.ITINERARY_ITEM,
    ENUMS.CONTENT_TYPE.COLLECTION,
    ENUMS.CONTENT_TYPE.TEMPLATE,
    ENUMS.CONTENT_TYPE.GROUP_PLAN_IDEA,
  ]),
  parent_id: z.string().uuid().optional().nullable(),
  is_deleted: z.boolean().default(false),
});

export type Comment = z.infer<typeof CommentSchema>;

/**
 * Reaction schema
 */
export const ReactionSchema = z.object({
  id: z.string().uuid(),
  emoji: z.string().min(1, 'Emoji is required'),
  created_by: z.string().uuid(),
  created_at: datetimeField(),
  updated_at: datetimeField(),
  content_id: z.string().uuid(),
  content_type: z.enum([
    ENUMS.CONTENT_TYPE.TRIP,
    ENUMS.CONTENT_TYPE.DESTINATION,
    ENUMS.CONTENT_TYPE.ITINERARY_ITEM,
    ENUMS.CONTENT_TYPE.COLLECTION,
    ENUMS.CONTENT_TYPE.TEMPLATE,
    ENUMS.CONTENT_TYPE.GROUP_PLAN_IDEA,
  ]),
});

export type Reaction = z.infer<typeof ReactionSchema>;
