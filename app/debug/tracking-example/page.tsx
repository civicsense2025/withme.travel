'use client';

import React from 'react';

export default function TrackingExamplePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Event Tracking Examples</h1>
      <p className="mb-6 text-gray-600">
        This page demonstrates different ways to implement event tracking in the application. All
        interactions on this page are tracked and can be viewed in the Research Debug panel.
      </p>

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Debug Instructions</h2>
        <p className="mb-2">
          To view tracked events, add{' '}
          <code className="bg-gray-200 p-1 rounded">?debug=research</code> to the URL.
        </p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Click various elements on this page</li>
          <li>Open the Research Debug panel</li>
          <li>Check the Events tab to see tracked events</li>
        </ol>
      </div>
    </div>
  );
}
