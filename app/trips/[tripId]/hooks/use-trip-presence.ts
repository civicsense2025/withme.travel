'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { throttle } from 'lodash';

// Define connection state type
export enum ConnectionState {
  Connected = 'connected',
  Disconnected = 'disconnected',
  Connecting = 'connecting',
}

// Define connection status
export interface ConnectionStatus {
  state: ConnectionState;
  lastConnected: Date | null;
  retryCount: number;
}

/**
 * Hook to manage trip presence and real-time connectivity
 */
export function useTripPresence(tripId: string, recoverPresence: () => Promise<void>) {
  const { toast } = useToast();
  
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    state: ConnectionState.Connecting,
    lastConnected: null,
    retryCount: 0,
  });
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastReconnectTime, setLastReconnectTime] = useState<Date | null>(null);
  const [reconnectTimeoutId, setReconnectTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Cursor tracking state
  const [showCursors, setShowCursors] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // Monitor network changes
  useEffect(() => {
    // Event listeners for network changes
    const handleOnline = () => {
      console.log('Network came online, attempting to recover presence connection');
      handleReconnect();
    };
    
    const handleOffline = () => {
      console.log('Network went offline, marking connection as disrupted');
      setConnectionQuality('poor');
      setErrorMessage('Network connection lost. Waiting for reconnection...');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    updateConnectionQuality();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Clear any pending reconnection timeout
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
    };
  }, [reconnectTimeoutId]);

  /**
   * Update connection quality based on status
   */
  const updateConnectionQuality = useCallback(() => {
    // Use connectionStatus and reconnect attempts to determine quality
    if (connectionStatus.state === ConnectionState.Connected && reconnectAttempts === 0) {
      setConnectionQuality('good');
    } else if (connectionStatus.state === ConnectionState.Connected && reconnectAttempts > 0) {
      setConnectionQuality('fair');
    } else if (connectionStatus.state === ConnectionState.Connecting) {
      setConnectionQuality('fair');
    } else {
      setConnectionQuality('poor');
    }
    
    // Set error message based on state
    if (connectionStatus.state === ConnectionState.Connected) {
      setErrorMessage(null);
    } else if (connectionStatus.state === ConnectionState.Connecting) {
      setErrorMessage('Connecting to presence service...');
    } else {
      setErrorMessage('Connection error: Unable to connect to presence service');
    }
  }, [connectionStatus.state, reconnectAttempts]);

  /**
   * Throttled cursor update function
   */
  const throttledCursorUpdate = useCallback(
    throttle((x: number, y: number) => {
      if (showCursors && typeof window !== 'undefined') {
        const cursorPos = { x, y };
        window.dispatchEvent(new CustomEvent('cursor-moved', { detail: cursorPos }));
      }
    }, 50),
    [showCursors]
  );

  /**
   * Toggle cursor visibility
   */
  const toggleCursorVisibility = useCallback(() => {
    setShowCursors(prev => !prev);
    
    // If turning off cursors, clean up existing cursor elements
    if (showCursors) {
      cleanupCursorElements();
    }
  }, [showCursors]);

  /**
   * Clean up cursor elements from the DOM
   */
  const cleanupCursorElements = useCallback(() => {
    if (typeof document === 'undefined') return;
    
    ['.user-cursor', '[data-presence-tooltip]', '[data-presence-portal]'].forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        try {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } catch (err) {
          console.warn(`Error removing element with selector ${selector}:`, err);
        }
      });
    });
  }, []);

  /**
   * Reconnect to the presence service
   */
  const handleReconnect = useCallback(async () => {
    if (isReconnecting) return;
    
    // Clear any existing timeout
    if (reconnectTimeoutId) {
      clearTimeout(reconnectTimeoutId);
      setReconnectTimeoutId(null);
    }
    
    // Set current time
    setLastReconnectTime(new Date());
    setIsReconnecting(true);
    setConnectionStatus(prev => ({ ...prev, state: ConnectionState.Connecting }));
    
    try {
      setReconnectAttempts(prev => prev + 1);
      setErrorMessage('Attempting to reconnect...');
      
      // Add timeout for the reconnection attempt
      await Promise.race([
        recoverPresence(),
        new Promise<void>((_, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Reconnection attempt timed out after 10 seconds'));
          }, 10000); // 10 second timeout
          
          // Save timeout ID for cleanup
          setReconnectTimeoutId(timeoutId);
        })
      ]);
      
      // If we reach here, reconnection was successful
      setReconnectAttempts(0);
      setErrorMessage(null);
      setConnectionQuality('good');
      setConnectionStatus({
        state: ConnectionState.Connected,
        lastConnected: new Date(),
        retryCount: 0
      });
      
    } catch (err) {
      console.error("Failed to reconnect:", err);
      setConnectionStatus(prev => ({ ...prev, state: ConnectionState.Disconnected }));
      
      // Determine if we should try again automatically
      if (reconnectAttempts < 5) {
        const backoffDelay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
        setErrorMessage(`Reconnection failed. Retrying in ${Math.ceil(backoffDelay/1000)} seconds...`);
        
        // Schedule automatic retry with exponential backoff
        const timeoutId = setTimeout(() => {
          handleReconnect();
        }, backoffDelay);
        
        setReconnectTimeoutId(timeoutId);
      } else {
        setErrorMessage('Multiple reconnection attempts failed. Please try again manually.');
      }
    } finally {
      setIsReconnecting(false);
    }
  }, [isReconnecting, reconnectTimeoutId, reconnectAttempts, recoverPresence]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up cursor elements
      cleanupCursorElements();
      
      // Clean up any timer
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
    };
  }, [cleanupCursorElements, reconnectTimeoutId]);

  // Update connection status when error state changes
  useEffect(() => {
    updateConnectionQuality();
  }, [connectionStatus.state, reconnectAttempts, updateConnectionQuality]);

  return {
    // State
    connectionStatus,
    connectionQuality,
    isReconnecting,
    reconnectAttempts,
    errorMessage,
    showCursors,
    lastUpdateTime,
    
    // Actions
    handleReconnect,
    toggleCursorVisibility,
    throttledCursorUpdate,
    cleanupCursorElements,
    setLastUpdateTime,
  };
} 