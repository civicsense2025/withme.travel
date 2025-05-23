import { useState, useEffect, useCallback } from 'react';

interface ActivityTimelineOptions {
  limit?: number;
  pollingInterval?: number | null;
  autoRefresh?: boolean;
}

interface PaginationState {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

interface ActivityTimelineReturn {
  activities: ActivityTimelineItem[];
  loading: boolean;
  error: Error | null;
  pagination: PaginationState;
  refreshTimeline: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// Local type definition for ActivityTimelineItem (formerly from notifications types)
export interface ActivityTimelineItem {
  id: string;
  trip_id: string;
  user_id: string | null;
  action_type: string;
  details: any;
  created_at: string;
  actor_name?: string;
  actor_avatar?: string | null;
}

export function useActivityTimeline(
  tripId: string | undefined,
  options: ActivityTimelineOptions = {}
): ActivityTimelineReturn {
  const {
    limit = 5,
    pollingInterval = 60000, // 1 minute by default, set to null to disable
    autoRefresh = true,
  } = options;

  const [activities, setActivities] = useState<ActivityTimelineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    total: 0,
    offset: 0,
    limit,
    hasMore: false,
  });

  const fetchTimeline = useCallback(
    async (offset = 0, append = false) => {
      if (!tripId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        });

        const response = await fetch(`/api/trips/${tripId}/activity?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch activity timeline');
        }

        const data = await response.json();
        const newActivities = data.activity || [];

        if (append) {
          // Append new items to existing ones
          setActivities((prev) => [...prev, ...newActivities]);
        } else {
          // Replace existing items
          setActivities(newActivities);
        }

        // Check if pagination data exists and has the expected structure
        const paginationData = data.pagination || {};
        const total = typeof paginationData.total === 'number' ? paginationData.total : 0;
        const newOffset = typeof paginationData.offset === 'number' ? paginationData.offset : 0;
        const newLimit = typeof paginationData.limit === 'number' ? paginationData.limit : limit;

        // Update pagination state with safe values
        setPagination({
          total,
          offset: newOffset,
          limit: newLimit,
          hasMore: newOffset + newActivities.length < total,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error fetching activity timeline:', err);
      } finally {
        setLoading(false);
      }
    },
    [tripId, limit]
  );

  // Function to refresh the timeline
  const refreshTimeline = useCallback(async () => {
    return await fetchTimeline(0, false);
  }, [fetchTimeline]);

  // Function to load more items
  const loadMore = useCallback(async () => {
    if (loading || !pagination.hasMore) return;

    await fetchTimeline(pagination.offset + pagination.limit, true);
  }, [fetchTimeline, loading, pagination]);

  // Initial data fetch
  useEffect(() => {
    if (tripId) {
      refreshTimeline();
    }
  }, [tripId, refreshTimeline]);

  // Set up polling for auto-refresh if enabled
  useEffect(() => {
    if (!tripId || !autoRefresh || !pollingInterval) return;

    const interval = setInterval(() => {
      return refreshTimeline();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [tripId, refreshTimeline, autoRefresh, pollingInterval]);

  return {
    activities,
    loading,
    error,
    pagination,
    refreshTimeline,
    loadMore,
  };
}
