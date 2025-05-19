/**
 * Trip members hook
 *
 * Hook for managing trip members with state, loading, and error handling
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  TripMember,
  AddTripMemberData,
  UpdateTripMemberData,
  listTripMembers,
  getTripMember,
  addTripMember,
  updateTripMember,
  removeTripMember,
  importTripMembers,
  checkTripMemberAccess,
} from '@/lib/client/tripMembers';
import { useToast } from '@/lib/hooks/use-toast';

// ============================================================================
// TYPES
// ============================================================================

interface UseTripMembersOptions {
  tripId: string;
  initialMembers?: TripMember[];
  autoFetch?: boolean;
}

interface UseTripMembersReturn {
  members: TripMember[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getMember: (userId: string) => Promise<TripMember | null>;
  addMember: (data: AddTripMemberData) => Promise<TripMember | null>;
  updateMember: (userId: string, data: UpdateTripMemberData) => Promise<TripMember | null>;
  removeMember: (userId: string) => Promise<boolean>;
  importMembers: (
    members: AddTripMemberData[]
  ) => Promise<{ added: number; invited: number } | null>;
  checkAccess: (
    userId: string,
    email?: string
  ) => Promise<{ isMember: boolean; isInvited: boolean } | null>;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Hook for managing trip members
 */
export function useTripMembers({
  tripId,
  initialMembers = [],
  autoFetch = true,
}: UseTripMembersOptions): UseTripMembersReturn {
  const [members, setMembers] = useState<TripMember[]>(initialMembers);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch trip members
  const fetchMembers = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    const result = await listTripMembers(tripId);

    if (result.success) {
      setMembers(result.data);
    } else {
      setError(new Error(result.error));
      toast({
        title: 'Error',
        description: `Failed to load trip members: ${result.error}`,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  }, [tripId, toast]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch && tripId) {
      fetchMembers();
    }
  }, [autoFetch, tripId, fetchMembers]);

  // Get a specific member
  const getMember = useCallback(
    async (userId: string): Promise<TripMember | null> => {
      if (!tripId) return null;

      const result = await getTripMember(tripId, userId);

      if (result.success) {
        return result.data;
      } else {
        toast({
          title: 'Error',
          description: `Failed to get member: ${result.error}`,
          variant: 'destructive',
        });
        return null;
      }
    },
    [tripId, toast]
  );

  // Add a new member
  const addMember = useCallback(
    async (data: AddTripMemberData): Promise<TripMember | null> => {
      if (!tripId) return null;

      setIsLoading(true);

      const result = await addTripMember(tripId, data);

      if (result.success) {
        setMembers((prevMembers) => [...prevMembers, result.data]);
        toast({
          title: 'Success',
          description: 'Member added successfully',
        });
        setIsLoading(false);
        return result.data;
      } else {
        setError(new Error(result.error));
        toast({
          title: 'Error',
          description: `Failed to add member: ${result.error}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
    },
    [tripId, toast]
  );

  // Update a member
  const updateMember = useCallback(
    async (userId: string, data: UpdateTripMemberData): Promise<TripMember | null> => {
      if (!tripId) return null;

      setIsLoading(true);

      const result = await updateTripMember(tripId, userId, data);

      if (result.success) {
        setMembers((prevMembers) =>
          prevMembers.map((member) => (member.user_id === userId ? result.data : member))
        );
        toast({
          title: 'Success',
          description: 'Member updated successfully',
        });
        setIsLoading(false);
        return result.data;
      } else {
        setError(new Error(result.error));
        toast({
          title: 'Error',
          description: `Failed to update member: ${result.error}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
    },
    [tripId, toast]
  );

  // Remove a member
  const removeMember = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!tripId) return false;

      setIsLoading(true);

      const result = await removeTripMember(tripId, userId);

      if (result.success) {
        setMembers((prevMembers) => prevMembers.filter((member) => member.user_id !== userId));
        toast({
          title: 'Success',
          description: 'Member removed successfully',
        });
        setIsLoading(false);
        return true;
      } else {
        setError(new Error(result.error));
        toast({
          title: 'Error',
          description: `Failed to remove member: ${result.error}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }
    },
    [tripId, toast]
  );

  // Import multiple members
  const importMembers = useCallback(
    async (members: AddTripMemberData[]): Promise<{ added: number; invited: number } | null> => {
      if (!tripId) return null;

      setIsLoading(true);

      const result = await importTripMembers(tripId, members);

      if (result.success) {
        // Refetch members to get the updated list
        await fetchMembers();
        toast({
          title: 'Success',
          description: `Added ${result.data.added} members and invited ${result.data.invited} users`,
        });
        setIsLoading(false);
        return result.data;
      } else {
        setError(new Error(result.error));
        toast({
          title: 'Error',
          description: `Failed to import members: ${result.error}`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return null;
      }
    },
    [tripId, fetchMembers, toast]
  );

  // Check member access
  const checkAccess = useCallback(
    async (
      userId: string,
      email?: string
    ): Promise<{ isMember: boolean; isInvited: boolean } | null> => {
      if (!tripId) return null;

      const result = await checkTripMemberAccess(tripId, userId, email);

      if (result.success) {
        return result.data;
      } else {
        toast({
          title: 'Error',
          description: `Failed to check access: ${result.error}`,
          variant: 'destructive',
        });
        return null;
      }
    },
    [tripId, toast]
  );

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
    getMember,
    addMember,
    updateMember,
    removeMember,
    importMembers,
    checkAccess,
  };
}
