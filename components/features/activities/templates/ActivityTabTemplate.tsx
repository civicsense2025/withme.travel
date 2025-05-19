/**
 * Activity Tab Template
 *
 * A template for the activity tab that displays a feed of trip activities.
 *
 * @module activities/templates
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ActivityFeed, Activity } from '@/components/features/activities/organisms/ActivityFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/use-toast'

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

export interface ActivityTabTemplateProps {
  /** ID of the trip or group to show activities for */
  entityId: string;
  /** Type of entity (trip or group) */
  entityType: 'trip' | 'group';
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ActivityTabTemplate({ entityId, entityType, className }: ActivityTabTemplateProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  // Load activities when component mounts or entityId/entityType changes
  useEffect(() => {
    async function loadActivities() {
      setIsLoading(true);
      try {
        // In a real app, you would call your API here
        // For now, we'll just simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - in real app, replace with API call
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'trip-created',
            user: { id: 'user1', name: 'John Doe', avatarUrl: '' },
            timestamp: new Date().toISOString(),
            description: 'created this trip',
            entityName: 'Summer Vacation',
          },
          {
            id: '2',
            type: 'member-added',
            user: { id: 'user1', name: 'John Doe', avatarUrl: '' },
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            description: 'added {entity} to the trip',
            entityName: 'Jane Smith',
          },
          {
            id: '3',
            type: 'comment-added',
            user: { id: 'user2', name: 'Jane Smith', avatarUrl: '' },
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            description: 'commented on this trip',
            details: 'Looking forward to our adventure!',
          },
          {
            id: '4',
            type: 'expense-added',
            user: { id: 'user1', name: 'John Doe', avatarUrl: '' },
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            description: 'added an expense',
            entityName: 'Hotel Booking',
            details: '$250.00',
          },
        ];

        setActivities(mockActivities);
        setHasMore(false); // For demo purposes, no more activities to load
      } catch (error) {
        console.error('Failed to load activities', error);
        toast({
          title: 'Error',
          description: 'Failed to load activities. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadActivities();
  }, [entityId, entityType, toast]);

  // Handle loading more activities
  const handleLoadMore = async () => {
    setPage((prevPage) => prevPage + 1);
    // In a real app, you would call your API here with the new page
    // For demo purposes, we'll just show no more results
    setHasMore(false);
  };

  return (
    <div className={cn('', className)}>
      {isLoading && activities.length === 0 ? (
        // Loading skeleton
        <ActivityFeedSkeleton />
      ) : (
        <ActivityFeed
          activities={activities}
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
          title={entityType === 'trip' ? 'Trip Activity' : 'Group Activity'}
        />
      )}
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="rounded-md border bg-background divide-y">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
