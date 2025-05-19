import React from 'react';

/**
 * Minimal Heading placeholder
 */
export function Heading({ level = 1, size = 'default', className = '', children }: { level?: 1|2|3|4|5|6, size?: string, className?: string, children: React.ReactNode }) {
  const tagMap = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const;
  const Tag = tagMap[level];
  return React.createElement(Tag, { className }, children);
} 