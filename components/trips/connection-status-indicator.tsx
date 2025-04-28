'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Connection states that the component can be in
export enum ConnectionState {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
  Reconnecting = 'reconnecting',
  Error = 'error',
}

interface ConnectionStatusIndicatorProps {
  tripId: string;
  onStatusChange?: (status: ConnectionState) => void;
  className?: string;
}

/**
 * Component that shows the real-time connection status
 * and provides a way to manually reconnect when disconnected
 */
export function ConnectionStatusIndicator({
  tripId,
  onStatusChange,
  className = '',
}: ConnectionStatusIndicatorProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<ConnectionState>(ConnectionState.Connecting);
  const [lastConnected, setLastConnected] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Refs to store Supabase client and subscription
  const supabaseRef = useRef(createClient());
  const subscriptionRef = useRef<RealtimeChannel | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Helper to determine if the browser is online
  const isBrowserOnline = () => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  };

  // Update connection status and notify parent component
  const updateStatus = useCallback((newStatus: ConnectionState, error?: Error) => {
    setStatus(newStatus);
    
    if (error) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage(null);
    }
    
    if (newStatus === ConnectionState.Connected) {
      setLastConnected(new Date());
    }
    
    // Notify parent component if callback exists
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  }, [onStatusChange]);

  // Initialize real-time subscription
  const initializeSubscription = useCallback(async () => {
    try {
      // Clean up existing subscription if it exists
      if (subscriptionRef.current) {
        await supabaseRef.current.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      
      updateStatus(ConnectionState.Connecting);
      setIsRetrying(true);

      // Create a new subscription to the trip's channel
      const channel = supabaseRef.current
        .channel(`trip:${tripId}`)
        .on('presence', { event: 'sync' }, () => {
          // Connection successful
          updateStatus(ConnectionState.Connected);
          setRetryCount(0);
          
          // Show connection restored toast if we were previously disconnected or had an error
          if (status === ConnectionState.Disconnected || status === ConnectionState.Error) {
            toast({
              title: 'Connection restored',
              description: 'Real-time updates have resumed',
              variant: 'default',
            });
          }
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          console.log('New users joined:', newPresences);
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          console.log('Users left:', leftPresences);
        })
        .subscribe(async (status, err) => {
          if (status === 'SUBSCRIBED') {
            // Set a timeout to verify that we're receiving data
            if (connectionTimeoutRef.current) {
              clearTimeout(connectionTimeoutRef.current);
            }
            
            connectionTimeoutRef.current = setTimeout(() => {
              if (status === ConnectionState.Connecting) {
                updateStatus(ConnectionState.Error, new Error('Connection timed out'));
                setIsRetrying(false);
              }
            }, 5000);
          } else if (err) {
            updateStatus(ConnectionState.Error, err as Error);
            setIsRetrying(false);
            
            toast({
              title: 'Connection error',
              description: 'Failed to establish real-time connection',
              variant: 'destructive',
            });
          }
        });

      // Store the subscription
      subscriptionRef.current = channel;
    } catch (error) {
      console.error('Error initializing subscription:', error);
      updateStatus(ConnectionState.Error, error as Error);
      setIsRetrying(false);
      
      toast({
        title: 'Connection error',
        description: 'Failed to initialize real-time connection',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  }, [tripId, toast, updateStatus, status]);

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // Only attempt reconnection if we were previously disconnected
      if (status === ConnectionState.Disconnected || status === ConnectionState.Error) {
        setRetryCount(prevCount => prevCount + 1);
        initializeSubscription();
      }
    };

    const handleOffline = () => {
      updateStatus(ConnectionState.Disconnected);
      
      toast({
        title: 'Connection lost',
        description: 'Real-time updates have been paused',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status, initializeSubscription, toast, updateStatus]);

  // Initialize subscription on mount and cleanup on unmount
  useEffect(() => {
    // Only initialize if browser is online
    if (isBrowserOnline()) {
      initializeSubscription();
    } else {
      updateStatus(ConnectionState.Disconnected);
    }

    return () => {
      // Cleanup subscription on unmount
      if (subscriptionRef.current) {
        supabaseRef.current.removeChannel(subscriptionRef.current);
      }
      
      // Clear any pending timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [tripId, initializeSubscription, updateStatus]);

  // Manual retry handler
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    initializeSubscription();
  };

  // Determine badge variant based on status
  const getBadgeVariant = () => {
    switch (status) {
      case ConnectionState.Connected:
        return 'default';
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return 'outline';
      case ConnectionState.Disconnected:
      case ConnectionState.Error:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Status text for the tooltip
  const getStatusText = () => {
    switch (status) {
      case ConnectionState.Connected:
        return 'Connected';
      case ConnectionState.Connecting:
        return 'Connecting...';
      case ConnectionState.Reconnecting:
        return 'Reconnecting...';
      case ConnectionState.Disconnected:
        return 'Disconnected';
      case ConnectionState.Error:
        return `Error: ${errorMessage || 'Connection failed'}`;
      default:
        return 'Unknown status';
    }
  };

  // Icon based on status
  const StatusIcon = status === ConnectionState.Connected || status === ConnectionState.Connecting
    ? Wifi
    : WifiOff;

  // Time since last connected (if disconnected)
  const timeSinceConnected = lastConnected
    ? `Last connected ${Math.floor((new Date().getTime() - lastConnected.getTime()) / 1000)} seconds ago`
    : 'Never connected';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center ${className}`}>
            <Badge 
              variant={getBadgeVariant()} 
              className="flex items-center gap-1.5 px-2 py-0 h-6"
            >
              {status === ConnectionState.Connecting || status === ConnectionState.Reconnecting || isRetrying 
                ? <RefreshCw className="h-3 w-3 animate-spin" /> 
                : <StatusIcon className="h-3 w-3" />
              }
              <span className="text-xs">
                {status === ConnectionState.Connected ? 'Live' : 'Offline'}
              </span>
            </Badge>
            
            {(status === ConnectionState.Disconnected || status === ConnectionState.Error) && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 ml-1"
                onClick={handleRetry}
                disabled={isRetrying || !isBrowserOnline()}
              >
                <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" className="max-w-xs">
          <div className="text-sm">
            <p className="font-medium">{getStatusText()}</p>
            {status !== ConnectionState.Connected && lastConnected && (
              <p className="text-xs text-muted-foreground mt-1">{timeSinceConnected}</p>
            )}
            {status === ConnectionState.Error && errorMessage && (
              <p className="text-xs text-destructive mt-1 font-mono">{errorMessage}</p>
            )}
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Retry attempts: {retryCount}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

