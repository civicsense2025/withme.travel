'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SurveyContainer } from '@/components/research/SurveyContainer';
import { ResearchProvider } from '@/components/research/ResearchProvider';
import { ResearchModal } from '@/components/research/ResearchModal';
import clientGuestUtils from '@/utils/guest';

interface SurveyDetailProps {
  id: string;
}

// --- API helpers ---
async function fetchSession(token: string) {
  const res = await fetch(`/api/user-testing-session/${token}`);
  if (!res.ok) throw new Error('Session not found or expired.');
  return res.json(); // { session: { cohort: 'beta', ... } }
}

async function fetchSurveyDetail(id: string, token: string) {
  const res = await fetch(`/api/forms/${id}?token=${token}`);
  if (!res.ok) throw new Error('Survey not found or access denied.');
  return res.json(); // { form: {...} }
}

export default function SurveyDetail({ id }: SurveyDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [userCohort, setUserCohort] = useState<string | null>(null);

  // Helper: Get token from all possible sources
  const getToken = useCallback(() => {
    const urlToken = searchParams?.get('token');
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const guestToken = clientGuestUtils.getToken();
    return urlToken || authToken || guestToken || null;
  }, [searchParams]);

  // Main effect: fetch session, cohort, and survey
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setSurvey(null);
      setUserCohort(null);

      const userToken = getToken();
      setToken(userToken);

      if (!userToken) {
        setError('No authentication token found. Please sign up for user testing to access surveys.');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch session to get cohort
        const { session } = await fetchSession(userToken);
        if (!session?.cohort) throw new Error('Session missing cohort.');
        setUserCohort(session.cohort);

        // 2. Fetch survey detail
        const { form: surveyData } = await fetchSurveyDetail(id, userToken);
        // 3. Check cohort access
        const allowedCohorts = Array.isArray(surveyData.cohorts)
          ? surveyData.cohorts
          : surveyData.cohort
            ? [surveyData.cohort]
            : [];
        if (allowedCohorts.length > 0 && !allowedCohorts.includes(session.cohort)) {
          throw new Error(
            `You do not have access to this survey (your cohort: ${session.cohort}, allowed: ${allowedCohorts.join(', ')}).`
          );
        }
        setSurvey(surveyData);
      } catch (err: any) {
        setError(err.message || 'Failed to load the survey. Please try again later.');
        setSurvey(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getToken]);

  // Handlers
  const handleComplete = () => setSubmitted(true);
  const handleBack = () => router.push('/user-testing/survey');
  const handleSignup = () => router.push('/user-testing'); // Or your signup page
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setSurvey(null);
    setUserCohort(null);
    // Triggers useEffect
    // (by changing id or searchParams, or can force reload by updating a key if needed)
  };

  // UI States
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading survey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleBack}>
            Return to Survey List
          </Button>
          <Button variant="secondary" onClick={handleRetry}>
            Retry
          </Button>
          <Button variant="default" onClick={handleSignup}>
            Sign Up for User Testing
          </Button>
        </div>
        {token && (
          <div className="mt-2 text-xs text-muted-foreground">
            <strong>Debug:</strong> Using token: <code>{token}</code>
            {userCohort && (
              <span> | Cohort: <code>{userCohort}</code></span>
            )}
          </div>
        )}
      </Alert>
    );
  }

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

  if (submitted) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>
            Your survey response has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We appreciate your feedback and will use it to improve our product.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBack}>Return to Survey List</Button>
        </CardFooter>
      </Card>
    );
  }

  // Main survey UI
  return (
    <ResearchProvider>
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Surveys
        </Button>
        <h1 className="text-3xl font-bold">{survey.name}</h1>
        <p className="text-muted-foreground mt-2">{survey.description}</p>
        {userCohort && (
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-muted text-xs font-semibold">
            Cohort: {userCohort}
          </span>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          <SurveyContainer
            survey={survey}
            onComplete={handleComplete}
          />
        </CardContent>
      </Card>
      <ResearchModal />
    </ResearchProvider>
  );
} 