/**
 * Voting API client functions
 *
 * Client-side wrappers for vote-related API calls
 */

import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';

/**
 * Vote entity with details
 */
export interface Vote {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

/**
 * Get all votes for the current user
 */
export async function getUserVotes(): Promise<Result<Vote[]>> {
  return tryCatch(
    fetch('/api/votes', {
      method: 'GET',
    }).then((response) => handleApiResponse<Vote[]>(response))
  );
}

/**
 * Vote on a group idea
 * 
 * @param groupId - ID of the group containing the idea
 * @param ideaId - ID of the idea to vote on
 * @param voteType - Type of vote (up or down)
 * @returns The result of the operation
 */
export async function submitGroupIdeaVote(
  groupId: string,
  ideaId: string,
  voteType: 'up' | 'down'
): Promise<Result<Vote>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/ideas/${ideaId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType }),
    }).then((response) => handleApiResponse<Vote>(response))
  );
}

/**
 * Vote on a task
 * 
 * @param taskId - ID of the task to vote on
 * @param voteType - Type of vote (up or down)
 * @returns The result of the operation
 */
export async function submitTaskVote(
  taskId: string,
  voteType: 'up' | 'down'
): Promise<Result<Vote>> {
  return tryCatch(
    fetch(`/api/tasks/${taskId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType }),
    }).then((response) => handleApiResponse<Vote>(response))
  );
}
