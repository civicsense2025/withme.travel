/**
 * Budget Tab
 * 
 * Main container component for the trip budget feature.
 */
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ManualDbExpense, UnifiedExpense, useTripBudget } from '@/hooks/use-trip-budget';
import { TripMemberFromSSR } from '@/components/members-tab';
import { useResearchTracking } from '@/hooks/use-research-tracking';

// Import our component library
import {
  BudgetSnapshotCard,
  MemberExpensesGrid,
  ExpenseList,
  ExpenseForm
} from './index';

// Extended interface for expense form data
interface ExtendedExpense extends UnifiedExpense {
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

export interface BudgetTabProps {
  tripId: string;
  canEdit?: boolean;
  isTripOver?: boolean;
  manualExpenses: ManualDbExpense[];
  plannedExpenses: UnifiedExpense[];
  initialMembers: TripMemberFromSSR[];
  budget?: number | null;
  handleBudgetUpdated?: () => void;
}

/**
 * Budget tab component with expense tracking and budget management
 */
export function BudgetTab({
  tripId,
  canEdit = false,
  isTripOver = false,
  manualExpenses: initialManualExpenses,
  plannedExpenses: initialPlannedExpenses,
  initialMembers,
  budget: initialBudget = null,
  handleBudgetUpdated,
}: BudgetTabProps) {
  const { toast } = useToast();
  const { trackEvent } = useResearchTracking();
  
  // State for budget management
  const [budgetEditMode, setBudgetEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<UnifiedExpense | undefined>(undefined);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'members'>('expenses');

  // Use the budget hook
  const {
    budget,
    setBudget,
    manualExpenses,
    plannedExpenses,
    members,
    totalManualSpent,
    totalPlanned,
    memberExpenseSummary,
    addExpense,
    updateBudget,
    refreshExpenses,
  } = useTripBudget({
    tripId,
    initialManualExpenses,
    initialPlannedExpenses,
    initialMembers,
    initialBudget
  });
  
  // Track any context changes in our UI
  useEffect(() => {
    if (manualExpenses.length > 0) {
      trackEvent('budget_tab_viewed' as any, {
        tripId,
        manualExpensesCount: manualExpenses.length,
        plannedExpensesCount: plannedExpenses.length,
        hasBudget: budget > 0,
        totalSpent: totalManualSpent,
      });
    }
  }, [manualExpenses.length, trackEvent, tripId, budget, totalManualSpent, plannedExpenses.length]);

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
          fromMemberId: debtor.id,
          fromMemberName: debtor.name,
          toMemberId: creditor.id,
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
      await updateBudget(newBudget);
      
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
        previousBudget: budget 
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
    trackEvent('add_expense_started' as any, { tripId });
  };

  // Handle editing an expense
  const handleEditExpense = (expense: UnifiedExpense) => {
    setSelectedExpense(expense as ExtendedExpense);
    setShowExpenseForm(true);
    trackEvent('edit_expense_started' as any, { tripId, expenseId: expense.id });
  };

  // Handle deleting an expense
  const handleDeleteExpense = async (expense: UnifiedExpense) => {
    // Implement delete logic
    toast({
      title: 'Not Implemented',
      description: 'Delete expense functionality is not implemented yet.'
    });
  };

  // Handle submitting the expense form
  const handleExpenseSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Determine if this is an edit or a new expense
      if (selectedExpense) {
        // Update existing expense
        toast({
          title: 'Not Implemented',
          description: 'Edit expense functionality is not implemented yet.'
        });
      } else {
        // Add new expense
        await addExpense({
          title: data.title,
          amount: data.amount,
          category: data.category,
          date: data.date ? data.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          paid_by: data.paidBy || (members.length > 0 ? members[0].user_id : ''),
          currency: data.currency
        });
        
        // Show success toast
        toast({
          title: 'Expense added',
          description: `Added "${data.title}" for ${data.currency} ${data.amount}`
        });

        trackEvent('expense_added' as any, { 
          tripId, 
          amount: data.amount,
          category: data.category
        });
      }

      // Close form and refresh data
      setShowExpenseForm(false);
      refreshExpenses();
    } catch (error) {
      console.error('Error adding/updating expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transform member data for different components
  const membersForDropdown = members.map(member => ({
    id: member.user_id,
    name: member.profiles?.name || 'Unknown'
  }));

  // Transform member expense data
  const memberExpenses = memberExpenseSummary.map(member => ({
    memberId: member.id,
    name: member.name,
    avatar: member.avatar,
    paid: member.paid,
    share: member.share,
    balance: member.balance
  }));

  // Calculate member debts
  const memberDebts = calculateMemberDebts();

  return (
    <div className="space-y-6">
      {/* Budget Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BudgetSnapshotCard
          targetBudget={budget}
          totalSpent={totalManualSpent}
          totalPlanned={totalPlanned}
          canEdit={canEdit}
          isEditing={budgetEditMode}
          onEditToggle={handleBudgetEditToggle}
          onSave={handleBudgetUpdate}
          onLogExpenseClick={handleAddExpenseClick}
          className="md:col-span-1"
        />
        
        <MemberExpensesGrid
          members={memberExpenses}
          debts={memberDebts}
          className="md:col-span-2"
        />
      </div>

      {/* Expenses List */}
      <ExpenseList
        expenses={manualExpenses.map(exp => ({
          id: exp.id,
          title: exp.title,
          amount: Number(exp.amount),
          currency: exp.currency,
          category: exp.category,
          date: exp.date,
          paidBy: members.find(m => m.user_id === exp.paid_by)?.profiles?.name || 'Unknown',
          paidById: exp.paid_by,
          source: 'manual' as const
        } as ExtendedExpense))}
        plannedExpenses={plannedExpenses}
        canEdit={canEdit}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
        onAddExpense={handleAddExpenseClick}
      />
      
      {/* Expense Form */}
      <ExpenseForm
        isOpen={showExpenseForm}
        expense={selectedExpense}
        members={membersForDropdown}
        isSubmitting={isSubmitting}
        onClose={() => setShowExpenseForm(false)}
        onSubmit={handleExpenseSubmit}
      />
    </div>
  );
} 