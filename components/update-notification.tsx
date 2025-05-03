'use client';

import React, { useState, useEffect } from 'react';

// Add workbox type declaration for TypeScript
declare global {
  interface Window {
    workbox?: {
      addEventListener: (event: string, callback: () => void) => void;
      removeEventListener: (event: string, callback: () => void) => void;
    };
  }
}

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Listen for app update events from service worker
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    // Example of subscribing to a service worker update event
    // This would need to be customized based on your service worker implementation
    if ('serviceWorker' in navigator && window.workbox) {
      window.workbox.addEventListener('updatefound', handleUpdateAvailable);
    }

    return () => {
      if ('serviceWorker' in navigator && window.workbox) {
        window.workbox.removeEventListener('updatefound', handleUpdateAvailable);
      }
    };
  }, []);

  return (
    <div
      style={{ display: showUpdate ? 'block' : 'none' }}
      className="fixed bottom-0 left-0 right-0 z-50 p-2 text-center text-white bg-blue-600"
    >
      A new version is available.{' '}
      <button className="underline" onClick={() => window.location.reload()}>
        Refresh
      </button>{' '}
      to update.
    </div>
  );
}
