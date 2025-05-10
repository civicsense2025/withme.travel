import React from 'react';

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No sidebar here; handled by main admin layout
  return <>{children}</>;
} 