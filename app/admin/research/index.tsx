import React from 'react';
import Link from 'next/link';

/**
 * Admin Research Section Index
 * TODO: Add navigation to analytics, survey management, and event logs
 */
export default function ResearchAdminIndex() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Research & User Testing Admin</h1>
      <ul className="space-y-2">
        <li>
          <Link href="/admin/research/analytics" className="text-blue-600 underline">
            Analytics Dashboard
          </Link>
        </li>
        <li>
          <Link href="/admin/research/surveys" className="text-blue-600 underline">
            Survey Management
          </Link>
        </li>
        <li>
          <Link href="/admin/research/events" className="text-blue-600 underline">
            Event Log
          </Link>
        </li>
      </ul>
    </div>
  );
}
