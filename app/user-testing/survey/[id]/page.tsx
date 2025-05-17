'use client';

import React from 'react';
import SurveyDetail from './SurveyDetail';
import { Spinner } from '@/components/ui/spinner';
import { ClassErrorBoundary } from '@/components/error-fallbacks/class-error-boundary';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

/**
 * Simple error fallback component that shows error details and offers a retry
 */
function SurveyErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  const router = useRouter();
  
  return (
    <Alert variant="destructive" className="max-w-xl mx-auto">
      <AlertTitle>Survey Error</AlertTitle>
      <AlertDescription>
        <p className="mb-4">There was a problem loading the survey: {error.message}</p>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
            Retry
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/user-testing/survey')}>
            Back to Survey List
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Page for displaying a specific survey by ID
 */
export default function SurveyDetailPage({ params }: { params: { id: string } }) {
  if (!params?.id) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertTitle>Missing Survey ID</AlertTitle>
        <AlertDescription>No survey ID was provided in the URL.</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ClassErrorBoundary fallback={SurveyErrorFallback}>
        <React.Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Spinner size="lg" />
            <p className="text-center text-muted-foreground mt-4">Loading survey...</p>
          </div>
        }>
          <SurveyDetail id={params.id} />
        </React.Suspense>
      </ClassErrorBoundary>
    </div>
  );
}