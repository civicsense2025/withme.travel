import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { SubmitResponsesSchema } from '@/app/components/feedback/types';
import { TABLES } from '@/utils/constants/database';
import { z } from 'zod';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request data using Zod
    const validationResult = SubmitResponsesSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validationResult.error.flatten()
        }, 
        { status: 400 }
      );
    }
    
    const { formId, sessionId, responses, metadata } = validationResult.data;
    
    // Create a Supabase client
    const supabase = await createRouteHandlerClient();
    
    // Get the authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();
    
    // Create or retrieve a response session
    let activeSessionId = sessionId;
    
    if (!activeSessionId) {
      // Create a new response session
      const { data: sessionData, error: sessionError } = await supabase
        .from('feedback_sessions')
        .insert({
          form_id: formId,
          respondent_id: user?.id || null,
          metadata: {
            user_agent: request.headers.get('user-agent'),
            referrer: request.headers.get('referer'),
            ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip'),
            ...metadata
          }
        })
        .select('id')
        .single();
      
      if (sessionError) {
        console.error('Error creating feedback session:', sessionError);
        return NextResponse.json(
          { success: false, error: 'Failed to create feedback session' },
          { status: 500 }
        );
      }
      
      activeSessionId = sessionData.id;
    }
    
    // Store each response
    const responsesToInsert = responses.map(response => ({
      session_id: activeSessionId,
      question_id: response.questionId,
      value: response.value,
      respondent_id: user?.id || null,
    }));
    
    const { error: responsesError } = await supabase
      .from('feedback_responses')
      .insert(responsesToInsert);
    
    if (responsesError) {
      console.error('Error storing feedback responses:', responsesError);
      return NextResponse.json(
        { success: false, error: 'Failed to store feedback responses' },
        { status: 500 }
      );
    }
    
    // Update the session as completed
    const { error: updateSessionError } = await supabase
      .from('feedback_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', activeSessionId);
    
    if (updateSessionError) {
      console.warn('Error updating feedback session:', updateSessionError);
      // Non-critical, continue
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      sessionId: activeSessionId,
      message: 'Feedback submitted successfully'
    });
    
  } catch (error) {
    console.error('Error processing feedback submission:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process feedback', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 