'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the ActivityFeed component
const ActivityFeed = lazy(() =>
  import('@/components/features/activities/organisms/ActivityFeed').then((mod) => ({
    default: mod.ActivityFeed,
  }))
);

interface HistoryTabContentProps {
  tripId: string;
}

// Placeholder for fetching activities
function useTripActivities(tripId: string) {
  // Replace with real fetching logic
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate async fetch
    setTimeout(() => {
      setActivities([]); // TODO: Replace with real data
      setIsLoading(false);
    }, 1000);
  }, [tripId]);

  return { activities, isLoading };
}

export function HistoryTabContent({ tripId }: HistoryTabContentProps) {
  const [isClient, setIsClient] = useState(false);
  const { activities, isLoading } = useTripActivities(tripId);

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
          <ActivityFeed activities={activities} isLoading={isLoading} />
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
