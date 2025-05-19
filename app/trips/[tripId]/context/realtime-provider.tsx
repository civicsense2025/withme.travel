'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useTripData } from './trip-data-provider';
import { useToast } from '@/hooks/use-toast'

interface RealtimeContextType {
  isRealtimeEnabled: boolean;
  status: 'connected' | 'disconnected' | 'connecting';
  reconnect: () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isRealtimeEnabled: false,
  status: 'disconnected',
  reconnect: () => {},
});

interface RealtimeProviderProps {
  tripId: string;
  children: React.ReactNode;
}

export function RealtimeProvider({ tripId, children }: RealtimeProviderProps) {
  const { refetchTrip, refetchItinerary, refetchMembers } = useTripData();
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const { toast } = useToast();
  const supabase = createClient();

  const setupSubscriptions = useCallback(() => {
    if (!tripId || !supabase) return null;

    setStatus('connecting');

    // Subscribe to trip changes
    const tripChannel = supabase
      .channel(`trip-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${tripId}`,
        },
        () => {
          console.log('[Realtime] Trip updated');
          refetchTrip();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${tripId}`,
        },
        () => {
          console.log('[Realtime] Trip deleted');
          toast({
            title: 'Trip Deleted',
            description: 'This trip has been deleted.',
            variant: 'destructive',
          });
          // Redirect to trips list - handled by parent components
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Trip subscription status: ${status}`);
        setStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    // Subscribe to itinerary changes
    const itineraryChannel = supabase
      .channel(`trip-itinerary-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary_items',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          console.log(`[Realtime] Itinerary ${payload.eventType}:`, payload.new);
          refetchItinerary();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'itinerary_sections',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          console.log(`[Realtime] Section ${payload.eventType}:`, payload.new);
          refetchItinerary();
        }
      )
      .subscribe();

    // Subscribe to member changes
    const membersChannel = supabase
      .channel(`trip-members-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_members',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          console.log(`[Realtime] Member ${payload.eventType}:`, payload.new);
          refetchMembers();
        }
      )
      .subscribe();

    return {
      tripChannel,
      itineraryChannel,
      membersChannel,
    };
  }, [tripId, supabase, refetchTrip, refetchItinerary, refetchMembers, toast, setStatus]);

  useEffect(() => {
    const channels = setupSubscriptions();

    return () => {
      if (channels && supabase) {
        supabase.removeChannel(channels.tripChannel);
        supabase.removeChannel(channels.itineraryChannel);
        supabase.removeChannel(channels.membersChannel);
      }
    };
  }, [tripId, setupSubscriptions, supabase]);

  const reconnect = useCallback(() => {
    const channels = setupSubscriptions();
    if (channels) {
      toast({
        title: 'Reconnecting...',
        description: 'Attempting to reconnect to real-time updates',
      });
    }
  }, [setupSubscriptions, toast]);

  const value = {
    isRealtimeEnabled: status === 'connected',
    status,
    reconnect,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export const useRealtime = () => {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }

  return context;
};
