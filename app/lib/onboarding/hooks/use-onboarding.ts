'use client';
import { useState, useEffect, useCallback } from 'react';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import { TABLES } from '@/utils/constants/tables';

// Define missing constants
const ONBOARDING_TABLES = {
  ONBOARDING_TOUR_COMPLETIONS: 'onboarding_tour_completions',
  ONBOARDING_PREFERENCES: 'onboarding_preferences',
};

// Since we can't directly import useTour from onborda, we'll create a placeholder type
// This should be replaced with the actual type if you have access to it
interface TourAPI {
  startTour: (tourConfig: any) => void;
  endTour: () => void;
  currentTour?: {
    id: string;
    completed?: boolean;
    timeSpent?: number;
    stepsViewed?: number;
  };
}

// Function to get the tour API (to be replaced with actual implementation)
const useTour = (): TourAPI => {
  // This is a mock implementation for now
  return {
    startTour: (tourConfig) => console.log('Starting tour', tourConfig),
    endTour: () => console.log('Ending tour'),
    currentTour: undefined,
  };
};

interface OnboardingState {
  hasCompletedTour: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseOnboardingOptions {
  isGuest?: boolean;
}

// Add a non-hook function to safely check tour completion
// This can be called from anywhere, including inside async functions
export async function checkTourCompletionStatus(
  tourId: string,
  options?: UseOnboardingOptions
): Promise<boolean> {
  // Return false for guest users
  if (options?.isGuest) {
    return false;
  }

  try {
    // First try localStorage as a quick check
    if (typeof localStorage !== 'undefined') {
      const tourCompleted = localStorage.getItem(`tour-completed-${tourId}`);
      if (tourCompleted === 'true') {
        return true;
      }
    }

    // Then try to check the database
    if (typeof window !== 'undefined') {
      const supabase = getBrowserClient();

      // Get the current user
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        return false;
      }

      // Query the onboarding_tour_completions table
      const { data: completionData, error } = await supabase
        .from(TABLES.ONBOARDING_TOUR_COMPLETIONS)
        .select('*')
        .eq('user_id', user.id)
        .eq('tour_id', tourId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned"
        console.error('Error checking tour completion:', error);
        return false;
      }

      return !!completionData;
    }
  } catch (error) {
    console.error('Error in checkTourCompletionStatus:', error);
  }

  return false;
}

// Add a function to mark tour as completed
export async function markTourAsCompleted(
  tourId: string,
  isSkipped = false,
  options?: UseOnboardingOptions
): Promise<boolean> {
  try {
    // Always save to localStorage for persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`tour-completed-${tourId}`, 'true');
    }

    // Skip database storage for guest users
    if (options?.isGuest) {
      return true;
    }

    // Then save to the database
    if (typeof window !== 'undefined') {
      const supabase = getBrowserClient();

      // Get the current user
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        return false;
      }

      // Insert or update the completion record
      const { error } = await supabase.from(TABLES.ONBOARDING_TOUR_COMPLETIONS).upsert({
        user_id: user.id,
        tour_id: tourId,
        completed_at: new Date().toISOString(),
        is_skipped: isSkipped,
      });

      if (error) {
        console.error('Error marking tour as completed:', error);
        return false;
      }

      return true;
    }
  } catch (error) {
    console.error('Error in markTourAsCompleted:', error);
  }

  return false;
}

export function useOnboarding(tourId: string, options?: UseOnboardingOptions) {
  const { startTour, endTour, currentTour } = useTour();
  const [state, setState] = useState<OnboardingState>({
    hasCompletedTour: false,
    isLoading: true,
    error: null,
  });

  // Only create Supabase client when component is mounted and not for guest users
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client on mount (browser-side only)
  useEffect(() => {
    // Skip for guest users, as they don't need auth
    if (options?.isGuest) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        hasCompletedTour: false, // Guests always haven't completed tours
      }));
      return;
    }

    try {
      // Only create the client in the browser
      if (typeof window !== 'undefined') {
        const client = getBrowserClient();
        setSupabase(client);
      }
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to initialize Supabase client',
        isLoading: false,
      }));
    }
  }, [options?.isGuest]);

  // Check if the user has completed this tour
  const checkTourCompletion = useCallback(async () => {
    // Skip for guest users
    if (options?.isGuest) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        hasCompletedTour: false,
      }));
      return;
    }

    // Skip if supabase client isn't ready
    if (!supabase) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Only try to get user if we're not a guest
      let user = null;
      try {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
      } catch (authError) {
        console.warn('Auth session not available, treating as guest user:', authError);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          hasCompletedTour: false, // Guest users don't have completion records
        }));
        return;
      }

      if (!user) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          // Guest users don't have completion records, so they haven't completed the tour
          hasCompletedTour: false,
        }));
        return;
      }

      // Query the onboarding_tour_completions table
      const { data, error } = await supabase
        .from(TABLES.ONBOARDING_TOUR_COMPLETIONS)
        .select('*')
        .eq('user_id', user.id)
        .eq('tour_id', tourId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned"
        throw error;
      }

      setState((prev) => ({
        ...prev,
        hasCompletedTour: !!data,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error checking tour completion:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to check tour completion status',
        isLoading: false,
      }));
    }
  }, [supabase, tourId, options?.isGuest]);

  // Mark tour as completed
  const markTourCompleted = useCallback(
    async (isSkipped = false) => {
      // Skip for guest users
      if (options?.isGuest || !supabase) {
        // For guests, just update local state
        setState((prev) => ({ ...prev, hasCompletedTour: true }));
        return;
      }

      try {
        // Get the current user
        let user = null;
        try {
          const { data } = await supabase.auth.getUser();
          user = data?.user;
        } catch (authError) {
          console.warn('Auth session not available, cannot mark tour as completed:', authError);
          return;
        }

        if (!user) {
          // For guests, we can't store completion status
          return;
        }

        // Insert or update the completion record
        const { error } = await supabase.from(TABLES.ONBOARDING_TOUR_COMPLETIONS).upsert({
          user_id: user.id,
          tour_id: tourId,
          completed_at: new Date().toISOString(),
          is_skipped: isSkipped,
          // Could also track additional metrics:
          // time_spent: currentTour?.timeSpent,
          // steps_viewed: currentTour?.stepsViewed,
        });

        if (error) {
          throw error;
        }

        // Update local state
        setState((prev) => ({ ...prev, hasCompletedTour: true }));
      } catch (error) {
        console.error('Error marking tour as completed:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to save tour completion status',
        }));
      }
    },
    [supabase, tourId, options?.isGuest]
  );

  // Start the tour if it hasn't been completed
  const startOnboardingIfNeeded = useCallback(
    (tourConfig: any) => {
      if (!state.hasCompletedTour && !state.isLoading) {
        startTour(tourConfig);
      }
    },
    [state.hasCompletedTour, state.isLoading, startTour]
  );

  // Skip the tour
  const skipTour = useCallback(() => {
    endTour();
    markTourCompleted(true);
  }, [endTour, markTourCompleted]);

  // Track tour completion
  useEffect(() => {
    if (currentTour?.completed && currentTour.id === tourId) {
      markTourCompleted(false);
    }
  }, [currentTour?.completed, currentTour?.id, markTourCompleted, tourId]);

  // Load initial completion status when supabase client is ready
  useEffect(() => {
    if (supabase || options?.isGuest) {
      checkTourCompletion();
    }
  }, [checkTourCompletion, supabase, options?.isGuest]);

  return {
    hasCompletedTour: state.hasCompletedTour,
    isLoading: state.isLoading,
    error: state.error,
    startOnboardingIfNeeded,
    skipTour,
    checkTourCompletion,
  };
}
