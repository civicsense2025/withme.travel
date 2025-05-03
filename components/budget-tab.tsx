'use client';
import { BUDGET_CATEGORIES, SPLIT_TYPES } from '@/utils/constants/status';
import { API_ROUTES } from '@/utils/constants/routes';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
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
} from 'lucide-react';
import { format, parseISO } from 'date-fns'; // Import date-fns functions

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

// Define ManualDbExpense type locally (if not imported)
interface ManualDbExpense {
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

// Define a unified expense type for rendering
interface UnifiedExpense {
  id: string | number;
  title: string | null;
  amount: number | null;
  currency: string | null;
  category: string | null;
  date: string | null;
  paidBy?: string | null;
  source: 'manual' | 'planned'; // Added source
}

interface BudgetTabProps {
  tripId: string;
  canEdit?: boolean;
  isTripOver?: boolean;
  manualExpenses: ManualDbExpense[];
  plannedExpenses: UnifiedExpense[];
  initialMembers: TripMemberFromSSR[];
}

export function BudgetTab({
  tripId,
  canEdit = false,
  isTripOver = false,
  manualExpenses,
  plannedExpenses,
  initialMembers,
}: BudgetTabProps) {
  const { toast } = useToast();

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

  // Restore paidByMemberTotals calculation (uses manualExpenses & members)
  const paidByMemberTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    manualExpenses.forEach((expense) => {
      const paidById = expense.paid_by;
      totals[paidById] = (totals[paidById] || 0) + Number(expense.amount);
    });
    return members
      .map((member) => ({
        id: member.user_id,
        name: member.profiles?.name || 'Unknown User',
        totalPaid: totals[member.user_id] || 0
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid);
  }, [manualExpenses, members]);

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

  const toggleItemExpansion = (itemId: string | number) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Define loading (can be made dynamic later if needed)
  const loading = false;

  if (loading) {
    return <div className="py-8 text-center">Loading budget...</div>;
  }

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Trip Finances</CardTitle>
          <CardDescription>Keep track of trip expenses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b pb-4">
            <Badge variant="secondary">Total Planned: {formatCurrency(totalPlanned)}</Badge>
            <Badge variant="secondary">Total Logged: {formatCurrency(totalManualSpent)}</Badge>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Expense Log</h3>
              <Badge variant="outline" className="ml-2">
                {Object.values(groupedExpenses).flat().length} items
              </Badge>
            </div>
            {sortedDateKeys.length > 0 ? (
              <div className="space-y-4 border rounded-md p-3 bg-muted/20">
                {sortedDateKeys.map((dateKey) => {
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

                  return (
                    <div key={dateKey}>
                      <h4 className="font-semibold text-md mb-2 sticky top-0 bg-muted/90 backdrop-blur-sm py-1 px-2 rounded-sm -mx-2 z-10">
                        {displayDate}
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
                              className="p-3 rounded-md border bg-card hover:bg-card/90 transition-colors cursor-pointer"
                              onClick={() => toggleItemExpansion(expense.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1 pr-2">
                                  <div className="font-medium flex items-center gap-2">
                                    {expense.title}
                                    {expense.source === 'planned' && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs font-normal text-blue-600 border-blue-200 bg-blue-50"
                                      >
                                        Planned
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    <span>{expense.category || 'Uncategorized'}</span>
                                    
                                    {/* Handle null dates and formatting separately */}
                                    <span>
                                      {expense.date ? (
                                        <> • {(() => {
                                          try {
                                            return format(new Date(expense.date), 'MMM d, yyyy');
                                          } catch {
                                            return 'Invalid date';
                                          }
                                        })()}</>
                                      ) : null}
                                    </span>
                                    
                                    {expense.source === 'manual' && expense.paidBy && (
                                      <>
                                        <span> • </span>
                                        <span>Paid by {expense.paidBy}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p
                                    className={`font-bold text-right ${expense.source === 'planned' ? 'text-muted-foreground italic' : ''}`}
                                  >
                                    {expense.source === 'planned'
                                      ? `${formatCurrency(costPerPerson ?? 0)} (est. pp)`
                                      : formatCurrency(expense.amount ?? 0)}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground"
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
                                <div className="mt-3 pt-3 border-t border-dashed space-y-2">
                                  <h4 className="text-sm font-medium text-muted-foreground">
                                    Details
                                  </h4>
                                  {expense.source === 'planned' && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                      {members.map((member) => (
                                        <div
                                          key={member.user_id}
                                          className="flex items-center gap-1 text-xs"
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
                                    <div className="flex items-center gap-2 text-xs">
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
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                <DollarSign className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No expenses logged or planned yet.</p>
              </div>
            )}
          </div>

          {/* Restore Paid by Member Card (Optional display) */}
          {paidByMemberTotals.filter((m) => m.totalPaid > 0).length > 0 && (
            <div className="pt-4 border-t mt-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Users className="h-5 w-5 mr-2 text-muted-foreground" /> Paid by Member Summary
              </h3>
              <ul className="space-y-2 text-sm">
                {paidByMemberTotals
                  .filter((m) => m.totalPaid > 0)
                  .map((member) => (
                    <li key={member.id} className="flex justify-between items-center">
                      <span>{member.name}</span>
                      <span className="font-medium">{formatCurrency(member.totalPaid)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}