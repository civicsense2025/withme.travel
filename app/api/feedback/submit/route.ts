import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { SubmitResponsesSchema } from '@/app/components/feedback/types';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';
import { TABLES } from '@/utils/constants/tables';

// Schema for validating feedback submissions
const feedbackSubmissionSchema = z.object({
  formId: z.string(),
  responses: z.array(
    z.object({
      questionId: z.string(),
      value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]),
    })
  ),
  metadata: z.record(z.any()).optional(),
});

// Define types for the database tables
type FormSessionInsert = {
  form_id: string;
  user_id: string | null;
  submission_date: string;
  metadata?: Record<string, any>;
  status: string;
};

type FormResponseInsert = {
  session_id: string;
  question_id: string;
  response_value: string | number | boolean | string[] | null;
  form_id: string;
};

type FeedbackInsert = {
  user_id: string | null;
  form_id: string;
  content: string;
  rating: number | null;
  type: string;
  status: string;
  metadata?: Record<string, any>;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = feedbackSubmissionSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { formId, responses, metadata } = validatedData.data;

    // Initialize Supabase client
    const supabase = await createRouteHandlerClient();

    // Get the user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Create a response session record
    const sessionData: FormSessionInsert = {
      form_id: formId,
      user_id: user?.id || null,
      submission_date: new Date().toISOString(),
      metadata: metadata || {},
      status: 'completed',
    };

    const { data: responseSession, error: sessionError } = await supabase
      .from(TABLES.FORMS)
      .insert(sessionData)
      .select('id')
      .single();

    if (sessionError) {
      console.error('Error creating response session:', sessionError);
      return NextResponse.json({ error: 'Failed to create response session' }, { status: 500 });
    }

    if (!responseSession || !responseSession.id) {
      return NextResponse.json(
        { error: 'Failed to create response session - no ID returned' },
        { status: 500 }
      );
    }

    // Insert individual responses
    const responseRecords: FormResponseInsert[] = responses.map((response) => ({
      session_id: responseSession.id,
      question_id: response.questionId,
      response_value: response.value,
      form_id: formId,
    }));

    const { error: responsesError } = await supabase
      .from(TABLES.FORM_TEMPLATES)
      .insert(responseRecords);

    if (responsesError) {
      console.error('Error saving responses:', responsesError);
      return NextResponse.json({ error: 'Failed to save responses' }, { status: 500 });
    }

    // Optionally create an entry in the feedback table as well for legacy support
    const mainQuestion = responses.find(
      (r) => r.questionId === 'missing-features' || r.questionId.includes('feedback')
    );
    const ratingQuestion = responses.find(
      (r) => r.questionId === 'satisfaction' || r.questionId.includes('rating')
    );

    if (mainQuestion) {
      const feedbackData: FeedbackInsert = {
        user_id: user?.id || null,
        form_id: formId,
        content: String(mainQuestion.value || ''),
        rating: ratingQuestion ? Number(ratingQuestion.value || 0) : null,
        type: 'feature_request',
        status: 'new',
        metadata: {
          source: 'form_submission',
          form_id: formId,
          session_id: responseSession.id,
          responses: responses.map((r) => ({ questionId: r.questionId, value: r.value })),
        },
      };

      const { error: feedbackError } = await supabase.from(TABLES.FEEDBACK).insert(feedbackData);

      if (feedbackError) {
        console.error('Error creating feedback entry:', feedbackError);
        // Continue anyway since the main form responses were saved
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: responseSession.id,
    });
  } catch (error) {
    console.error('Error processing feedback submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
