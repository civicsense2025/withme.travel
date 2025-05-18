'use client';

import { ActivityTimeline } from '@/components/trips/organisms';

interface ActivityTabContentProps {
  tripId: string;
}

export function ActivityTabContent({ tripId }: ActivityTabContentProps) {
  return (
    <div className="w-full">
      <ActivityTimeline tripId={tripId} showRefreshButton={true} maxHeight="80vh" />
    </div>
  );
}
