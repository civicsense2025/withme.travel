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

  // Check for dev-mode header or query param
  const url = new URL(request.url);
  const isDevModeRequested = url.searchParams.get('dev-mode') === 'false' ? false : true;
  const headers = request.headers;
  const devModeHeader = headers.get('x-dev-mode');
  const useDevMode = process.env.NODE_ENV !== 'production' && 
    (devModeHeader !== 'false' && !isDevModeRequested === false);

  console.log(`[API] Forms/[id] request mode: ${useDevMode ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  
  // Development flag to bypass milestone trigger requirements (in dev mode only)
  const BYPASS_MILESTONE_TRIGGERS = useDevMode;

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
    const token = url.searchParams.get('token');
    console.log('[API] /api/forms/[id] - Token:', token);
    
    if (!token && !useDevMode) {
      console.warn('[API] /api/forms/[id] - Missing token and not in dev mode');
      return NextResponse.json(
        { error: 'Token parameter is required' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Validate the token (skip in dev mode)
    const supabase = await createRouteHandlerClient();
    let userCohort = 'user-research-default'; // Default cohort

    if (!useDevMode && token) {
      console.log('[API] Validating token in production mode');
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_testing_sessions')
        .select('id, status, cohort')
        .eq('token', token)
        .single();
        
      if (sessionError || !sessionData) {
        console.error('[API] /api/forms/[id] - Invalid session token:', token, sessionError);
        // In production mode, fail if token is invalid
        if (!useDevMode) {
          return NextResponse.json(
            { error: 'Invalid session token' },
            { status: 401, headers: responseHeaders }
          );
        }
      }
      
      // If session exists, assume it's valid, but use the default cohort
      // since the column might not exist in all environments
      if (sessionData) {
        // Use default cohort set earlier
        console.log('[API] Session exists, using default cohort:', userCohort);
      }
    } else {
      console.log('[API] Skipping token validation in dev mode');
    }

    console.log('[API] /api/forms/[id] - Looking for form with ID:', id);
    // Get form by ID
    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !form) {
      console.error('[API] /api/forms/[id] - Error fetching form:', error);
      
      // Only provide mock data in dev mode
      if (useDevMode) {
        console.log('[API] /api/forms/[id] - DEV MODE: Using fallback mock form for ID:', id);
        
        const mockForm = {
          id,
          name: 'Example Survey',
          description: 'This is a mock survey for testing purposes',
          type: 'survey',
          is_active: true,
          cohort: userCohort,
          created_at: new Date().toISOString(),
          // Ensure milestones is an array
          milestones: ['INTRO', 'QUESTIONS', 'FEEDBACK'],
          milestone_trigger: null, // No trigger for mock form
          config: {
            progress: 0,
            fields: [
              {
                id: 'field-1',
                milestone: 'INTRO', // Match milestone to the first in array above
                type: 'text',
                label: 'What do you think about withme.travel?',
                required: true,
                description: 'Please provide your honest feedback'
              },
              {
                id: 'field-2',
                milestone: 'QUESTIONS', // Match milestone to the second in array above
                type: 'text',
                label: 'What features would you like to see?',
                required: true,
                description: 'Tell us what would make your experience better'
              },
              {
                id: 'field-3',
                milestone: 'FEEDBACK', // Match milestone to the third in array above
                type: 'radio',
                label: 'How would you rate your experience?',
                required: true,
                description: 'On a scale of 1-5',
                config: {
                  options: [
                    '1 - Poor',
                    '2 - Fair',
                    '3 - Good',
                    '4 - Very Good',
                    '5 - Excellent'
                  ]
                }
              }
            ]
          }
        };
        
        console.log('[API] /api/forms/[id] - Mock form created:', mockForm);
        
        return NextResponse.json(
          { form: mockForm },
          { status: 200, headers: responseHeaders }
        );
      } else {
        // In production mode, return 404 if form not found
        return NextResponse.json(
          { error: 'Survey not found' },
          { status: 404, headers: responseHeaders }
        );
      }
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
    
    // Check if the milestone trigger is required
    if (form.milestone_trigger && !BYPASS_MILESTONE_TRIGGERS) {
      console.log(`[API] /api/forms/[id] - Survey requires milestone trigger: ${form.milestone_trigger}`);
      
      // Here you would normally check if the user has completed this milestone
      // For now, we'll bypass this check in development mode
      
      // In production, you would add logic like:
      // const userHasCompletedMilestone = await checkUserMilestone(userId, form.milestone_trigger);
      // if (!userHasCompletedMilestone) {
      //   return NextResponse.json(
      //     { error: 'This survey is not available yet. Complete more activities to unlock it.' },
      //     { status: 403, headers: responseHeaders }
      //   );
      // }
    } else if (form.milestone_trigger) {
      console.log(`[API] /api/forms/[id] - Bypassing milestone trigger: ${form.milestone_trigger} (development mode)`);
    }
    
    // Build processed form data
    const processedForm = {
      ...surveyData,
      // Ensure milestones is an array
      milestones: Array.isArray(milestones) && milestones.length > 0 
                  ? milestones 
                  : ['default'], // Always provide a default milestone if none found
      // Ensure fields array exists with milestone property
      fields: Array.isArray(formConfig.fields) 
              ? formConfig.fields.map((field: { milestone?: string; [key: string]: any }) => ({
                  ...field,
                  // If field doesn't have milestone, set to first milestone or 'default'
                  milestone: field.milestone || 
                             (Array.isArray(milestones) && milestones.length > 0 
                               ? milestones[0] 
                               : 'default')
                }))
              : [],
      progress: formConfig.progress || 0
    };

    // IMPORTANT: Log the final format to ensure it matches what the components expect
    console.log('[API] /api/forms/[id] - Response format summary:', {
      status: 200,
      responseKeys: Object.keys(processedForm),
      hasMilestones: !!processedForm.milestones,
      hasFields: Array.isArray(processedForm.fields),
      fieldCount: Array.isArray(processedForm.fields) ? processedForm.fields.length : 0,
      firstField: processedForm.fields?.[0] ? {
        id: processedForm.fields[0]?.id,
        type: processedForm.fields[0]?.type,
        milestone: processedForm.fields[0]?.milestone,
      } : null
    });

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