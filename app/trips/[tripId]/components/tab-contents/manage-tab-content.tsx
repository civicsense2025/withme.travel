'use client';
import { useEffect, useState } from 'react';
import { MembersTab, TripMemberFromSSR } from '@/components/features/trips/molecules/MembersTab';
import { Skeleton } from '@/components/ui/skeleton';
import * as Sentry from '@sentry/nextjs';
import { TripRole } from '@/types/roles';
import { useTripManagement, adaptTripMembersToSSR } from '@/lib/hooks/use-trip-management';

interface ManageTabContentProps {
  tripId: string;
  canEdit: boolean;
  userRole: TripRole | null;
}

export function ManageTabContent({ tripId, canEdit, userRole }: ManageTabContentProps) {
  const {
    members,
    isLoadingMembers,
    membersError,
    addMember,
    updateMemberRole,
    removeMember,
    sendInvitation,
    refreshMembers,
    accessRequests,
    isLoadingAccessRequests,
    accessRequestsError,
    respondToRequest,
    refreshAccessRequests,
    transferOwnership,
    isOperationInProgress,
  } = useTripManagement(tripId);

  // Track component load in Sentry
  useEffect(() => {
    try {
      Sentry.addBreadcrumb({
        category: 'component',
        message: 'Manage tab loaded',
        level: 'info',
        data: {
          tripId,
          canEdit,
          userRole,
          membersCount: members?.length,
        },
      });
    } catch (error) {
      console.error('Error in ManageTabContent init:', error);
      Sentry.captureException(error, {
        tags: { component: 'ManageTabContent', tripId },
      });
    }
  }, [tripId, canEdit, userRole, members?.length]);

  if (isLoadingMembers) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (membersError) {
    return <div className="text-red-500 p-4">{membersError}</div>;
  }

  const adaptedMembers = adaptTripMembersToSSR(members);

  return (
    <MembersTab
      tripId={tripId}
      canEdit={canEdit}
      userRole={userRole}
      initialMembers={adaptedMembers as unknown as TripMemberFromSSR[]}
    />
  );
}
