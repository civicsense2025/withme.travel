import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useAuth, AppUser } from '@/components/auth-provider';
import _ from 'lodash';
import { RealtimeChannel } from '@supabase/supabase-js';
import { DB_TABLES, DB_FIELDS, DB_ENUMS } from '@/utils/constants/database';
// Assuming PresenceStatus should be exported from '@/types/presence'
// The fix likely involves adding `export` to the type definition in that file.
// If PresenceStatus is defined and exported elsewhere (e.g., in database constants), adjust the import accordingly.
// For now, keeping the import as is, acknowledging the error is external.
import {
  PresenceStatus,
  CursorPosition,
  UserPresence,
  ConnectionState
} from '@/types/presence';

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_DELAY = 30000; // 30 seconds maximum reconnect delay
const CLEANUP_TIMEOUT = 5000; // 5 seconds
const INACTIVITY_CHECK_INTERVAL = 10000; // 10 seconds - how often to check for inactivity
const PRESENCE_UPDATE_DEBOUNCE = 1000; // 1 second - debounce delay for presence updates
// Utility to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to validate status using database constants
const validateStatus = (status: PresenceStatus): boolean => {
  return Object.values(DB_ENUMS.PRESENCE_STATUS).includes(status as any);
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
) {
  const {
    updateInterval = 30000, 
    awayTimeout = 120000, 
    trackCursor = false,
    initialStatus = 'online'
  } = options;
  
  // Connection management variables
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const pathname = usePathname();
  
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
  // --- Define Callbacks First --- 

  const setPresenceStatus = useCallback((newStatus: PresenceStatus) => {
    if (validateStatus(newStatus)) {
      setStatus(newStatus);
    } else {
      console.warn(`Invalid presence status: ${newStatus}`);
    }
  }, []);

  // Define debouncedPresenceUpdate first
  const debouncedPresenceUpdate = useCallback(
    _.debounce(async (currentStatus: PresenceStatus, cursorPos: CursorPosition | null, currentEditingItemId: string | null) => {
      if (!subscriptionRef.current || !user || !user.id) return;
      
      try {
        await subscriptionRef.current.track({
          user_id: user.id,
          name: user.profile?.name ?? null,
          avatar_url: user.profile?.avatar_url ?? null,
          email: user.email ?? null,
          status: currentStatus,
          cursor_position: cursorPos ? {
            ...cursorPos,
            timestamp: Date.now()
          } : null,
          editing_item_id: currentEditingItemId,
          last_active: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Failed to update presence via debounced update:', error);
      }
    }, PRESENCE_UPDATE_DEBOUNCE),
    [user]
  );

  // Define updateLastActivity after debouncedPresenceUpdate
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (status !== 'online') {
      setStatus('online');
      if (subscriptionRef.current && user && user.id) {
        // Call the debounced function
        debouncedPresenceUpdate(DB_ENUMS.PRESENCE_STATUS.ONLINE, cursorPositionRef.current, editingItemId);
      }
    }
  }, [
      status,
      editingItemId,
      user,
      debouncedPresenceUpdate
    ]);

  const debouncedCursorUpdate = useCallback(
    _.debounce((x: number, y: number) => {
      cursorPositionRef.current = { x, y, timestamp: Date.now() };
      if (!isAuthLoading && user && user.id && subscriptionRef.current && connectionState === 'connected') {
        debouncedPresenceUpdate(status, cursorPositionRef.current, editingItemId);
      }
    }, 50),
    [status, editingItemId, debouncedPresenceUpdate, isAuthLoading, user, connectionState]
  );
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (trackCursor) { 
      cursorPositionRef.current = { x: event.clientX, y: event.clientY, timestamp: Date.now() };
      debouncedCursorUpdate(event.clientX, event.clientY); 
    }
    updateLastActivity();
  }, [debouncedCursorUpdate, trackCursor, updateLastActivity]);

  const startEditing = useCallback((itemId: string) => {
    setEditingItemId(itemId);
    setPresenceStatus(DB_ENUMS.PRESENCE_STATUS.EDITING);
    if (subscriptionRef.current && user && user.id) {
      debouncedPresenceUpdate.flush();
      debouncedPresenceUpdate(DB_ENUMS.PRESENCE_STATUS.EDITING, cursorPositionRef.current, itemId);
    }
  }, [debouncedPresenceUpdate, user, setPresenceStatus]);

  const stopEditing = useCallback(() => {
    setEditingItemId(null);
    setPresenceStatus(DB_ENUMS.PRESENCE_STATUS.ONLINE);
    if (subscriptionRef.current && user && user.id) {
      debouncedPresenceUpdate.flush();
      debouncedPresenceUpdate(DB_ENUMS.PRESENCE_STATUS.ONLINE, cursorPositionRef.current, null);
    }
  }, [debouncedPresenceUpdate, user, setPresenceStatus]);

  // Function to add or update presence in the database
  const upsertPresence = useCallback(async () => {
    if (!supabase) {
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
        cursor_position: cursorPositionRef.current ? {
          ...cursorPositionRef.current,
          timestamp: Date.now()
        } : null,
        page_path: pathname,
      };

      // Make sure all required fields are present
      if (!presenceData.user_id || !presenceData.trip_id || !presenceData.status) {
        console.error('[usePresence] Missing required fields for presence upsert:', 
          { hasUserId: !!presenceData.user_id, hasTripId: !!presenceData.trip_id, hasStatus: !!presenceData.status });
        setError(new Error('Missing required fields for presence update'));
        return;
      }

      console.log(`[usePresence] ${presenceIdRef.current ? 'Updating' : 'Creating'} presence record`);
      
      let result;
      if (presenceIdRef.current) {
        // Update existing record
        result = await supabase
          .from(DB_TABLES.USER_PRESENCE)
          .update(presenceData)
          .eq(DB_FIELDS.COMMON.ID, presenceIdRef.current)
          .select(DB_FIELDS.COMMON.ID)
          .single();
      } else {
        result = await supabase
          .from(DB_TABLES.USER_PRESENCE)
          .insert(presenceData)
          .select(DB_FIELDS.COMMON.ID)
          .single();
      }
      const { data, error: upsertError } = result;
      if (upsertError) {
        let errorString = '';
        try {
          errorString = JSON.stringify(upsertError, Object.getOwnPropertyNames(upsertError));
        } catch (e) {
          errorString = String(upsertError);
        }
        
        console.error('[usePresence] Upsert error details:', errorString);
        console.error('[usePresence] Raw upsert error:', upsertError);
        
        // Check for common error conditions and provide more specific guidance
        if (upsertError.message) {
          if (upsertError.message.includes('permission denied') || 
              upsertError.message.includes('row level security') || 
              upsertError.message.includes('policy')) {
            console.error('[usePresence] Possible RLS policy violation. Ensure user has permission to insert/update user_presence records.');
            setError(new Error('Permission denied. Please check your access to this trip.'));
          } else if (upsertError.message.includes('auth must be authorized')) {
            console.error('[usePresence] User authentication issue. User may be logged out or session expired.');
            setError(new Error('Your session may have expired. Please refresh the page.'));
          } else if (upsertError.message.includes('foreign key constraint')) {
            console.error('[usePresence] Foreign key constraint violation. Trip ID may be invalid.');
            setError(new Error('Invalid trip reference. Please check trip access.'));
          } else if (upsertError.message.includes('not-found')) {
            console.error('[usePresence] Resource not found. Trip or user may not exist.');
            setError(new Error('Trip or user resource not found.'));
          }
        }
        
        throw upsertError;
      }
      if (data?.id) {
        presenceIdRef.current = data.id; // Store the confirmed/new ID
        console.log('[usePresence] Presence upsert successful, ID:', data.id);
      }
    } catch (err) {
      console.error('[usePresence] Error upserting presence:', err);
      setError(err instanceof Error ? err : new Error('Failed to update presence'));
    }
  }, [supabase, user, tripId, status, editingItemId, pathname]);

    // Function to fetch all active users in the trip
    const fetchActiveUsers = useCallback(async () => {
        if (!supabase || !tripId) return; 
        try {
            const { data, error: fetchError } = await supabase
              .from(DB_TABLES.USER_PRESENCE)
              .select(`
                *,
                profiles:${DB_FIELDS.USER_PRESENCE.USER_ID} (
                  ${DB_FIELDS.PROFILES.NAME},
                  ${DB_FIELDS.PROFILES.AVATAR_URL},
                  ${DB_FIELDS.PROFILES.EMAIL}
                )
              `)
              .eq(DB_FIELDS.USER_PRESENCE.TRIP_ID, tripId)
              .not(DB_FIELDS.USER_PRESENCE.STATUS, 'eq', DB_ENUMS.PRESENCE_STATUS.OFFLINE); // Exclude offline users
              
            if (fetchError) throw fetchError;
            
            // Transform the data 
            const processedData: UserPresence[] = (data || []).map((presence: any) => ({
              ...presence,
              // Directly map profile data if it exists
              name: presence.profiles?.name,
              avatar_url: presence.profiles?.avatar_url,
              email: presence.profiles?.email,
            }));
            
            const myData = processedData.find(p => p.user_id === user?.id) || null;
            setMyPresence(myData); 
            setActiveUsers(processedData);
            setError(null); // Clear error on successful fetch

        } catch (err) {
          console.error('Error fetching active users:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch active users'));
        }
    }, [supabase, tripId, user?.id]);

  // Calculate exponential backoff delay for reconnection attempts
  const getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttemptsRef.current;
    // Exponential backoff with jitter: min(maxDelay, initialDelay * 2^attempt) + random jitter
    const baseDelay = Math.min(
      MAX_RECONNECT_DELAY,
      INITIAL_RECONNECT_DELAY * Math.pow(2, attempt)
    );
    // Add random jitter (0-25% of the delay)
    return baseDelay + Math.random() * (baseDelay * 0.25);
  }, []);
  
  // Function to recover presence after errors or disconnections
  const recoverPresence = useCallback(async () => {
    if (!supabase || !user || !user.id || !tripId) return; 
    
    // Clear any existing reconnect timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    try {
      setConnectionState('connecting');
      setIsLoading(true); // Set loading for recovery process
      setError(null); 
      
      // If we have an existing channel, clean it up first
      if (subscriptionRef.current) {
        try {
          await subscriptionRef.current.unsubscribe();
          await supabase.removeChannel(subscriptionRef.current);
        } catch (cleanupError) {
          console.warn('Error during channel cleanup in recovery:', cleanupError);
          // Continue with recovery despite cleanup errors
        } finally {
          subscriptionRef.current = null;
        }
      }
      
      // Attempt to recover existing presence ID from DB
      const { data: existingPresence } = await supabase
        .from(DB_TABLES.USER_PRESENCE)
        .select(`${DB_FIELDS.COMMON.ID}, ${DB_FIELDS.USER_PRESENCE.STATUS}`)
        .eq(DB_FIELDS.USER_PRESENCE.USER_ID, user.id)
        .eq(DB_FIELDS.USER_PRESENCE.TRIP_ID, tripId)
        .maybeSingle();
          
      if (existingPresence?.id) {
        presenceIdRef.current = existingPresence.id;
        // Update status immediately if needed, then upsert
        if (status === DB_ENUMS.PRESENCE_STATUS.OFFLINE) {
          setPresenceStatus(DB_ENUMS.PRESENCE_STATUS.ONLINE);
        }
        await upsertPresence(); // Update the record fully
      } else {
        // Create new presence record if none found
        presenceIdRef.current = null; // Ensure ID is null before insert
        if (status === DB_ENUMS.PRESENCE_STATUS.OFFLINE) {
          setPresenceStatus(DB_ENUMS.PRESENCE_STATUS.ONLINE);
        }
        await upsertPresence();
      }

      // Set up a new subscription
      const channel = supabase.channel(`trip-presence:${tripId}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      // Configure channel event handlers (similar to setup in useEffect)
      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const users = Object.values(newState).map((presenceArray: unknown) => {
            const presenceValues = presenceArray as any[];
            const p = presenceValues[0]; // Get the first presence object
            return { 
              user_id: p.user_id,
              status: p.status,
              editing_item_id: p.editing_item_id,
              cursor_position: p.cursor_position,
              name: p.name,
              avatar_url: p.avatar_url,
              email: p.email,
              id: p.user_id,
              trip_id: tripId,
              last_active: new Date().toISOString(),
            } as UserPresence;
          });
          setActiveUsers(users);
          const myData = users.find(u => u.user_id === user.id) || null;
          setMyPresence(myData);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
          console.log('Presence join:', key, newPresences);
          const usersToAdd = newPresences.map(p => ({ 
            user_id: p.user_id,
            status: p.status,
            editing_item_id: p.editing_item_id,
            cursor_position: p.cursor_position,
            name: p.name,
            avatar_url: p.avatar_url,
            email: p.email,
            id: p.user_id, 
            trip_id: tripId, 
            last_active: new Date().toISOString()
          } as UserPresence));
          setActiveUsers(prev => [...prev.filter(u => u.user_id !== key), ...usersToAdd]);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
          console.log('Presence leave:', key, leftPresences);
          setActiveUsers(prev => prev.filter((u: UserPresence) => u.user_id !== key));
          if (key === user.id) setMyPresence(null); // Clear my presence if I left
        });

      // Subscribe and set up listeners
      await channel.subscribe(async (statusVal: string, err?: Error) => {
        if (statusVal === 'SUBSCRIBED') {
          console.log(`Reconnected to presence channel: trip-presence:${tripId}`);
          // Reset reconnect attempts after successful connection
          reconnectAttemptsRef.current = 0;
          setConnectionState('connected');
          
          // Track initial state AFTER successful subscription
          await channel.track({ 
            user_id: user.id, 
            name: user.profile?.name ?? null, 
            avatar_url: user.profile?.avatar_url ?? null, 
            email: user.email ?? null,
            status: status ?? 'online', 
            editing_item_id: editingItemId,
            cursor_position: cursorPositionRef.current
          });
          
          // Upsert to DB after tracking
          await upsertPresence(); 
          setError(null); // Clear previous errors
          setIsLoading(false);
        } else if (statusVal === 'CHANNEL_ERROR' || statusVal === 'TIMED_OUT') {
          console.error(`Channel subscription error: ${statusVal}`, err);
          setConnectionState('disconnected');
          setError(err || new Error(`Channel subscription failed: ${statusVal}`));
          throw new Error(`Channel subscription failed: ${statusVal}`);
        }
      });

      subscriptionRef.current = channel;

      // Fetch latest state of all users
      await fetchActiveUsers();
      
    } catch (err) {
      console.error('Failed to recover presence:', err);
      setError(err instanceof Error ? err : new Error('Failed to recover presence'));
      setConnectionState('disconnected');
      setIsLoading(false);
      
      // Schedule a reconnection attempt with exponential backoff
      reconnectAttemptsRef.current += 1;
      
      if (reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
        // Schedule next retry with exponential backoff
        const reconnectDelay = getReconnectDelay();
        reconnectTimeoutRef.current = setTimeout(() => {
          if (supabase && user && user.id && tripId) {
            recoverPresence().catch(console.error);
          }
        }, reconnectDelay);
      } else {
        setError(new Error('Maximum reconnection attempts reached. Please try manually reconnecting.'));
        setConnectionState('disconnected');
      }
    }
  }, [
    supabase, 
    user, 
    tripId, 
    status, 
    editingItemId,
    upsertPresence, 
    fetchActiveUsers, 
    getReconnectDelay,
    setPresenceStatus
  ]);

  // Main effect for presence subscription and tracking
  useEffect(() => {
    console.log('Presence effect mount', { user, tripId });
    // Check dependencies first
    if (isAuthLoading || !user || !user.id || !tripId || !supabase) {
      setIsLoading(false); // Not loading if auth isn't ready
      return; // Wait for auth and necessary params
    }

    let isMounted = true; // Flag to prevent updates after unmount
    let failsafeTimeoutId: NodeJS.Timeout | null = null;
        
    setIsLoading(true);

    const setup = async () => {
      try {
        // Initial fetch of users
        await fetchActiveUsers();
        if (!isMounted) return;

        // Remove existing channel first (important for HMR)
        if (subscriptionRef.current) {
          try {
            await supabase.removeChannel(subscriptionRef.current);
            console.log("Removed previous presence channel before setup.");
          } catch (removeError) {
            console.error("Error removing previous channel during setup:", removeError);
          }
          subscriptionRef.current = null;
        }

        const channel = supabase.channel(`trip-presence:${tripId}`, {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channel
          .on('presence', { event: 'sync' }, () => {
            if (!isMounted) return;
            const newState = channel.presenceState();
            const users = Object.values(newState).map((presenceArray: unknown) => {
              const presenceValues = presenceArray as any[];
              const p = presenceValues[0]; // Get the first presence object
              // Map to UserPresence structure
              return {
                user_id: p.user_id,
                status: p.status,
                editing_item_id: p.editing_item_id,
                cursor_position: p.cursor_position,
                name: p.name, // Assuming these are tracked
                avatar_url: p.avatar_url,
                email: p.email,
                // Add defaults for fields not directly in presence state if needed
                id: p.user_id, // Use user_id as a temporary ID if DB ID isn't sent
                trip_id: tripId,
                last_active: new Date().toISOString(), // Placeholder
              } as UserPresence;
            });
            setActiveUsers(users);
            const myData = users.find(u => u.user_id === user.id) || null;
            setMyPresence(myData);
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
            if (!isMounted) return;
            console.log('Presence join:', key, newPresences);
            const usersToAdd = newPresences.map(p => ({
              user_id: p.user_id,
              status: p.status,
              editing_item_id: p.editing_item_id,
              cursor_position: p.cursor_position,
              name: p.name,
              avatar_url: p.avatar_url,
              email: p.email,
              id: p.user_id, 
              trip_id: tripId, 
              last_active: new Date().toISOString()
            } as UserPresence));
            setActiveUsers(prev => [...prev.filter(u => u.user_id !== key), ...usersToAdd]);
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
            if (!isMounted) return;
            console.log('Presence leave:', key, leftPresences);
            setActiveUsers(prev => prev.filter((u: UserPresence) => u.user_id !== key));
            if (key === user.id) setMyPresence(null); // Clear my presence if I left
          });

        channel.subscribe(async (statusVal: string, err?: Error) => {
          if (!isMounted) return;
          if (statusVal === 'SUBSCRIBED') {
            console.log(`Subscribed to presence channel: trip-presence:${tripId}`);
            setConnectionState('connected'); // Update connection state
            reconnectAttemptsRef.current = 0; // Reset reconnect attempts
            // Track initial state AFTER successful subscription
            await channel.track({
              user_id: user.id,
              name: user.profile?.name ?? null,
              avatar_url: user.profile?.avatar_url ?? null,
              email: user.email ?? null,
              status: status ?? DB_ENUMS.PRESENCE_STATUS.ONLINE,
              editing_item_id: editingItemId,
              cursor_position: cursorPositionRef.current ? {
                ...cursorPositionRef.current,
                timestamp: Date.now()
              } : null
            });
            // Upsert to DB after tracking
            await upsertPresence();
            setError(null); // Clear previous errors
          } else if (statusVal === 'CHANNEL_ERROR' || statusVal === 'TIMED_OUT') {
            console.error(`Channel subscription error: ${statusVal}`, err);
            setConnectionState('disconnected'); // Update connection state
            setError(err || new Error(`Channel subscription failed: ${statusVal}`));
            // Attempt recovery
            await recoverPresence();
          } else {
            console.log(`Channel status: ${statusVal}`);
          }
        });

        subscriptionRef.current = channel;
        setIsLoading(false); // Stop loading after setup attempt
      } catch (setupError) {
        console.error("Error during presence setup:", setupError);
        setError(setupError instanceof Error ? setupError : new Error('Presence setup failed'));
        setIsLoading(false);
        setConnectionState('disconnected');
        if (isMounted) {
          recoverPresence(); // Attempt recovery on setup failure
        }
      }
    };

    setup();

    // Event listeners for activity detection
    const handleMouseMove = (event: MouseEvent) => {
      if (trackCursor) {
        cursorPositionRef.current = { 
          x: event.clientX, 
          y: event.clientY,
          timestamp: Date.now()
        };
        debouncedCursorUpdate(event.clientX, event.clientY);
      }
      updateLastActivity();
    };

    const updateLastActivity = () => {
      if (!isMounted) return;
      const now = Date.now();
      lastUserActivityRef.current = now;
      // If user was away or offline, mark as online immediately on activity
      if (status === DB_ENUMS.PRESENCE_STATUS.AWAY || status === DB_ENUMS.PRESENCE_STATUS.OFFLINE) {
        setStatus(DB_ENUMS.PRESENCE_STATUS.ONLINE);
        // Reset away timeout timer
        if (awayTimeoutRef.current !== null) clearTimeout(awayTimeoutRef.current);
        awayTimeoutRef.current = setTimeout(() => {
          if (isMounted) setStatus(DB_ENUMS.PRESENCE_STATUS.AWAY);
        }, awayTimeout);
      }
      // If user becomes active, ensure DB update reflects this soon
      debouncedPresenceUpdate(DB_ENUMS.PRESENCE_STATUS.ONLINE, cursorPositionRef.current, editingItemId);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);

    // Start interval to periodically update DB
    activityIntervalRef.current = setInterval(upsertPresence, updateInterval);

    // Start inactivity check interval (primarily for setting 'away')
    awayTimeoutRef.current = setTimeout(() => {
      if (isMounted) setStatus(DB_ENUMS.PRESENCE_STATUS.AWAY);
    }, awayTimeout);

    // --- Cleanup function ---
    return () => {
      console.log('Presence effect cleanup', { user, tripId });
      isMounted = false; // Set flag on unmount
      console.log("Cleaning up presence hook...");

      // Clear previous failsafe timeout if it exists from a prior cleanup run
      if (failsafeTimeoutId) {
        clearTimeout(failsafeTimeoutId);
        failsafeTimeoutId = null;
        console.log("Cleared previous failsafe timeout.");
      }

      // Clear other timeouts and intervals
      const intervals = [
        activityIntervalRef.current,
        awayTimeoutRef.current,
        inactivityCheckIntervalRef.current,
        reconnectTimeoutRef.current
      ];
      intervals.forEach(interval => {
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
      debouncedPresenceUpdate.cancel();
      debouncedCursorUpdate.cancel();

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
          console.log("Async cleanup skipped: component re-mounted.");
          return;
        }
        setIsCleaningUp(true);
        try {
          console.log("Starting async cleanup...");
          if (localSubscriptionRef && currentUserId) {
            try {
              console.log(`Attempting channel cleanup for user ${currentUserId}...`);
              // Try track offline first
              try {
                await localSubscriptionRef.track({ status: DB_ENUMS.PRESENCE_STATUS.OFFLINE });
              } catch (trackError) {
                console.error('Error tracking offline status:', trackError);
              }

              // Channel cleanup sequence
              console.log("Unsubscribing channel...");
              await localSubscriptionRef.unsubscribe();
              console.log("Removing channel...");
              await supabase?.removeChannel(localSubscriptionRef);
              console.log("Channel cleanup successful.");
            } catch (cleanupError) {
              console.error('Error during channel cleanup:', cleanupError);
            }
          } else {
            console.log("Skipping channel cleanup (no channel or user).");
          }

          // DB offline update
          if (localPresenceIdRef && currentUserId && supabase) {
            try {
              console.log(`Attempting DB offline update for presence ${localPresenceIdRef}...`);
              const { error: dbError } = await supabase
                .from(DB_TABLES.USER_PRESENCE)
                .update({ status: DB_ENUMS.PRESENCE_STATUS.OFFLINE, last_active: new Date().toISOString() })
                .eq(DB_FIELDS.COMMON.ID, localPresenceIdRef);
              if (dbError) throw dbError;
              console.log("DB offline update successful.");
            } catch (dbError) {
              console.error('Error updating presence status to offline in DB:', dbError);
            }
          } else {
            console.log("Skipping DB offline update (no presence ID, user, or supabase).");
          }
        } catch (error) {
          console.error('Unexpected error during async cleanup:', error);
        } finally {
          console.log("Async cleanup finished.");
          // Only set isCleaningUp to false if the component is *still* unmounted
          if (isMounted === false) {
            setIsCleaningUp(false);
          } else {
            console.log("Async cleanup finished, but component is mounted again. State not updated.");
          }
        }
      };

      performAsyncCleanup(); // Call async cleanup

      // Set a *new* failsafe cleanup timeout
      console.log("Setting failsafe cleanup timeout...");
      failsafeTimeoutId = setTimeout(async () => { // Assign to the outer variable
        console.warn("Presence cleanup failsafe triggered.");
        // Failsafe should only run if the component is actually unmounted
        if (isMounted === false) {
          setIsCleaningUp(true); // Indicate failsafe is working
          try {
            // Attempt DB update again
            if (supabase && localPresenceIdRef) { // Use local copy
              console.log(`Failsafe attempting DB offline update for presence ${localPresenceIdRef}...`);
              await supabase.from(DB_TABLES.USER_PRESENCE)
                .update({ status: DB_ENUMS.PRESENCE_STATUS.OFFLINE, last_active: new Date().toISOString() })
                .eq(DB_FIELDS.COMMON.ID, localPresenceIdRef);
              console.log("Failsafe DB update attempt finished.");
            } else {
              console.log("Failsafe skipping DB update (no supabase or presence ID).");
            }
          } catch (e: unknown) {
            console.error("Error during failsafe DB update:", e);
          } finally {
            // Reset cleanup state even if failsafe failed
            if (isMounted === false) { // Double check mount status
              setIsCleaningUp(false);
              console.log("Failsafe cleanup finished.");
            }
          }
        } else {
          console.log("Failsafe skipped: component is still mounted.");
          // Clear the potentially unnecessary timeout ID if component remounted
          if (failsafeTimeoutId) {
            clearTimeout(failsafeTimeoutId);
            failsafeTimeoutId = null;
          }
        }
      }, CLEANUP_TIMEOUT); // 5-second failsafe
    }; // End of cleanup function
  }, [
    isAuthLoading, 
    user, 
    tripId, 
    supabase, 
    status,
    editingItemId,
    fetchActiveUsers,
    upsertPresence,
    updateInterval, 
    awayTimeout, 
    trackCursor,
    recoverPresence,
    debouncedPresenceUpdate,
    debouncedCursorUpdate,
    updateLastActivity
  ]);

  // Effect to update presence when status or editing state changes
  useEffect(() => {
    // Only update presence when user is authenticated and connected
    if (!isAuthLoading && user && user.id && subscriptionRef.current && connectionState === 'connected') {
      debouncedPresenceUpdate(status, cursorPositionRef.current, editingItemId);
    }
  }, [status, editingItemId, debouncedPresenceUpdate, isAuthLoading, user, connectionState]);

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
    isEditing: status === DB_ENUMS.PRESENCE_STATUS.EDITING,
    /** ID of the item being edited, if any */
    editingItemId,
    /** Function to manually recover presence after connection issues */
    recoverPresence,
    /** Whether presence data is being cleaned up (during unmount) */
    isCleaningUp,
    /** Current connection state */
    connectionState
  };
}

