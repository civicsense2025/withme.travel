/**
 * useVotes Hook
 *
 * Custom React hook for managing votes across different entities 
 * (group ideas, tasks, etc).
 *
 * @module hooks/use-votes
 */

'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { submitGroupIdeaVote, submitTaskVote } from '@/lib/client/votes';
import type { Result } from '@/lib/client/result';

/**
 * Parameters for using the votes hook
 */
export interface UseVotesParams {
  /** The entity type to vote on */
  entityType: 'group-idea' | 'task';
  /** The group ID if entity type is group-idea */
  groupId?: string;
}

/**
 * useVotes hook for managing votes
 * @param params - Hook parameters
 * @returns Object with voting functions and loading states
 */
export function useVotes({ entityType, groupId }: UseVotesParams) {
  // Loading states
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Cast vote on an entity
  const castVote = useCallback(
    async (entityId: string, voteType: 'up' | 'down'): Promise<Result<any>> => {
      if (entityType === 'group-idea' && !groupId) {
        const errorMsg = 'Group ID is required for voting on group ideas';
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        return { success: false, error: errorMsg };
      }

      setIsVoting(true);
      setError(null);

      try {
        let result: Result<any>;

        if (entityType === 'group-idea') {
          result = await submitGroupIdeaVote(groupId!, entityId, voteType);
        } else if (entityType === 'task') {
          result = await submitTaskVote(entityId, voteType);
        } else {
          throw new Error(`Unsupported entity type: ${entityType}`);
        }

        if (result.success) {
          toast({
            title: 'Vote recorded',
            description: `Your ${voteType} vote has been recorded.`,
          });
        } else {
          throw new Error(result.error);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        toast({
          title: 'Failed to cast vote',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsVoting(false);
      }
    },
    [entityType, groupId, toast]
  );

  // Upvote an entity
  const upvote = useCallback(
    (entityId: string) => castVote(entityId, 'up'),
    [castVote]
  );

  // Downvote an entity
  const downvote = useCallback(
    (entityId: string) => castVote(entityId, 'down'),
    [castVote]
  );

  return {
    // Loading states
    isVoting,
    error,

    // Actions
    castVote,
    upvote,
    downvote,
  };
} 