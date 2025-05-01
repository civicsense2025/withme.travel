'use client';

import { useState, useEffect } from 'react';
import { logger, dev, setLogging } from '@/utils/logger';
import { useAuth } from '@/lib/hooks/use-auth';

/**
 * Debug Panel Component
 *
 * A simple floating panel for development that provides:
 * - Auth state information
 * - Logging toggle
 * - API status
 *
 * To use: Add {process.env.NODE_ENV === 'development' && <DebugPanel />} to your layout
 */
export function DebugPanel() {
  const [expanded, setExpanded] = useState(false);
  const [loggingEnabled, setLoggingEnabled] = useState(false);
  const { user, session, isLoading, error } = useAuth();

  // Check if logging is enabled on mount
  useEffect(() => {
    setLoggingEnabled(dev.isLoggingEnabled());
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Handle logging toggle
  const toggleLogging = () => {
    const newState = !loggingEnabled;
    setLogging(newState);
    setLoggingEnabled(newState);
    logger.info(`Logging ${newState ? 'enabled' : 'disabled'}`, 'ui');
  };

  // Refresh the page
  const refreshPage = () => {
    window.location.reload();
  };

  // Extract key info from session
  const isAuthenticated = !!session;
  const userId = user?.id || 'Not logged in';
  const sessionExpiry = session?.expires_at
    ? new Date(session.expires_at * 1000).toLocaleTimeString()
    : 'No session';

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Open Debug Panel"
        >
          <span className="block h-5 w-5 text-xs font-mono">{isAuthenticated ? '✓' : '✕'}</span>
        </button>
      ) : (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-72 text-xs">
          <div className="flex justify-between mb-3 items-center">
            <h3 className="font-semibold">WithMe Debug</h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between pb-1 border-b border-gray-700">
              <span>Auth Status:</span>
              <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono">{userId.substring(0, 10)}...</span>
            </div>

            <div className="flex justify-between">
              <span>Session Expires:</span>
              <span>{sessionExpiry}</span>
            </div>

            <div className="flex justify-between">
              <span>Loading:</span>
              <span>{isLoading ? 'Yes' : 'No'}</span>
            </div>

            {error && (
              <div className="flex justify-between text-red-400">
                <span>Error:</span>
                <span>{error.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={toggleLogging}
              className={`w-full py-1 px-2 rounded text-xs ${
                loggingEnabled ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {loggingEnabled ? 'Disable Logging' : 'Enable Logging'}
            </button>

            <button
              onClick={refreshPage}
              className="w-full py-1 px-2 rounded bg-gray-700 hover:bg-gray-600 text-xs"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
