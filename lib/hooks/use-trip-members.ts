/**
 * useTripMembers Hook
 *
 * Custom React hook for managing trip members with full CRUD capabilities,
 * invitation handling, and loading states.
 *
 * @module hooks/use-trip-members
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listTripMembers,
  getTripMember,
  addTripMember,
  updateTripMember,
  removeTripMember,
  importTripMembers,
  checkTripMemberAccess,
  type TripMember,
  type AddTripMemberData,
  type UpdateTripMemberData,
} from '@/lib/client/tripMembers';
import type { Result } from '@/lib/client/tripMembers';
import { useToast } from '@/hooks/use-toast';

/**
 * useTripMembers hook for managing trip members
 * @param tripId - The trip ID
 * @param fetchOnMount - Whether to fetch members on mount
 * @returns Object with members, loading states, error handling, and member management operations
 */
export function useTripMembers(tripId: string, fetchOnMount = true) {
  // State
  const [tripMembers, setTripMembers] = useState<TripMember[]>([]);
  const [currentMember, setCurrentMember] = useState<TripMember | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { toast } = useToast();

  // Fetch all members for the trip
  const fetchMembers = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    const result = await listTripMembers(tripId);

    if (result.success) {
      setTripMembers(result.data);
    } else {
      setError(String(result.error));
      toast({
        title: 'Failed to load members',
        description: String(result.error),
        variant: 'destructive',
      });
    }

    setIsLoading(false);
    return result;
  }, [tripId, toast]);

  // Fetch a single member by user ID
  const fetchMember = useCallback(
    async (userId: string) => {
      if (!tripId || !userId) return;

      setIsLoading(true);
      setError(null);

      const result = await getTripMember(tripId, userId);

      if (result.success) {
        setCurrentMember(result.data);
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to load member',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Add a new member to the trip
  const inviteMember = useCallback(
    async (data: AddTripMemberData) => {
      if (!tripId) return;

      setIsAdding(true);
      setError(null);

      const result = await addTripMember(tripId, data);

      if (result.success) {
        setTripMembers((prev) => [...prev, result.data]);
        toast({
          title: 'Member invited',
          description: `${data.email} has been invited to the trip.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to invite member',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsAdding(false);
      return result;
    },
    [tripId, toast]
  );

  // Update an existing member
  const updateMember = useCallback(
    async (userId: string, data: UpdateTripMemberData) => {
      if (!tripId || !userId) return;

      setIsUpdating(true);
      setError(null);

      const result = await updateTripMember(tripId, userId, data);

      if (result.success) {
        // Update in members list
        setTripMembers((prev) =>
          prev.map((member) => (member.user_id === userId ? result.data : member))
        );

        // Update current member if it's the one being edited
        if (currentMember?.user_id === userId) {
          setCurrentMember(result.data);
        }

        toast({
          title: 'Member updated',
          description: `Member ${data.role ? 'role' : 'details'} has been updated.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to update member',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsUpdating(false);
      return result;
    },
    [tripId, currentMember, toast]
  );

  // Remove a member from the trip
  const removeMember = useCallback(
    async (userId: string) => {
      if (!tripId || !userId) return;

      setIsRemoving(true);
      setError(null);

      const result = await removeTripMember(tripId, userId);

      if (result.success) {
        // Remove from members list
        setTripMembers((prev) => prev.filter((member) => member.user_id !== userId));

        // Clear current member if it's the one being removed
        if (currentMember?.user_id === userId) {
          setCurrentMember(null);
        }

        toast({
          title: 'Member removed',
          description: 'The member has been removed from the trip.',
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to remove member',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsRemoving(false);
      return result;
    },
    [tripId, currentMember, toast]
  );

  // Import multiple members at once
  const importMembers = useCallback(
    async (members: AddTripMemberData[]) => {
      if (!tripId || !members.length) return;

      setIsImporting(true);
      setError(null);

      const result = await importTripMembers(tripId, members);

      if (result.success) {
        // Refresh the member list after import
        fetchMembers();

        toast({
          title: 'Members imported',
          description: `${result.data.added} members added, ${result.data.invited} invitations sent.`,
        });
      } else {
        setError(String(result.error));
        toast({
          title: 'Failed to import members',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsImporting(false);
      return result;
    },
    [tripId, fetchMembers, toast]
  );

  // Check if a user has access to the trip
  const checkMemberAccess = useCallback(
    async (userId: string, email?: string) => {
      if (!tripId || (!userId && !email)) return;

      setIsLoading(true);
      setError(null);

      const result = await checkTripMemberAccess(tripId, userId, email);

      if (!result.success) {
        setError(String(result.error));
        toast({
          title: 'Failed to check access',
          description: String(result.error),
          variant: 'destructive',
        });
      }

      setIsLoading(false);
      return result;
    },
    [tripId, toast]
  );

  // Fetch members on mount if enabled
  useEffect(() => {
    if (fetchOnMount && tripId) {
      fetchMembers();
    }
  }, [fetchOnMount, tripId, fetchMembers]);

  return {
    // Data
    tripMembers,
    currentMember,
    error,

    // Loading states
    isLoading,
    isAdding,
    isUpdating,
    isRemoving,
    isImporting,

    // Actions
    fetchMembers,
    fetchMember,
    inviteMember,
    updateMember,
    removeMember,
    importMembers,
    checkMemberAccess,
  };
}
