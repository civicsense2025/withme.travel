'use client';

import React, { useState, useEffect } from 'react';

export function OfflineNotification() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Set initial state
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      style={{ display: isOffline ? 'block' : 'none' }}
      className="fixed top-0 left-0 right-0 z-50 p-2 text-center text-white bg-yellow-600"
    >
      You are currently offline. Some features may be limited.
    </div>
  );
}
