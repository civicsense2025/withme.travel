/**
 * Activity Timeline
 * 
 * Displays a chronological timeline of trip activities with real-time updates
 * 
 * @module trips/organisms
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ActivityItem } from '../molecules/ActivityItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// ============================================================================
// COMPONENT PROPS & TYPES
// ============================================================================

/**
 * Individual activity item structure
 */
export interface Activity {
  id: string;
  type: string;
  created_at: string;
  actor?: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
  target?: {
    id: string;
    name?: string;
    type?: string;
  };
  action: string;
  details?: Record<string, any>;
}

/**
 * Props for the ActivityTimeline component
 */
export interface ActivityTimelineProps {
  /** Trip ID to fetch activities for */
  tripId: string;
  /** Whether to show the refresh button */
  showRefreshButton?: boolean;
  /** Maximum height of the timeline container */
  maxHeight?: string;
  /** Optional click handler for activity */
  onActivityClick?: (activity: Activity) => void;
  /** Optional additional CSS classes */
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Organism: Timeline of trip activities with real-time updates
 */
export function ActivityTimeline({
  tripId,
  showRefreshButton = true,
  maxHeight,
  onActivityClick,
  className,
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const fetchActivities = useCallback(async () => {
    if (!tripId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('trip_activity')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
        .limit(30);
        
      if (error) throw error;
      
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity timeline');
      toast({
        title: 'Error',
        description: 'Failed to load activity timeline',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [tripId, supabase, toast]);
  
  // Setup real-time subscription
  useEffect(() => {
    if (!tripId) return;
    
    fetchActivities();
    
    // Subscribe to updates
    const channel = supabase
      .channel(`trip-activity-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_activity',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          // Add the new activity to the timeline
          setActivities((current) => [payload.new as Activity, ...current]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, supabase, fetchActivities]);
  
  const handleRefresh = () => {
    fetchActivities();
  };
  
  // Render loading state
  if (isLoading && activities.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <div className="flex flex-col gap-2">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="self-start" 
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Render empty state
  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">No activity yet</p>
        {showRefreshButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        )}
      </div>
    );
  }
  
  // Convert activities to ActivityItem props
  const activityItems = activities.map((activity) => ({
    id: activity.id,
    actorName: activity.actor?.name || 'Someone',
    actorAvatarUrl: activity.actor?.avatar_url,
    action: activity.action,
    targetName: activity.target?.name,
    timestamp: new Date(activity.created_at),
    details: activity.details,
  }));
  
  return (
    <div className={className}>
      {showRefreshButton && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </div>
      )}
      
      <div 
        className="flex flex-col gap-3" 
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        {activityItems.map((item, idx) => (
          <ActivityItem
            key={item.id || idx}
            {...item}
            onClick={onActivityClick ? () => onActivityClick(activities[idx]) : undefined}
          />
        ))}
      </div>
    </div>
  );
} 