import React from 'react';

/**
 * Minimal PageContainer placeholder
 */
export function PageContainer({ children, header, ...props }: any) {
  return (
    <div {...props}>
      {header}
      <div>{children}</div>
    </div>
  );
} 