import { tryCatch } from '@/lib/client/result';
import type { Result } from '@/lib/client/result';
import { handleApiResponse } from './index';

// Vote on a group idea
export async function submitGroupIdeaVote(
  groupId: string,
  ideaId: string,
  voteType: 'up' | 'down'
): Promise<Result<any>> {
  return tryCatch(
    fetch(`/api/groups/${groupId}/ideas/${ideaId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType }),
    }).then((response) => handleApiResponse<any>(response))
  );
}

// Vote on a task
export async function submitTaskVote(
  taskId: string,
  voteType: 'up' | 'down'
): Promise<Result<any>> {
  return tryCatch(
    fetch(`/api/tasks/${taskId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType }),
    }).then((response) => handleApiResponse<any>(response))
  );
}
