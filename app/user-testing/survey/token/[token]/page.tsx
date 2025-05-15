import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';
import { USER_TESTING_TABLES } from '@/utils/constants/tables';
import TokenSurveyPageClient from './page-client';

interface SurveyPageProps {
  params: {
    token: string;
  };
}

// Define the expected metadata shape
interface SessionMetadata {
  survey_id?: string;
  [key: string]: any;
}

/**
 * Loads a survey by token and displays it
 * This is useful for direct survey links without requiring login
 */
export default async function TokenSurveyPage({ params }: SurveyPageProps) {
  const { token } = params;
  
  if (!token) {
    redirect('/user-testing/survey');
  }
  
  try {
    // Validate the token server-side to ensure it exists
    const supabase = await createServerComponentClient();
    
    const { data: session, error } = await supabase
      .from(USER_TESTING_TABLES.USER_TESTING_SESSIONS)
      .select('id, metadata')
      .eq('token', token)
      .single();
    
    if (error || !session) {
      console.error('Invalid token or session not found:', error);
      redirect('/user-testing/survey?error=invalid_token');
    }
    
    // Extract survey_id from metadata - it may be stored there based on our analysis
    const metadata = (session.metadata as SessionMetadata) || {};
    const surveyId = metadata.survey_id;
    
    if (!surveyId) {
      console.error('No survey ID found in session metadata');
      redirect('/user-testing/survey?error=no_survey');
    }
    
    // Use the new client component
    return (
      <TokenSurveyPageClient 
        token={token} 
        surveyId={surveyId} 
        sessionId={session.id} 
      />
    );
    
  } catch (error) {
    console.error('Error validating session token:', error);
    redirect('/user-testing/survey?error=server_error');
  }
}

export const metadata = {
  title: 'Research Survey | withme.travel',
  description: 'Help us improve withme.travel by taking this survey',
}; 