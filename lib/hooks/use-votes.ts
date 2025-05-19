/**
 * Voting Hook
 * 
 * Provides functionality for voting on different entities in the application,
 * including group ideas and tasks.
 * 
 * @module hooks/use-votes
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { submitGroupIdeaVote, submitTaskVote, getUserVotes } from '@/lib/client/votes';
import { useToast } from '@/lib/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Vote entity with details
 */
export interface Vote {
  /** Unique identifier for the vote */
  id: string;
  /** ID of the user who cast the vote */
  user_id: string;
  /** Type of entity being voted on (e.g., 'group_idea', 'task') */
  entity_type: string;
  /** ID of the entity being voted on */
  entity_id: string;
  /** The vote type (up or down) */
  vote_type: 'up' | 'down';
  /** When the vote was cast */
  created_at: string;
}

/**
 * Return type for the useVotes hook
 */
export interface UseVotesResult {
  /** Whether a vote is currently being processed */
  isVoting: boolean;
  /** Error that occurred during voting, if any */
  error: Error | null;
  /** List of votes by the current user */
  userVotes: Vote[];
  /** Whether user votes are still loading */
  loading: boolean;
  /** Function to vote on a group idea */
  voteOnGroupIdea: (groupId: string, ideaId: string, voteType: 'up' | 'down') => Promise<boolean>;
  /** Function to vote on a task */
  voteOnTask: (taskId: string, voteType: 'up' | 'down') => Promise<boolean>;
  /** Function to refresh the user's votes */
  refreshVotes: () => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing votes across different entity types
 * 
 * @returns Object containing voting state and functions
 */
export function useVotes(): UseVotesResult {
  // ========== State ==========
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  
  // ========== Dependencies ==========
  const { toast } = useToast();
  const { user } = useAuth();

  // ========== Fetch User Votes ==========
  const fetchUserVotes = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setUserVotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await getUserVotes();
      
      if (result.success) {
        setUserVotes(result.data);
      } else {
        console.error('Failed to fetch user votes:', result.error);
        setError(new Error(result.error));
      }
    } catch (err) {
      console.error('Error fetching votes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch votes'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load user votes on mount and when user changes
  useEffect(() => {
    fetchUserVotes();
  }, [fetchUserVotes]);

  // ========== Voting Functions ==========
  const voteOnGroupIdea = useCallback(
    async (groupId: string, ideaId: string, voteType: 'up' | 'down'): Promise<boolean> => {
      if (!groupId || !ideaId) {
        toast({ 
          title: 'Error',
          description: 'Group ID and idea ID are required',
          variant: 'destructive' 
        });
        return false;
      }

      try {
        setIsVoting(true);
        setError(null);
        
        const result = await submitGroupIdeaVote(groupId, ideaId, voteType);
        
        if (result.success) {
          toast({ 
            title: 'Vote recorded',
            description: `You voted ${voteType === 'up' ? 'for' : 'against'} this idea`
          });
          
          // Update local state with the new vote
          if (result.data) {
            // Find and remove any existing vote by this user on this idea
            const updatedVotes = userVotes.filter(
              vote => !(vote.entity_id === ideaId && vote.entity_type === 'group_idea')
            );
            
            // Add the new vote
            setUserVotes([...updatedVotes, result.data]);
          } else {
            // If no vote data returned, refresh votes to get latest state
            fetchUserVotes();
          }
          
          return true;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to record vote';
        
        console.error('Error voting on group idea:', errorMessage);
        setError(new Error(errorMessage));
        
        toast({ 
          title: 'Error voting',
          description: errorMessage,
          variant: 'destructive' 
        });
        
        return false;
      } finally {
        setIsVoting(false);
      }
    },
    [toast, userVotes, fetchUserVotes]
  );

  const voteOnTask = useCallback(
    async (taskId: string, voteType: 'up' | 'down'): Promise<boolean> => {
      if (!taskId) {
        toast({ 
          title: 'Error',
          description: 'Task ID is required',
          variant: 'destructive' 
        });
        return false;
      }

      try {
        setIsVoting(true);
        setError(null);
        
        const result = await submitTaskVote(taskId, voteType);
        
        if (result.success) {
          toast({ 
            title: 'Vote recorded',
            description: `You voted ${voteType === 'up' ? 'for' : 'against'} this task`
          });
          
          // Update local state with the new vote
          if (result.data) {
            // Find and remove any existing vote by this user on this task
            const updatedVotes = userVotes.filter(
              vote => !(vote.entity_id === taskId && vote.entity_type === 'task')
            );
            
            // Add the new vote
            setUserVotes([...updatedVotes, result.data]);
          } else {
            // If no vote data returned, refresh votes to get latest state
            fetchUserVotes();
          }
          
          return true;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to record vote';
        
        console.error('Error voting on task:', errorMessage);
        setError(new Error(errorMessage));
        
        toast({ 
          title: 'Error voting',
          description: errorMessage,
          variant: 'destructive' 
        });
        
        return false;
      } finally {
        setIsVoting(false);
      }
    },
    [toast, userVotes, fetchUserVotes]
  );

  // Return the hook's API
  return {
    isVoting,
    error,
    userVotes,
    loading,
    voteOnGroupIdea,
    voteOnTask,
    refreshVotes: fetchUserVotes,
  };
}
