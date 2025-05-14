import React from 'react';
import Link from 'next/link';

interface ResearchAdminLayoutProps {
  children: React.ReactNode;
}

export default function ResearchAdminLayout({ children }: ResearchAdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-100 p-6 border-r">
        <h2 className="text-lg font-semibold mb-4">Research Admin</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/admin/research/analytics" className="text-blue-600 underline">
              Analytics
            </Link>
          </li>
          <li>
            <Link href="/admin/research/surveys" className="text-blue-600 underline">
              Surveys
            </Link>
          </li>
          <li>
            <Link href="/admin/research/events" className="text-blue-600 underline">
              Event Log
            </Link>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
