/**
 * useGroupMembers Hook
 * 
 * A hook to fetch and manage group members.
 * 
 * @module hooks/use-group-members
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

/**
 * Group member interface
 */
interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  joined_at: string;
}

/**
 * Hook result type
 */
export interface UseGroupMembersResult {
  loading: boolean;
  error: string | null;
  members: GroupMember[];
  fetchMembers: (groupId: string) => Promise<void>;
  inviteMember: (groupId: string, email: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (groupId: string, memberId: string) => Promise<{ success: boolean; error?: string }>;
  updateMemberRole: (groupId: string, memberId: string, role: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook to manage group members
 */
export function useGroupMembers(): UseGroupMembersResult {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMembers = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/groups/members?groupId=${groupId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch group members: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMembers(data.members || []);
      return data.members;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch group members';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const inviteMember = useCallback(
    async (groupId: string, email: string, role: string = 'member') => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/groups/members/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ groupId, email, role }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to invite member');
        }
        
        toast({
          title: 'Invitation Sent',
          description: `Invitation sent to ${email}`,
        });
        
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to invite member';
        setError(errorMessage);
        toast({
          title: 'Invitation Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const removeMember = useCallback(
    async (groupId: string, memberId: string) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/groups/members?groupId=${groupId}&memberId=${memberId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to remove member');
        }
        
        // Update local state
        setMembers((prev) => prev.filter((member) => member.id !== memberId));
        
        toast({
          title: 'Member Removed',
          description: 'Member has been removed from the group',
        });
        
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const updateMemberRole = useCallback(
    async (groupId: string, memberId: string, role: string) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/groups/members', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ groupId, memberId, role }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update member role');
        }
        
        // Update local state
        setMembers((prev) =>
          prev.map((member) => (member.id === memberId ? { ...member, role } : member))
        );
        
        toast({
          title: 'Role Updated',
          description: 'Member role has been updated',
        });
        
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update member role';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  return {
    members,
    loading,
    error,
    fetchMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
} 