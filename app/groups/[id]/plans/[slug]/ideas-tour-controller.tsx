'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { ideasWhiteboardTour } from '@/app/lib/onboarding/tours';
import { trackPlanEvent, PLAN_EVENT_TYPES } from '@/app/lib/group-plans/track-plan-event';

const TOUR_ID = 'ideas-whiteboard-tour';
const SHOW_TOUR_PARAM = 'show-tour';

/**
 * Hook to control when to show the ideas whiteboard onboarding tour.
 * Returns [showOnborda, setShowOnborda] for use in parent component.
 */
export function useIdeasTourController(isGuest?: boolean) {
  const searchParams = useSearchParams();
  const params = useParams();
  const [showOnborda, setShowOnborda] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Safely mount component to avoid SSR issues with browser client
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Only import and use the onboarding hook after component is mounted in browser
  useEffect(() => {
    if (!isMounted) return;

    // Dynamically import to avoid SSR issues
    const checkTourCompletion = async () => {
      try {
        if (typeof window === 'undefined') return;

        // Check if the tour is forced via URL parameter
        const forceShowTour = searchParams?.get(SHOW_TOUR_PARAM) === 'true';
        const groupId = params?.id as string;
        const planSlug = params?.slug as string;

        if (forceShowTour) {
          setShowOnborda(true);
          if (groupId && planSlug) {
            trackPlanEvent({
              groupId,
              planId: planSlug,
              eventType: PLAN_EVENT_TYPES.TOUR_START,
              eventData: { forced: true },
            });
          }
          setIsLoading(false);
          return;
        }

        // Use browser-safe localStorage for guests
        if (isGuest) {
          try {
            // Check localStorage directly for guests
            if (typeof localStorage !== 'undefined') {
              const tourCompleted = localStorage.getItem(`tour-completed-${TOUR_ID}`);
              const completed = tourCompleted === 'true';
              setHasCompletedTour(completed);

              if (!completed) {
                setShowOnborda(true);
                if (groupId && planSlug) {
                  trackPlanEvent({
                    groupId,
                    planId: planSlug,
                    eventType: PLAN_EVENT_TYPES.TOUR_START,
                    eventData: { automatic: true },
                  });
                }
              }
            }
            setIsLoading(false);
          } catch (storageError) {
            console.error('Error accessing localStorage:', storageError);
            setIsLoading(false);
          }
          return;
        }

        // For authenticated users, check tour completion
        try {
          // FIXED: Don't call the hook inside this function
          // Instead, import and use our non-hook function
          const { checkTourCompletionStatus } = await import(
            '@/app/lib/onboarding/hooks/use-onboarding'
          );

          // Check tour completion status using our safe function
          const hasCompletedTour = await checkTourCompletionStatus(TOUR_ID, { isGuest });
          setHasCompletedTour(hasCompletedTour);

          if (!hasCompletedTour) {
            setShowOnborda(true);
            if (groupId && planSlug) {
              trackPlanEvent({
                groupId,
                planId: planSlug,
                eventType: PLAN_EVENT_TYPES.TOUR_START,
                eventData: { automatic: true },
              });
            }
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Error in tour controller:', error);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to check tour completion:', error);
        setIsLoading(false);
      }
    };

    checkTourCompletion();
  }, [isMounted, params, searchParams, isGuest]);

  // Handler to close the tour and mark as complete
  const handleCloseTour = useCallback(async () => {
    setShowOnborda(false);
    setHasCompletedTour(true);

    // Track that the tour was completed
    const groupId = params?.id as string;
    const planSlug = params?.slug as string;

    if (groupId && planSlug) {
      trackPlanEvent({
        groupId,
        planId: planSlug,
        eventType: PLAN_EVENT_TYPES.TOUR_COMPLETE,
        eventData: { automatic: false },
      }).catch((error) => {
        console.warn('Failed to track tour completion event:', error);
      });
    }

    try {
      // Use our non-hook function to mark tour as completed
      const { markTourAsCompleted } = await import('@/app/lib/onboarding/hooks/use-onboarding');
      await markTourAsCompleted(TOUR_ID, false, { isGuest });
    } catch (error) {
      console.error('Error marking tour as completed:', error);
      // Still save to localStorage as fallback
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`tour-completed-${TOUR_ID}`, 'true');
      }
    }
  }, [isGuest, params]);

  return { showOnborda, setShowOnborda, handleCloseTour, isLoading };
}

// This is a logical component with no UI
export default function IdeasTourController() {
  return null;
}
