'use client';

import React from 'react';

export function UpdateNotification() {
  return (
    <div
      id="update-notification"
      style={{ display: 'none' }}
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
