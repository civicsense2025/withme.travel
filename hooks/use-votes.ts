import { useState, useCallback } from 'react';
import { submitGroupIdeaVote, submitTaskVote } from '@/lib/client/votes';
import { useToast } from '@/hooks/use-toast';

interface UseVotesResult {
  isVoting: boolean;
  error: Error | null;
  voteOnGroupIdea: (groupId: string, ideaId: string, voteType: 'up' | 'down') => Promise<boolean>;
  voteOnTask: (taskId: string, voteType: 'up' | 'down') => Promise<boolean>;
}

export function useVotes(): UseVotesResult {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const voteOnGroupIdea = useCallback(
    async (groupId: string, ideaId: string, voteType: 'up' | 'down') => {
      setIsVoting(true);
      setError(null);
      const result = await submitGroupIdeaVote(groupId, ideaId, voteType);
      setIsVoting(false);
      if (result.success) {
        toast({ title: 'Vote recorded', description: `You voted ${voteType}` });
        return true;
      } else {
        setError(new Error(result.error));
        toast({ title: 'Error voting', description: result.error, variant: 'destructive' });
        return false;
      }
    },
    [toast]
  );

  const voteOnTask = useCallback(
    async (taskId: string, voteType: 'up' | 'down') => {
      setIsVoting(true);
      setError(null);
      const result = await submitTaskVote(taskId, voteType);
      setIsVoting(false);
      if (result.success) {
        toast({ title: 'Vote recorded', description: `You voted ${voteType}` });
        return true;
      } else {
        setError(new Error(result.error));
        toast({ title: 'Error voting', description: result.error, variant: 'destructive' });
        return false;
      }
    },
    [toast]
  );

  return {
    isVoting,
    error,
    voteOnGroupIdea,
    voteOnTask,
  };
}
