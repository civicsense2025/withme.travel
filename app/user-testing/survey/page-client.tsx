'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSurvey }  from '@/hooks/use-survey';
import { SurveyContainer, SurveyResponse } from '@/components/research/SurveyContainer';
import { SurveyWelcome } from '@/components/research/SurveyWelcome';
import { SurveyCompletion } from '@/components/research/SurveyCompletion';
import { SurveyProgressBar } from '@/components/research';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { SurveyGrid } from './SurveyGrid';
import DevModeControls from './DevModeControls';
import { SurveyForm } from '@/components/research/SurveyForm';
import type { FormField } from '@/hooks/use-survey';

interface SurveyPageClientProps {
  initialToken?: string;
  initialSessionId?: string;
  initialSurveyId?: string;
}

// Dev mode storage helper
export const DEV_MODE_STORAGE_KEY = 'withme_survey_dev_mode';

export function getDevModeEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(DEV_MODE_STORAGE_KEY) !== 'false';
}

export function setDevModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEV_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
}

// Add this component at the beginning of your existing client component
function DevModeToggle() {
  const [enabled, setEnabled] = useState(getDevModeEnabled());
  
  useEffect(() => {
    setDevModeEnabled(enabled);
  }, [enabled]);
  
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  return (
    <div className="bg-yellow-100 p-2 rounded mb-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">Development Mode:</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={(e) => setEnabled(e.target.checked)} 
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-2">{enabled ? 'On' : 'Off'}</span>
        </label>
      </div>
      <p className="mt-1 text-xs">
        {enabled 
          ? 'Using mock survey data for development' 
          : 'Using real survey data from API'}
      </p>
    </div>
  );
}

// Helper function to get response value
function getResponseValue(responses: Record<string, any>, fieldId: string): any {
  return responses[fieldId];
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
  const [responses, setResponses] = useState<SurveyResponse>({} as SurveyResponse);
  
  const {
    form,
    loading,
    error,
    submitting,
    submitted,
    submitFormResponse,
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
      await submitFormResponse(form?.id || '', responses, sessionId);
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
    if (surveyId && form && !loading && step !== 'welcome') {
      // This check is to prevent resetting if it's the same survey or still loading
      // A more robust check might involve comparing survey.id if it changes without a full reload
      setStep('welcome');
      setResponses({} as SurveyResponse);
    }
  }, [surveyId, form, loading]); //Removed step from dependency array to avoid loop

  // Show loading state
  if (loading && !form) { // Only show initial full page skeleton if survey is not yet loaded
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
  if (surveyId && (error || !form)) { // Modified condition to check surveyId
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
  if (step === 'welcome' && form) {
    return (
      <SurveyWelcome
        title={form.name}
        description={form.description || 'Help us improve by taking this quick survey.'}
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
  if (step === 'survey' && form) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Custom survey rendering using the form data */}
        <h1 className="text-2xl font-bold mb-4">{form.name}</h1>
        {form.description && <p className="mb-6">{form.description}</p>}
        
        {/* Show progress bar */}
        {form.config?.fields && form.config.fields.length > 0 && (
          <SurveyProgressBar 
            value={Object.keys(responses).length / form.config.fields.length * 100} 
            steps={form.config.fields.length}
            currentStep={Object.keys(responses).length + 1}
            className="mb-6" 
          />
        )}
        
        <div className="space-y-6">
          {/* Render form fields */}
          {form.config?.fields?.map((field: FormField) => (
            <div key={field.id} className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">{field.label}</h3>
              {field.description && <p className="text-sm mb-3">{field.description}</p>}
              
              {/* Simple input rendering based on field type */}
              {field.type === 'text' && (
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={getResponseValue(responses, field.id) || ''}
                  onChange={(e) => handleResponseChange(field.id, e.target.value)}
                />
              )}
              
              {/* Add more field type renderers as needed */}
            </div>
          ))}
          
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep('welcome')}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Back to Welcome
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Responses'}
            </button>
          </div>
        </div>
      </div>
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
