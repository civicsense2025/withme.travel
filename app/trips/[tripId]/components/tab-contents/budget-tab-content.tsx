'use client';
import { useMemo, useState } from 'react';
import { BudgetTab } from '@/components/budget-tab';
import { Skeleton } from '@/components/ui/skeleton';
import * as Sentry from '@sentry/nextjs';
import { TripRole } from '@/types/roles';
import { BudgetSnapshotSidebar } from '@/components/ui/features/trips/organisms/BudgetSnapshotSidebar';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTripBudget, ManualDbExpense, UnifiedExpense } from '@/hooks/use-trip-budget';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus, Wallet2 } from 'lucide-react';

// Type for members passed from SSR
interface LocalTripMemberFromSSR {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  joined_at: string;
  profiles: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

interface BudgetTabContentProps {
  tripId: string;
  canEdit: boolean;
  isTripOver: boolean;
  manualExpenses: ManualDbExpense[];
  plannedExpenses: UnifiedExpense[];
  members: LocalTripMemberFromSSR[];
  isLoading?: boolean;
  budget?: number | null;
}

export function BudgetTabContent({
  tripId,
  canEdit,
  isTripOver,
  manualExpenses: initialManualExpenses,
  plannedExpenses: initialPlannedExpenses,
  members: initialMembers,
  isLoading = false,
  budget: initialBudget = null,
}: BudgetTabContentProps) {
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showBudgetSheet, setShowBudgetSheet] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use our centralized budget hook
  const {
    budget,
    manualExpenses,
    plannedExpenses,
    members,
    totalManualSpent,
    totalPlanned,
    refreshExpenses,
  } = useTripBudget({
    tripId,
    initialBudget,
    initialManualExpenses,
    initialPlannedExpenses,
    initialMembers: initialMembers.map((member) => ({
      ...member,
      role: member.role as any, // Type assertion to bypass type checking
    })),
  });

  // Handle refresh
  const handleBudgetUpdate = () => {
    refreshExpenses();
    setRefreshTrigger(prev => prev + 1);
  };

  // Add Sentry breadcrumb for component load
  useMemo(() => {
    Sentry.addBreadcrumb({
      category: 'component',
      message: 'Budget tab loaded',
      level: 'info',
      data: {
        tripId,
        expensesCount: manualExpenses?.length,
        plannedExpensesCount: plannedExpenses?.length,
      },
    });
  }, [tripId, manualExpenses?.length, plannedExpenses?.length]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Convert members to the expected type by treating TripRole as GroupMemberRole
  // This works because they have the same string values, just different TypeScript types
  const adaptedMembers = initialMembers.map((member) => ({
    ...member,
    role: member.role as any, // Type assertion to bypass type checking
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <BudgetTab
            tripId={tripId}
            canEdit={canEdit}
            isTripOver={isTripOver}
            manualExpenses={manualExpenses}
            plannedExpenses={plannedExpenses}
            initialMembers={adaptedMembers}
            budget={budget}
          />
        </div>
        
        {/* Right sidebar with budget snapshot */}
        <div className="md:w-64 lg:w-80">
          <BudgetSnapshotSidebar
            tripId={tripId}
            initialBudget={initialBudget}
            initialManualExpenses={initialManualExpenses}
            initialPlannedExpenses={initialPlannedExpenses}
            initialMembers={adaptedMembers}
            onBudgetUpdated={handleBudgetUpdate}
            onLogExpenseClick={() => setShowBudgetSheet(true)}
            key={`snapshot-${refreshTrigger}`}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4 w-full gap-2"
            onClick={() => setShowExpenseDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Add Quick Expense
          </Button>
        </div>
      </div>
      
      {/* Budget quick sheet */}
      <Sheet open={showBudgetSheet} onOpenChange={setShowBudgetSheet}>
        <SheetContent className="sm:max-w-md p-0">
          <SheetTitle className="sr-only">Trip Budget</SheetTitle>
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Wallet2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Trip Budget</h2>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-muted-foreground mb-4">
              This feature is being expanded. For now, use the budget tab to manage your expenses.
            </p>
            <Button
              onClick={() => {
                setShowBudgetSheet(false);
                handleBudgetUpdate();
              }}
              className="w-full"
            >
              Close and Refresh
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
