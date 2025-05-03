'use client';

import { useActivityTimeline } from '@/hooks/use-activity-timeline';
import { ActivityTimelineItem, ActionType } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import {
  Plus,
  X,
  Edit,
  User,
  Users,
  MessageCircle,
  Check,
  Vote,
  Image,
  Tag,
  FileText,
  Target,
  Clock,
  RefreshCw,
  History,
  Map,
  Calendar,
  Bookmark,
  ExternalLink,
} from 'lucide-react';

// Extend ActionType to include trip history action types
type ExtendedActionType =
  | ActionType
  | 'TRIP_VISITED'
  | 'TRIP_PLANNED'
  | 'TRAVEL_HISTORY_ADDED'
  | 'DESTINATION_VISITED'
  | 'DESTINATION_RATED';

interface ActivityTimelineProps {
  tripId: string;
  limit?: number;
  maxHeight?: string;
  showRefreshButton?: boolean;
  className?: string;
  useTripHistory?: boolean;
}

// Updated TripHistoryItem interface to match new schema
interface TripHistoryItem {
  id: string;
  trip_id: string;
  user_id: string | null;
  action_type: ExtendedActionType;
  details: any;
  created_at: string;
  profiles?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

// Simplified mock implementation for now - we'll use the regular activity timeline
// until the trip_history data is fully integrated
const useTripHistoryData = (tripId: string, options: { limit: number }) => {
  const { activities, loading, error, refreshTimeline, loadMore, pagination } = useActivityTimeline(
    tripId,
    options
  );

  return {
    historyItems: activities as unknown as TripHistoryItem[],
    loading,
    error,
    refreshHistory: refreshTimeline,
    loadMore,
  };
};

export function ActivityTimeline({
  tripId,
  limit = 5,
  maxHeight = '600px',
  showRefreshButton = true,
  className = '',
  useTripHistory = false,
}: ActivityTimelineProps) {
  const { activities, loading, error, refreshTimeline, loadMore, pagination } = useActivityTimeline(
    tripId,
    { limit }
  );

  const {
    historyItems,
    loading: historyLoading,
    error: historyError,
    refreshHistory,
    loadMore: loadMoreHistory,
  } = useTripHistoryData(tripId, { limit });

  const displayActivities = useTripHistory ? historyItems : activities;
  const isLoading = useTripHistory ? historyLoading : loading;
  const hasError = useTripHistory ? historyError : error;
  const refresh = useTripHistory ? refreshHistory : refreshTimeline;
  const loadMoreItems = useTripHistory ? loadMoreHistory : loadMore;

  const getActivityIcon = (actionType: ExtendedActionType) => {
    switch (actionType) {
      case 'ITINERARY_ITEM_ADDED':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'ITINERARY_ITEM_UPDATED':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ITINERARY_ITEM_DELETED':
        return <X className="h-4 w-4 text-red-500" />;
      case 'MEMBER_ADDED':
        return <User className="h-4 w-4 text-green-500" />;
      case 'MEMBER_REMOVED':
        return <User className="h-4 w-4 text-red-500" />;
      case 'MEMBER_ROLE_UPDATED':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'COMMENT_ADDED':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'COMMENT_UPDATED':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'COMMENT_DELETED':
        return <MessageCircle className="h-4 w-4 text-red-500" />;
      case 'VOTE_CAST':
        return <Vote className="h-4 w-4 text-indigo-500" />;
      case 'ACCESS_REQUEST_UPDATED':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'IMAGE_UPLOADED':
        return <Image className="h-4 w-4 text-blue-500" aria-hidden="true" />;
      case 'TAG_ADDED':
      case 'TAG_REMOVED':
        return <Tag className="h-4 w-4 text-yellow-500" />;
      case 'NOTE_CREATED':
      case 'NOTE_UPDATED':
      case 'NOTE_DELETED':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'FOCUS_INITIATED':
        return <Target className="h-4 w-4 text-red-500" />;
      // Trip history specific icons
      case 'TRIP_VISITED':
      case 'TRAVEL_HISTORY_ADDED':
        return <History className="h-4 w-4 text-green-500" />;
      case 'TRIP_PLANNED':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'DESTINATION_VISITED':
        return <Map className="h-4 w-4 text-purple-500" />;
      case 'DESTINATION_RATED':
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAvatarInitials = (name?: string | null): string => {
    if (!name || name === 'Unknown' || name === 'System') {
      return 'U';
    }

    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const getBgColorFromName = (name: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-teal-500',
      'bg-orange-500',
    ];

    // Generate a color based on the name
    const hashCode = name.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hashCode % colors.length];
  };

  // Helper function to check if an object is a TripHistoryItem
  const isTripHistoryItem = (
    item: ActivityTimelineItem | TripHistoryItem
  ): item is TripHistoryItem => {
    return 'profiles' in item;
  };

  // Helper function to get the actor name from any activity item
  const getActorName = (item: ActivityTimelineItem | TripHistoryItem): string => {
    if (isTripHistoryItem(item)) {
      return item.profiles?.name && !item.profiles.name.toLowerCase().includes('unknown')
        ? item.profiles.name
        : 'You';
    } else {
      return item.actor_name && !item.actor_name.toLowerCase().includes('unknown')
        ? item.actor_name
        : 'You';
    }
  };

  // Helper function to get the actor avatar from any activity item
  const getActorAvatar = (item: ActivityTimelineItem | TripHistoryItem): string | null => {
    if (isTripHistoryItem(item)) {
      return item.profiles?.avatar_url || null;
    } else {
      return item.actor_avatar || null;
    }
  };

  const getActivityMessage = (activity: ActivityTimelineItem | TripHistoryItem): string => {
    // Get actor name using the helper function
    const actorName = getActorName(activity);
    const actionType = activity.action_type;
    const details = activity.details || {};

    // Handle standard activity types
    if (actionType === 'ITINERARY_ITEM_ADDED') {
      return `${actorName} added "${details.title || 'an item'}" to the itinerary`;
    }
    if (actionType === 'ITINERARY_ITEM_UPDATED') {
      return `${actorName} updated "${details.title || 'an item'}" in the itinerary`;
    }
    if (actionType === 'ITINERARY_ITEM_DELETED') {
      return `${actorName} removed "${details.title || 'an item'}" from the itinerary`;
    }
    if (actionType === 'MEMBER_ADDED') {
      const memberName = details.name || details.email || 'someone';
      return `${actorName} added ${memberName} to the trip`;
    }
    if (actionType === 'MEMBER_REMOVED') {
      const removedName = details.name || details.email || 'someone';
      return `${actorName} removed ${removedName} from the trip`;
    }
    if (actionType === 'MEMBER_ROLE_UPDATED') {
      const updatedName = details.name || details.email || 'someone';
      const role = details.role || 'a new role';
      return `${actorName} updated ${updatedName}'s role to ${role}`;
    }
    if (actionType === 'COMMENT_ADDED') {
      return `${actorName} added a comment`;
    }
    if (actionType === 'COMMENT_UPDATED') {
      return `${actorName} updated a comment`;
    }
    if (actionType === 'COMMENT_DELETED') {
      return `${actorName} deleted a comment`;
    }
    if (actionType === 'VOTE_CAST') {
      return `${actorName} cast a vote`;
    }
    if (actionType === 'ACCESS_REQUEST_UPDATED') {
      return `${actorName} updated an access request`;
    }
    if (actionType === 'IMAGE_UPLOADED') {
      return `${actorName} uploaded an image`;
    }
    if (actionType === 'TAG_ADDED') {
      return `${actorName} added a tag: "${details.name || 'a tag'}"`;
    }
    if (actionType === 'TAG_REMOVED') {
      return `${actorName} removed a tag: "${details.name || 'a tag'}"`;
    }
    if (actionType === 'NOTE_CREATED') {
      return `${actorName} created a note`;
    }
    if (actionType === 'NOTE_UPDATED') {
      return `${actorName} updated a note`;
    }
    if (actionType === 'NOTE_DELETED') {
      return `${actorName} deleted a note`;
    }
    if (actionType === 'FOCUS_INITIATED') {
      return `${actorName} started a focus session on "${details.section_name || 'a section'}"`;
    }

    // Trip history action types
    if (actionType === 'TRIP_VISITED') {
      return `${actorName} visited "${details.destination || 'a destination'}"`;
    }
    if (actionType === 'TRIP_PLANNED') {
      return `${actorName} planned a trip to "${details.destination || 'a destination'}"`;
    }
    if (actionType === 'TRAVEL_HISTORY_ADDED') {
      return `${actorName} added travel history for "${details.destination || 'a destination'}"`;
    }
    if (actionType === 'DESTINATION_VISITED') {
      return `${actorName} visited "${details.destination || 'a destination'}"`;
    }
    if (actionType === 'DESTINATION_RATED') {
      const rating = details.rating ? `${details.rating}/5` : '';
      return `${actorName} rated "${details.destination || 'a destination'}" ${rating}`;
    }

    // Default case
    return `${actorName} updated the trip`;
  };

  const renderTripHistoryItem = (historyItem: TripHistoryItem) => {
    const userName = historyItem.profiles?.name || 'Someone';
    return (
      <div key={historyItem.id} className="relative pl-10 pr-4 py-3 hover:bg-muted/30">
        <div className="absolute left-4 top-4 flex items-center justify-center z-10">
          <div className="h-4 w-4 rounded-full bg-background border-2 border-muted flex items-center justify-center">
            <Map className="h-4 w-4 text-blue-500" />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            {historyItem.profiles?.avatar_url ? (
              <AvatarImage src={historyItem.profiles.avatar_url} alt={`${userName}'s avatar`} />
            ) : null}
            <AvatarFallback>{userName.substring(0, 2).toUpperCase() || '?'}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm">
              {`${userName} traveled to ${historyItem.details.destination || 'a destination'}`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(historyItem.created_at), { addSuffix: true })}
            </p>
            {historyItem.details.notes && (
              <p className="text-xs mt-1 text-muted-foreground">{historyItem.details.notes}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (hasError) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error loading activity timeline</p>
        <Button variant="outline" size="sm" onClick={refresh} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  const hasContent = displayActivities.length > 0;

  return (
    <div className={`border rounded-md relative overflow-hidden ${className}`}>
      <div className="px-4 py-3 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-medium">Activity Timeline</h3>
        {showRefreshButton && (
          <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      <ScrollArea className="relative" style={{ maxHeight }}>
        {hasError && (
          <div className="p-4 text-center text-red-500">
            Failed to load activity. Please try again.
          </div>
        )}

        {isLoading && displayActivities.length === 0 ? (
          // Show loading skeletons only on initial load
          <div className="space-y-4 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : useTripHistory ? (
          // Trip history content (placeholder)
          <div className="p-4 space-y-1">
            {historyItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-6">No activity history yet</div>
            ) : (
              historyItems.map((historyItem) => renderTripHistoryItem(historyItem))
            )}
          </div>
        ) : displayActivities.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">No activity yet</div>
        ) : (
          <div className="p-4 space-y-1">
            {displayActivities.map((activity) => (
              <div
                key={activity.id}
                className="relative pl-10 pr-4 py-3 hover:bg-muted/30 border-b border-muted/50 last:border-0"
              >
                <div className="absolute left-4 top-4 flex items-center justify-center z-10">
                  <div className="h-4 w-4 flex items-center justify-center">
                    {getActivityIcon(activity.action_type as ExtendedActionType)}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={getActorAvatar(activity) || ''}
                      alt={`${getActorName(activity) || 'User'}'s avatar`} />
                    <AvatarFallback
                      className={`text-white ${
                        getActorName(activity)
                          ? getActorName(activity).toLowerCase().includes('admin')
                            ? 'bg-red-500'
                            : getActorName(activity).toLowerCase().includes('system')
                              ? 'bg-gray-500'
                              : getBgColorFromName(getActorName(activity))
                          : 'bg-blue-500'
                      }`}>
                      {getAvatarInitials(getActorName(activity) || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination loading indicator */}
        {isLoading && displayActivities.length > 0 && (
          <div className="py-3 text-center">
            <Skeleton className="h-6 w-32 mx-auto" />
          </div>
        )}

        {/* Load more button */}
        {!isLoading && pagination.hasMore && (
          <div className="p-4 text-center border-t">
            <Button variant="outline" size="sm" onClick={loadMoreItems} className="w-full">
              Load More ({pagination.total - displayActivities.length} remaining)
            </Button>
          </div>
        )}

        {/* Pagination summary */}
        {!isLoading && !pagination.hasMore && displayActivities.length > 0 && (
          <div className="p-3 text-center text-xs text-muted-foreground border-t">
            Showing all {displayActivities.length} of {pagination.total} activities
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
