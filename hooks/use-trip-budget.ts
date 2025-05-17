/**
 * Trip Budget Hook
 * 
 * Centralizes budget-related functionality for trips to be used across
 * budget tab, budget snapshot, and budget side sheet components.
 */
import { useState, useEffect, useMemo } from 'react';
import { API_ROUTES } from '@/utils/constants/routes';
import { useAuth } from '@/lib/hooks/use-auth';
import { TripMemberFromSSR } from '@/components/members-tab';

// Define expense types
export interface ManualDbExpense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  paid_by: string; // User ID
  date: string; // ISO string
  created_at: string;
  updated_at?: string | null;
  source?: string | null;
}

export interface UnifiedExpense {
  id: string | number;
  title: string | null;
  amount: number | null;
  currency: string | null;
  category: string | null;
  date: string | null;
  paidBy?: string | null;
  source: 'manual' | 'planned';
}

interface UseTripBudgetProps {
  tripId: string;
  initialManualExpenses?: ManualDbExpense[];
  initialPlannedExpenses?: UnifiedExpense[];
  initialMembers?: TripMemberFromSSR[];
  initialBudget?: number | null;
}

interface UseTripBudgetResult {
  budget: number;
  setBudget: (budget: number) => void;
  manualExpenses: ManualDbExpense[];
  plannedExpenses: UnifiedExpense[];
  members: TripMemberFromSSR[];
  totalManualSpent: number;
  totalPlanned: number;
  percentSpent: number;
  loading: boolean;
  error: Error | null;
  addExpense: (expense: Omit<ManualDbExpense, 'id' | 'trip_id' | 'created_at'>) => Promise<void>;
  refreshExpenses: () => Promise<void>;
  updateBudget: (newBudget: number) => Promise<void>;
  memberExpenseSummary: Array<{
    id: string;
    name: string;
    avatar: string | null;
    paid: number;
    share: number;
    balance: number;
  }>;
}

export function useTripBudget({
  tripId,
  initialManualExpenses = [],
  initialPlannedExpenses = [],
  initialMembers = [],
  initialBudget = 0,
}: UseTripBudgetProps): UseTripBudgetResult {
  const { user } = useAuth();
  const [manualExpenses, setManualExpenses] = useState<ManualDbExpense[]>(initialManualExpenses);
  const [plannedExpenses, setPlannedExpenses] = useState<UnifiedExpense[]>(initialPlannedExpenses);
  const [members, setMembers] = useState<TripMemberFromSSR[]>(initialMembers);
  const [budget, setBudget] = useState<number>(initialBudget || 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Calculate totals
  const totalManualSpent = useMemo(
    () => manualExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
    [manualExpenses]
  );

  const totalPlanned = useMemo(
    () => plannedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    [plannedExpenses]
  );
  
  const percentSpent = useMemo(() => {
    if (budget <= 0) return 0;
    return Math.min(100, Math.round((totalManualSpent / budget) * 100));
  }, [totalManualSpent, budget]);

  // Calculate member expense summary
  const memberExpenseSummary = useMemo(() => {
    const memberCount = members.length > 0 ? members.length : 1;
    
    return members
      .map((member) => {
        // Calculate what this member paid
        const paid = manualExpenses
          .filter((exp) => exp.paid_by === member.user_id)
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        // Calculate this member's share of all expenses
        const share = manualExpenses.reduce(
          (sum, exp) => sum + Number(exp.amount) / memberCount,
          0
        );

        // Calculate balance (positive means others owe this member)
        const balance = paid - share;

        return {
          id: member.user_id,
          name: member.profiles?.name || 'Unknown',
          avatar: member.profiles?.avatar_url || null,
          paid,
          share,
          balance,
        };
      })
      .sort((a, b) => b.paid - a.paid);
  }, [manualExpenses, members]);

  // Fetch expenses if not provided initially
  useEffect(() => {
    if (initialManualExpenses.length === 0) {
      refreshExpenses();
    }
  }, [tripId]);

  // Function to refresh expense data
  const refreshExpenses = async () => {
    if (!tripId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch manual expenses
      try {
        const expensesResponse = await fetch(`/api/trips/${tripId}/expenses`);
        if (!expensesResponse.ok) {
          const errorText = await expensesResponse.text();
          console.error('Failed to fetch expenses:', errorText);
          
          // If it's a rate limit issue, don't show an error to the user - use the last data
          if (expensesResponse.status === 429) {
            // Use existing data (don't update state or show an error)
            console.log('Rate limit exceeded for expenses API, using existing data');
          }
          // Continue execution rather than throwing, to allow other data to load
        } else {
          const expensesData = await expensesResponse.json();
          setManualExpenses(expensesData.expenses || []);
        }
      } catch (expError) {
        console.error('Error fetching expenses:', expError);
        // Continue execution rather than re-throwing
      }
      
      // Fetch planned expenses
      try {
        const plannedResponse = await fetch(`/api/trips/${tripId}/planned-expenses`);
        if (!plannedResponse.ok) {
          const errorText = await plannedResponse.text();
          console.error('Failed to fetch planned expenses:', errorText);
          
          // If it's a rate limit issue, don't show an error to the user - use the last data
          if (plannedResponse.status === 429) {
            // Use existing data (don't update state or show an error)
            console.log('Rate limit exceeded for planned expenses API, using existing data');
          }
          // Continue execution
        } else {
          const plannedData = await plannedResponse.json();
          setPlannedExpenses(plannedData.expenses || []);
        }
      } catch (plannedError) {
        console.error('Error fetching planned expenses:', plannedError);
        // Continue execution rather than re-throwing
      }
      
      // Fetch budget if not provided
      if (initialBudget === 0) {
        try {
          const tripResponse = await fetch(`/api/trips/${tripId}`);
          if (tripResponse.ok) {
            const tripData = await tripResponse.json();
            if (tripData.trip && tripData.trip.budget) {
              setBudget(tripData.trip.budget);
            }
          }
        } catch (budgetError) {
          console.error('Error fetching trip budget:', budgetError);
        }
      }
      
      // Fetch members if not provided
      if (initialMembers.length === 0) {
        try {
          const membersResponse = await fetch(`/api/trips/${tripId}/members`);
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            setMembers(membersData.members || []);
          }
        } catch (membersError) {
          console.error('Error fetching members:', membersError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      console.error('Error fetching trip budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new expense
  const addExpense = async (expense: Omit<ManualDbExpense, 'id' | 'trip_id' | 'created_at'>) => {
    if (!tripId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        name: expense.title,
        amount: Number(expense.amount),
        category: expense.category,
        date: expense.date,
        paid_by: expense.paid_by,
        currency: expense.currency || 'USD',
      };

      const response = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add expense');
      }
      
      // Refresh expenses after adding a new one
      await refreshExpenses();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add expense'));
      console.error('Error adding expense:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to update budget
  const updateBudget = async (newBudget: number) => {
    if (!tripId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: newBudget }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to update budget';
        
        // Log detailed error information
        console.error('Budget update error:', {
          status: response.status,
          message: errorMessage,
          details: errorData.details || 'No details available'
        });
        
        // Throw specific error based on status code
        if (response.status === 403) {
          throw new Error("You don't have permission to update the budget");
        } else if (response.status === 400) {
          throw new Error("Invalid budget value");
        } else {
          throw new Error(errorMessage);
        }
      }
      
      setBudget(newBudget);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update budget'));
      console.error('Error updating budget:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    budget,
    setBudget,
    manualExpenses,
    plannedExpenses,
    members,
    totalManualSpent,
    totalPlanned,
    percentSpent,
    loading,
    error,
    addExpense,
    refreshExpenses,
    updateBudget,
    memberExpenseSummary,
  };
} 