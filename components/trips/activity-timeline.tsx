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
  RefreshCw
} from 'lucide-react';

interface ActivityTimelineProps {
  tripId: string;
  limit?: number;
  maxHeight?: string;
  showRefreshButton?: boolean;
  className?: string;
}

export function ActivityTimeline({
  tripId,
  limit = 30,
  maxHeight = '600px',
  showRefreshButton = true,
  className = '',
}: ActivityTimelineProps) {
  const { 
    activities, 
    loading, 
    error, 
    pagination, 
    refreshTimeline, 
    loadMore 
  } = useActivityTimeline(tripId, {
    limit,
    pollingInterval: 30000, // 30 seconds
  });
  
  const getActivityIcon = (actionType: ActionType) => {
    switch (actionType) {
      case 'ITINERARY_ITEM_ADDED':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'ITINERARY_ITEM_UPDATED':
        return <Edit className="h-4 w-4 text-blue-500" />;
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
        return <Image className="h-4 w-4 text-blue-500" aria-label="Image uploaded" />;
      case 'TAG_ADDED':
      case 'TAG_REMOVED':
        return <Tag className="h-4 w-4 text-yellow-500" />;
      case 'NOTE_CREATED':
      case 'NOTE_UPDATED':
      case 'NOTE_DELETED':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'FOCUS_INITIATED':
        return <Target className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const getActivityMessage = (activity: ActivityTimelineItem): string => {
    const actorName = activity.actor_name || 'Someone';
    
    switch (activity.action_type) {
      case 'ITINERARY_ITEM_ADDED':
        return `${actorName} added "${activity.details.title || 'an item'}" to the itinerary`;
      case 'ITINERARY_ITEM_UPDATED':
        return `${actorName} updated "${activity.details.title || 'an item'}" in the itinerary`;
      case 'ITINERARY_ITEM_DELETED':
        return `${actorName} removed "${activity.details.title || 'an item'}" from the itinerary`;
      case 'MEMBER_ADDED':
        const memberName = activity.details.name || activity.details.email || 'someone';
        return `${actorName} added ${memberName} to the trip`;
      case 'MEMBER_REMOVED':
        const removedName = activity.details.name || activity.details.email || 'someone';
        return `${actorName} removed ${removedName} from the trip`;
      case 'MEMBER_ROLE_UPDATED':
        const updatedName = activity.details.name || activity.details.email || 'someone';
        const role = activity.details.role || 'a new role';
        return `${actorName} updated ${updatedName}'s role to ${role}`;
      case 'COMMENT_ADDED':
        return `${actorName} added a comment`;
      case 'COMMENT_UPDATED':
        return `${actorName} updated a comment`;
      case 'COMMENT_DELETED':
        return `${actorName} deleted a comment`;
      case 'VOTE_CAST':
        return `${actorName} voted on a poll`;
      case 'IMAGE_UPLOADED':
        return `${actorName} uploaded an image`;
      case 'TAG_ADDED':
        return `${actorName} added a tag: ${activity.details.name || 'a tag'}`;
      case 'TAG_REMOVED':
        return `${actorName} removed a tag: ${activity.details.name || 'a tag'}`;
      case 'NOTE_CREATED':
        return `${actorName} created a note`;
      case 'NOTE_UPDATED':
        return `${actorName} updated a note`;
      case 'NOTE_DELETED':
        return `${actorName} deleted a note`;
      case 'FOCUS_INITIATED':
        return `${actorName} started a focus session on ${activity.details.section_name || 'a section'}`;
      default:
        return `${actorName} updated the trip`;
    }
  };
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error loading activity timeline</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshTimeline}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`border rounded-md ${className}`}>
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <h3 className="font-medium text-sm">Activity Timeline</h3>
        {showRefreshButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshTimeline}
            className="h-7 w-7 p-0"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        )}
      </div>
      
      <ScrollArea style={{ maxHeight }} className="p-0">
        {loading && activities.length === 0 ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No activity yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted/50" aria-hidden="true"></div>
            
            {/* Activity items */}
            <div className="relative space-y-0">
              {activities.map(activity => (
                <div key={activity.id} className="relative pl-10 pr-4 py-3 hover:bg-muted/30">
                  {/* Timeline dot with icon */}
                  <div className="absolute left-4 top-4 flex items-center justify-center z-10">
                    <div className="h-4 w-4 rounded-full bg-background border-2 border-muted flex items-center justify-center">
                      {getActivityIcon(activity.action_type)}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {activity.actor_avatar ? (
                        <AvatarImage 
                          src={activity.actor_avatar} 
                          alt={`${activity.actor_name || 'User'}'s avatar`} 
                        />
                      ) : null}
                      <AvatarFallback>
                        {activity.actor_name?.substring(0, 2).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        {getActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load more button */}
              {pagination.hasMore && (
                <div className="relative py-4 flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={loadMore}
                    disabled={loading}
                    className="relative z-10"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 