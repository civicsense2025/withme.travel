'use client';

import React from 'react';

export function OfflineNotification() {
  return (
    <div
      id="offline-notification"
      style={{ display: 'none' }}
      className="fixed top-0 left-0 right-0 z-50 p-2 text-center text-white bg-yellow-600"
    >
      You are currently offline. Some features may be limited.
    </div>
  );
} 