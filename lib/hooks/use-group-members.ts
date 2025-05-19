/**
 * Group Members Hook
 * 
 * Provides functionality for working with group members
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

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

export interface UseGroupMembersResult {
  loading: boolean;
  error: string | null;
  members: GroupMember[];
  fetchMembers: (groupId: string) => Promise<void>;
  inviteMember: (groupId: string, email: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  removeMember: (groupId: string, memberId: string) => Promise<{ success: boolean; error?: string }>;
  updateMemberRole: (groupId: string, memberId: string, role: string) => Promise<{ success: boolean; error?: string }>;
}

export function useGroupMembers(): UseGroupMembersResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const { user } = useAuth();

  const fetchMembers = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/groups/${groupId}/members`);
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      setError('Failed to fetch members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteMember = useCallback(async (groupId: string, email: string, role = 'member'): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to invite member' };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error inviting member:', err);
      return { success: false, error: 'Failed to invite member' };
    }
  }, []);

  const removeMember = useCallback(async (groupId: string, memberId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to remove member' };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error removing member:', err);
      return { success: false, error: 'Failed to remove member' };
    }
  }, []);

  const updateMemberRole = useCallback(async (groupId: string, memberId: string, role: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to update member role' };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating member role:', err);
      return { success: false, error: 'Failed to update member role' };
    }
  }, []);

  return {
    loading,
    error,
    members,
    fetchMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
} 