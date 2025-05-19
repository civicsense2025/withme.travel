'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the ActivityTimeline component
const ActivityFeed = lazy(() =>
  import('@/components/features/activities/organisms/activity-feed').then((mod) => ({
    default: mod.ActivityFeed,
  }))
);

interface HistoryTabContentProps {
  tripId: string;
}

export function HistoryTabContent({ tripId }: HistoryTabContentProps) {
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration completes before attempting to render the lazy component
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full">
      {isClient ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              <span>Loading trip history...</span>
            </div>
          }
        >
          <ActivityFeed tripId={tripId} showRefreshButton={true} maxHeight="80vh" />
        </Suspense>
      ) : (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin w-6 h-6 mr-2" />
          <span>Initializing...</span>
        </div>
      )}
    </div>
  );
}
