import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/utils/supabase/server';
import { TABLES } from '@/utils/constants/tables';

/**
 * Get session by token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
): Promise<NextResponse> {
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  });

  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400, headers: responseHeaders }
      );
    }

    // Look up the session by token
    const supabase = await createRouteHandlerClient();

    // First check the user testing sessions table
    const { data: session, error } = await supabase
      .from(TABLES.USER_TESTING_SESSIONS)
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error fetching session by token:', error);
      
      // For testing, return a mock survey form
      console.log('Using fallback: Returning mock survey for token:', token);
      
      // Return a simple mock survey with some fields
      return NextResponse.json({
        id: 'mock-survey-id',
        name: 'User Experience Survey',
        description: 'Help us improve withme.travel',
        type: 'survey',
        is_active: true,
        form_fields: [
          {
            id: 'field-1',
            type: 'text',
            label: 'What do you like most about the application?',
            required: true
          },
          {
            id: 'field-2',
            type: 'radio',
            label: 'How likely are you to recommend withme.travel to a friend?',
            required: true,
            config: {
              options: [
                { label: 'Very Unlikely', value: '1' },
                { label: 'Unlikely', value: '2' },
                { label: 'Neutral', value: '3' },
                { label: 'Likely', value: '4' },
                { label: 'Very Likely', value: '5' }
              ]
            }
          },
          {
            id: 'field-3',
            type: 'textarea',
            label: 'Any other feedback or suggestions?',
            required: false
          }
        ]
      });
    }

    // Get the associated form/survey
    // In a real implementation, you would look up the survey based on user cohort
    // or whatever survey assignment logic you have
    const { data: forms, error: formsError } = await supabase
      .from('forms')
      .select('*')
      .eq('cohort', session.cohort || 'default')
      .eq('is_active', true)
      .limit(1);

    if (formsError || !forms || forms.length === 0) {
      console.error('Error fetching form or no forms available:', formsError);
      
      // For testing, return a mock survey form
      console.log('Using fallback: Returning mock survey for cohort:', session.cohort);
      
      // Return a simple mock survey with some fields
      return NextResponse.json({
        id: 'mock-survey-id',
        name: 'User Experience Survey',
        description: 'Help us improve withme.travel',
        type: 'survey',
        is_active: true,
        form_fields: [
          {
            id: 'field-1',
            type: 'text',
            label: 'What do you like most about the application?',
            required: true
          },
          {
            id: 'field-2',
            type: 'radio',
            label: 'How likely are you to recommend withme.travel to a friend?',
            required: true,
            config: {
              options: [
                { label: 'Very Unlikely', value: '1' },
                { label: 'Unlikely', value: '2' },
                { label: 'Neutral', value: '3' },
                { label: 'Likely', value: '4' },
                { label: 'Very Likely', value: '5' }
              ]
            }
          },
          {
            id: 'field-3',
            type: 'textarea',
            label: 'Any other feedback or suggestions?',
            required: false
          }
        ]
      });
    }

    // Return the first form
    return NextResponse.json(forms[0]);
  } catch (error) {
    console.error('Unexpected error in research session endpoint:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500, headers: responseHeaders }
    );
  }
} 