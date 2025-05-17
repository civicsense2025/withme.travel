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
import { UnifiedExpense } from '@/hooks/use-trip-budget';

export interface ExpenseListProps {
  /**
   * Array of expenses to display
   */
  expenses: UnifiedExpense[];
  /**
   * Array of planned expenses to display
   */
  plannedExpenses: UnifiedExpense[];
  /**
   * Whether the user can edit expenses
   */
  canEdit: boolean;
  /**
   * Callback for editing an expense
   */
  onEditExpense: (expense: UnifiedExpense) => void;
  /**
   * Callback for deleting an expense
   */
  onDeleteExpense: (expense: UnifiedExpense) => void;
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
        expense.paidBy?.toLowerCase().includes(query)
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
                  expense={expense}
                  onEdit={onEditExpense}
                  onDelete={onDeleteExpense}
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

  // The main content component
  const content = (
    <>
      <div className="flex justify-between items-center mb-4">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'actual' | 'planned')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="actual" className="flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              <span>Actual Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="planned" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Planned Expenses</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {filtersSection}
      
      {canEdit && (
        <div className="mb-4">
          <Button variant="outline" size="sm" className="w-full" onClick={onAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Add {activeTab === 'actual' ? 'Expense' : 'Planned Expense'}
          </Button>
        </div>
      )}
      
      {expenseList}
    </>
  );

  // Render without card wrapper
  if (noCardWrapper) {
    return <div className={className}>{content}</div>;
  }

  // Render with card wrapper
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Expenses</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
} 