/**
 * useGroups Hook
 *
 * Manages groups state, CRUD operations, and group-related functionality.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast, type ToastOptions } from '@/components/ui/use-toast';
import {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  type Group,
  type CreateGroupData,
  type UpdateGroupData,
} from '@/lib/client/groups';
import type { Result } from '@/lib/client/result';

/**
 * Hook return type for useGroups
 */
export interface UseGroupsResult {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addGroup: (data: CreateGroupData) => Promise<Result<Group>>;
  updateGroupDetails: (groupId: string, data: UpdateGroupData) => Promise<Result<Group>>;
  removeGroup: (groupId: string) => Promise<Result<void>>;
  getGroupById: (groupId: string) => Promise<Result<Group>>;
  selectedGroup: Group | null;
  selectGroup: (group: Group | null) => void;
}

/**
 * useGroups - React hook for managing groups
 */
export function useGroups(
  /** Whether to fetch groups on component mount */
  fetchOnMount = true
): UseGroupsResult {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Fetch all groups
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await listGroups();
      
      if (result.success) {
        setGroups(result.data.groups || []);
      } else {
        setError(result.error);
        toast({
          title: 'Failed to load groups',
          description: result.error,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading groups';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Add a new group
  const addGroup = useCallback(async (data: CreateGroupData): Promise<Result<Group>> => {
    setIsLoading(true);
    
    try {
      const result = await createGroup(data);
      
      if (result.success) {
        setGroups((prev) => [result.data, ...prev]);
        toast({
          title: 'Group created successfully',
        });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to create group',
          description: result.error,
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating group';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update a group
  const updateGroupDetails = useCallback(
    async (groupId: string, data: UpdateGroupData): Promise<Result<Group>> => {
      setIsLoading(true);
      
      try {
        const result = await updateGroup(groupId, data);
        
        if (result.success) {
          setGroups((prev) => 
            prev.map((group) => (group.id === groupId ? result.data : group))
          );
          
          // Update selected group if it's the one being edited
          if (selectedGroup && selectedGroup.id === groupId) {
            setSelectedGroup(result.data);
          }
          
          toast({
            title: 'Group updated successfully',
          });
        } else {
          setError(result.error);
          toast({
            title: 'Failed to update group',
            description: result.error,
          });
        }
        
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error updating group';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
        });
        
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [selectedGroup, toast]
  );

  // Delete a group
  const removeGroup = useCallback(async (groupId: string): Promise<Result<void>> => {
    setIsLoading(true);
    
    try {
      const result = await deleteGroup(groupId);
      
      if (result.success) {
        setGroups((prev) => prev.filter((group) => group.id !== groupId));
        
        // Clear selected group if it's the one being deleted
        if (selectedGroup && selectedGroup.id === groupId) {
          setSelectedGroup(null);
        }
        
        toast({
          title: 'Group deleted successfully',
        });
      } else {
        setError(result.error);
        toast({
          title: 'Failed to delete group',
          description: result.error,
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting group';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [selectedGroup, toast]);

  // Get a group by ID
  const getGroupById = useCallback(async (groupId: string): Promise<Result<Group>> => {
    setIsLoading(true);
    
    try {
      const result = await getGroup(groupId);
      
      if (!result.success) {
        setError(result.error);
        toast({
          title: 'Failed to get group',
          description: result.error,
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error getting group';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Select a group
  const selectGroup = useCallback((group: Group | null) => {
    setSelectedGroup(group);
  }, []);

  // Initial load
  useEffect(() => {
    if (fetchOnMount) {
      refresh();
    }
  }, [fetchOnMount, refresh]);

  return {
    groups,
    isLoading,
    error,
    refresh,
    addGroup,
    updateGroupDetails,
    removeGroup,
    getGroupById,
    selectedGroup,
    selectGroup,
  };
} 