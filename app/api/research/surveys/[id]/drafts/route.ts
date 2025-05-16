import { z } from 'zod';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';
import { NextRequest, NextResponse } from 'next/server';

// Schema for draft responses
const DraftResponseSchema = z.object({
  session_id: z.string(),
  responses: z.array(
    z.object({
      fieldId: z.string(),
      value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.union([z.string(), z.number()]))
      ])
    })
  ),
  milestone: z.string().optional(),
  current_question_index: z.number(),
  current_milestone_index: z.number(),
  last_activity_timestamp: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * GET /api/research/surveys/[id]/drafts
 * Retrieves draft responses for a survey
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id;
    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get session ID from query params if provided
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    // Query condition builder
    const query = supabase
      .from(TABLES.SURVEY_DRAFT_RESPONSES)
      .select('*')
      .eq('survey_id', surveyId);
    
    // Filter by session or user
    if (sessionId) {
      query.eq('session_id', sessionId);
    } else {
      query.eq('user_id', user.id);
    }
    
    // Get the most recent draft
    query.order('updated_at', { ascending: false }).limit(1);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error retrieving draft responses:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve draft responses' },
        { status: 500 }
      );
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ draft: null });
    }
    
    return NextResponse.json({ draft: data[0] });
  } catch (error) {
    console.error('Unexpected error in draft responses endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/research/surveys/[id]/drafts
 * Saves draft responses for a survey
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id;
    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();
    
    // Get request body
    const body = await request.json();
    
    // Validate the request data
    const validationResult = DraftResponseSchema.safeParse(body);
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
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Check if a draft already exists
    const { data: existingDraft } = await supabase
      .from(TABLES.SURVEY_DRAFT_RESPONSES)
      .select('id')
      .eq('survey_id', surveyId)
      .eq('session_id', validatedData.session_id);
    
    let result;
    if (existingDraft && existingDraft.length > 0) {
      // Update existing draft
      result = await supabase
        .from(TABLES.SURVEY_DRAFT_RESPONSES)
        .update({
          responses: validatedData.responses,
          milestone: validatedData.milestone,
          current_question_index: validatedData.current_question_index,
          current_milestone_index: validatedData.current_milestone_index,
          last_activity_timestamp: validatedData.last_activity_timestamp || new Date().toISOString(),
          metadata: validatedData.metadata,
          user_id: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDraft[0].id)
        .select();
    } else {
      // Create new draft
      result = await supabase
        .from(TABLES.SURVEY_DRAFT_RESPONSES)
        .insert({
          survey_id: surveyId,
          session_id: validatedData.session_id,
          user_id: userId,
          responses: validatedData.responses,
          milestone: validatedData.milestone,
          current_question_index: validatedData.current_question_index,
          current_milestone_index: validatedData.current_milestone_index,
          last_activity_timestamp: validatedData.last_activity_timestamp || new Date().toISOString(),
          metadata: validatedData.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
    }
    
    if (result.error) {
      console.error('Error saving draft responses:', result.error);
      return NextResponse.json(
        { error: 'Failed to save draft responses' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, draft: result.data[0] });
  } catch (error) {
    console.error('Unexpected error in draft responses endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/research/surveys/[id]/drafts
 * Deletes draft responses for a survey
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const surveyId = params.id;
    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createRouteHandlerClient();
    
    // Get session ID from query params
    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    // Build query
    const query = supabase
      .from(TABLES.SURVEY_DRAFT_RESPONSES)
      .delete()
      .eq('survey_id', surveyId)
      .eq('session_id', sessionId);
    
    // Add user check if user is authenticated
    if (user) {
      query.eq('user_id', user.id);
    }
    
    const { error } = await query;
    
    if (error) {
      console.error('Error deleting draft responses:', error);
      return NextResponse.json(
        { error: 'Failed to delete draft responses' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in draft responses endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 