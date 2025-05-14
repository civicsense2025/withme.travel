'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { TABLES } from '@/utils/constants/database';
import { API_ROUTES } from '@/utils/constants/routes';
import { useToast } from '@/components/ui/use-toast';

// Define proper types for plans
interface GroupPlan {
  id: string;
  group_id: string;
  title: string;
  description?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Type for the hook's return value
interface UseGroupPlansResult {
  plans: GroupPlan[];
  loading: boolean;
  error: Error | null;
  createPlan: (title: string, description?: string) => Promise<GroupPlan | null>;
  updatePlan: (id: string, data: Partial<GroupPlan>) => Promise<boolean>;
  deletePlan: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useGroupPlans(groupId: string): UseGroupPlansResult {
  const [plans, setPlans] = useState<GroupPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // Fetch group plans
  const fetchPlans = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from(TABLES.GROUP_PLANS)
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (fetchError) throw new Error(fetchError.message);

      setPlans(
        (data || []).map((plan) => ({
          id: plan.id,
          group_id: plan.group_id || '',
          title: plan.name || '',
          description: plan.description || '',
          created_by: plan.created_by || '',
          created_at: plan.created_at || '',
          updated_at: plan.updated_at || '',
          is_active: plan.is_archived || false,
        }))
      );
    } catch (err) {
      console.error('Error fetching group plans:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: 'Error',
        description: 'Failed to load group plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, supabase, toast]);

  // Initial fetch
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Create a new plan
  const createPlan = async (title: string, description?: string): Promise<GroupPlan | null> => {
    if (!groupId || !title.trim()) {
      toast({
        title: 'Error',
        description: 'Group ID and title are required',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const response = await fetch(API_ROUTES.GROUP_PLANS.CREATE(groupId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create plan: ${response.status}`);
      }

      const data = await response.json();

      // Add new plan to state
      const newPlan = data.plan as GroupPlan;
      setPlans((prevPlans) => [newPlan, ...prevPlans]);

      return newPlan;
    } catch (err) {
      console.error('Error creating group plan:', err);
      toast({
        title: 'Error',
        description: 'Failed to create group plan',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update a plan
  const updatePlan = async (id: string, data: Partial<GroupPlan>): Promise<boolean> => {
    if (!groupId || !id) return false;

    try {
      const response = await fetch(API_ROUTES.GROUP_PLANS.UPDATE(groupId, id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update plan: ${response.status}`);
      }

      const responseData = await response.json();
      const updatedPlan = responseData.plan as GroupPlan;

      // Update plan in state
      setPlans((prevPlans) => prevPlans.map((plan) => (plan.id === id ? updatedPlan : plan)));

      return true;
    } catch (err) {
      console.error('Error updating group plan:', err);
      toast({
        title: 'Error',
        description: 'Failed to update group plan',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a plan
  const deletePlan = async (id: string): Promise<boolean> => {
    if (!groupId || !id) return false;

    try {
      const response = await fetch(API_ROUTES.GROUP_PLANS.DELETE(groupId, id), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete plan: ${response.status}`);
      }

      // Remove plan from state
      setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id));

      return true;
    } catch (err) {
      console.error('Error deleting group plan:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete group plan',
        variant: 'destructive',
      });
      return false;
    }
  };

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
