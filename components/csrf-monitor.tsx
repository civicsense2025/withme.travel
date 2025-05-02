'use client';

import { useEffect, useState } from 'react';
import { useCsrf } from './csrf-provider';

export function CsrfMonitor() {
  const { csrfToken, getToken, isLoading, error } = useCsrf();
  const [hasIssue, setHasIssue] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairMessage, setRepairMessage] = useState<string | null>(null);

  // Check CSRF token consistency
  const checkCsrfConsistency = async () => {
    try {
      // If no token exists or there was an error loading it, mark as having an issue
      if (!csrfToken || error) {
        setHasIssue(true);
        return;
      }

      setHasIssue(false);
    } catch (err) {
      console.error('CSRF Monitor: Error checking CSRF consistency', err);
      setHasIssue(true);
    }
  };

  // Check on mount and when token changes
  useEffect(() => {
    checkCsrfConsistency();
  }, [csrfToken, error, checkCsrfConsistency]);

  // Function to repair the CSRF token if needed
  const repairCsrfToken = async () => {
    try {
      setIsRepairing(true);
      setRepairMessage('Fetching a new CSRF token...');

      // Force a new token fetch
      await getToken();

      setRepairMessage('CSRF token refreshed successfully');
      setHasIssue(false);

      // Reset message after a delay
      setTimeout(() => {
        setRepairMessage(null);
      }, 3000);
    } catch (err) {
      console.error('CSRF Monitor: Error repairing CSRF token', err);
      setRepairMessage('Failed to refresh CSRF token. Please reload the page.');
    } finally {
      setIsRepairing(false);
    }
  };

  // Only render UI in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border rounded-md shadow-md p-2 text-xs max-w-[300px]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">CSRF Status</span>
        <span
          className={`px-1.5 py-0.5 rounded ${hasIssue ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
        >
          {hasIssue ? 'Issue Detected' : 'OK'}
        </span>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading token...</p>}

      {error && (
        <div className="text-red-500 text-xs mt-1 mb-1">
          {error.message || 'Error loading CSRF token'}
        </div>
      )}

      {repairMessage && <div className="text-xs mt-1 mb-1 italic">{repairMessage}</div>}

      {hasIssue && !isRepairing && (
        <button
          onClick={repairCsrfToken}
          className="w-full mt-1 px-2 py-1 bg-primary text-primary-foreground rounded-sm text-xs"
          disabled={isRepairing}
        >
          Repair CSRF Token
        </button>
      )}
    </div>
  );
}
