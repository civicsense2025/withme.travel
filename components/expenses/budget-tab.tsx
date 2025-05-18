/**
 * Budget Tab
 * 
 * Main container component for the trip budget feature.
 * Uses the centralized useExpenses hook for API access.
 */
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TripMemberFromSSR } from '@/components/members-tab';
import { useResearchTracking } from '@/hooks/use-research-tracking';
import { useExpenses } from '@/hooks/use-expenses';
import type { Expense } from '@/lib/api/_shared';
import { UnifiedExpense } from './organisms/expense-list';

// Import our component library
import {
  BudgetSnapshotCard,
  MemberExpensesGrid,
  ExpenseList,
  ExpenseForm
} from './index';

// Extended interface for expense form data
interface ExtendedExpense extends Expense {
  description?: string;
  paidById?: string;
}

// Type for a member debt calculation
interface MemberDebt {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

// Type for member expense summary
interface MemberExpense {
  memberId: string;
  name: string;
  avatar: string | null;
  paid: number;
  share: number;
  balance: number;
}

export interface BudgetTabProps {
  tripId: string;
  canEdit?: boolean;
  isTripOver?: boolean;
  initialMembers: TripMemberFromSSR[];
  budget?: number | null;
  handleBudgetUpdated?: () => void;
  manualExpenses?: any[];
  plannedExpenses?: any[];
}

/**
 * Budget tab component with expense tracking and budget management
 */
export function BudgetTab({
  tripId,
  canEdit = false,
  isTripOver = false,
  initialMembers,
  budget: initialBudget = null,
  handleBudgetUpdated,
  manualExpenses = [],
  plannedExpenses = [],
}: BudgetTabProps) {
  const { toast } = useToast();
  const { trackEvent } = useResearchTracking();
  
  // State for budget management
  const [budgetEditMode, setBudgetEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'members'>('expenses');
  const [budgetValue, setBudgetValue] = useState<number>(initialBudget || 0);
  const [members, setMembers] = useState<TripMemberFromSSR[]>(initialMembers);

  // Use the new expenses hook
  const {
    expenses,
    isLoading,
    error,
    summary,
    refresh: refreshExpenses,
    addExpense,
    editExpense,
    removeExpense,
  } = useExpenses(tripId);

  // Calculate totals
  const totalManualSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const totalPlanned = plannedExpenses?.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) || 0;
  const percentSpent = budgetValue > 0 ? Math.min(100, Math.round((totalManualSpent / budgetValue) * 100)) : 0;

  // Calculate member expense summary
  const memberExpenseSummary: MemberExpense[] = members.map((member) => {
    const memberCount = members.length > 0 ? members.length : 1;
    
    // Calculate what this member paid
    const paid = expenses
      .filter((exp) => exp.paid_by === member.user_id)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Calculate this member's share of all expenses
    const share = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount) / memberCount,
      0
    );

    // Calculate balance (positive means others owe this member)
    const balance = paid - share;

    return {
      memberId: member.user_id,
      name: member.profiles?.name || 'Unknown',
      avatar: member.profiles?.avatar_url || null,
      paid,
      share,
      balance,
    };
  }).sort((a, b) => b.paid - a.paid);
  
  // Track any context changes in our UI
  useEffect(() => {
    if (expenses.length > 0) {
      trackEvent('budget_tab_viewed' as any, {
        tripId,
        manualExpensesCount: expenses.length,
        plannedExpensesCount: plannedExpenses?.length || 0,
        hasBudget: budgetValue > 0,
        totalSpent: totalManualSpent,
      });
    }
  }, [expenses.length, trackEvent, tripId, budgetValue, totalManualSpent, plannedExpenses?.length]);

  // Calculate debts between members
  const calculateMemberDebts = useCallback(() => {
    // Skip if less than 2 members
    if (memberExpenseSummary.length < 2) {
      return [];
    }

    const debts: MemberDebt[] = [];
    
    // Sort members by balance (descending)
    const sortedMembers = [...memberExpenseSummary]
      .sort((a, b) => b.balance - a.balance);

    // Simplify debts calculation with direct transfer method
    let i = 0;  // index for members who are owed money (positive balance)
    let j = sortedMembers.length - 1;  // index for members who owe money (negative balance)

    while (i < j) {
      const creditor = sortedMembers[i];
      const debtor = sortedMembers[j];
      
      // Skip if no imbalance
      if (creditor.balance <= 0 || debtor.balance >= 0) {
        if (creditor.balance <= 0) i++;
        if (debtor.balance >= 0) j--;
        continue;
      }

      // Calculate the transfer amount
      const transferAmount = Math.min(creditor.balance, -debtor.balance);
      
      if (transferAmount > 0.01) {  // Ignore tiny amounts
        debts.push({
          fromMemberId: debtor.memberId,
          fromMemberName: debtor.name,
          toMemberId: creditor.memberId,
          toMemberName: creditor.name,
          amount: transferAmount
        });
        
        // Update balances
        creditor.balance -= transferAmount;
        debtor.balance += transferAmount;
      }
      
      // Move to next members if their balance is settled
      if (Math.abs(creditor.balance) < 0.01) i++;
      if (Math.abs(debtor.balance) < 0.01) j--;
    }

    return debts;
  }, [memberExpenseSummary]);

  // Handle toggling the budget edit mode
  const handleBudgetEditToggle = (isEditing: boolean) => {
    setBudgetEditMode(isEditing);
    if (isEditing) {
      trackEvent('budget_edit_started' as any, { tripId });
    }
  };

  // Handle updating the budget
  const handleBudgetUpdate = async (newBudget: number) => {
    try {
      // Here we would call an API to update the budget, but that's not part of useExpenses yet
      // For now, just update the local state
      setBudgetValue(newBudget);
      
      // Notify parent
      if (handleBudgetUpdated) {
        handleBudgetUpdated();
      }

      // Show toast
      toast({
        title: 'Budget updated',
        description: `Your trip budget has been set to $${newBudget.toFixed(2)}.`
      });

      trackEvent('budget_updated' as any, { 
        tripId, 
        newBudget, 
        previousBudget: budgetValue 
      });
    } catch (error) {
      console.error('Failed to update budget:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update budget. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle opening the add expense form
  const handleAddExpenseClick = () => {
    setSelectedExpense(undefined);
    setShowExpenseForm(true);
  };

  // Handle opening the edit expense form
  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowExpenseForm(true);
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (expense: Expense) => {
    try {
      await removeExpense(expense.id);
      trackEvent('expense_deleted' as any, { tripId, expenseId: expense.id });
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete expense. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle expense form submission
  const handleExpenseSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const expenseData = {
        title: data.title,
        amount: Number(data.amount),
        category: data.category,
        date: data.date ? data.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: data.description,
        paid_by: data.paidBy || (members.length > 0 ? members[0].user_id : ''),
        currency: data.currency || 'USD'
      };
      
      if (selectedExpense) {
        // Update existing expense
        await editExpense(selectedExpense.id, expenseData);
        trackEvent('expense_updated' as any, { 
          tripId, 
          expenseId: selectedExpense.id,
          category: data.category
        });
      } else {
        // Create new expense
        await addExpense(expenseData);
        trackEvent('expense_added' as any, { 
          tripId,
          category: data.category,
          amount: Number(data.amount)
        });
      }

      setShowExpenseForm(false);
      setSelectedExpense(undefined);
    } catch (error) {
      console.error('Failed to save expense:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save expense. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format members for the expense form dropdown
  const formattedMembers = members.map(member => ({
    id: member.user_id,
    name: member.profiles?.name || 'Unknown'
  }));

  // Calculate member debts
  const memberDebts = calculateMemberDebts();

  return (
    <Tabs defaultValue="expenses" className="w-full space-y-4" onValueChange={(v) => setActiveTab(v as any)}>
      <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="members">Splits</TabsTrigger>
      </TabsList>
      
      <TabsContent value="expenses" className="space-y-4">
        {/* Budget snapshot */}
        <BudgetSnapshotCard
          budget={budgetValue}
          spent={totalManualSpent}
          percentSpent={percentSpent}
          isEditing={budgetEditMode}
          onEditToggle={handleBudgetEditToggle}
          onBudgetUpdate={handleBudgetUpdate}
          canEdit={canEdit}
        />
        
        {/* Expenses list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md">Expense List</CardTitle>
            {canEdit && (
              <Button onClick={handleAddExpenseClick} size="sm">
                Add Expense
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ExpenseList
              expenses={expenses}
              plannedExpenses={plannedExpenses}
              canEdit={canEdit}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddExpense={handleAddExpenseClick}
              noCardWrapper
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="members" className="space-y-4">
        {/* Member expense grid */}
        <MemberExpensesGrid
          members={memberExpenseSummary}
          debts={memberDebts}
          totalAmount={totalManualSpent}
        />
      </TabsContent>
      
      {/* Expense form dialog */}
      <ExpenseForm
        isOpen={showExpenseForm}
        expense={selectedExpense as any}
        members={formattedMembers}
        isSubmitting={isSubmitting}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={handleExpenseSubmit}
      />
    </Tabs>
  );
} 