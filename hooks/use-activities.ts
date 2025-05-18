/**
 * useActivities Hook
 *
 * Manages trip activities state, CRUD actions, and loading/error handling.
 * Uses the standardized Result pattern and client API wrapper.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Activity } from '@/lib/api/_shared';
import {
  listTripActivities,
  getTripActivity,
  createTripActivity,
  updateTripActivity,
  deleteTripActivity,
  generateActivitySuggestions,
} from '@/lib/client/activities';
import type { Result } from '@/lib/client/result';

/**
 * Hook return type for useActivities
 */
export interface UseActivitiesResult {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addActivity: (data: Partial<Activity>) => Promise<Result<Activity>>;
  editActivity: (activityId: string, data: Partial<Activity>) => Promise<Result<Activity>>;
  removeActivity: (activityId: string) => Promise<Result<null>>;
  getSuggestions: (params?: { count?: number; category?: string }) => Promise<Result<Activity[]>>;
}

/**
 * useActivities - React hook for managing trip activities
 */
export function useActivities(tripId: string): UseActivitiesResult {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all activities for the trip
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await listTripActivities(tripId);
    if (result.success) {
      setActivities(result.data);
    } else {
      setError(result.error);
      toast({
        title: 'Failed to load activities',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [tripId, toast]);

  // Add a new activity
  const addActivity = useCallback(
    async (data: Partial<Activity>) => {
      setIsLoading(true);
      const result = await createTripActivity(tripId, data);
      if (result.success) {
        setActivities((prev) => [result.data, ...prev]);
        toast({ title: 'Activity added' });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to add activity',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Edit an existing activity
  const editActivity = useCallback(
    async (activityId: string, data: Partial<Activity>) => {
      setIsLoading(true);
      const result = await updateTripActivity(tripId, activityId, data);
      if (result.success) {
        setActivities((prev) =>
          prev.map((act) => (act.id === activityId ? result.data : act))
        );
        toast({ title: 'Activity updated' });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to update activity',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Remove an activity
  const removeActivity = useCallback(
    async (activityId: string) => {
      setIsLoading(true);
      const result = await deleteTripActivity(tripId, activityId);
      if (result.success) {
        setActivities((prev) => prev.filter((act) => act.id !== activityId));
        toast({ title: 'Activity deleted' });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to delete activity',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Get activity suggestions
  const getSuggestions = useCallback(
    async (params?: { count?: number; category?: string }) => {
      setIsLoading(true);
      const result = await generateActivitySuggestions(tripId, params || {});
      if (!result.success) {
        setError(result.error);
        toast({
          title: 'Failed to get activity suggestions',
          description: result.error,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Initial load
  useEffect(() => {
    if (tripId) {
      refresh();
    }
  }, [tripId, refresh]);

  return {
    activities,
    isLoading,
    error,
    refresh,
    addActivity,
    editActivity,
    removeActivity,
    getSuggestions,
  };
} 