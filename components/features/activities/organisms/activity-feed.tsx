/**
 * Activity Feed (Organism)
 *
 * Displays a feed of activities with filtering and pagination.
 *
 * @module activities/organisms
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ActivityItem } from '../molecules/ActivityItem';
import { ActivityFilter, ActivityFilterItem } from '../molecules/ActivityFilter';
import { ActivityType } from '../atoms/activity-icon';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// ============================================================================
// COMPONENT PROPS & TYPES
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
}

export interface ActivityFeedProps {
  /** List of activities to display */
  activities: Activity[];
  /** Whether more activities can be loaded */
  hasMore?: boolean;
  /** Whether activities are currently loading */
  isLoading?: boolean;
  /** Callback to load more activities */
  onLoadMore?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show filter controls */
  showFilters?: boolean;
  /** Title for the feed */
  title?: string;
}

// ============================================================================
// DEFAULT FILTER OPTIONS
// ============================================================================

const DEFAULT_FILTER_OPTIONS: ActivityFilterItem[] = [
  { value: 'all', label: 'All Activities' },
  { value: 'comment_added', label: 'Comments' },
  { value: 'trip_created', label: 'Trip Created' },
  { value: 'trip_updated', label: 'Trip Updated' },
  { value: 'member_added', label: 'Member Added' },
  { value: 'member_removed', label: 'Member Removed' },
  { value: 'item_added', label: 'Item Added' },
  { value: 'expense_added', label: 'Expense Added' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ActivityFeed({
  activities,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  className,
  showFilters = true,
  title = 'Activity Feed',
}: ActivityFeedProps) {
  // State for selected filters
  const [selectedFilters, setSelectedFilters] = useState<(ActivityType | 'all')[]>(['all']);

  // Filter activities based on selected filters
  const filteredActivities = selectedFilters.includes('all')
    ? activities
    : activities.filter((activity) => selectedFilters.includes(activity.type));

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with title and filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>

        {showFilters && (
          <ActivityFilter
            selectedFilters={selectedFilters}
            filterOptions={DEFAULT_FILTER_OPTIONS}
            onFilterChange={setSelectedFilters}
          />
        )}
      </div>

      {/* Activity list */}
      <div className="rounded-md border bg-background">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-muted-foreground">No activities to display</p>
            {isLoading && <Loader2 className="h-6 w-6 animate-spin mt-2" />}
          </div>
        ) : (
          <div className="divide-y">
            {filteredActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                type={activity.type}
                user={activity.user}
                timestamp={activity.timestamp}
                description={activity.description}
                entityName={activity.entityName}
                details={activity.details}
                truncateDescription={true}
              />
            ))}
          </div>
        )}

        {/* Load more button */}
        {hasMore && (
          <div className="p-3 text-center">
            <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
