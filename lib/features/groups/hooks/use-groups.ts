/**
 * Re-export the groups hook from the main hook location
 * This maintains the feature-first organization while preserving
 * compatibility with existing code
 */
export * from '../../../hooks/use-groups'; 

/**
 * Groups Hook
 * 
 * A hook for accessing and managing groups data
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/hooks/use-toast';
import * as groupsClient from '@/lib/client/groups';
import * as groupMembersClient from '@/lib/client/groups'; // TODO: Create dedicated client
import { isSuccess } from '@/lib/client/result';

// ============================================================================
// TYPES
// ============================================================================

export interface GroupWithDetails extends groupsClient.Group {
  members?: groupsClient.GroupMember[];
  memberCount?: number;
}

export interface UseGroupDetailsOptions {
  initialGroupId?: string;
}

export interface UseGroupDetailsResult {
  group: GroupWithDetails | null;
  isLoading: boolean;
  error: Error | null;
  fetchGroup: (groupId: string) => Promise<void>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for fetching and managing a single group with its detailed information
 */
export function useGroupDetails({ initialGroupId }: UseGroupDetailsOptions = {}): UseGroupDetailsResult {
  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchGroup = useCallback(async (groupId: string) => {
    if (!groupId) return;

    setIsLoading(true);
    setError(null);

    try {
      const groupResult = await groupsClient.getGroup(groupId);
      
      if (!isSuccess(groupResult)) {
        throw new Error(groupResult.error?.message || 'Failed to fetch group');
      }

      // Fetch additional details like members
      const membersResult = await groupsClient.getGroupMembers(groupId);
      
      let members: groupsClient.GroupMember[] = [];
      if (isSuccess(membersResult)) {
        members = membersResult.data;
      }

      const groupWithDetails: GroupWithDetails = {
        ...groupResult.data,
        members,
        memberCount: members.length
      };

      setGroup(groupWithDetails);
    } catch (err) {
      console.error('Error fetching group details:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch group details'));
      toast({
        title: 'Error',
        description: 'Failed to load group details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch group on initial load if ID is provided
  useEffect(() => {
    if (initialGroupId) {
      fetchGroup(initialGroupId);
    }
  }, [initialGroupId, fetchGroup]);

  return {
    group,
    isLoading,
    error,
    fetchGroup
  };
}

/**
 * Hook for listing and managing multiple groups
 */
export function useGroups() {
  const [groups, setGroups] = useState<groupsClient.Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await groupsClient.listGroups();
      
      if (!isSuccess(result)) {
        throw new Error(result.error?.message || 'Failed to fetch groups');
      }

      setGroups(result.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch groups'));
      toast({
        title: 'Error',
        description: 'Failed to load groups. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createGroup = useCallback(async (data: groupsClient.CreateGroupData) => {
    try {
      const result = await groupsClient.createGroup(data);
      
      if (!isSuccess(result)) {
        throw new Error(result.error?.message || 'Failed to create group');
      }

      // Refresh groups list
      fetchGroups();
      
      return { success: true, data: result.data };
    } catch (err) {
      console.error('Error creating group:', err);
      toast({
        title: 'Error',
        description: 'Failed to create group. Please try again.',
        variant: 'destructive',
      });
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create group' };
    }
  }, [fetchGroups, toast]);

  const updateGroup = useCallback(async (id: string, data: groupsClient.UpdateGroupData) => {
    try {
      const result = await groupsClient.updateGroup(id, data);
      
      if (!isSuccess(result)) {
        throw new Error(result.error?.message || 'Failed to update group');
      }

      // Update group in the list
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === id ? { ...group, ...data } : group
        )
      );
      
      return { success: true, data: result.data };
    } catch (err) {
      console.error('Error updating group:', err);
      toast({
        title: 'Error',
        description: 'Failed to update group. Please try again.',
        variant: 'destructive',
      });
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update group' };
    }
  }, [toast]);

  const deleteGroup = useCallback(async (id: string) => {
    try {
      const result = await groupsClient.deleteGroup(id);
      
      if (!isSuccess(result)) {
        throw new Error(result.error?.message || 'Failed to delete group');
      }

      // Remove group from the list
      setGroups(prevGroups => prevGroups.filter(group => group.id !== id));
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting group:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete group. Please try again.',
        variant: 'destructive',
      });
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete group' };
    }
  }, [toast]);

  // Load groups on initial mount
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    isLoading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup
  };
} 