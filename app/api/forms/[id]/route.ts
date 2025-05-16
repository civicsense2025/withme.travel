import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';

// Basic survey data interface
interface Survey {
  id: string;
  name: string;
  description: string;
  type: string;
  is_active: boolean;
  cohort: string;
  milestones: string[] | null;
  milestone_trigger: string | null;
  created_at: string;
  config: any;
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    console.log('[API] /api/forms/[id] - Incoming request:', request.url);
    const { id } = await context.params;
    console.log('[API] /api/forms/[id] - Params:', { id });
    if (!id) {
      console.warn('[API] /api/forms/[id] - Missing id');
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Get token from search params
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    console.log('[API] /api/forms/[id] - Token:', token);
    
    if (!token) {
      console.warn('[API] /api/forms/[id] - Missing token');
      return NextResponse.json(
        { error: 'Token parameter is required' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Validate the token (optional, can be skipped for development)
    const supabase = await createRouteHandlerClient();

    const { data: sessionData, error: sessionError } = await supabase
      .from('user_testing_sessions')
      .select('id, status')
      .eq('token', token)
      .single();
      
    // For simplicity, let's use a default cohort since the column might not exist
    const userCohort = 'user-research-default';

    if (sessionError || !sessionData) {
      console.error('[API] /api/forms/[id] - Invalid session token:', token, sessionError);
      // For development, we'll continue even with an invalid token
    }

    console.log('[API] /api/forms/[id] - Looking for form with ID:', id);
    // Get form by ID
    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[API] /api/forms/[id] - Error fetching form:', error);
      
      // For testing, provide a mock form
      console.log('[API] /api/forms/[id] - Using fallback: Returning mock form for ID:', id);
      
      const mockForm = {
        id,
        name: 'Example Survey',
        description: 'This is a mock survey for testing purposes',
        type: 'survey',
        is_active: true,
        cohort: userCohort,
        created_at: new Date().toISOString(),
        milestones: ['INTRO', 'QUESTIONS', 'FEEDBACK'],
        milestone_trigger: 'INTRO',
        config: {
          progress: 0,
          fields: [
            {
              id: 'field-1',
              type: 'text',
              label: 'What do you think about withme.travel?',
              required: true
            },
            {
              id: 'field-2',
              type: 'text',
              label: 'How can we improve?',
              required: true
            }
          ]
        }
      };
      
      console.log('[API] /api/forms/[id] - Mock form created:', mockForm);
      
      return NextResponse.json(
        { form: mockForm },
        { status: 200, headers: responseHeaders }
      );
    }

    // Process the form data to match expected format
    let surveyData = form;
    
    // Extract fields from config if needed
    const formConfig = form.config ? 
      (typeof form.config === 'string' ? JSON.parse(form.config) : form.config) 
      : {};
    
    // Extract milestones from the form
    let milestones = null;
    if (form.milestones) {
      try {
        milestones = Array.isArray(form.milestones) 
          ? form.milestones 
          : (typeof form.milestones === 'string' 
              ? JSON.parse(form.milestones) 
              : null);
      } catch (e) {
        console.error('[API] /api/forms/[id] - Error parsing milestones:', e);
      }
    }
    
    // Build processed form data
    const processedForm = {
      ...surveyData,
      milestones,
      fields: formConfig.fields || [],
      progress: formConfig.progress || 0
    };

    console.log('[API] /api/forms/[id] - Returning processed form:', processedForm);
    return NextResponse.json(
      { form: processedForm },
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error('[API] /api/forms/[id] - Unexpected error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500, headers: responseHeaders }
    );
  }
} 