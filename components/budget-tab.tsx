'use client';
import { BUDGET_CATEGORIES, SPLIT_TYPES } from '@/utils/constants/status';
import { API_ROUTES } from '@/utils/constants/routes';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  DollarSign,
  PieChart,
  Wallet2,
  Loader2,
  LinkIcon,
  Link2Off,
  RefreshCw,
  Users,
  ChevronDown,
  ChevronUp,
  Calendar,
  Save,
  X,
  HelpCircle,
  ChevronsUpDown,
  MoreHorizontal,
  Edit2,
  Trash2,
  ArrowUpRight,
  Utensils,
  Train,
  Bed,
  Ticket,
  ShoppingBag,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate, formatError, getInitials } from '@/utils/lib-utils';

import { limitItems } from '@/utils/lib-utils';
import { useAuth } from '@/lib/hooks/use-auth';
import { TripMemberFromSSR } from '@/components/members-tab';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useResearchTracking } from '@/hooks/use-research-tracking';
import { ManualDbExpense, UnifiedExpense, useTripBudget } from '@/hooks/use-trip-budget';

interface BudgetTabProps {
  tripId: string;
  canEdit?: boolean;
  isTripOver?: boolean;
  manualExpenses: ManualDbExpense[];
  plannedExpenses: UnifiedExpense[];
  initialMembers: TripMemberFromSSR[];
  budget?: number | null;
  handleBudgetUpdated?: () => void;
}

export function BudgetTab({
  tripId,
  canEdit = false,
  isTripOver = false,
  manualExpenses,
  plannedExpenses,
  initialMembers,
  budget = null,
  handleBudgetUpdated,
}: BudgetTabProps) {
  const { toast } = useToast();
  const { trackEvent } = useResearchTracking();
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    paid_by: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const members = initialMembers;
  const memberCount = members.length > 0 ? members.length : 1;

  // State for expanded items
  const [expandedItems, setExpandedItems] = useState<Record<string | number, boolean>>({});

  // Restore combinedExpenses calculation (needed for paidByMemberTotals)
  const combinedExpenses = useMemo(() => {
    const mappedManual: UnifiedExpense[] = manualExpenses.map((exp) => {
      // Find member who paid this expense
      const payer = members.find((m) => m.user_id === exp.paid_by);
      // Safely access profile name with fallback
      const payerName = payer?.profiles?.name || 'Unknown';

      return {
        id: exp.id,
        title: exp.title,
        amount: Number(exp.amount),
        currency: 'USD',
        category: exp.category,
        date: exp.date,
        paidBy: payerName,
        source: 'manual' as const,
      };
    });
    const allExpenses = [...mappedManual, ...plannedExpenses];
    return allExpenses.sort((a, b) => {
      if (a.date === null && b.date === null) return 0;
      if (a.date === null) return 1;
      if (b.date === null) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [manualExpenses, plannedExpenses, members]);

  // Calculate amounts per member
  const memberExpenseSummary = useMemo(() => {
    const summary = members
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
          avatar: member.profiles?.avatar_url,
          paid,
          share,
          balance,
        };
      })
      .sort((a, b) => b.paid - a.paid);

    return summary;
  }, [manualExpenses, members, memberCount]);

  // Trip date range and duration
  const tripDuration = useMemo(() => {
    // This would ideally come from the trip data
    // For now, using the earliest and latest expense dates as a proxy
    const dates = combinedExpenses
      .filter((exp) => exp.date)
      .map((exp) => new Date(exp.date as string));

    if (dates.length < 2) return { days: 0, start: null, end: null };

    const start = new Date(Math.min(...dates.map((d) => d.getTime())));
    const end = new Date(Math.max(...dates.map((d) => d.getTime())));
    const days = differenceInDays(end, start) + 1;

    return { days, start, end };
  }, [combinedExpenses]);

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, UnifiedExpense[]> = {};
    const nullDateKey = 'unscheduled';

    const mappedManual: UnifiedExpense[] = manualExpenses.map((exp) => {
      // Find member who paid this expense
      const payer = members.find((m) => m.user_id === exp.paid_by);
      // Safely access profile name with fallback
      const payerName = payer?.profiles?.name || 'Unknown';

      return {
        id: exp.id,
        title: exp.title,
        amount: Number(exp.amount),
        currency: 'USD',
        category: exp.category,
        date: exp.date, // Keep original date string/null
        paidBy: payerName,
        source: 'manual' as const, // Use const assertion for literal type
      };
    });

    const allExpenses = [...mappedManual, ...plannedExpenses];

    allExpenses.forEach((expense) => {
      const dateKey = expense.date ? expense.date.split('T')[0] : nullDateKey; // Use YYYY-MM-DD or nullDateKey
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });

    // Sort expenses within each date group (optional, but good practice)
    for (const dateKey in groups) {
      groups[dateKey].sort((a, b) => {
        // Basic sort putting manual before planned if dates match, otherwise keep original logic
        if (a.date && b.date && a.date === b.date) {
          return a.source === 'manual' ? -1 : 1;
        }
        return 0; // Keep original array order if dates differ or are null
      });
    }

    return groups;
  }, [manualExpenses, plannedExpenses, members]);

  // Get sorted date keys
  const sortedDateKeys = useMemo(() => {
    const nullDateKey = 'unscheduled';
    const dateKeys = Object.keys(groupedExpenses)
      .filter((key) => key !== nullDateKey) // Exclude unscheduled for now
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Sort dates chronologically

    // Add unscheduled key at the end if it exists
    if (groupedExpenses[nullDateKey]) {
      dateKeys.push(nullDateKey);
    }
    return dateKeys;
  }, [groupedExpenses]);

  // Calculate totals locally
  const totalPlanned = useMemo(
    () => plannedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0),
    [plannedExpenses]
  );
  const totalManualSpent = useMemo(
    () => manualExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
    [manualExpenses]
  );
  
  // Calculate percentage spent
  const percentSpent = useMemo(() => {
    if (!budget || budget <= 0) return 0;
    return Math.min(100, Math.round((totalManualSpent / budget) * 100));
  }, [totalManualSpent, budget]);

  const toggleItemExpansion = (itemId: string | number) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSubmitInlineExpense = async () => {
    try {
      setIsLoading(true);

      const payload = {
        name: newExpense.title,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        date: newExpense.date,
        paid_by: newExpense.paid_by,
        currency: 'USD', // Default currency
      };

      // Make the actual API call
      const response = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add expense');
      }

      toast({
        title: 'Expense added',
        description: `Added ${newExpense.title} for ${formatCurrency(Number(newExpense.amount))}`,
      });

      // Reset form
      setNewExpense({
        title: '',
        amount: '',
        category: '',
        paid_by: '',
        date: new Date().toISOString().split('T')[0],
      });
      setIsAddingInline(false);
      
      // Notify parent to refresh data
      if (handleBudgetUpdated) {
        handleBudgetUpdated();
      } else {
        // Fallback to page reload if no handler provided
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add expense',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to set the budget from props when available
  useEffect(() => {
    // Get the budget value from the parent component's trip data
    if (budget && typeof budget === 'number' && budget > 0) {
      setBudgetTotal(budget);
    }
  }, [budget]);

  // Define loading (can be made dynamic later if needed)
  const loading = false;

  if (loading) {
    return <div className="py-8 text-center">Loading budget...</div>;
  }

  return (
    <div className="space-y-6 py-4">
      <Card className="shadow-sm border-muted/50">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-medium">Trip Finances</CardTitle>
            <CardDescription className="text-base">Keep track of trip expenses.</CardDescription>
          </div>
          <div className="text-right bg-muted/20 px-4 py-2 rounded-xl">
            <div className="text-sm font-medium text-muted-foreground">Budget</div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalManualSpent)}/{formatCurrency(budgetTotal)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex flex-wrap gap-4 border-b pb-4">
            <Badge
              variant="secondary"
              className="text-sm px-4 py-1.5 rounded-full flex items-center gap-2 bg-surface-light dark:bg-surface-light/10"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Total Planned: {formatCurrency(totalPlanned)}
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1 flex items-center gap-1">
              <Wallet2 className="h-3.5 w-3.5" />
              Total Logged: {formatCurrency(totalManualSpent)}
            </Badge>
            {tripDuration.days > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {tripDuration.days} day{tripDuration.days !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Member breakdown as accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="member-summary">
              <AccordionTrigger className="py-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-medium">Member Summary</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="border-dashed mt-2">
                  <ScrollArea className="max-h-[300px]">
                    <div className="p-4 space-y-3">
                      {memberExpenseSummary.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 border-b border-dashed last:border-0 rounded-lg hover:bg-surface-light/50 dark:hover:bg-surface-light/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage src={member.avatar ?? undefined} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-base">{member.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Paid {formatCurrency(member.paid)} • Share{' '}
                                {formatCurrency(member.share)}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`font-medium text-sm px-3 py-1 rounded-full ${
                              member.balance > 0
                                ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                                : member.balance < 0
                                  ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                                  : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                            }`}
                          >
                            {member.balance > 0
                              ? `Owed ${formatCurrency(member.balance)}`
                              : member.balance < 0
                                ? `Owes ${formatCurrency(Math.abs(member.balance))}`
                                : 'Even'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Expense Log</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="ml-2">
                  {Object.values(groupedExpenses).flat().length} items
                </Badge>
                {canEdit && !isAddingInline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddingInline(true)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Expense
                  </Button>
                )}
              </div>
            </div>

            {/* Inline expense form */}
            {isAddingInline && (
              <Card className="mb-6 border border-dashed shadow-sm">
                <CardContent className="p-5 pt-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs font-medium">
                        Description
                      </Label>
                      <Input
                        id="title"
                        placeholder="What was this expense for?"
                        value={newExpense.title}
                        onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="amount" className="text-xs font-medium">
                        Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          $
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-7 h-10"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs font-medium">
                        Category
                      </Label>
                      <Select
                        value={newExpense.category}
                        onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue>Select category</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accommodation">Accommodation</SelectItem>
                          <SelectItem value="food">Food & Drinks</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="activities">Activities</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="paid_by" className="text-xs font-medium">
                        Paid By
                      </Label>
                      <Select
                        value={newExpense.paid_by}
                        onValueChange={(value) => setNewExpense({ ...newExpense, paid_by: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue>Who paid?</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.user_id} value={member.user_id}>
                              {member.profiles?.name || 'Unknown'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="date" className="text-xs font-medium">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="flex items-end justify-end gap-2 md:col-span-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingInline(false)}
                        className="gap-1.5 text-muted-foreground h-9"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmitInlineExpense}
                        className="gap-1.5 h-9"
                        disabled={!newExpense.title || !newExpense.amount || !newExpense.paid_by || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Expense
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Always show expense log, but conditionally fill it */}
            <div className="space-y-5 border rounded-xl p-4 bg-muted/10">
              {sortedDateKeys.length > 0
                ? // Has expenses - render as before
                  sortedDateKeys.map((dateKey) => {
                    const expensesForDate = groupedExpenses[dateKey];
                    const isUnscheduled = dateKey === 'unscheduled';
                    let displayDate = 'Unscheduled Expenses';
                    if (!isUnscheduled) {
                      try {
                        displayDate = format(parseISO(dateKey), 'EEEE, MMM d, yyyy');
                      } catch (e) {
                        displayDate = dateKey; // Fallback if date parsing fails
                      }
                    }

                    // Calculate day total
                    const dayTotal = expensesForDate.reduce(
                      (sum, exp) => sum + (exp.amount || 0),
                      0
                    );

                    return (
                      <div key={dateKey}>
                        <h4 className="font-semibold text-base mb-3 sticky top-0 bg-muted/90 backdrop-blur-sm py-2 px-3 rounded-md -mx-2 z-10 flex justify-between">
                          <span>{displayDate}</span>
                          <span className="text-sm font-normal text-muted-foreground">
                            {formatCurrency(dayTotal)}
                          </span>
                        </h4>
                        <div className="space-y-2 pl-2 border-l-2 border-dashed ml-1">
                          {expensesForDate.map((expense: UnifiedExpense) => {
                            const isExpanded = expandedItems[expense.id] || false;
                            const costPerPerson =
                              expense.source === 'planned' && memberCount > 0 && expense.amount
                                ? expense.amount / memberCount
                                : null;
                            const payerProfile =
                              expense.source === 'manual'
                                ? members.find(
                                    (m) =>
                                      m.user_id ===
                                      manualExpenses.find((me) => me.id === expense.id)?.paid_by
                                  )?.profiles
                                : null;

                            return (
                              <div
                                key={`${expense.source}-${expense.id}`}
                                className="p-4 rounded-xl border bg-card hover:bg-card/90 transition-colors cursor-pointer my-2.5"
                                onClick={() => toggleItemExpansion(expense.id)}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex-1 pr-2">
                                    <div className="font-medium flex items-center gap-2 text-base">
                                      {expense.title}
                                      {expense.source === 'planned' && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-2 py-0.5 rounded-full font-normal text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
                                        >
                                          Planned
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                      <span className="capitalize">
                                        {expense.category || 'Uncategorized'}
                                      </span>

                                      {expense.source === 'manual' && expense.paidBy && (
                                        <>
                                          <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                                          <span>Paid by {expense.paidBy}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p
                                      className={`font-bold text-right text-base ${expense.source === 'planned' ? 'text-muted-foreground italic' : ''}`}
                                    >
                                      {expense.source === 'planned'
                                        ? `${formatCurrency(costPerPerson ?? 0)} (est. pp)`
                                        : formatCurrency(expense.amount ?? 0)}
                                    </p>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full text-muted-foreground"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="mt-4 pt-3 border-t border-dashed space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                      Details
                                    </h4>
                                    {expense.source === 'planned' && (
                                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                        {members.map((member) => (
                                          <div
                                            key={member.user_id}
                                            className="flex items-center gap-2 text-xs bg-muted/30 px-2.5 py-1.5 rounded-lg"
                                          >
                                            <Avatar className="h-5 w-5">
                                              <AvatarImage
                                                src={member.profiles?.avatar_url ?? undefined}
                                              />
                                              <AvatarFallback className="text-xs">
                                                {getInitials(member.profiles?.name ?? '')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span>{formatCurrency(costPerPerson ?? 0)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {expense.source === 'manual' && payerProfile && (
                                      <div className="flex items-center gap-2 text-xs bg-muted/30 px-2.5 py-1.5 rounded-lg w-fit">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={payerProfile.avatar_url ?? undefined} />
                                          <AvatarFallback className="text-xs">
                                            {getInitials(payerProfile.name ?? '')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>Paid {formatCurrency(expense.amount ?? 0)}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                : // No expenses, but generate a week of dates from today for placeholders
                  Array.from({ length: 7 }).map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() + index);
                    const dateKey = date.toISOString().split('T')[0];
                    const displayDate = format(date, 'EEEE, MMM d, yyyy');

                    return (
                      <div key={dateKey}>
                        <h4 className="font-semibold text-base mb-3 sticky top-0 bg-muted/90 backdrop-blur-sm py-2 px-3 rounded-md -mx-2 z-10 flex justify-between">
                          <span>{displayDate}</span>
                          <span className="text-sm font-normal text-muted-foreground">
                            {formatCurrency(0)}
                          </span>
                        </h4>
                        <div className="space-y-2 pl-3 border-l-2 border-dashed ml-1 py-3 opacity-60">
                          <div className="text-center text-muted-foreground text-sm py-2">
                            <span>No expenses logged for this day</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="pt-6 border-t mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-header">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-medium">Budget FAQs</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 py-2">
                    <div>
                      <h4 className="font-medium">How are expenses split?</h4>
                      <p className="text-sm text-muted-foreground">
                        By default, expenses are split equally among all trip members. The member
                        summary shows who has paid what and who owes money to whom.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">How do I add an expense?</h4>
                      <p className="text-sm text-muted-foreground">
                        Click the "Add Expense" button and fill out the form with the expense
                        details, including who paid and the date of the expense.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Can I set a budget limit?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, you can set a budget target by clicking the pencil icon next to the
                        total at the top right of this section.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">How do I export expenses?</h4>
                      <p className="text-sm text-muted-foreground">
                        Currently, you can screenshot this page for your records. We're working on
                        adding CSV export functionality soon.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
