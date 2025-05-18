/**
 * BudgetTabTemplate Component
 *
 * Template layout for the Budget tab, integrating with the expenses API
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useExpenses } from '@/lib/hooks/use-expenses';
import { ExpenseList, Expense as ExpenseListItem } from '../organisms/expense-list';
import { BudgetBreakdown, Expense as BudgetExpense } from '../organisms/budget-breakdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExpenseCategory } from '../atoms/expense-category-badge';
import { Label } from '@/components/ui/label';

// ============================================================================
// TYPES
// ============================================================================

export interface BudgetTabTemplateProps {
  /** ID of the trip */
  tripId: string;
  /** Total budget amount */
  budget?: number;
  /** Whether the user can edit expenses */
  canEdit?: boolean;
  /** Whether to initially show the breakdown view */
  defaultShowBreakdown?: boolean;
  /** Optional custom class names */
  className?: string;
}

// Expense type from the API
interface ApiExpense {
  id: string;
  description?: string;
  amount: number;
  category?: string;
  date?: string;
  created_by?:
    | {
        id: string;
        name: string;
        avatar_url?: string;
      }
    | null
    | string;
}

// Helper type guard for created_by object
function isCreatedByObject(
  created_by: any
): created_by is { id: string; name: string; avatar_url?: string } {
  return (
    typeof created_by === 'object' &&
    created_by !== null &&
    'id' in created_by &&
    'name' in created_by
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Template component for the Budget tab
 */
export function BudgetTabTemplate({
  tripId,
  budget = 1000,
  canEdit = false,
  defaultShowBreakdown = false,
  className,
}: BudgetTabTemplateProps) {
  // Get expenses from API hook
  const { expenses, isLoading, error, addExpense, editExpense, removeExpense } =
    useExpenses(tripId);

  // State for add expense dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'other' as ExpenseCategory,
    date: new Date().toISOString().slice(0, 10),
  });

  // State for selected expense dialog
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const selectedExpense = selectedExpenseId
    ? expenses.find((exp) => exp.id === selectedExpenseId)
    : null;

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new expense
  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;

    await addExpense({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: newExpense.date,
    });

    // Reset form and close dialog
    setNewExpense({
      description: '',
      amount: '',
      category: 'other' as ExpenseCategory,
      date: new Date().toISOString().slice(0, 10),
    });
    setIsAddDialogOpen(false);
  };

  // Handle expense click
  const handleExpenseClick = (id: string) => {
    if (canEdit) {
      setSelectedExpenseId(id);
    }
  };

  // Handle deleting an expense
  const handleDeleteExpense = async () => {
    if (selectedExpenseId) {
      await removeExpense(selectedExpenseId);
      setSelectedExpenseId(null);
    }
  };

  // Map API expenses to ExpenseList component format
  const expenseListItems: ExpenseListItem[] = expenses.map((exp) => ({
    id: exp.id,
    description: exp.description || '',
    amount: exp.amount,
    category: (exp.category || 'other') as ExpenseCategory,
    date: exp.date || new Date().toISOString(),
    createdBy: isCreatedByObject(exp.created_by)
      ? {
          id: exp.created_by.id,
          name: exp.created_by.name,
          avatarUrl: exp.created_by.avatar_url,
        }
      : undefined,
  }));

  // Map API expenses to BudgetBreakdown component format
  const budgetExpenseItems: BudgetExpense[] = expenses.map((exp) => ({
    id: exp.id,
    description: exp.description || '',
    amount: exp.amount,
    category: (exp.category || 'other') as ExpenseCategory,
    date: exp.date || new Date().toISOString(),
  }));

  return (
    <div className={cn('space-y-6', className)}>
      <Tabs defaultValue={defaultShowBreakdown ? 'breakdown' : 'expenses'}>
        <TabsList className="mb-4">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="breakdown">Budget Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-0">
          <ExpenseList
            expenses={expenseListItems}
            canAdd={canEdit}
            isLoading={isLoading}
            error={error}
            onExpenseClick={handleExpenseClick}
            onAddExpense={() => setIsAddDialogOpen(true)}
          />
        </TabsContent>

        <TabsContent value="breakdown" className="mt-0">
          <BudgetBreakdown
            expenses={budgetExpenseItems}
            totalBudget={budget}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={newExpense.description}
                onChange={handleInputChange}
                placeholder="Taxi to hotel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newExpense.category}
                onChange={handleInputChange}
              >
                <option value="food">Food</option>
                <option value="transportation">Transportation</option>
                <option value="accommodation">Accommodation</option>
                <option value="activities">Activities</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={newExpense.date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Expense Dialog */}
      <Dialog
        open={!!selectedExpenseId}
        onOpenChange={(open) => !open && setSelectedExpenseId(null)}
      >
        {selectedExpense && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Expense Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Description</div>
                <div className="font-medium">{selectedExpense.description}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className="font-medium">${selectedExpense.amount.toFixed(2)}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Category</div>
                <div className="font-medium">{selectedExpense.category}</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Date</div>
                <div className="font-medium">
                  {selectedExpense.date ? new Date(selectedExpense.date).toLocaleDateString() : ''}
                </div>
              </div>

              {isCreatedByObject(selectedExpense.created_by) && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Added by</div>
                  <div className="font-medium">{selectedExpense.created_by.name}</div>
                </div>
              )}
            </div>

            {canEdit && (
              <DialogFooter>
                <Button variant="destructive" onClick={handleDeleteExpense}>
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedExpenseId(null)}>
                  Close
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
