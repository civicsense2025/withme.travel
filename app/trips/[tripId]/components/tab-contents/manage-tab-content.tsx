'use client';
import { useEffect, useState } from 'react';
import { MembersTab } from '@/components/members-tab';

import { Skeleton } from '@/components/ui/skeleton';


import * as Sentry from '@sentry/nextjs';

// Explicitly define TripRole type here to avoid import issues
type TripRole = 'admin' | 'editor' | 'viewer' | 'contributor';

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

interface ManageTabContentProps {
  tripId: string;
  canEdit: boolean;
  userRole: TripRole | null;
  members: LocalTripMemberFromSSR[];
}

export function ManageTabContent({ tripId, canEdit, userRole, members }: ManageTabContentProps) {
  const [isLoading, setIsLoading] = useState(true);

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

      // Simulate loading state for SSR hydration
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    } catch (error) {
      console.error('Error in ManageTabContent init:', error);
      Sentry.captureException(error, {
        tags: { component: 'ManageTabContent', tripId },
      });
      setIsLoading(false);
    }
  }, [tripId, canEdit, userRole, members?.length]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <MembersTab tripId={tripId} canEdit={canEdit} userRole={userRole} initialMembers={members} />
  );
}