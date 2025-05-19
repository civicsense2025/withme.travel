/**
 * Group Ideas Hook
 * 
 * Provides functionality for managing and interacting with group ideas, including:
 * - Fetching and listing ideas
 * - Creating new ideas
 * - Voting on ideas
 * - Updating and deleting ideas
 * 
 * @module hooks/use-group-ideas
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { listGroupIdeas, createGroupIdea, GroupIdea } from '@/lib/client/groupPlans';
import { useVotes } from '@/lib/hooks/use-votes';
import { useToast } from '@/lib/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { API_ROUTES } from '@/utils/constants/routes';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Response from the hook with all available operations and state
 */
export interface UseGroupIdeasResult {
  /** List of group ideas */
  ideas: GroupIdea[];
  /** Whether ideas are currently loading */
  loading: boolean;
  /** Error object if an error occurred */
  error: Error | null;
  /** Function to create a new idea in the group */
  createIdea: (data: Partial<GroupIdea>) => Promise<GroupIdea | null>;
  /** Function to vote on an idea */
  voteOnIdea: (ideaId: string, voteType: 'up' | 'down') => Promise<boolean>;
  /** Function to delete an idea */
  deleteIdea: (ideaId: string) => Promise<boolean>;
  /** Function to update an existing idea */
  updateIdea: (ideaId: string, data: Partial<GroupIdea>) => Promise<GroupIdea | null>;
  /** Function to manually refresh the ideas list */
  refetch: () => Promise<void>;
}

/**
 * Group idea with user-specific voting information
 */
export interface GroupIdeaWithVoteStatus extends GroupIdea {
  /** Whether the current user has upvoted this idea */
  hasUpvoted: boolean;
  /** Whether the current user has downvoted this idea */
  hasDownvoted: boolean;
  /** Total number of upvotes (normalized) */
  upvotes: number;
  /** Total number of downvotes (normalized) */
  downvotes: number;
}

/**
 * Response from the useGroupIdeasWithVotes hook
 */
export interface UseGroupIdeasWithVotesResult extends Omit<UseGroupIdeasResult, 'ideas'> {
  /** List of ideas with the current user's vote status */
  ideas: GroupIdeaWithVoteStatus[];
  /** Ideas sorted by popularity (upvotes - downvotes) */
  popularIdeas: GroupIdeaWithVoteStatus[];
  /** Ideas created by the current user */
  myIdeas: GroupIdeaWithVoteStatus[];
}

/**
 * Custom discriminated union type for API responses
 */
type ApiResponse<T> = 
  | { success: true; idea: T }
  | { success: false; error: string };

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing group ideas
 * 
 * @param groupId - The ID of the group to fetch and manage ideas for
 * @returns Object containing ideas data and management functions
 */
export function useGroupIdeas(groupId: string): UseGroupIdeasResult {
  // ========== State ==========
  const [ideas, setIdeas] = useState<GroupIdea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // ========== Dependencies ==========
  const { toast } = useToast();
  const { voteOnGroupIdea } = useVotes();
  const { user } = useAuth();

  // ========== Fetch Logic ==========
  const fetchIdeas = useCallback(async (): Promise<void> => {
    // Validate input
    if (!groupId) {
      setError(new Error('Group ID is required'));
      setLoading(false);
      return;
    }

    try {
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
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(new Error(errorMessage));
      toast({
        title: 'Error',
        description: 'Failed to load group ideas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  // Load data on mount and when groupId changes
  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // ========== Create Logic ==========
  const createIdea = useCallback(
    async (data: Partial<GroupIdea>): Promise<GroupIdea | null> => {
      // Validate inputs
      if (!groupId) {
        toast({
          title: 'Error',
          description: 'Group ID is required',
          variant: 'destructive',
        });
        return null;
      }
      
      if (!data.title?.trim()) {
        toast({
          title: 'Error',
          description: 'Title is required',
          variant: 'destructive',
        });
        return null;
      }

      try {
        // Ensure we have the creator ID if not provided
        const ideaData = {
          ...data,
          created_by: data.created_by || user?.id,
        };
        
        const result = await createGroupIdea(groupId, ideaData);
        
        if (result.success) {
          // Optimistically update the UI
          setIdeas((prev) => [result.data, ...prev]);
          
          toast({
            title: 'Success',
            description: 'Idea created successfully',
          });
          
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to create idea';
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return null;
      }
    },
    [groupId, toast, user?.id]
  );

  // ========== Voting Logic ==========
  const voteOnIdea = useCallback(
    async (ideaId: string, voteType: 'up' | 'down'): Promise<boolean> => {
      if (!ideaId) {
        toast({
          title: 'Error',
          description: 'Idea ID is required',
          variant: 'destructive',
        });
        return false;
      }

      try {
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

          // Refresh data after a delay to get the updated vote counts
          setTimeout(fetchIdeas, 1000);
          
          return true;
        } else {
          throw new Error('Failed to vote on idea');
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to vote on idea';
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return false;
      }
    },
    [groupId, voteOnGroupIdea, fetchIdeas, toast]
  );

  // ========== Delete Logic ==========
  const deleteIdea = useCallback(
    async (ideaId: string): Promise<boolean> => {
      if (!ideaId) {
        toast({
          title: 'Error',
          description: 'Idea ID is required',
          variant: 'destructive',
        });
        return false;
      }

      try {
        const response = await fetch(
          API_ROUTES.GROUP_PLAN_IDEAS.DELETE(groupId, ideaId),
          { method: 'DELETE' }
        );

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
      } catch (err) {
        console.error('Error deleting idea:', err);
        
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to delete idea';
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return false;
      }
    },
    [groupId, toast]
  );

  // ========== Update Logic ==========
  const updateIdea = useCallback(
    async (ideaId: string, data: Partial<GroupIdea>): Promise<GroupIdea | null> => {
      if (!ideaId) {
        toast({
          title: 'Error',
          description: 'Idea ID is required',
          variant: 'destructive',
        });
        return null;
      }

      try {
        const response = await fetch(
          API_ROUTES.GROUP_PLAN_IDEAS.UPDATE(groupId, ideaId),
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update idea');
        }

        const result = await response.json() as ApiResponse<GroupIdea>;

        if (!result.success) {
          throw new Error(result.error);
        }

        // Update the ideas list with the updated idea
        setIdeas((prev) => 
          prev.map((idea) => (idea.id === ideaId ? result.idea : idea))
        );

        toast({
          title: 'Success',
          description: 'Idea updated successfully',
        });

        return result.idea;
      } catch (err) {
        console.error('Error updating idea:', err);
        
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to update idea';
        
        toast({
          title: 'Error',
          description: errorMessage,
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
