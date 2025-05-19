/**
 * Group Plans Hook
 * 
 * Provides functionality for working with group plans
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface GroupPlan {
  id: string;
  group_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  created_at: string;
  created_by: string;
}

export interface UseGroupPlansResult {
  loading: boolean;
  error: string | null;
  plans: GroupPlan[];
  fetchPlans: (groupId: string) => Promise<void>;
  createPlan: (groupId: string, data: Partial<GroupPlan>) => Promise<{ success: boolean; planId?: string; error?: string }>;
  updatePlan: (groupId: string, planId: string, data: Partial<GroupPlan>) => Promise<{ success: boolean; error?: string }>;
  deletePlan: (groupId: string, planId: string) => Promise<{ success: boolean; error?: string }>;
  convertPlanToTrip: (groupId: string, planId: string) => Promise<{ success: boolean; tripId?: string; error?: string }>;
}

export function useGroupPlans(): UseGroupPlansResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<GroupPlan[]>([]);
  const { user } = useAuth();

  const fetchPlans = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/groups/${groupId}/plans`);
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (err) {
      setError('Failed to fetch plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (groupId: string, data: Partial<GroupPlan>): Promise<{ success: boolean; planId?: string; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to create plan' };
      }
      
      const responseData = await res.json();
      return { success: true, planId: responseData.plan?.id };
    } catch (err) {
      console.error('Error creating plan:', err);
      return { success: false, error: 'Failed to create plan' };
    }
  }, []);

  const updatePlan = useCallback(async (groupId: string, planId: string, data: Partial<GroupPlan>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to update plan' };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error updating plan:', err);
      return { success: false, error: 'Failed to update plan' };
    }
  }, []);

  const deletePlan = useCallback(async (groupId: string, planId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/plans/${planId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to delete plan' };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting plan:', err);
      return { success: false, error: 'Failed to delete plan' };
    }
  }, []);

  const convertPlanToTrip = useCallback(async (groupId: string, planId: string): Promise<{ success: boolean; tripId?: string; error?: string }> => {
    try {
      const res = await fetch(`/api/groups/${groupId}/plans/${planId}/convert-to-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Failed to convert plan to trip' };
      }
      
      const responseData = await res.json();
      return { success: true, tripId: responseData.tripId };
    } catch (err) {
      console.error('Error converting plan to trip:', err);
      return { success: false, error: 'Failed to convert plan to trip' };
    }
  }, []);

  return {
    loading,
    error,
    plans,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    convertPlanToTrip,
  };
} 