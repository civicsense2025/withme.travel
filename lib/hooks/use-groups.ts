/**
 * Groups hooks
 *
 * React hooks for group-related functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
  Group,
  CreateGroupData,
  UpdateGroupData,
} from '@/lib/client/groups';
import { isSuccess } from '@/lib/client/result';

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for managing groups data and operations
 */
export function useGroups(guestToken?: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Fetches a single group with all its related details
   * 
   * @param groupId - ID of the group to fetch
   * @returns Promise with the group and its related data
   */
  const fetchGroupWithDetails = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the basic group data
      const result = await getGroup(groupId, guestToken);
      
      if (!isSuccess(result)) {
        throw new Error(result.error || 'Failed to fetch group');
      }
      
      // Also fetch related data like membership, plans, trips, etc.
      // You might need to implement these in your groups client module
      
      // For now, just return the base group data
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Error fetching group details:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [guestToken]);

  /**
   * Fetches all groups for the current user
   */
  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await listGroups();

      if (!isSuccess(result)) {
        throw new Error(result.error || 'Failed to fetch groups');
      }

      setGroups(result.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  /**
   * Creates a new group
   */
  const handleCreateGroup = useCallback(
    async (data: CreateGroupData) => {
      try {
        setIsLoading(true);
        const result = await createGroup(data);

        if (!isSuccess(result)) {
          throw new Error(result.error || 'Failed to create group');
        }

        await fetchGroups();
        return { success: true, data: result.data };
      } catch (error) {
        console.error('Error creating group:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({
          title: 'Error creating group',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchGroups, toast]
  );

  /**
   * Updates an existing group
   */
  const handleUpdateGroup = useCallback(
    async (groupId: string, data: UpdateGroupData) => {
      try {
        setIsLoading(true);
        const result = await updateGroup(groupId, data);

        if (!isSuccess(result)) {
          throw new Error(result.error || 'Failed to update group');
        }

        await fetchGroups();
        return { success: true, data: result.data };
      } catch (error) {
        console.error('Error updating group:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({
          title: 'Error updating group',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchGroups, toast]
  );

  /**
   * Deletes a group
   */
  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      try {
        setIsLoading(true);
        const result = await deleteGroup(groupId);

        if (!isSuccess(result)) {
          throw new Error(result.error || 'Failed to delete group');
        }

        await fetchGroups();
        return { success: true };
      } catch (error) {
        console.error('Error deleting group:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({
          title: 'Error deleting group',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchGroups, toast]
  );

  return {
    groups,
    isLoading,
    error,
    fetchGroups,
    createGroup: handleCreateGroup,
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
    fetchGroupWithDetails
  };
}
