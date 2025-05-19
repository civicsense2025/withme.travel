/**
 * Activities Hook
 *
 * Custom React hook for managing activities data with API integration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ActivityType } from '@/components/features/activities/types';
import { listActivities } from '../client/activities';

// ============================================================================
// TYPES
// ============================================================================

export interface Activity {
  id: string;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  timestamp: string;
  description: string;
  entityName?: string;
  details?: string;
  entityId?: string;
  entityType?: string;
}

export interface UseActivitiesParams {
  /** ID of the entity (trip/group) */
  entityId: string;
  /** Type of entity */
  entityType: 'trip' | 'group';
  /** Whether to fetch on mount */
  fetchOnMount?: boolean;
  /** Maximum activities to fetch */
  limit?: number;
}

// ============================================================================
// HOOK
// ============================================================================

export function useActivities({
  entityId,
  entityType,
  fetchOnMount = true,
  limit = 20,
}: UseActivitiesParams) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<(ActivityType | 'all')[]>(['all']);

  const { toast } = useToast();

  // Fetch activities from the API
  const fetchActivities = useCallback(
    async (pageNum = 1, replace = true) => {
      if (!entityId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Construct API endpoint based on entity type
        const endpoint =
          entityType === 'trip'
            ? `/api/trips/${entityId}/activity?page=${pageNum}&limit=${limit}`
            : `/api/groups/${entityId}/activity?page=${pageNum}&limit=${limit}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Error fetching activities: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform API response to match our component format
        const transformedActivities: Activity[] = data.activities.map((activity: any) => ({
          id: activity.id,
          type: activity.activity_type || 'default',
          user: {
            id: activity.user_id,
            name: activity.user_name || 'Anonymous',
            avatarUrl: activity.user_avatar_url,
          },
          timestamp: activity.created_at,
          description: activity.description || '',
          entityName: activity.entity_name,
          details: activity.details,
          entityId: activity.entity_id,
          entityType: activity.entity_type,
        }));

        // Update state
        if (replace) {
          setActivities(transformedActivities);
        } else {
          setActivities((prev) => [...prev, ...transformedActivities]);
        }

        // Check if more items are available
        setHasMore(transformedActivities.length === limit);
        setPage(pageNum);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
        toast({
          title: 'Error',
          description: 'Failed to load activities',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [entityId, entityType, limit, toast]
  );

  // Load more activities
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchActivities(page + 1, false);
    }
  }, [fetchActivities, hasMore, isLoading, page]);

  // Filter activities by type
  const filterActivities = useCallback(
    (filters: (ActivityType | 'all')[]) => {
      setActiveFilters(filters);

      if (filters.includes('all')) {
        setFilteredActivities(activities);
        return;
      }

      const filtered = activities.filter((activity) => filters.includes(activity.type));

      setFilteredActivities(filtered);
    },
    [activities]
  );

  // Fetch activities on mount
  useEffect(() => {
    if (fetchOnMount && entityId) {
      fetchActivities(1, true);
    }
  }, [fetchOnMount, entityId, fetchActivities]);

  // Apply filters whenever activities change
  useEffect(() => {
    filterActivities(activeFilters);
  }, [activities, activeFilters, filterActivities]);

  return {
    activities: filteredActivities,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh: () => fetchActivities(1, true),
    filterActivities,
  };
}
