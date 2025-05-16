'use client';

import React from 'react';

/**
 * Temporary AuthTestPanel implementation
 *
 * This is a simplified version to fix the build error.
 * The full implementation should be restored later.
 */
export default function AuthTestPanel() {
  return (
    <div className="fixed bottom-0 right-0 z-[9999] p-4 bg-black/80 text-white rounded-lg">
      <h3 className="font-bold text-sm mb-2">Auth Test Panel</h3>
      <p className="text-xs">Temporary implementation. See full panel in developer tools.</p>
    </div>
  );
}
