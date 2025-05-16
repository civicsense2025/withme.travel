/**
 * Survey Debug View Component
 * 
 * Displays detailed information about survey data, form fields and tokens
 * Only rendered in development/test environments
 */
'use client';

import React from 'react';
import { Form } from '@/types/research';

interface SurveyDebugViewProps {
  survey: Form | null;
  token: string | null;
  isSubmitted: boolean;
  error: string | null;
}

/**
 * Debug view component for surveys that only shows in development mode
 */
export function SurveyDebugView({ survey, token, isSubmitted, error }: SurveyDebugViewProps) {
  // Only show in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Show nothing unless explicitly triggered by URL param or error
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const showDebug = searchParams.get('debug') === 'true';
  
  if (!showDebug && !error) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 bg-gray-900 text-white p-4 rounded-tl-lg opacity-75 hover:opacity-100 transition-opacity max-w-[500px] max-h-[300px] overflow-auto text-xs font-mono">
      <h3 className="font-bold mb-2">Survey Debug View</h3>
      
      <div className="mb-2">
        <div className="font-semibold">Token:</div>
        <div className="truncate">{token || 'No token'}</div>
      </div>
      
      <div className="mb-2">
        <div className="font-semibold">Status:</div>
        <div>
          {error && <span className="text-red-400">Error: {error}</span>}
          {isSubmitted && <span className="text-green-400">Submitted</span>}
          {!error && !isSubmitted && <span>Ready</span>}
        </div>
      </div>
      
      <div>
        <div className="font-semibold">Survey ID:</div>
        <div>{survey?.id || 'No survey'}</div>
      </div>
    </div>
  );
}

// Custom replacer function to properly stringified nested objects
function replacer(key: string, value: any): any {
  // Skip circular references
  if (key && typeof value === 'object' && value !== null) {
    if (circularCache.has(value)) {
      return '[Circular Reference]';
    }
    circularCache.add(value);
  }
  
  // Format special values
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
  
  return value;
}

// Cache for detecting circular references
const circularCache = new WeakSet(); 