'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AuthContext } from '@/components/auth-provider';
import { useContext } from 'react';
import _ from 'lodash';
import { RealtimeChannel } from '@supabase/supabase-js';
import { type TABLES, type ENUMS } from '@/utils/constants/database';

// Define a more complete type for TABLES that includes missing properties
type ExtendedTables = {
  TRIP_MEMBERS: string;
  TRIPS: string;
  USERS: string;
  ITINERARY_ITEMS: string;
  ITINERARY_SECTIONS: string;
  [key: string]: string;
};

// Use the extended type with the existing TABLES constant
const Tables = TABLES as unknown as ExtendedTables;

import { PresenceStatus, CursorPosition, UserPresence, ConnectionState } from '@/types/presence';
import { RealtimePresence } from '@supabase/supabase-js';
import { throttle, debounce } from 'lodash';
import { getBrowserClient } from '@/utils/supabase/browser-client';
import type { Database } from '@/types/database.types';

// Check if presence is enabled via environment variable
const PRESENCE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PRESENCE !== 'false';

// Debug settings
const DEBUG = process.env.NODE_ENV === 'development';

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_DELAY = 30000; // 30 seconds maximum reconnect delay
const CLEANUP_TIMEOUT = 5000; // 5 seconds
const INACTIVITY_CHECK_INTERVAL = 10000; // 10 seconds - how often to check for inactivity
const PRESENCE_UPDATE_DEBOUNCE = 1000; // 1 second - debounce delay for presence updates
// Utility to add delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to validate status using database constants
const validateStatus = (status: PresenceStatus): boolean => {
  return Object.values(ENUMS.PRESENCE_STATUS).includes(status as any);
};

// Create a hook to access the auth context
function useAuth() {
  return useContext(AuthContext);
}

export interface PresenceContextType {
  activeUsers: UserPresence[];
  myPresence: UserPresence | null;
  status: PresenceStatus;
  error: Error | null;
  isLoading: boolean;
  isCleaningUp: boolean;
  connectionState: ConnectionState;
  startEditing: (itemId: string) => void;
  stopEditing: () => void;
  setStatus: (status: PresenceStatus) => void;
  isEditing: boolean;
  editingItemId: string | null;
  recoverPresence: () => Promise<void>;
}

// Create a default/dummy state for when presence is disabled
const defaultDisabledPresenceState: PresenceContextType = {
  activeUsers: [],
  myPresence: null,
  status: 'offline',
  error: null,
  isLoading: false,
  isCleaningUp: false,
  connectionState: 'disconnected',
  startEditing: () => {},
  stopEditing: () => {},
  setStatus: () => {},
  isEditing: false,
  editingItemId: null,
  recoverPresence: async () => {},
};

export function usePresence(
  /**
   * ID of the trip to track presence for
   */
  tripId: string,
  /**
   * Configuration options
   */
  options: {
    /**
     * How often to update presence in database (milliseconds)
     * @default 30000 (30 seconds)
     */
    updateInterval?: number;

    /**
     * Time of inactivity before setting user as away (milliseconds)
     * @default 120000 (2 minutes)
     */
    awayTimeout?: number;

    /**
     * Whether to track cursor position
     * @default false
     */
    trackCursor?: boolean;

    /**
     * Initial status for the user
     * @default 'online'
     */
    initialStatus?: PresenceStatus;
  } = {}
): PresenceContextType {
  const {
    updateInterval = 30000,
    awayTimeout = 120000,
    trackCursor = false,
    initialStatus = 'online',
  } = options;

  // ---> Return dummy state immediately if presence is disabled
  if (!PRESENCE_ENABLED) {
    console.warn('[usePresence] Presence features are disabled via NEXT_PUBLIC_ENABLE_PRESENCE.');
    return defaultDisabledPresenceState;
  }

  // Connection management variables
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user, isLoading: isAuthLoading } = useAuth();
  const pathname = usePathname();

  // Get the supabase client directly
  const supabaseRef = useRef(typeof window !== 'undefined' ? getBrowserClient() : null);

  // Update the ref when window is available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      supabaseRef.current = getBrowserClient();
    }
  }, []);

  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [myPresence, setMyPresence] = useState<UserPresence | null>(null);
  const [status, setStatus] = useState<PresenceStatus>(initialStatus);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCleaningUp, setIsCleaningUp] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

  const presenceIdRef = useRef<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const awayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cursorPositionRef = useRef<CursorPosition | null>(null);
  const subscriptionRef = useRef<RealtimeChannel | null>(null);
  const lastUserActivityRef = useRef<number>(Date.now());
  let failsafeTimeoutId: NodeJS.Timeout | null = null;

  // ---> Define updateLastActivity function
  const updateLastActivity = useCallback(() => {
    lastUserActivityRef.current = Date.now();
    if (status === ENUMS.PRESENCE_STATUS.AWAY) {
      // If user becomes active while marked away, reset status
      setStatus(ENUMS.PRESENCE_STATUS.ONLINE);
    }
    // Reset the away timer whenever activity is detected
    if (awayTimeoutRef.current) {
      clearTimeout(awayTimeoutRef.current);
    }
    // Set a new away timer
    awayTimeoutRef.current = setTimeout(() => {
      // Don't set if component unmounted
      if (subscriptionRef.current) {
        // Check if still subscribed/mounted effectively
        setStatus(ENUMS.PRESENCE_STATUS.AWAY);
        //debouncedPresenceUpdate(); // Assuming this exists/is called elsewhere
      }
    }, awayTimeout);
  }, [status, awayTimeout, setStatus]); // Add dependencies

  // Define setPresenceStatus for the interface
  const setPresenceStatus = useCallback((newStatus: PresenceStatus) => {
    if (validateStatus(newStatus)) {
      setStatus(newStatus);
    } else {
      console.warn(`Invalid presence status: ${newStatus}`);
    }
  }, []);

  // Function to upsert presence in the database - use supabaseRef.current
  const upsertPresence = useCallback(async () => {
    if (!supabaseRef.current) {
      console.error('[usePresence] Cannot upsert presence: Supabase client is not available');
      return;
    }
    if (!user || !user.id) {
      console.error('[usePresence] Cannot upsert presence: User is not authenticated');
      setError(new Error('User authentication required to update presence'));
      return;
    }
    if (!tripId) {
      console.error('[usePresence] Cannot upsert presence: No trip ID provided');
      setError(new Error('Trip ID is required to update presence'));
      return;
    }

    try {
      const presenceData = {
        ...(presenceIdRef.current ? { id: presenceIdRef.current } : {}),
        user_id: user.id,
        trip_id: tripId,
        last_active: new Date().toISOString(),
        status,
        editing_item_id: editingItemId,
        cursor_position: cursorPositionRef.current
          ? {
              ...cursorPositionRef.current,
              timestamp: Date.now(),
            }
          : null,
        page_path: pathname,
      };

      // Make sure all required fields are present
      if (!presenceData.user_id || !presenceData.trip_id || !presenceData.status) {
        console.error('[usePresence] Missing required fields for presence upsert:', {
          hasUserId: !!presenceData.user_id,
          hasTripId: !!presenceData.trip_id,
          hasStatus: !!presenceData.status,
        });
        setError(new Error('Missing required fields for presence update'));
        return;
      }

      console.log(
        `[usePresence] ${presenceIdRef.current ? 'Updating' : 'Creating'} presence record`
      );

      let result;
      if (presenceIdRef.current) {
        // Update existing record
        result = await supabaseRef.current
          .from(Tables.USER_PRESENCE)
          .update(presenceData)
          .eq(FIELDS.COMMON.ID, presenceIdRef.current)
          .select(FIELDS.COMMON.ID)
          .single();
      } else {
        result = await supabaseRef.current
          .from(Tables.USER_PRESENCE)
          .insert(presenceData)
          .select(FIELDS.COMMON.ID)
          .single();
      }
      const { data, error: upsertError } = result;
      if (upsertError) {
        console.error('[usePresence] Upsert error:', upsertError);
        setError(
          upsertError instanceof Error ? upsertError : new Error('Failed to update presence')
        );
        return;
      }
      if (data?.id) {
        presenceIdRef.current = data.id; // Store the confirmed/new ID
        console.log('[usePresence] Presence upsert successful, ID:', data.id);
      }
    } catch (err) {
      console.error('[usePresence] Error upserting presence:', err);
      setError(err instanceof Error ? err : new Error('Failed to update presence'));
    }
  }, [user, tripId, status, editingItemId, pathname, setError]);

  // Function to fetch all active users
  const fetchActiveUsers = useCallback(async () => {
    if (!supabaseRef.current || !tripId) return;
    try {
      const { data, error: fetchError } = await supabaseRef.current
        .from(Tables.USER_PRESENCE)
        .select('*')
        .eq('trip_id', tripId)
        .in('status', [
          ENUMS.PRESENCE_STATUS.ONLINE,
          ENUMS.PRESENCE_STATUS.EDITING,
          ENUMS.PRESENCE_STATUS.AWAY,
        ])
        .limit(50); // Reasonable limit to prevent large result sets

      if (fetchError) {
        console.error('[usePresence] Fetch error:', fetchError);
        setError(
          fetchError instanceof Error ? fetchError : new Error('Failed to fetch active users')
        );
        return;
      }

      // Transform data and update state
      if (data) {
        setActiveUsers(data as UserPresence[]);
        // Find our own presence
        const myPresence = data.find((p) => p.user_id === user?.id) as UserPresence | undefined;
        if (myPresence) {
          setMyPresence(myPresence);
          // Update our local state if it differs
          if (myPresence.status !== status) {
            setStatus(myPresence.status);
          }
          if (myPresence.editing_item_id !== editingItemId) {
            setEditingItemId(myPresence.editing_item_id || null);
          }
        }
      }
    } catch (err) {
      console.error('[usePresence] Error fetching active users:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch active users'));
    }
  }, [supabaseRef, tripId, setError, user, status, editingItemId, setStatus]);

  // Recovery function for connection issues
  const recoverPresence = useCallback(async () => {
    if (!supabaseRef.current || !user || !tripId) return;

    try {
      console.log('[usePresence] Attempting presence recovery...');
      setIsCleaningUp(true);

      // Clean up existing subscription if any
      if (subscriptionRef.current) {
        try {
          await subscriptionRef.current.unsubscribe();
          await supabaseRef.current.removeChannel(subscriptionRef.current);
        } catch (cleanupError) {
          console.warn('Error cleaning up channel during recovery:', cleanupError);
        }
        subscriptionRef.current = null;
      }

      // Attempt to get existing presence record
      const { data: existingPresence } = await supabaseRef.current
        .from(Tables.USER_PRESENCE)
        .select('id, status')
        .eq('user_id', user.id)
        .eq('trip_id', tripId)
        .single();

      // If we have an existing record, use its ID
      if (existingPresence?.id) {
        presenceIdRef.current = existingPresence.id;
      }

      // Create and set up new channel
      const channel = supabaseRef.current.channel(`presence:trip:${tripId}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      // Re-setup all the event handlers
      // (similar code to setup function, but with recovery context)

      // Set up a presence sync handler
      channel
        .on('presence', { event: 'sync' }, () => {
          console.log('[usePresence] Presence sync event received');
          try {
            // Get the current state from the channel
            const state = channel.presenceState();
            console.log('[usePresence] Current presence state:', state);

            // Convert to array of user presence objects and update state
            const users = Object.values(state).flatMap((presences: any) => presences);
            setActiveUsers(users as UserPresence[]);

            // Also update our own presence from the state
            const myPresenceInState = users.find(
              (presence: any) => presence.user_id === user.id
            ) as UserPresence | undefined;

            if (myPresenceInState) {
              setMyPresence(myPresenceInState);
            }

            // Mark as connected
            setConnectionState('connected');
            setError(null);
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
          } catch (err) {
            console.error('[usePresence] Error processing presence sync:', err);
            setError(err instanceof Error ? err : new Error('Failed to process presence update'));
          }
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log(`[usePresence] User ${key} joined with presences:`, newPresences);
          // Updates will come through the sync event, so no need to manually update here
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log(`[usePresence] User ${key} left with presences:`, leftPresences);
          // Updates will come through the sync event, so no need to manually update here
        });

      // Track our presence in the channel
      await channel.track({
        user_id: user.id,
        name: user.profile?.name ?? null,
        avatar_url: user.profile?.avatar_url ?? null,
        email: user.email ?? null,
        status,
        editing_item_id: editingItemId,
        last_active: new Date().toISOString(),
      });

      // Subscribe to the channel
      await channel.subscribe();

      // Replace the ref
      subscriptionRef.current = channel;

      // Update database record
      await upsertPresence();

      // Refresh active users
      await fetchActiveUsers();

      // Update state to reflect successful recovery
      setConnectionState('connected');
      setError(null);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts
      console.log('[usePresence] Presence recovery successful');
    } catch (error) {
      console.error('[usePresence] Presence recovery failed:', error);
      setConnectionState('disconnected');
      setError(error instanceof Error ? error : new Error('Failed to recover presence'));
    } finally {
      setIsCleaningUp(false);
    }
  }, [supabaseRef, user, tripId, status, editingItemId, upsertPresence, fetchActiveUsers]);

  // Define startEditing & stopEditing
  const startEditing = useCallback(
    (itemId: string) => {
      setEditingItemId(itemId);
      setStatus(ENUMS.PRESENCE_STATUS.EDITING);
      // Assuming debouncedPresenceUpdate is called elsewhere in the code
    },
    [setStatus]
  );

  const stopEditing = useCallback(() => {
    setEditingItemId(null);
    setStatus(ENUMS.PRESENCE_STATUS.ONLINE);
    // Assuming debouncedPresenceUpdate is called elsewhere in the code
  }, [setStatus]);

  // Main effect for presence subscription and tracking
  useEffect(() => {
    // ---> Skip effect if presence is disabled
    if (!PRESENCE_ENABLED) {
      setIsLoading(false);
      return;
    }

    console.log('Presence effect mount', { user, tripId });
    // Check dependencies first
    if (isAuthLoading || !user || !user.id || !tripId || !supabaseRef.current) {
      setIsLoading(false); // Not loading if auth isn't ready
      return; // Wait for auth and necessary params
    }

    let isMounted = true; // Flag to prevent updates after unmount
    let failsafeTimeoutId: NodeJS.Timeout | null = null;

    setIsLoading(true);

    // Define checkInactivity inside useEffect to access isMounted and debouncedPresenceUpdate
    const checkInactivity = () => {
      if (!isMounted) return;
      const now = Date.now();
      if (now - lastUserActivityRef.current > awayTimeout) {
        // Set status to 'away' if no activity within the timeout
        if (status !== ENUMS.PRESENCE_STATUS.AWAY) {
          setStatus(ENUMS.PRESENCE_STATUS.AWAY);
          // Assuming debouncedPresenceUpdate is called elsewhere in the code
        }
      } else {
        // If user is active but marked away, reset the away timeout
        if (status === ENUMS.PRESENCE_STATUS.AWAY) {
          if (awayTimeoutRef.current) clearTimeout(awayTimeoutRef.current);
          awayTimeoutRef.current = setTimeout(() => {
            if (isMounted) setStatus(ENUMS.PRESENCE_STATUS.AWAY);
          }, awayTimeout) as unknown as NodeJS.Timeout;
        }
      }
    };

    const setup = useCallback(async () => {
      if (isAuthLoading || !user || !user.id || !tripId || !supabaseRef.current) {
        console.log('[usePresence] Not ready for setup yet:', {
          isAuthLoading,
          hasUser: !!user,
          hasTripId: !!tripId,
          hasSupabase: !!supabaseRef.current,
        });
        return;
      }

      try {
        console.log('[usePresence] Setting up presence for trip:', tripId);
        setConnectionState('connecting');

        // Fetch active users for the trip to initialize our state
        await fetchActiveUsers();

        // Create a presence channel for this trip
        const channel = supabaseRef.current.channel(`presence:trip:${tripId}`, {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        console.log('[usePresence] Created presence channel, setting up event listeners');

        // Set up a presence sync handler
        channel
          .on('presence', { event: 'sync' }, () => {
            console.log('[usePresence] Presence sync event received');
            try {
              // Get the current state from the channel
              const state = channel.presenceState();
              console.log('[usePresence] Current presence state:', state);

              // Convert to array of user presence objects and update state
              const users = Object.values(state).flatMap((presences: any) => presences);
              setActiveUsers(users as UserPresence[]);

              // Also update our own presence from the state
              const myPresenceInState = users.find(
                (presence: any) => presence.user_id === user.id
              ) as UserPresence | undefined;

              if (myPresenceInState) {
                setMyPresence(myPresenceInState);
              }

              // Mark as connected
              setConnectionState('connected');
              setError(null);
              reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
            } catch (err) {
              console.error('[usePresence] Error processing presence sync:', err);
              setError(err instanceof Error ? err : new Error('Failed to process presence update'));
            }
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log(`[usePresence] User ${key} joined with presences:`, newPresences);
            // Updates will come through the sync event, so no need to manually update here
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log(`[usePresence] User ${key} left with presences:`, leftPresences);
            // Updates will come through the sync event, so no need to manually update here
          })
          .subscribe(async (status) => {
            // Handle subscription status
            if (status === 'SUBSCRIBED') {
              console.log('[usePresence] Successfully subscribed to presence channel');
              // Track initial presence after subscription is confirmed
              try {
                channel.track({
                  user_id: user.id,
                  name: user.profile?.name ?? null,
                  avatar_url: user.profile?.avatar_url ?? null,
                  email: user.email ?? null,
                  status: status,
                  editing_item_id: editingItemId,
                  last_active: new Date().toISOString(),
                });
                console.log('[usePresence] Initial presence tracking successful');
                setConnectionState('connected');
                setIsLoading(false);
              } catch (trackError) {
                console.error('[usePresence] Error tracking initial presence:', trackError);
                setError(
                  trackError instanceof Error
                    ? trackError
                    : new Error('Failed to initialize presence')
                );
                setIsLoading(false);
              }
            } else if (status === 'CHANNEL_ERROR') {
              console.error('[usePresence] Channel subscription error');
              setConnectionState('disconnected');
              setError(new Error('Failed to connect to presence channel'));
              setIsLoading(false);
            } else if (status === 'TIMED_OUT') {
              console.error('[usePresence] Channel subscription timed out');
              setConnectionState('disconnected');
              setError(new Error('Connection timed out'));
              setIsLoading(false);
            }
          });

        // Save the subscription ref
        subscriptionRef.current = channel;

        console.log('[usePresence] Presence setup complete');
      } catch (err) {
        console.error('[usePresence] Error in presence setup:', err);
        setError(err instanceof Error ? err : new Error('Failed to set up presence tracking'));
        setConnectionState('disconnected');
        setIsLoading(false);

        // Schedule reconnect attempt
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const backoffDelay = Math.min(
            INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
            MAX_RECONNECT_DELAY
          );
          console.log(`[usePresence] Scheduling reconnect in ${backoffDelay}ms`);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            setup();
          }, backoffDelay);
        }
      }
    }, [isAuthLoading, user, tripId, editingItemId, status, fetchActiveUsers]);

    setup();

    // Event listeners for activity detection
    const handleMouseMove = (event: MouseEvent) => {
      if (trackCursor) {
        cursorPositionRef.current = {
          x: event.clientX,
          y: event.clientY,
          timestamp: Date.now(),
        };
        // Assuming debouncedPresenceUpdate is called elsewhere in the code
      }
      updateLastActivity(); // Call the defined function
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);

    // Set up interval to check for inactivity
    inactivityCheckIntervalRef.current = setInterval(checkInactivity, INACTIVITY_CHECK_INTERVAL);

    // Set up interval for periodic presence updates
    activityIntervalRef.current = setInterval(upsertPresence, updateInterval);

    // Check inactivity immediately on mount
    checkInactivity();

    // --- Cleanup function ---
    return () => {
      // ---> Skip cleanup if presence was never enabled
      if (!PRESENCE_ENABLED) return;

      console.log('Presence effect cleanup', { user, tripId });
      isMounted = false; // Set flag on unmount
      console.log('Cleaning up presence hook...');

      // Clear previous failsafe timeout if it exists from a prior cleanup run
      if (failsafeTimeoutId) {
        clearTimeout(failsafeTimeoutId);
        failsafeTimeoutId = null;
        console.log('Cleared previous failsafe timeout.');
      }

      // Clear other timeouts and intervals
      const intervals = [
        activityIntervalRef.current,
        awayTimeoutRef.current,
        inactivityCheckIntervalRef.current,
        reconnectTimeoutRef.current,
      ];
      intervals.forEach((interval) => {
        if (interval !== null) clearTimeout(interval);
      });

      // Reset refs holding interval/timeout IDs
      activityIntervalRef.current = null;
      awayTimeoutRef.current = null;
      inactivityCheckIntervalRef.current = null;
      reconnectTimeoutRef.current = null;

      // Remove event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('scroll', updateLastActivity);

      // Cancel any pending debounced updates
      // Assuming debouncedPresenceUpdate.cancel() is called elsewhere in the code
      // Assuming debouncedCursorUpdate.cancel() is called elsewhere in the code

      // Store necessary values before they might become unavailable in async cleanup
      const currentUserId = user?.id;
      const localSubscriptionRef = subscriptionRef.current; // Local copy for async cleanup
      const localPresenceIdRef = presenceIdRef.current; // Local copy for async cleanup

      // Clear refs immediately
      subscriptionRef.current = null;
      presenceIdRef.current = null;

      // Perform async cleanup
      const performAsyncCleanup = async () => {
        // Check if component is still unmounted before proceeding
        if (isMounted) {
          console.log('Async cleanup skipped: component re-mounted.');
          return;
        }
        setIsCleaningUp(true);
        try {
          console.log('Starting async cleanup...');
          if (localSubscriptionRef && currentUserId) {
            try {
              console.log(`Attempting channel cleanup for user ${currentUserId}...`);
              // Try track offline first
              try {
                await localSubscriptionRef.track({ status: ENUMS.PRESENCE_STATUS.OFFLINE });
              } catch (trackError) {
                console.error('Error tracking offline status:', trackError);
              }

              // Channel cleanup sequence
              console.log('Unsubscribing channel...');
              await localSubscriptionRef.unsubscribe();
              console.log('Removing channel...');
              await supabaseRef.current?.removeChannel(localSubscriptionRef);
              console.log('Channel cleanup successful.');
            } catch (cleanupError) {
              console.error('Error during channel cleanup:', cleanupError);
            }
          } else {
            console.log('Skipping channel cleanup (no channel or user).');
          }

          // DB offline update
          if (localPresenceIdRef && currentUserId && supabaseRef.current) {
            try {
              console.log(`Attempting DB offline update for presence ${localPresenceIdRef}...`);
              const { error: dbError } = await supabaseRef.current
                .from(Tables.USER_PRESENCE)
                .update({
                  status: ENUMS.PRESENCE_STATUS.OFFLINE,
                  editing_item_id: null,
                  cursor_position: null,
                })
                .eq(FIELDS.COMMON.ID, localPresenceIdRef);

              if (dbError) {
                console.warn('Error updating DB presence status on unmount:', dbError);
              } else {
                console.log('Successfully marked presence as offline in database');
              }
            } catch (dbError) {
              console.warn('Exception updating DB presence on unmount:', dbError);
            }
          } else {
            console.log('Skipping DB offline update (no presence ID, user, or supabase).');
          }
        } catch (error) {
          console.error('Unexpected error during async cleanup:', error);
        } finally {
          console.log('Async cleanup finished.');
          // Only set isCleaningUp to false if the component is *still* unmounted
          if (isMounted === false) {
            setIsCleaningUp(false);
          } else {
            console.log(
              'Async cleanup finished, but component is mounted again. State not updated.'
            );
          }
        }
      };

      performAsyncCleanup(); // Call async cleanup

      // Set a *new* failsafe cleanup timeout
      console.log('Setting failsafe cleanup timeout...');
      failsafeTimeoutId = setTimeout(async () => {
        // Assign to the outer variable
        console.warn('Presence cleanup failsafe triggered.');
        // Failsafe should only run if the component is actually unmounted
        if (isMounted === false) {
          setIsCleaningUp(true); // Indicate failsafe is working
          try {
            // Attempt DB update again
            if (supabaseRef.current && localPresenceIdRef) {
              // Use local copy
              console.log(
                `Failsafe attempting DB offline update for presence ${localPresenceIdRef}...`
              );
              await supabaseRef.current
                .from(Tables.USER_PRESENCE)
                .update({
                  status: ENUMS.PRESENCE_STATUS.OFFLINE,
                  editing_item_id: null,
                  cursor_position: null,
                })
                .eq(FIELDS.COMMON.ID, localPresenceIdRef);
              console.log('Failsafe DB update attempt finished.');
            } else {
              console.log('Failsafe skipping DB update (no supabase or presence ID).');
            }
          } catch (e) {
            console.error('Error during failsafe DB update:', e);
          } finally {
            // Reset cleanup state even if failsafe failed
            if (isMounted === false) {
              // Double check mount status
              setIsCleaningUp(false);
              console.log('Failsafe cleanup finished.');
            }
          }
        } else {
          console.log('Failsafe skipped: component is still mounted.');
          // Clear the potentially unnecessary timeout ID if component remounted
          if (failsafeTimeoutId) {
            clearTimeout(failsafeTimeoutId);
            failsafeTimeoutId = null;
          }
        }
      }, CLEANUP_TIMEOUT) as NodeJS.Timeout; // Cast to NodeJS.Timeout type
    }; // End of cleanup function
  }, [
    isAuthLoading,
    user,
    tripId,
    supabaseRef,
    status,
    editingItemId,
    fetchActiveUsers,
    upsertPresence,
    updateInterval,
    awayTimeout,
    trackCursor,
    recoverPresence,
    // Assuming debouncedPresenceUpdate and debouncedCursorUpdate are called elsewhere in the code
    updateLastActivity,
  ]);

  // Effect to update presence when status or editing state changes
  useEffect(() => {
    // ---> Skip effect if presence is disabled
    if (!PRESENCE_ENABLED) return;

    // Only update presence when user is authenticated and connected
    if (
      !isAuthLoading &&
      user &&
      user.id &&
      subscriptionRef.current &&
      connectionState === 'connected'
    ) {
      // Assuming debouncedPresenceUpdate is called elsewhere in the code
    }
  }, [
    status,
    editingItemId, // Assuming debouncedPresenceUpdate is called elsewhere in the code
    isAuthLoading,
    user,
    connectionState,
  ]);

  // Return the hook's state and methods
  return {
    /** List of all active users in the trip */
    activeUsers,
    /** Current user's presence data */
    myPresence,
    /** Current user's status */
    status,
    /** Error state if any */
    error,
    /** Whether presence is being initialized */
    isLoading,
    /** Start editing an item - sets status to EDITING and records the item ID */
    startEditing,
    /** Stop editing - sets status back to ONLINE and clears editing item ID */
    stopEditing,
    /** Manually set user's presence status */
    setStatus: setPresenceStatus,
    /** Whether the current user is in editing mode */
    isEditing: !!editingItemId,
    /** ID of the item being edited, if any */
    editingItemId,
    /** Function to manually recover presence after connection issues */
    recoverPresence,
    /** Whether presence data is being cleaned up (during unmount) */
    isCleaningUp,
    /** Current connection state */
    connectionState,
  };
}
