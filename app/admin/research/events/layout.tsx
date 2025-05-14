import React from 'react';

interface EventLogLayoutProps {
  children: React.ReactNode;
}

export default function EventLogLayout({ children }: EventLogLayoutProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Event Log</h2>
      {children}
    </div>
  );
}
