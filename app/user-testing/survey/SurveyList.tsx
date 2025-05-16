'use client';

import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SurveyGrid, Survey } from './SurveyGrid';
import clientGuestUtils from '@/utils/guest';
import { useSearchParams } from 'next/navigation';

// --- API helpers ---
async function fetchSession(token: string) {
  const res = await fetch(`/api/user-testing-session/${token}`);
  if (!res.ok) throw new Error('Session not found or expired.');
  return res.json(); // { session: { cohort: 'beta', ... } }
}

async function fetchSurveysForCohort(cohort: string, token: string) {
  // Pass token for auth, cohort for filtering
  const res = await fetch(`/api/forms?cohort=${encodeURIComponent(cohort)}&token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Failed to fetch surveys for your cohort.');
  return res.json(); // { forms: [...] }
}

/**
 * Component that displays a list of available surveys for user testing
 */
export default function SurveyList() {
  const searchParams = useSearchParams();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCohort, setUserCohort] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      setIsLoading(true);
      setError(null);
      setSurveys([]);
      setUserCohort(null);
      try {
        console.log('SurveyList: Starting to fetch surveys');
        
        // Get token from URL or localStorage
        const urlToken = searchParams?.get('token');
        console.log('SurveyList: URL token:', urlToken ? 'present' : 'not present');
        
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        console.log('SurveyList: Auth token:', authToken ? 'present' : 'not present');
        
        // Use token from URL or localStorage
        const userToken = urlToken || authToken;
        console.log('SurveyList: Final user token:', userToken ? 'present' : 'not present');
        
        // Save URL token to localStorage if present
        if (urlToken) {
          localStorage.setItem('authToken', urlToken);
          console.log('SurveyList: Saved URL token to localStorage');
        }
        
        if (!userToken) {
          console.log('SurveyList: No token found, redirecting to signup');
          setError('No authentication token found. Please sign up or log in.');
          // Redirect to registration page
          window.location.href = '/user-testing';
          setIsLoading(false);
          return;
        }
        
        // 1. Fetch session to get cohort
        console.log('SurveyList: Fetching session with token');
        const { session } = await fetchSession(userToken);
        if (!session?.cohort) throw new Error('Session missing cohort.');
        setUserCohort(session.cohort);
        console.log('SurveyList: Got cohort:', session.cohort);
        
        // 2. Fetch surveys for cohort
        console.log('SurveyList: Fetching surveys for cohort:', session.cohort);
        const { forms } = await fetchSurveysForCohort(session.cohort, userToken);
        if (!forms || forms.length === 0) {
          console.log('SurveyList: No forms returned');
          setSurveys([]);
          setIsLoading(false);
          return;
        }
        console.log('SurveyList: Got surveys:', forms.length);
        setSurveys(forms);
      } catch (err: any) {
        console.error('SurveyList: Error in fetchList:', err);
        setError(err.message || 'Failed to load surveys. Please try again later.');
        setSurveys([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner className="mr-2" />
        <span>Loading available surveys...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No surveys available</h3>
        <p className="text-muted-foreground">
          There are no surveys available for your cohort at the moment. Please check back later.
        </p>
        {userCohort && (
          <div className="mt-2 text-xs text-muted-foreground">
            <strong>Your cohort:</strong> <code>{userCohort}</code>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userCohort && (
        <div className="mb-2 text-xs text-muted-foreground">
          <span className="inline-block px-3 py-1 rounded-full bg-muted font-semibold">
            Cohort: {userCohort}
          </span>
        </div>
      )}
      <SurveyGrid surveys={surveys} />
    </div>
  );
} 