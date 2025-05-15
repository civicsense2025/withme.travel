'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSurvey, SurveyResponse } from '@/hooks/use-survey';
import { SurveyContainer } from '@/components/research/SurveyContainer';
import { SurveyWelcome } from '@/components/research/SurveyWelcome';
import { SurveyCompletion } from '@/components/research/SurveyCompletion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface SurveyPageClientProps {
  initialToken?: string;
  initialSessionId?: string;
  initialSurveyId?: string;
}

/**
 * Client component for the survey page
 * Handles loading/error states and survey flow
 */
export default function SurveyPageClient({
  initialToken,
  initialSessionId,
  initialSurveyId,
}: SurveyPageClientProps) {
  const searchParams = useSearchParams();
  // Prioritize initial props, then search params, then default
  const surveyId = initialSurveyId || searchParams?.get('id') || '';
  const sessionId = initialSessionId || searchParams?.get('session_id') || initialToken || undefined;
  
  const [step, setStep] = useState<'welcome' | 'survey' | 'completion'>('welcome');
  const [responses, setResponses] = useState<SurveyResponse>({});
  
  const {
    survey,
    loading,
    error,
    submitting,
    submitted,
    submitSurveyResponse,
    trackEvent
  } = useSurvey(surveyId || undefined);

  // Track page view when component mounts
  useEffect(() => {
    if (surveyId) {
      trackEvent('survey_page_view', { survey_id: surveyId }, sessionId);
    }
  }, [surveyId, sessionId, trackEvent]);

  // Handle survey start
  const handleStart = async () => {
    setStep('survey');
    trackEvent('survey_started', { survey_id: surveyId }, sessionId);
  };

  // Handle question responses
  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    trackEvent('survey_question_answered', {
      survey_id: surveyId,
      question_id: questionId,
      value
    }, sessionId);
  };

  // Handle survey submission
  const handleSubmit = async () => {
    if (!surveyId) return;
    
    try {
      await submitSurveyResponse(surveyId, responses, sessionId);
      trackEvent('survey_completed', {
        survey_id: surveyId,
        response_count: Object.keys(responses).length
      }, sessionId);
      setStep('completion');
    } catch (err) {
      console.error('Failed to submit survey:', err);
      // Error handling already done in the hook
    }
  };
  
  // Reset step to welcome if surveyId changes and a new survey is loaded
  useEffect(() => {
    if (surveyId && survey && !loading && step !== 'welcome') {
      // This check is to prevent resetting if it's the same survey or still loading
      // A more robust check might involve comparing survey.id if it changes without a full reload
      setStep('welcome');
      setResponses({});
    }
  }, [surveyId, survey, loading]); //Removed step from dependency array to avoid loop

  // Show loading state
  if (loading && !survey) { // Only show initial full page skeleton if survey is not yet loaded
    return (
      <Card className="p-6 max-w-3xl mx-auto my-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    );
  }

  // Show error state if surveyId is present but survey loading failed
  if (surveyId && (error || !survey)) { // Modified condition to check surveyId
    return (
      <Alert variant="destructive" className="max-w-3xl mx-auto my-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error?.message || 'Survey not found. Please check the URL and try again.'}
        </AlertDescription>
      </Alert>
    );
  }
  
  // If no surveyId is available at all (e.g. direct access to /user-testing/survey without params)
  if (!surveyId && !initialSurveyId) {
     return (
      <Alert variant="default" className="max-w-3xl mx-auto my-8">
        <AlertTitle>No Survey Selected</AlertTitle>
        <AlertDescription>
          Please provide a survey ID in the URL (e.g., ?id=your-survey-id) or use a valid survey link.
        </AlertDescription>
      </Alert>
    );
  }

  // Show welcome screen
  if (step === 'welcome' && survey) {
    return (
      <SurveyWelcome
        title={survey.name}
        description={survey.description || 'Help us improve by taking this quick survey.'}
        onStart={handleStart}
      />
    );
  }

  // Show completion screen
  if (step === 'completion' || submitted) {
    return (
      <SurveyCompletion
        title="Thank you!"
        description="Your response has been recorded. Thank you for your feedback!"
      />
    );
  }

  // Show survey
  if (step === 'survey' && survey) {
    return (
      <SurveyContainer
        survey={survey}
        responses={responses}
        onResponseChange={handleResponseChange}
        onSubmit={handleSubmit}
        isSubmitting={submitting || loading} // Show submitting state also when survey is re-loading
      />
    );
  }
  
  // Fallback or if survey is null but still loading (e.g. after surveyId change)
  return (
     <Card className="p-6 max-w-3xl mx-auto my-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
  );
}
