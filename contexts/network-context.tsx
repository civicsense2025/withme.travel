'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the network context type
interface NetworkContextType {
  isOnline: boolean;
  connectionQuality: 'good' | 'fair' | 'poor' | 'unknown';
}

// Create the context with default values
const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  connectionQuality: 'unknown',
});

// Hook to use the network context
export const useNetwork = () => useContext(NetworkContext);

// Provider component
interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor' | 'unknown'>(
    'unknown'
  );

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    // Check connection quality using Navigation API if available
    const checkConnectionQuality = () => {
      // Use effective connection type if available
      if ('connection' in navigator && navigator.connection) {
        const connection = navigator.connection as any;
        if (connection.effectiveType) {
          switch (connection.effectiveType) {
            case '4g':
              setConnectionQuality('good');
              break;
            case '3g':
              setConnectionQuality('fair');
              break;
            case '2g':
            case 'slow-2g':
              setConnectionQuality('poor');
              break;
            default:
              setConnectionQuality('unknown');
          }
        }
      }
    };

    // Check connection quality initially and when online status changes
    checkConnectionQuality();

    // If the Connection API is available, listen for changes
    if ('connection' in navigator && navigator.connection) {
      const connection = navigator.connection as any;
      if (connection.addEventListener) {
        connection.addEventListener('change', checkConnectionQuality);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if ('connection' in navigator && navigator.connection) {
        const connection = navigator.connection as any;
        if (connection.removeEventListener) {
          connection.removeEventListener('change', checkConnectionQuality);
        }
      }
    };
  }, []);

  // Provide network state to children
  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        connectionQuality,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}
