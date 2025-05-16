import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';
import { RESEARCH_EVENT_TYPES } from '@/components/research/useResearchTracking';
import { v4 as uuidv4 } from 'uuid';

// Schema for abandon event data
const AbandonEventSchema = z.object({
  session_id: z.string(),
  survey_id: z.string(),
  user_id: z.string().optional(),
  current_question_index: z.number(),
  current_milestone_index: z.number().optional(),
  milestone: z.string().optional(),
  time_spent_seconds: z.number(),
  responses_so_far: z.number(),
  total_questions: z.number(),
  progress_percentage: z.number(),
  device_info: z.record(z.any()).optional(),
  viewport: z.object({
    width: z.number(),
    height: z.number()
  }).optional(),
  reason: z.enum(['close', 'navigation', 'timeout', 'other']).optional(),
  additional_details: z.record(z.any()).optional()
});

/**
 * POST /api/research/events/abandon
 * Records detailed information about when a user abandons a survey
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient();
    const body = await request.json();
    
    // Validate the request data
    const validationResult = AbandonEventSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Check authentication if user_id is provided
    let authenticatedUserId: string | null = null;
    
    if (validatedData.user_id) {
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id || null;
      
      // If user_id provided doesn't match authenticated user, ignore it
      if (authenticatedUserId && authenticatedUserId !== validatedData.user_id) {
        validatedData.user_id = authenticatedUserId;
      }
    }
    
    // Track the event with detailed information
    const { data: event, error } = await supabase
      .from(TABLES.USER_TESTING_EVENTS)
      .insert({
        id: uuidv4(),
        session_id: validatedData.session_id,
        user_id: validatedData.user_id,
        event_type: RESEARCH_EVENT_TYPES.SURVEY_ABANDONED,
        data: {
          survey_id: validatedData.survey_id,
          current_question_index: validatedData.current_question_index,
          current_milestone_index: validatedData.current_milestone_index,
          milestone: validatedData.milestone,
          time_spent_seconds: validatedData.time_spent_seconds,
          responses_so_far: validatedData.responses_so_far,
          total_questions: validatedData.total_questions,
          progress_percentage: validatedData.progress_percentage,
          device_info: validatedData.device_info,
          viewport: validatedData.viewport,
          reason: validatedData.reason,
          additional_details: validatedData.additional_details,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error recording survey abandonment event:', error);
      return NextResponse.json(
        { error: 'Failed to record survey abandonment event' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Unexpected error in survey abandonment endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 