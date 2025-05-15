/**
 * Survey Loader Hook
 * 
 * A hook for loading surveys from the API with proper loading states and error handling.
 */

import { useState, useEffect } from 'react';
import { Survey } from '@/components/research/SurveyForm';

// ============================================================================
// TYPES
// ============================================================================

type SurveyLoadingState = 'idle' | 'loading' | 'success' | 'error';

interface UseSurveyLoaderResult {
  survey: Survey | null;
  state: SurveyLoadingState;
  error: Error | null;
  reload: () => void;
}

/**
 * Hook to load a survey from the API by ID
 */
export function useSurveyLoader(surveyId: string | null): UseSurveyLoaderResult {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [state, setState] = useState<SurveyLoadingState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Reload function to trigger a fresh fetch
  const reload = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    if (!surveyId) {
      setState('idle');
      setSurvey(null);
      setError(null);
      return;
    }

    // Set loading state
    setState('loading');
    setError(null);

    // Fetch the survey from the API
    fetch(`/api/research/surveys/${surveyId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Survey fetch failed with status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setSurvey(data);
        setState('success');
      })
      .catch(err => {
        console.error('Error loading survey:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setState('error');
      });
  }, [surveyId, refreshKey]);

  return {
    survey,
    state,
    error,
    reload
  };
}

/**
 * Hook to load all available surveys
 */
export function useSurveysList(): {
  surveys: Survey[];
  isLoading: boolean;
  error: Error | null;
  reload: () => void;
} {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch('/api/research/surveys')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Surveys fetch failed with status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setSurveys(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading surveys:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });
  }, [refreshKey]);

  return {
    surveys,
    isLoading,
    error,
    reload
  };
} 