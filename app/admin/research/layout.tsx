import React from 'react';

interface ResearchAdminLayoutProps {
  children: React.ReactNode;
}

export default function ResearchAdminLayout({ children }: ResearchAdminLayoutProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
