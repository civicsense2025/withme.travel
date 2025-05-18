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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await listGroups(guestToken);

    if (isSuccess(result)) {
      setGroups(result.data.groups);
    } else {
      setError(result.error);
      toast({
        title: 'Error loading groups',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }, [guestToken, toast]);

  // Create group
  const handleCreateGroup = useCallback(
    async (data: CreateGroupData) => {
      try {
        setIsLoading(true);
        const result = await createGroup(data);

        if (isSuccess(result)) {
          setGroups((prevGroups) => [...prevGroups, result.data]);
          toast({
            title: 'Group created',
            description: 'Your group has been created successfully.',
          });
          return { success: true, groupId: result.data.id };
        } else {
          toast({
            title: 'Error creating group',
            description: result.error,
            variant: 'destructive',
          });
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
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
    [toast]
  );

  // Update group
  const handleUpdateGroup = useCallback(
    async (groupId: string, data: UpdateGroupData) => {
      try {
        setIsLoading(true);
        const result = await updateGroup(groupId, data);

        if (isSuccess(result)) {
          setGroups((prevGroups) =>
            prevGroups.map((group) => (group.id === groupId ? result.data : group))
          );
          toast({
            title: 'Group updated',
            description: 'Your group has been updated successfully.',
          });
          return { success: true };
        } else {
          toast({
            title: 'Error updating group',
            description: result.error,
            variant: 'destructive',
          });
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
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
    [toast]
  );

  // Delete group
  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      try {
        setIsLoading(true);
        const result = await deleteGroup(groupId);

        if (isSuccess(result)) {
          setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
          toast({
            title: 'Group deleted',
            description: 'The group has been deleted successfully.',
          });
          return { success: true };
        } else {
          toast({
            title: 'Error deleting group',
            description: result.error,
            variant: 'destructive',
          });
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
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
    [toast]
  );

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    isLoading,
    error,
    refresh: fetchGroups,
    createGroup: handleCreateGroup,
    updateGroup: handleUpdateGroup,
    deleteGroup: handleDeleteGroup,
  };
}
