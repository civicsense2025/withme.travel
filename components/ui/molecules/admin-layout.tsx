'use client';

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import AdminAccessCheck from './AdminAccessCheck';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAccessCheck>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 overflow-auto">
          <main className="max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </AdminAccessCheck>
  );
}
