import React from 'react';

interface SurveyManagementLayoutProps {
  children: React.ReactNode;
}

export default function SurveyManagementLayout({ children }: SurveyManagementLayoutProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Survey Management</h2>
      {children}
    </div>
  );
}
