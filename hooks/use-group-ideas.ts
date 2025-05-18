'use client';

import { useState, useEffect, useCallback } from 'react';
import { listGroupIdeas, createGroupIdea, GroupIdea } from '@/lib/client/groupPlans';
import { useVotes } from '@/hooks/use-votes';
import { useToast } from '@/hooks/use-toast';

interface UseGroupIdeasResult {
  ideas: GroupIdea[];
  loading: boolean;
  error: Error | null;
  createIdea: (data: Partial<GroupIdea>) => Promise<GroupIdea | null>;
  voteOnIdea: (ideaId: string, voteType: 'up' | 'down') => Promise<boolean>;
  deleteIdea: (ideaId: string) => Promise<boolean>;
  updateIdea: (ideaId: string, data: Partial<GroupIdea>) => Promise<GroupIdea | null>;
  refetch: () => Promise<void>;
}

export function useGroupIdeas(groupId: string): UseGroupIdeasResult {
  const [ideas, setIdeas] = useState<GroupIdea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { voteOnGroupIdea } = useVotes();

  // Fetch group ideas
  const fetchIdeas = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    const result = await listGroupIdeas(groupId);
    if (result.success) {
      setIdeas(result.data);
    } else {
      setError(new Error(result.error));
      toast({
        title: 'Error',
        description: 'Failed to load group ideas',
        variant: 'destructive',
      });
    }
    setLoading(false);
  }, [groupId, toast]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Create a new idea
  const createIdea = useCallback(
    async (data: Partial<GroupIdea>): Promise<GroupIdea | null> => {
      if (!groupId || !data.title) {
        toast({
          title: 'Error',
          description: 'Group ID and title are required',
          variant: 'destructive',
        });
        return null;
      }
      const result = await createGroupIdea(groupId, data);
      if (result.success) {
        setIdeas((prev) => [result.data, ...prev]);
        toast({
          title: 'Success',
          description: 'Group idea created',
        });
        return result.data;
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        return null;
      }
    },
    [groupId, toast]
  );

  // Vote on an idea using the votes hook
  const voteOnIdea = useCallback(
    async (ideaId: string, voteType: 'up' | 'down') => {
      const success = await voteOnGroupIdea(groupId, ideaId, voteType);
      if (success) {
        // Optimistically update the UI
        setIdeas((prevIdeas) =>
          prevIdeas.map((idea) => {
            if (idea.id === ideaId) {
              if (voteType === 'up') {
                return {
                  ...idea,
                  votes_up: (idea.votes_up || 0) + 1,
                };
              } else {
                return {
                  ...idea,
                  votes_down: (idea.votes_down || 0) + 1,
                };
              }
            }
            return idea;
          })
        );

        // We'll refetch ideas after a delay to get the updated vote counts
        setTimeout(fetchIdeas, 1000);
      }
      return success;
    },
    [groupId, voteOnGroupIdea, fetchIdeas]
  );

  // Delete an idea
  const deleteIdea = useCallback(
    async (ideaId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/groups/${groupId}/ideas/${ideaId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete idea');
        }

        // Optimistically update the UI
        setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));

        toast({
          title: 'Success',
          description: 'Idea deleted successfully',
        });

        return true;
      } catch (error) {
        console.error('Error deleting idea:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete idea',
          variant: 'destructive',
        });
        return false;
      }
    },
    [groupId, toast]
  );

  // Update an idea
  const updateIdea = useCallback(
    async (ideaId: string, data: Partial<GroupIdea>): Promise<GroupIdea | null> => {
      try {
        const response = await fetch(`/api/groups/${groupId}/ideas/${ideaId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update idea');
        }

        const result = await response.json();

        // Update the ideas list with the updated idea
        setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? result.idea : idea)));

        toast({
          title: 'Success',
          description: 'Idea updated successfully',
        });

        return result.idea;
      } catch (error) {
        console.error('Error updating idea:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update idea',
          variant: 'destructive',
        });
        return null;
      }
    },
    [groupId, toast]
  );

  return {
    ideas,
    loading,
    error,
    createIdea,
    voteOnIdea,
    deleteIdea,
    updateIdea,
    refetch: fetchIdeas,
  };
}
