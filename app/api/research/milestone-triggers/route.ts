import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { z } from 'zod';
import { Database } from '@/types/database.types';

// EventType union (should match types/research.ts)
const EventTypeEnum = z.union([
  z.literal('trip_created'),
  z.literal('trip_updated'),
  z.literal('trip_deleted'),
  z.literal('trip_creation_failed'),
  z.literal('itinerary_item_added'),
  z.literal('itinerary_item_updated'),
  z.literal('itinerary_item_deleted'),
  z.literal('itinerary_item_creation_failed'),
  z.literal('itinerary_voted'),
  z.literal('group_created'),
  z.literal('group_member_added'),
  z.literal('group_member_removed'),
  z.literal('group_plan_created'),
  z.literal('group_plan_creation_failed'),
  z.literal('comment_posted'),
  z.literal('comment_reacted'),
  z.literal('comment_reaction_failed'),
  z.literal('budget_item_added'),
  z.literal('budget_item_updated'),
  z.literal('budget_item_deleted'),
  z.literal('budget_item_addition_failed'),
  z.literal('feedback_submitted'),
  z.literal('survey_started'),
  z.literal('survey_completed'),
  z.literal('survey_step_completed'),
  z.literal('survey_question_answered'),
  z.literal('survey_submission_failed'),
  z.literal('onboarding_completed'),
  z.literal('feature_discovered'),
  z.literal('destination_saved'),
  z.literal('template_used'),
]);

// Zod schemas for validation
const CreateMilestoneTriggerPayloadSchema = z.object({
  form_id: z.string().uuid(),
  event_type: EventTypeEnum,
  // milestone: z.string().optional(), // Remove, not in DB
});

const ListMilestoneTriggersQuerySchema = z.object({
  formId: z.string().uuid().optional(),
});

// Types
/**
 * Row and Insert types for milestone_triggers table
 */
type MilestoneTriggerInsert = Database['public']['Tables']['milestone_triggers']['Insert'];
type MilestoneTriggerRow = Database['public']['Tables']['milestone_triggers']['Row'];

/**
 * GET /api/research/milestone-triggers
 * List milestone triggers, optionally filtered by form_id
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const { searchParams } = new URL(request.url);
    const queryValidation = ListMilestoneTriggersQuerySchema.safeParse({
      formId: searchParams.get('formId'),
    });
    if (!queryValidation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: queryValidation.error.flatten() }, { status: 400 });
    }
    const { formId } = queryValidation.data;
    let query = supabase.from(TABLES.MILESTONE_TRIGGERS).select('*');
    if (formId) query = query.eq('form_id', formId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data as MilestoneTriggerRow[]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch milestone triggers', details: String(error) }, { status: 500 });
  }
}

/**
 * POST /api/research/milestone-triggers
 * Create a new milestone trigger
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const body = await request.json();
    const validation = CreateMilestoneTriggerPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: validation.error.flatten() }, { status: 400 });
    }
    const { form_id, event_type } = validation.data;
    // Check if the form exists
    const { data: form, error: formError } = await supabase.from(TABLES.FORMS).select('id').eq('id', form_id).single();
    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found', details: `Form with ID '${form_id}' does not exist.` }, { status: 404 });
    }
    // Insert the new trigger (only valid fields)
    const triggerToInsert: MilestoneTriggerInsert = { form_id, event_type };
    const { data: newTrigger, error: insertError } = await supabase.from(TABLES.MILESTONE_TRIGGERS).insert(triggerToInsert).select().single();
    if (insertError) {
      return NextResponse.json({ error: 'Failed to create milestone trigger', details: insertError.message }, { status: 500 });
    }
    return NextResponse.json(newTrigger as MilestoneTriggerRow, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create milestone trigger', details: String(error) }, { status: 500 });
  }
}
