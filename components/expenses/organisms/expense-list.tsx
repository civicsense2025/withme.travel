/**
 * Expense List
 * 
 * Displays a filterable, sortable list of expenses with
 * category and date filtering.
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExpenseItemCard } from '../molecules/expense-item-card';
import { ExpenseAmount } from '../atoms/expense-amount';
import { DateBadge } from '../atoms/date-badge';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  ArrowUpDown,
  Receipt,
  Calendar
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ENUMS } from '@/utils/constants/status';
import type { Expense } from '@/lib/api/_shared';

// For backwards compatibility with components that use UnifiedExpense
export interface UnifiedExpense {
  id: string | number;
  title: string | null;
  amount: number | null;
  currency: string | null;
  category: string | null;
  date: string | null;
  paidBy?: string | null;
  paidById?: string;
  source: 'manual' | 'planned';
}

// Helper function to convert Expense to backward compatible UnifiedExpense for rendering
function adaptExpenseForDisplay(expense: Expense, displayName?: string): UnifiedExpense {
  return {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    currency: expense.currency || 'USD',
    category: expense.category || 'other',
    date: expense.date || null,
    paidBy: displayName || 'Unknown',
    paidById: expense.paid_by,
    source: 'manual'
  };
}

export interface ExpenseListProps {
  /**
   * Array of expenses to display
   */
  expenses: Expense[];
  /**
   * Array of planned expenses to display
   */
  plannedExpenses: Expense[];
  /**
   * Whether the user can edit expenses
   */
  canEdit: boolean;
  /**
   * Callback for editing an expense
   */
  onEditExpense: (expense: Expense) => void;
  /**
   * Callback for deleting an expense
   */
  onDeleteExpense: (expense: Expense) => void;
  /**
   * Callback for adding a new expense
   */
  onAddExpense: () => void;
  /**
   * Optional CSS class
   */
  className?: string;
  /**
   * If true, renders without the Card wrapper
   */
  noCardWrapper?: boolean;
}

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

/**
 * Displays a filterable, sortable list of expenses
 */
export function ExpenseList({
  expenses,
  plannedExpenses,
  canEdit,
  onEditExpense,
  onDeleteExpense,
  onAddExpense,
  className = '',
  noCardWrapper = false
}: ExpenseListProps) {
  // State for filters and sorting
  const [activeTab, setActiveTab] = useState<'actual' | 'planned'>('actual');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Reset filters when expenses change
  useEffect(() => {
    setSearchQuery('');
    setCategoryFilter('all');
  }, [expenses, plannedExpenses]);

  // Get the active expenses based on the tab
  const activeExpenses = activeTab === 'actual' ? expenses : plannedExpenses;

  // Filter expenses based on search query and category
  const filteredExpenses = useMemo(() => {
    let result = [...activeExpenses];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(expense => 
        expense.title?.toLowerCase().includes(query) ||
        expense.paid_by?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(expense => expense.category === categoryFilter);
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      } else if (sortBy === 'amount-desc') {
        return (b.amount || 0) - (a.amount || 0);
      } else {
        return (a.amount || 0) - (b.amount || 0);
      }
    });
  }, [activeExpenses, searchQuery, categoryFilter, sortBy]);

  // Calculate total amount
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  // Get all expense categories
  const allCategories = Object.values(ENUMS.BUDGET_CATEGORY);

  // Render the filters section
  const filtersSection = (
    <div className={`space-y-2 ${showFilters ? 'mb-4' : ''}`}>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="h-8"
        />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 flex-shrink-0"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Select 
            value={categoryFilter} 
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={sortBy} 
            onValueChange={v => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  // Render the expense list
  const expenseList = (
    <div className="space-y-2">
      {filteredExpenses.length > 0 ? (
        <>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredExpenses.map((expense) => (
                <ExpenseItemCard
                  key={expense.id}
                  expense={adaptExpenseForDisplay(expense)}
                  onEdit={() => onEditExpense(expense)}
                  onDelete={() => onDeleteExpense(expense)}
                  canEdit={canEdit}
                  compact
                />
              ))}
            </div>
          </ScrollArea>
          
          <Separator className="my-2" />
          
          <div className="flex justify-between items-center px-1">
            <div className="text-sm text-muted-foreground">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
            </div>
            <div className="font-medium">
              Total: <ExpenseAmount amount={totalAmount} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <p className="text-muted-foreground mb-2">No expenses found</p>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={onAddExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // Render content with or without tabs based on whether we have planned expenses
  const content = plannedExpenses.length > 0 ? (
    <Tabs defaultValue="actual" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
      <TabsList className="grid grid-cols-2 w-full max-w-[200px] mb-4">
        <TabsTrigger value="actual" className="flex items-center">
          <Receipt className="h-4 w-4 mr-2" />
          Actual
        </TabsTrigger>
        <TabsTrigger value="planned" className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Planned
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="actual" className="mt-0">
        {filtersSection}
        {expenseList}
      </TabsContent>
      
      <TabsContent value="planned" className="mt-0">
        {filtersSection}
        {expenseList}
      </TabsContent>
    </Tabs>
  ) : (
    <>
      {filtersSection}
      {expenseList}
    </>
  );

  // Render with or without the card wrapper
  if (noCardWrapper) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">Expenses</CardTitle>
        {canEdit && (
          <Button onClick={onAddExpense} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        )}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
} 