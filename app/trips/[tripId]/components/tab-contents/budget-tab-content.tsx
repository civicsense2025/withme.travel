'use client';
import { useMemo } from 'react';
import { BudgetTab } from '@/components/budget-tab';

import { Skeleton } from '@/components/ui/skeleton';

import * as Sentry from '@sentry/nextjs';

// Explicitly define TripRole type here to avoid import issues
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

// Define ManualDbExpense type locally (matching definition in page.tsx)
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

// Add source to UnifiedExpense for differentiation
interface UnifiedExpense {
  id: string | number;
  title: string | null;
  amount: number | null;
  currency: string | null;
  category: string | null;
  date: string | null;
  paidBy?: string | null;
  source: 'manual' | 'planned';
}

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
}

export function BudgetTabContent({
  tripId,
  canEdit,
  isTripOver,
  manualExpenses,
  plannedExpenses,
  members,
  isLoading = false,
}: BudgetTabContentProps) {
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

  return (
    <BudgetTab
      tripId={tripId}
      canEdit={canEdit}
      isTripOver={isTripOver}
      manualExpenses={manualExpenses}
      plannedExpenses={plannedExpenses}
      initialMembers={members}
    />
  );
}
