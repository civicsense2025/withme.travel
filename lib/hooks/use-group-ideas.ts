/**
 * Group Ideas Hook
 * 
 * Provides functionality for working with group ideas
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { GroupIdea } from '@/types/group-ideas';

export interface UseGroupIdeasResult {
  loading: boolean;
  error: string | null;
  ideas: GroupIdea[];
  fetchIdeas: (groupId: string) => Promise<void>;
  addIdea: (groupId: string, data: Partial<GroupIdea>) => Promise<{ success: boolean; ideaId?: string; error?: string }>;
  updateIdea: (groupId: string, ideaId: string, data: Partial<GroupIdea>) => Promise<{ success: boolean; error?: string }>;
  deleteIdea: (groupId: string, ideaId: string) => Promise<{ success: boolean; error?: string }>;
  voteOnIdea: (groupId: string, ideaId: string, vote: 'up' | 'down') => Promise<{ success: boolean; error?: string }>;
}

export function useGroupIdeas(): UseGroupIdeasResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<GroupIdea[]>([]);
  const { user } = useAuth();

  const fetchIdeas = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/groups/${groupId}/ideas`);
      if (!res.ok) throw new Error('Failed to fetch ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch (err) {
      setError('Failed to fetch ideas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addIdea = useCallback(async (groupId: string, data: Partial<GroupIdea>): Promise<{ success: boolean; ideaId?: string; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to add idea' };
      }
      
      const responseData = await res.json();
      return { success: true, ideaId: responseData.idea?.id };
    } catch (err) {
      console.error('Error adding idea:', err);
      return { success: false, error: 'Failed to add idea' };
    }
  }, []);

  const updateIdea = useCallback(async (groupId: string, ideaId: string, data: Partial<GroupIdea>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to update idea' };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating idea:', err);
      return { success: false, error: 'Failed to update idea' };
    }
  }, []);

  const deleteIdea = useCallback(async (groupId: string, ideaId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/ideas/${ideaId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to delete idea' };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting idea:', err);
      return { success: false, error: 'Failed to delete idea' };
    }
  }, []);

  const voteOnIdea = useCallback(async (groupId: string, ideaId: string, vote: 'up' | 'down'): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/ideas/${ideaId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to vote on idea' };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error voting on idea:', err);
      return { success: false, error: 'Failed to vote on idea' };
    }
  }, []);

  return {
    loading,
    error,
    ideas,
    fetchIdeas,
    addIdea,
    updateIdea,
    deleteIdea,
    voteOnIdea,
  };
} 