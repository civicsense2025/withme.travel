/**
 * ExpenseList Component (Organism)
 * 
 * Displays a list of expenses with sorting, filtering, and pagination.
 *
 * @module budget/organisms
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ExpenseItem } from '../molecules/expense-item';
import { ExpenseCategory } from '../atoms/expense-category-badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  CalendarIcon,
  DollarSign,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format, isAfter, parseISO } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export type SortField = 'date' | 'amount' | 'description';
export type SortDirection = 'asc' | 'desc';

export interface ExpenseListProps {
  /** Expenses to display */
  expenses: Expense[];
  /** Whether user can add new expenses */
  canAdd?: boolean;
  /** Whether list is loading */
  isLoading?: boolean;
  /** Error message, if any */
  error?: string | null;
  /** Callback for clicking on an expense */
  onExpenseClick?: (id: string) => void;
  /** Callback for adding a new expense */
  onAddExpense?: () => void;
  /** Optional custom class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ExpenseList({
  expenses,
  canAdd = false,
  isLoading = false,
  error = null,
  onExpenseClick,
  onAddExpense,
  className,
}: ExpenseListProps) {
  // State for sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    if (!expenses.length) return [];

    // First, apply filters
    let result = [...expenses];

    // Apply recent filter (last 30 days) if on recent tab
    if (activeTab === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter((expense) => {
        const expenseDate = parseISO(expense.date);
        return isAfter(expenseDate, thirtyDaysAgo);
      });
    }
    
    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.description.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query) ||
          (expense.createdBy?.name.toLowerCase().includes(query) ?? false)
      );
    }

    // Then, sort the results
    result.sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'date':
          return multiplier * (new Date(a.date).getTime() - new Date(b.date).getTime());
        case 'amount':
          return multiplier * (a.amount - b.amount);
        case 'description':
          return multiplier * a.description.localeCompare(b.description);
        default:
          return 0;
      }
    });

    return result;
  }, [expenses, searchQuery, sortField, sortDirection, activeTab]);
  
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Expenses</CardTitle>
        
        {canAdd && onAddExpense && (
          <Button 
            size="sm" 
            onClick={onAddExpense}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Search input */}
        <div className="mb-4">
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Expense List */}
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as 'all' | 'recent')}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Expenses</TabsTrigger>
            <TabsTrigger value="recent">Recent (30 Days)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ExpenseListContent
              expenses={filteredExpenses}
              isLoading={isLoading}
              error={error}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onExpenseClick={onExpenseClick}
            />
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <ExpenseListContent
              expenses={filteredExpenses}
              isLoading={isLoading}
              error={error}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onExpenseClick={onExpenseClick}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ExpenseListContentProps {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onExpenseClick?: (id: string) => void;
}

function ExpenseListContent({
  expenses,
  isLoading,
  error,
  sortField,
  sortDirection,
  onSort,
  onExpenseClick,
}: ExpenseListContentProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading expenses...
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="py-8 text-center text-destructive">
        Error: {error}
      </div>
    );
  }
  
  // Empty state
  if (!expenses.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No expenses yet
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {/* Sorting controls */}
      <div className="flex justify-end items-center gap-2 text-sm text-muted-foreground mb-2">
        <span>Sort by:</span>
        <button
          onClick={() => onSort('date')}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded hover:bg-muted',
            sortField === 'date' && 'font-medium text-foreground'
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          Date
          {sortField === 'date' && (
            sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        
        <button
          onClick={() => onSort('amount')}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded hover:bg-muted',
            sortField === 'amount' && 'font-medium text-foreground'
          )}
        >
          <DollarSign className="h-3.5 w-3.5" />
          Amount
          {sortField === 'amount' && (
            sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        
        <button
          onClick={() => onSort('description')}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded hover:bg-muted',
            sortField === 'description' && 'font-medium text-foreground'
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Description
          {sortField === 'description' && (
            sortDirection === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      
      {/* Expense items */}
      <div className="space-y-2">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            id={expense.id}
            description={expense.description}
            amount={expense.amount}
            category={expense.category}
            date={expense.date}
            createdBy={expense.createdBy}
            onClick={onExpenseClick}
          />
        ))}
      </div>
    </div>
  );
}
