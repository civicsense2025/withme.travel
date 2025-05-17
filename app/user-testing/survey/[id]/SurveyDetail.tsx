'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SurveyContainer, Survey } from '@/components/research/SurveyContainer';
import { ResearchProvider } from '@/components/research/ResearchProvider';
import { ResearchModal } from '@/components/research/ResearchModal';

interface SurveyDetailProps {
  id: string;
}

export default function SurveyDetail({ id }: SurveyDetailProps) {
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Only check for dev mode once at load time
  useEffect(() => {
    setDevMode(process.env.NODE_ENV !== 'production' || localStorage.getItem('dev-mode') === 'true');
  }, []);

  // Simple data fetching
  useEffect(() => {
    if (!id) {
      setError('Survey ID is required');
      setLoading(false);
      return;
    }

    async function fetchSurvey() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/user-testing/survey/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch survey: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.id || !Array.isArray(data.fields)) {
          throw new Error('Invalid survey data format received');
        }
        
        setSurvey(data);
      } catch (err: unknown) {
        console.error('Error loading survey:', err);
        setError(err instanceof Error ? err.message : 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    }

    fetchSurvey();
  }, [id]);

  const handleComplete = useCallback(() => {
    setSubmitted(true);
  }, []);

  const handleBack = useCallback(() => {
    router.push('/user-testing/survey');
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading survey...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertTitle>Error Loading Survey</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{error}</p>
        </AlertDescription>
        <Button variant="outline" className="mt-4" onClick={handleBack}>
          Return to Survey List
        </Button>
      </Alert>
    );
  }

  // Missing survey state
  if (!survey) {
    return (
      <Alert className="max-w-xl mx-auto">
        <AlertTitle>Survey Not Found</AlertTitle>
        <AlertDescription>
          The survey you're looking for doesn't exist or has been removed.
        </AlertDescription>
        <Button variant="outline" className="mt-4" onClick={handleBack}>
          Return to Survey List
        </Button>
      </Alert>
    );
  }

  // Main render
  return (
    <ResearchProvider>
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>
        <h1 className="text-3xl font-bold mt-4">{survey.name}</h1>
        <p className="text-muted-foreground mt-2">{survey.description}</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          {!submitted ? (
            <SurveyContainer 
              survey={survey} 
              onComplete={handleComplete} 
            />
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-xl font-bold mb-4 text-green-700">Thank You for Your Feedback!</h2>
              <p className="mb-6">Your responses have been recorded successfully.</p>
              <Button onClick={handleBack}>Return to Surveys</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple dev mode display */}
      {devMode && (
        <div className="p-4 border border-dashed border-amber-300 rounded-md bg-amber-50 mb-8">
          <h3 className="font-medium text-amber-800">Developer Mode</h3>
          <p className="text-sm text-amber-700 mb-2">Survey ID: {survey.id}</p>
          <details>
            <summary className="cursor-pointer text-sm text-amber-700">Show Survey Data</summary>
            <pre className="mt-2 p-2 bg-black text-green-400 rounded-md text-xs overflow-auto max-h-96">
              {JSON.stringify(survey, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <ResearchModal />
    </ResearchProvider>
  );
}