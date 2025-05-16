/**
 * Survey Debug View Component
 * 
 * Displays detailed information about survey data, form fields and tokens
 * Only rendered in development/test environments
 */
import React from 'react';
import { Survey } from '@/types/research';

interface SurveyDebugViewProps {
  survey: Survey | null;
  token: string | null;
  isSubmitted: boolean;
  error: string | null;
}

export function SurveyDebugView({ survey, token, isSubmitted, error }: SurveyDebugViewProps) {
  // Only render in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div 
      data-testid="survey-debug-view"
      className="fixed bottom-0 right-0 p-2 bg-black/80 text-green-400 font-mono text-xs rounded-tl-md max-w-lg max-h-96 overflow-auto"
      style={{ zIndex: 9999 }}
    >
      <div className="mb-2 p-1 border-b border-green-500">
        <h3 className="font-bold">Survey Debug Data</h3>
        <div className="flex gap-2">
          <span className="px-1 bg-green-900 rounded">Token: {token || 'NONE'}</span>
          <span className="px-1 bg-green-900 rounded">Status: {isSubmitted ? 'SUBMITTED' : 'ACTIVE'}</span>
          {error && <span className="px-1 bg-red-900 text-red-400 rounded">ERROR: {error}</span>}
        </div>
      </div>

      {survey && (
        <div className="space-y-1">
          <div>
            <strong>ID:</strong> {survey.id}
            <strong className="ml-2">Name:</strong> {survey.name}
          </div>
          
          {survey.fields && (
            <div>
              <strong>Form Fields ({survey.fields.length}):</strong>
              <pre className="mt-1 p-1 bg-gray-900 rounded text-xs whitespace-pre-wrap">
                {JSON.stringify(survey.fields, replacer, 2)}
              </pre>
            </div>
          )}
          
          {/* Fallback to questions property if available */}
          {!survey.fields && survey.config?.fields && (
            <div>
              <strong>Form Fields ({survey.config.fields.length}):</strong>
              <pre className="mt-1 p-1 bg-gray-900 rounded text-xs whitespace-pre-wrap">
                {JSON.stringify(survey.config.fields, replacer, 2)}
              </pre>
            </div>
          )}
          
          {survey.config && (
            <div>
              <strong>Config:</strong>
              <pre className="mt-1 p-1 bg-gray-900 rounded text-xs whitespace-pre-wrap">
                {JSON.stringify(survey.config, replacer, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
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