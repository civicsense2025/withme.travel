import { useState, useCallback } from 'react';
import { ActivityIdea } from '@/utils/activity-generator';

interface UseActivitySuggestionsOptions {
  onError?: (error: Error) => void;
}

interface UseActivitySuggestionsReturn {
  activities: ActivityIdea[];
  keywords: string[];
  isLoading: boolean;
  error: Error | null;
  fetchActivities: (destinationId: string, tripId?: string) => Promise<void>;
  selectActivity: (activity: ActivityIdea) => void;
  selectedActivities: ActivityIdea[];
}

/**
 * Custom hook for managing activity suggestions
 *
 * @param options - Configuration options
 * @returns An object containing activities, loading state, error state, and fetch function
 */
export function useActivitySuggestions(
  options: UseActivitySuggestionsOptions = {}
): UseActivitySuggestionsReturn {
  const [activities, setActivities] = useState<ActivityIdea[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<ActivityIdea[]>([]);

  /**
   * Fetches activity suggestions from the API
   */
  const fetchActivities = useCallback(
    async (destinationId: string, tripId?: string) => {
      if (!destinationId) {
        const error = new Error('Destination ID is required');
        setError(error);
        options.onError?.(error);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/activities/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destinationId,
            tripId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        setActivities(data.activities || []);
        setKeywords(data.keywords || []);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch activities');
        setError(error);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  /**
   * Selects an activity from the suggestions
   */
  const selectActivity = useCallback((activity: ActivityIdea) => {
    setSelectedActivities((prev) => {
      // Check if already selected
      const isAlreadySelected = prev.some(
        (item) => item.title === activity.title && item.category === activity.category
      );

      // If already selected, remove it (toggle behavior)
      if (isAlreadySelected) {
        return prev.filter(
          (item) => !(item.title === activity.title && item.category === activity.category)
        );
      }

      // Otherwise add it
      return [...prev, activity];
    });
  }, []);

  return {
    activities,
    keywords,
    isLoading,
    error,
    fetchActivities,
    selectActivity,
    selectedActivities,
  };
}
