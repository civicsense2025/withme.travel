import React from 'react';

/**
 * Minimal FullBleedSection placeholder
 */
export function FullBleedSection({ children, ...props }: any) {
  return <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)' }} {...props}>{children}</div>;
} 