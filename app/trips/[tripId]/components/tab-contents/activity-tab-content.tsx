'use client';

import { ActivityFeed } from '@/components/features/activities/organisms';

interface ActivityTabContentProps {
  tripId: string;
}

export function ActivityTabContent({ tripId }: ActivityTabContentProps) {
  return (
    <div className="w-full">
      <ActivityFeed tripId={tripId} showRefreshButton={true} maxHeight="80vh" />
    </div>
  );
}
