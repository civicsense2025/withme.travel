import { useCallback } from 'react';
import { useResearchTracking } from './use-research-tracking';

/**
 * Hook for tracking events related to groups with relevant context
 */
export function useGroupEventTracking(groupId?: string) {
  const { trackEvent } = useResearchTracking();

  const trackGroupCreated = useCallback(
    (details?: Record<string, any>) => {
      trackEvent('group_created', {
        groupId,
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupMemberAdded = useCallback(
    (memberId: string, details?: Record<string, any>) => {
      trackEvent('group_member_added', {
        groupId,
        memberId,
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupMemberRemoved = useCallback(
    (memberId: string, details?: Record<string, any>) => {
      trackEvent('group_member_removed', {
        groupId,
        memberId,
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  // Group plan actions
  const trackGroupPlanCreated = useCallback(
    (planId: string, details?: Record<string, any>) => {
      trackEvent('feature_discovered', {
        groupId,
        planId,
        feature: 'group_plans',
        action: 'created',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupPlanIdeaAdded = useCallback(
    (planId: string, ideaId: string, details?: Record<string, any>) => {
      trackEvent('feature_discovered', {
        groupId,
        planId,
        ideaId,
        feature: 'group_plan_ideas',
        action: 'added',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupPlanIdeaVoted = useCallback(
    (planId: string, ideaId: string, voteType: 'up' | 'down', details?: Record<string, any>) => {
      trackEvent('feature_discovered', {
        groupId,
        planId,
        ideaId,
        voteType,
        feature: 'group_plan_ideas',
        action: 'voted',
        ...details,
      });
    },
    [trackEvent, groupId]
  );

  const trackGroupPlanIdeaCommented = useCallback(
    (planId: string, ideaId: string, commentId: string, details?: Record<string, any>) => {
      trackEvent('comment_posted', {
        groupId,
        planId,
        ideaId,
        commentId,
        commentContext: 'group_plan_idea',
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