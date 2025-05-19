import React from 'react';

/**
 * Minimal PageHeader placeholder
 */
export function PageHeader({ title, description, centered }: any) {
  return (
    <div style={{ textAlign: centered ? 'center' : 'left' }}>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
} 