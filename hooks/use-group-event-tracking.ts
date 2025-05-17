import { useCallback } from 'react';
import { useTripEventTracking } from './use-trip-event-tracking';

/**
 * Hook for tracking events related to groups with relevant context
 */
export function useGroupEventTracking(groupId?: string) {
  const { trackEvent } = useTripEventTracking();

  const trackGroupCreated = useCallback(
    (details?: Record<string, any>) => {
      trackEvent('trip_created', {
        groupId,
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupMemberAdded = useCallback(
    (memberId: string, details?: Record<string, any>) => {
      trackEvent('trip_updated', {
        groupId,
        memberId,
        action: 'member_added',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupMemberRemoved = useCallback(
    (memberId: string, details?: Record<string, any>) => {
      trackEvent('trip_updated', {
        groupId,
        memberId,
        action: 'member_removed',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  // Group plan actions
  const trackGroupPlanCreated = useCallback(
    (planId: string, details?: Record<string, any>) => {
      trackEvent('trip_created', {
        groupId,
        planId,
        context: 'group_plan',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupPlanIdeaAdded = useCallback(
    (planId: string, ideaId: string, details?: Record<string, any>) => {
      trackEvent('itinerary_item_added', {
        groupId,
        planId,
        ideaId,
        context: 'group_plan_idea',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupPlanIdeaVoted = useCallback(
    (planId: string, ideaId: string, voteType: 'up' | 'down', details?: Record<string, any>) => {
      trackEvent('itinerary_voted', {
        groupId,
        planId,
        itemId: ideaId,
        voteType,
        context: 'group_plan_idea',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupPlanIdeaCommented = useCallback(
    (planId: string, ideaId: string, commentId: string, details?: Record<string, any>) => {
      trackEvent('itinerary_item_updated', {
        groupId,
        planId,
        itemId: ideaId,
        commentId,
        action: 'comment_added',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  return {
    trackGroupCreated,
    trackGroupMemberAdded,
    trackGroupMemberRemoved,
    trackGroupPlanCreated,
    trackGroupPlanIdeaAdded,
    trackGroupPlanIdeaVoted,
    trackGroupPlanIdeaCommented,
    trackEvent, // Include the original trackEvent for any other custom events
  };
} 