'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  listGroupPlans,
  createGroupPlan,
  updateGroupPlan,
  deleteGroupPlan,
  GroupPlan,
} from '@/lib/client/groupPlans';
import { useToast } from '@/lib/hooks/use-toast';

interface UseGroupPlansResult {
  plans: GroupPlan[];
  loading: boolean;
  error: Error | null;
  createPlan: (data: Partial<GroupPlan>) => Promise<GroupPlan | null>;
  updatePlan: (id: string, data: Partial<GroupPlan>) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useGroupPlans(groupId: string): UseGroupPlansResult {
  const [plans, setPlans] = useState<GroupPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch group plans
  const fetchPlans = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    const result = await listGroupPlans(groupId);
    if (result.success) {
      setPlans(result.data);
    } else {
      setError(new Error(result.error));
      toast({
        title: 'Error',
        description: 'Failed to load group plans',
        variant: 'destructive',
      });
    }
    setLoading(false);
  }, [groupId, toast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Create a new plan
  const createPlan = useCallback(
    async (data: Partial<GroupPlan>): Promise<GroupPlan | null> => {
      if (!groupId || !data.title) {
        toast({
          title: 'Error',
          description: 'Group ID and title are required',
          variant: 'destructive',
        });
        return null;
      }
      const result = await createGroupPlan(groupId, data);
      if (result.success) {
        setPlans((prev) => [result.data, ...prev]);
        toast({
          title: 'Success',
          description: 'Group plan created',
        });
        return result.data;
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        return null;
      }
    },
    [groupId, toast]
  );

  // Update a plan
  const updatePlan = useCallback(
    async (id: string, data: Partial<GroupPlan>): Promise<boolean> => {
      if (!groupId || !id) return false;
      const result = await updateGroupPlan(groupId, id, data);
      if (result.success) {
        setPlans((prev) => prev.map((plan) => (plan.id === id ? result.data : plan)));
        toast({
          title: 'Success',
          description: 'Group plan updated',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        return false;
      }
    },
    [groupId, toast]
  );

  // Delete a plan
  const deletePlan = useCallback(
    async (id: string): Promise<boolean> => {
      if (!groupId || !id) return false;
      const result = await deleteGroupPlan(groupId, id);
      if (result.success) {
        setPlans((prev) => prev.filter((plan) => plan.id !== id));
        toast({
          title: 'Success',
          description: 'Group plan deleted',
        });
        return true;
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        return false;
      }
    },
    [groupId, toast]
  );

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    refetch: fetchPlans,
  };
}
