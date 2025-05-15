/**
 * TokenSurveyPageClient
 * 
 * A client-side component for the token-based survey page that uses our new SurveyForm component
 * for an improved user experience.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { SurveyContainer } from '@/components/research/SurveyContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useSurvey } from '@/hooks/use-survey';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface TokenSurveyPageClientProps {
  token: string;
  surveyId: string;
  sessionId: string;
}

/**
 * Client component for the token-based survey page
 * Uses the new SurveyForm component with improved UX
 */
export default function TokenSurveyPageClient({
  token,
  surveyId,
  sessionId,
}: TokenSurveyPageClientProps) {
  const {
    survey,
    loading,
    error,
    trackEvent,
  } = useSurvey(surveyId);

  // Track page view on mount
  React.useEffect(() => {
    trackEvent('survey_page_view', { survey_id: surveyId }, sessionId);
  }, [surveyId, sessionId, trackEvent]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto my-8">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !survey) {
    const isExpired = error?.message?.toLowerCase().includes('expired');
    const isInvalid = error?.message?.toLowerCase().includes('invalid') || 
                     error?.message?.toLowerCase().includes('not found');
    
    return (
      <Alert 
        variant="destructive" 
        className="max-w-3xl mx-auto my-8"
        data-testid="error-container"
        role="alert"
      >
        <AlertTitle data-testid="error-title">
          {isExpired ? 'Session Expired' : isInvalid ? 'Invalid Token' : 'Error'}
        </AlertTitle>
        <AlertDescription data-testid="error-message">
          {error?.message || 'Survey not found. Please check the URL and try again.'}
        </AlertDescription>
        <div className="mt-4">
          <Button asChild data-testid="home-button">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  // Render the milestone-aware survey container
  return (
    <div className="container max-w-3xl mx-auto my-8 px-4">
      <SurveyContainer
        survey={survey}
        sessionId={sessionId}
        onComplete={() => {
          trackEvent('survey_completed', { survey_id: surveyId }, sessionId);
        }}
      />
    </div>
  );
} 