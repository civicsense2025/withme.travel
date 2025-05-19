/**
 * LiveRegion (Molecule)
 *
 * A themeable, accessible live region component for screen readers.
 *
 * @module ui/molecules
 */
import React, { useEffect, useState } from 'react';

export interface LiveRegionProps {
  message?: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
  visuallyHidden?: boolean;
}

export function LiveRegion({
  message,
  politeness = 'polite',
  clearAfter,
  visuallyHidden = true,
}: LiveRegionProps) {
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    setDisplayMessage(message);
    
    // Clear message after specified time if clearAfter is set
    if (clearAfter && message) {
      const timeoutId = setTimeout(() => {
        setDisplayMessage('');
      }, clearAfter);
      
      return () => clearTimeout(timeoutId);
    }
  }, [message, clearAfter]);

  if (!displayMessage) return null;

  return visuallyHidden ? (
    <div 
      aria-live={politeness} 
      style={{ 
        position: 'absolute', 
        width: '1px', 
        height: '1px', 
        padding: 0, 
        margin: '-1px', 
        overflow: 'hidden', 
        clip: 'rect(0, 0, 0, 0)', 
        whiteSpace: 'nowrap', 
        border: 0 
      }}
    >
      {displayMessage}
    </div>
  ) : (
    <div 
      aria-live={politeness} 
      className="rounded-md border p-4 mb-4"
    >
      {displayMessage}
    </div>
  );
} 