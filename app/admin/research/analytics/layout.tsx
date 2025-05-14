import React from 'react';

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Analytics Dashboard</h2>
      {children}
    </div>
  );
}
