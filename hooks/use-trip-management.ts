/**
 * Trip Management Hook
 * 
 * React hook for managing trip members, access requests, and permissions
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getTripMembers,
  addTripMember,
  updateTripMember,
  removeTripMember,
  sendTripInvitation,
  getTripAccessRequests,
  respondToAccessRequest,
  transferTripOwnership,
  type TripMember,
  type TripRole,
  type TripAccessRequest,
  type TripInvitation
} from '@/lib/client/trip-management';
import { isSuccess } from '@/utils/result';

// ============================================================================
// TYPES
// ============================================================================

interface UseTripManagementOptions {
  /** Whether to fetch members data when hook mounts */
  fetchOnMount?: boolean;
  /** Whether to fetch access requests when hook mounts */
  fetchAccessRequestsOnMount?: boolean;
}

interface UseTripManagementReturn {
  /** Trip members list */
  members: TripMember[];
  /** Whether members are currently being loaded */
  isLoadingMembers: boolean;
  /** Error message related to members operations */
  membersError: string | null;
  /** Function to add a new trip member */
  addMember: (userId: string, role: TripRole) => Promise<boolean>;
  /** Function to update a trip member's role */
  updateMemberRole: (userId: string, role: TripRole) => Promise<boolean>;
  /** Function to remove a trip member */
  removeMember: (userId: string) => Promise<boolean>;
  /** Function to send a trip invitation */
  sendInvitation: (email: string, role: TripRole) => Promise<boolean>;
  /** Function to manually refresh members data */
  refreshMembers: () => Promise<void>;
  /** Access requests list */
  accessRequests: TripAccessRequest[];
  /** Whether access requests are currently being loaded */
  isLoadingAccessRequests: boolean;
  /** Error message related to access requests operations */
  accessRequestsError: string | null;
  /** Function to approve or reject an access request */
  respondToRequest: (requestId: string, approved: boolean, reason?: string) => Promise<boolean>;
  /** Function to manually refresh access requests data */
  refreshAccessRequests: () => Promise<void>;
  /** Function to transfer trip ownership */
  transferOwnership: (newOwnerId: string) => Promise<boolean>;
  /** Whether an operation is currently in progress */
  isOperationInProgress: boolean;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing trip members and permissions
 */
export function useTripManagement(
  tripId: string,
  options: UseTripManagementOptions = {}
): UseTripManagementReturn {
  const { 
    fetchOnMount = true,
    fetchAccessRequestsOnMount = true
  } = options;
  const { toast } = useToast();

  // State
  const [members, setMembers] = useState<TripMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  
  const [accessRequests, setAccessRequests] = useState<TripAccessRequest[]>([]);
  const [isLoadingAccessRequests, setIsLoadingAccessRequests] = useState<boolean>(true);
  const [accessRequestsError, setAccessRequestsError] = useState<string | null>(null);
  
  const [isOperationInProgress, setIsOperationInProgress] = useState<boolean>(false);

  /**
   * Fetch trip members
   */
  const fetchMembers = useCallback(async () => {
    if (!tripId) return;

    setIsLoadingMembers(true);
    setMembersError(null);

    const result = await getTripMembers(tripId);

    if (isSuccess(result)) {
      setMembers(result.data);
    } else {
      const errorMessage = result.error.toString();
      setMembersError(errorMessage);
      toast({
        title: 'Error loading members',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    setIsLoadingMembers(false);
  }, [tripId, toast]);

  /**
   * Fetch trip access requests
   */
  const fetchAccessRequests = useCallback(async () => {
    if (!tripId) return;

    setIsLoadingAccessRequests(true);
    setAccessRequestsError(null);

    const result = await getTripAccessRequests(tripId);

    if (isSuccess(result)) {
      setAccessRequests(result.data);
    } else {
      const errorMessage = result.error.toString();
      setAccessRequestsError(errorMessage);
      toast({
        title: 'Error loading access requests',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    setIsLoadingAccessRequests(false);
  }, [tripId, toast]);

  /**
   * Add a trip member
   */
  const addMember = useCallback(async (userId: string, role: TripRole): Promise<boolean> => {
    if (!tripId) return false;

    setIsOperationInProgress(true);
    setMembersError(null);

    const result = await addTripMember(tripId, userId, role);

    if (isSuccess(result)) {
      // Optimistically update the members list
      setMembers(prev => [...prev, result.data]);
      toast({
        title: 'Member added',
        description: 'User added successfully to the trip',
        variant: 'default',
      });
      setIsOperationInProgress(false);
      return true;
    } else {
      const errorMessage = result.error.toString();
      setMembersError(errorMessage);
      toast({
        title: 'Error adding member',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsOperationInProgress(false);
      return false;
    }
  }, [tripId, toast]);

  /**
   * Update a trip member's role
   */
  const updateMemberRole = useCallback(async (userId: string, role: TripRole): Promise<boolean> => {
    if (!tripId) return false;

    setIsOperationInProgress(true);
    setMembersError(null);

    const result = await updateTripMember(tripId, userId, role);

    if (isSuccess(result)) {
      // Optimistically update the members list
      setMembers(prev => 
        prev.map(member => 
          member.user_id === userId ? { ...member, role } : member
        )
      );
      toast({
        title: 'Role updated',
        description: 'Member role updated successfully',
        variant: 'default',
      });
      setIsOperationInProgress(false);
      return true;
    } else {
      const errorMessage = result.error.toString();
      setMembersError(errorMessage);
      toast({
        title: 'Error updating role',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsOperationInProgress(false);
      return false;
    }
  }, [tripId, toast]);

  /**
   * Remove a trip member
   */
  const removeMember = useCallback(async (userId: string): Promise<boolean> => {
    if (!tripId) return false;

    setIsOperationInProgress(true);
    setMembersError(null);

    const result = await removeTripMember(tripId, userId);

    if (isSuccess(result)) {
      // Optimistically update the members list
      setMembers(prev => prev.filter(member => member.user_id !== userId));
      toast({
        title: 'Member removed',
        description: 'User removed successfully from the trip',
        variant: 'default',
      });
      setIsOperationInProgress(false);
      return true;
    } else {
      const errorMessage = result.error.toString();
      setMembersError(errorMessage);
      toast({
        title: 'Error removing member',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsOperationInProgress(false);
      return false;
    }
  }, [tripId, toast]);

  /**
   * Send a trip invitation
   */
  const sendInvitation = useCallback(async (email: string, role: TripRole): Promise<boolean> => {
    if (!tripId) return false;

    setIsOperationInProgress(true);
    setMembersError(null);

    const result = await sendTripInvitation(tripId, email, role);

    if (isSuccess(result)) {
      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${email}`,
        variant: 'default',
      });
      setIsOperationInProgress(false);
      return true;
    } else {
      const errorMessage = result.error.toString();
      setMembersError(errorMessage);
      toast({
        title: 'Error sending invitation',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsOperationInProgress(false);
      return false;
    }
  }, [tripId, toast]);

  /**
   * Respond to an access request
   */
  const respondToRequest = useCallback(
    async (requestId: string, approved: boolean, reason?: string): Promise<boolean> => {
      if (!tripId) return false;

      setIsOperationInProgress(true);
      setAccessRequestsError(null);

      const result = await respondToAccessRequest(tripId, requestId, approved, reason);

      if (isSuccess(result)) {
        // Optimistically update the access requests list
        setAccessRequests(prev => 
          prev.map(request => 
            request.id === requestId 
              ? { ...request, status: approved ? 'approved' : 'rejected' } 
              : request
          )
        );
        toast({
          title: approved ? 'Request approved' : 'Request rejected',
          description: approved ? 'Access request approved' : 'Access request rejected',
          variant: 'default',
        });
        
        // If approved, we should also fetch the updated members list
        if (approved) {
          fetchMembers();
        }
        
        setIsOperationInProgress(false);
        return true;
      } else {
        const errorMessage = result.error.toString();
        setAccessRequestsError(errorMessage);
        toast({
          title: 'Error responding to request',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsOperationInProgress(false);
        return false;
      }
    }, 
    [tripId, toast, fetchMembers]
  );

  /**
   * Transfer trip ownership
   */
  const transferOwnership = useCallback(
    async (newOwnerId: string): Promise<boolean> => {
      if (!tripId) return false;

      setIsOperationInProgress(true);
      setMembersError(null);

      const result = await transferTripOwnership(tripId, newOwnerId);

      if (isSuccess(result)) {
        toast({
          title: 'Ownership transferred',
          description: 'Trip ownership successfully transferred',
          variant: 'default',
        });
        
        // Refresh the members list to reflect new ownership
        fetchMembers();
        
        setIsOperationInProgress(false);
        return true;
      } else {
        const errorMessage = result.error.toString();
        setMembersError(errorMessage);
        toast({
          title: 'Error transferring ownership',
          description: errorMessage,
          variant: 'destructive',
        });
        setIsOperationInProgress(false);
        return false;
      }
    }, 
    [tripId, toast, fetchMembers]
  );

  // Load data on mount if requested
  useEffect(() => {
    if (fetchOnMount) {
      fetchMembers();
    }
    if (fetchAccessRequestsOnMount) {
      fetchAccessRequests();
    }
  }, [fetchOnMount, fetchAccessRequestsOnMount, fetchMembers, fetchAccessRequests]);

  return {
    members,
    isLoadingMembers,
    membersError,
    addMember,
    updateMemberRole,
    removeMember,
    sendInvitation,
    refreshMembers: fetchMembers,
    accessRequests,
    isLoadingAccessRequests,
    accessRequestsError,
    respondToRequest,
    refreshAccessRequests: fetchAccessRequests,
    transferOwnership,
    isOperationInProgress,
  };
}

// ============================================================================
// ADAPTER UTILITY
// ============================================================================

/**
 * Adapter to convert TripMember (API) to TripMemberFromSSR (UI/SSR)
 */
export interface MemberProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export interface TripMemberFromSSR {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: MemberProfile | null;
}

export function adaptTripMemberToSSR(member: TripMember): TripMemberFromSSR {
  // Map TripRole to GroupMemberRole: 'admin' and 'editor' => 'admin', others => 'member'
  let groupRole: 'admin' | 'member' = 'member';
  if (member.role === 'admin' || member.role === 'editor') {
    groupRole = 'admin';
  }
  return {
    id: member.id,
    trip_id: member.trip_id,
    user_id: member.user_id,
    role: groupRole,
    joined_at: member.created_at,
    profiles: member.user
      ? {
          id: member.user.id,
          name: member.user.full_name ?? member.user.username ?? null,
          avatar_url: member.user.avatar_url ?? null,
        }
      : null,
  };
}

export function adaptTripMembersToSSR(members: TripMember[]): TripMemberFromSSR[] {
  return members.map(adaptTripMemberToSSR);
} 